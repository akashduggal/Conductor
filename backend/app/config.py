# CORS_ORIGINS: read from os.environ only (no pydantic field) — avoids JSON parse error on Vercel
import os
from pydantic_settings import BaseSettings
from typing import List


def _get_cors_origins_list() -> List[str]:
    """Read CORS_ORIGINS from env (comma-separated); never parsed as JSON (avoids Vercel/pydantic-settings issue)."""
    raw = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
    return [x.strip() for x in raw.split(",") if x.strip()]


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./ml_dashboard.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # API
    api_v1_prefix: str = "/api/v1"
    # CORS is read via get_cors_origins_list() so pydantic-settings never tries to JSON-parse it

    @property
    def cors_origins_list(self) -> List[str]:
        return _get_cors_origins_list()
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
