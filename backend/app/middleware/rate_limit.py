import time
import hashlib
import logging
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.config import settings

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """In-memory token-bucket rate limiter."""

    def __init__(self, app):
        super().__init__(app)
        self._buckets = defaultdict(lambda: {"tokens": 0, "last_refill": 0.0})

    async def dispatch(self, request, call_next):
        path = request.url.path

        # Skip rate limiting for health checks and webhooks
        if path in ("/health", "/api/webhook/stripe"):
            return await call_next(request)

        # Determine rate limits based on path
        if "/generate/" in path:
            max_tokens = settings.RATE_LIMIT_GENERATION_REQUESTS
            window = settings.RATE_LIMIT_GENERATION_WINDOW
        else:
            max_tokens = settings.RATE_LIMIT_REQUESTS
            window = settings.RATE_LIMIT_WINDOW_SECONDS

        # Identify client by auth token hash or IP
        key = request.client.host if request.client else "unknown"
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            key = hashlib.sha256(auth_header.encode()).hexdigest()[:16]

        # Refill tokens
        bucket = self._buckets[key]
        now = time.time()

        if bucket["last_refill"] == 0:
            bucket["tokens"] = max_tokens
            bucket["last_refill"] = now
        else:
            elapsed = now - bucket["last_refill"]
            refill = elapsed / window * max_tokens
            bucket["tokens"] = min(max_tokens, bucket["tokens"] + refill)
            bucket["last_refill"] = now

        # Check tokens
        if bucket["tokens"] < 1:
            retry_after = int(window - (now - bucket["last_refill"]))
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please try again later."},
                headers={"Retry-After": str(max(1, retry_after))},
            )

        bucket["tokens"] -= 1

        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(int(bucket["tokens"]))
        return response
