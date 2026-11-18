
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_NAME: str = "HeartGuard AI API"
    APP_VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000

    FRONTEND_URL: str = "http://localhost:5173"

    DATABASE_URL: str = "postgresql+psycopg://localhost:5432/heartguard_db"

    # JWT configuration
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Environment
    ENVIRONMENT: str = "development"

    # AI / Gemini configuration
    GEMINI_API_KEY: str | None = None
    GOOGLE_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"

    # Password reset configuration
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 15

    # SMTP / Email configuration (optional)
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str = "noreply@heartguard.ai"
    SMTP_TLS: bool = True

    @property
    def effective_gemini_api_key(self) -> str | None:
        return self.GEMINI_API_KEY or self.GOOGLE_API_KEY

    model_config = SettingsConfigDict(
        env_file=(".env", str(_BASE_DIR / ".env")),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
