"""
SkillGap Core Configuration
Pydantic v2 BaseSettings with strict weight validation and environment parsing.
"""

from typing import List
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillGap API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite:///./skillgap.db"
    
    # Security
    SECRET_KEY: str = "dev_secret_key_skillgap_matrix_9901_production_ready"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS: comma-separated string in env, parsed dynamically
    CORS_ORIGINS_RAW: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="CORS_ORIGINS"
    )
    
    # Algorithm Weights (Must sum to 1.0)
    WEIGHT_DEMAND: float = 0.5
    WEIGHT_GAP: float = 0.3
    WEIGHT_VALUE: float = 0.2
    
    # Readiness Gate Threshold (0.0 to 1.0)
    PREREQUISITE_PASS_THRESHOLD: float = 0.50

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("WEIGHT_VALUE")
    @classmethod
    def validate_weights_sum(cls, v: float, info) -> float:
        """Validates that algorithm weights sum to 1.0 ± 0.001 to prevent score distortion."""
        data = info.data
        wd = data.get("WEIGHT_DEMAND", 0.5)
        wg = data.get("WEIGHT_GAP", 0.3)
        total = wd + wg + v
        if not (0.999 <= total <= 1.001):
            raise ValueError(
                f"Scoring weights must sum to 1.0! (Received: demand={wd}, gap={wg}, value={v}, total={total})"
            )
        return v

    @property
    def cors_origins(self) -> List[str]:
        """Exposes CORS origins as a clean list of trimmed strings."""
        if not self.CORS_ORIGINS_RAW:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]


settings = Settings()
