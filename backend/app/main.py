import logging
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.config import settings
from app.middleware.rate_limit import RateLimitMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title="SkillPilot API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url=None,
    )

    # CORS - restricted origins
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=origins,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

    # Rate limiting
    app.add_middleware(RateLimitMiddleware)

    # Import and include routers
    from app.routers import auth, generation, download, history, payments, referrals

    app.include_router(auth.router)
    app.include_router(generation.router)
    app.include_router(download.router)
    app.include_router(history.router)
    app.include_router(payments.router)
    app.include_router(referrals.router)

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "skillpilot"}

    logger.info("SkillPilot API initialized")
    return app


app = create_app()
