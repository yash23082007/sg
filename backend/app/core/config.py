from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillGap API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/skillgap_db"
    SECRET_KEY: str = "dev_secret_key_skillgap_matrix_9901"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
