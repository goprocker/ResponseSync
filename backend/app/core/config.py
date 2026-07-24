"""Application configuration management using Pydantic Settings."""

from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized application settings loaded from environment variables."""

    # App Info
    APP_NAME: str = "ResponSync Backend"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    VERSION: str = "0.1.0"

    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/responsync"

    # Supabase Settings
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # External APIs
    OPENWEATHER_API_KEY: str = ""
    MAPBOX_API_KEY: str = ""

    # AI / LLM Integration
    GEMINI_API_KEY: str = ""

    # Security / Auth Settings
    JWT_SECRET: str = "default-insecure-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS Settings
    CORS_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
