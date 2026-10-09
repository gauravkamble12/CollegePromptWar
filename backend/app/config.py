import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "City Life: AI-Powered Smart City Explorer"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "citylife-insecure-dev-secret-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./citylife.db")
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
    DEFAULT_CITY: str = "Pune, Maharashtra, India"
    DEFAULT_COORDINATES: tuple[float, float] = (18.5204, 73.8567)  # Lat, Lng

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
