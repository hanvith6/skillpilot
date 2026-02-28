from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def generate(self, prompt: str, temperature: float = 0.7, max_tokens: int = 2000) -> str:
        """Generate text from a prompt."""
        ...

    @abstractmethod
    def is_available(self) -> bool:
        """Check if this provider is configured and available."""
        ...

    @abstractmethod
    def name(self) -> str:
        """Return provider name for logging."""
        ...
