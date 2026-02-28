import asyncio
import re
import logging
from typing import List
from app.services.llm.base import LLMProvider
from app.services.llm.gemini import GeminiProvider
from app.services.llm.openai_provider import OpenAIProvider
from app.config import settings

logger = logging.getLogger(__name__)

MAX_RETRIES = 2
RETRY_DELAY = 2.0  # seconds base delay


class LLMRouter:
    """Routes LLM calls to available providers with automatic fallback."""

    def __init__(self):
        self._providers: List[LLMProvider] = []
        self._failure_counts: dict = {}
        self._setup_providers()

    def _setup_providers(self):
        primary = settings.PRIMARY_LLM

        gemini = GeminiProvider()
        openai = OpenAIProvider()

        if primary == "openai" and openai.is_available():
            self._providers = [openai, gemini]
        else:
            self._providers = [gemini, openai]

        # Filter to only available providers
        self._providers = [p for p in self._providers if p.is_available()]

        if not self._providers:
            logger.error("No LLM providers configured!")

        logger.info(f"LLM providers: {[p.name() for p in self._providers]}")

    async def generate(self, prompt: str, temperature: float = 0.7, max_tokens: int = 2000) -> str:
        """Generate text using available providers with automatic fallback and retry."""
        last_error = None

        for provider in self._providers:
            for attempt in range(MAX_RETRIES + 1):
                try:
                    result = await provider.generate(prompt, temperature, max_tokens)
                    return result
                except Exception as e:
                    provider_name = provider.name()
                    error_str = str(e).lower()
                    is_retryable = any(
                        kw in error_str for kw in ("rate", "limit", "429", "quota", "resource_exhausted", "timeout")
                    )

                    if is_retryable and attempt < MAX_RETRIES:
                        # Try to extract API-suggested retry delay
                        delay_match = re.search(r'retry in ([\d.]+)s', error_str)
                        delay = float(delay_match.group(1)) if delay_match else RETRY_DELAY * (attempt + 1)
                        delay = min(delay, 30.0)  # cap at 30s
                        logger.warning(f"{provider_name} rate limited (attempt {attempt + 1}), retrying in {delay}s")
                        await asyncio.sleep(delay)
                        continue

                    self._failure_counts[provider_name] = self._failure_counts.get(provider_name, 0) + 1
                    logger.warning(
                        f"{provider_name} failed (total failures: {self._failure_counts[provider_name]}): {e}"
                    )
                    last_error = e
                    break  # move to next provider

        error_msg = f"All LLM providers failed. Last error: {last_error}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)

    def get_stats(self) -> dict:
        return {
            "providers": [p.name() for p in self._providers],
            "failure_counts": dict(self._failure_counts),
        }


# Singleton instance
_router: LLMRouter = None


def get_llm_router() -> LLMRouter:
    global _router
    if _router is None:
        _router = LLMRouter()
    return _router
