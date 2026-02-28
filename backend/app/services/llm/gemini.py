import logging
from google import genai
from app.services.llm.base import LLMProvider
from app.config import settings

logger = logging.getLogger(__name__)


class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider."""

    def __init__(self):
        self._client = None
        self._model = "gemini-2.5-flash"

    def _get_client(self):
        if self._client is None:
            self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
        return self._client

    async def generate(self, prompt: str, temperature: float = 0.7, max_tokens: int = 2000) -> str:
        client = self._get_client()
        response = client.models.generate_content(
            model=self._model,
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens
            )
        )
        return response.text

    def is_available(self) -> bool:
        return bool(settings.GEMINI_API_KEY)

    def name(self) -> str:
        return "gemini"
