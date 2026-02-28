import logging
from openai import AsyncOpenAI
from app.services.llm.base import LLMProvider
from app.config import settings

logger = logging.getLogger(__name__)


class OpenAIProvider(LLMProvider):
    """OpenAI GPT-4o-mini fallback provider."""

    def __init__(self):
        self._client = None
        self._model = "gpt-4o-mini"

    def _get_client(self):
        if self._client is None:
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    async def generate(self, prompt: str, temperature: float = 0.7, max_tokens: int = 2000) -> str:
        client = self._get_client()
        response = await client.chat.completions.create(
            model=self._model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content

    def is_available(self) -> bool:
        return bool(settings.OPENAI_API_KEY)

    def name(self) -> str:
        return "openai"
