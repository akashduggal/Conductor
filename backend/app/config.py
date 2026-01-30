from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union


def _parse_cors_origins(v: Union[str, list]) -> List[str]:
    """Accept CORS_ORIGINS as comma-separated string or JSON array (for Vercel env)."""
    if isinstance(v, list):
        return [str(x).strip() for x in v if x]
    if isinstance(v, str):
        return [x.strip() for x in v.split(",") if x.strip()]
    return []


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite+aiosqlite:///./ml_dashboard.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # API
    api_v1_prefix: str = "/api/v1"
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, list]) -> List[str]:
        return _parse_cors_origins(v)
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
