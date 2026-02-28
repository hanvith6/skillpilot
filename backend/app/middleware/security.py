import re
import logging

logger = logging.getLogger(__name__)

# Patterns that indicate leaked secrets in LLM output
_BLOCKED_PATTERNS = [
    re.compile(r'(?i)(api[_-]?key|secret[_-]?key|password|token)\s*[:=]\s*\S{8,}'),
    re.compile(r'sk-[a-zA-Z0-9]{20,}'),
    re.compile(r'AIza[a-zA-Z0-9_-]{35}'),
    re.compile(r'(?i)bearer\s+[a-zA-Z0-9._-]{20,}'),
    re.compile(r'eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}'),  # JWT-like tokens
]


def filter_output(text: str) -> str:
    """Remove potentially leaked secrets from LLM output."""
    for pattern in _BLOCKED_PATTERNS:
        text = pattern.sub('[REDACTED]', text)
    return text
