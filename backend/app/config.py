import os
from typing import List
from pydantic import BaseModel

INSECURE_DEFAULT_SECRET = "citylife-insecure-dev-secret-key-change-in-prod-2026"

class Settings(BaseModel):
    APP_NAME: str = "City Life: AI-Powered Smart City Explorer"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").strip().lower()
    SECRET_KEY: str = os.getenv("SECRET_KEY", INSECURE_DEFAULT_SECRET)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./citylife.db")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
    DEFAULT_CITY: str = "Pune, Maharashtra, India"
    DEFAULT_COORDINATES: tuple[float, float] = (18.5204, 73.8567)  # Lat, Lng
    # Comma-separated list of allowed browser origins. "*" allows all (dev only).
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    # When enabled, live OpenStreetMap places are pulled from Overpass on startup
    ENABLE_OSM_SYNC: bool = os.getenv("ENABLE_OSM_SYNC", "false").strip().lower() in ("1", "true", "yes", "on")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT in ("production", "prod")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Fail fast rather than silently signing tokens with a publicly known secret.
if settings.is_production and settings.SECRET_KEY == INSECURE_DEFAULT_SECRET:
    raise RuntimeError(
        "SECRET_KEY must be set to a strong, unique value in production. "
        "Refusing to start with the insecure development default."
    )
