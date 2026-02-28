from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str

    # LLM Providers
    GEMINI_API_KEY: str
    OPENAI_API_KEY: str = ""
    PRIMARY_LLM: str = "gemini"

    # Payments
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 30
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    RATE_LIMIT_GENERATION_REQUESTS: int = 10
    RATE_LIMIT_GENERATION_WINDOW: int = 60

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
