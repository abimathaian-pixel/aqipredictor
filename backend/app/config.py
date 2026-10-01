import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from project root or backend dir
load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "AeroPulse Pune"
    PROJECT_SHORT_NAME: str = "AeroPulse"
    TAGLINE: str = "Real-Time Air Intelligence. Predictive Insights. Healthier Pune."
    API_V1_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pune_aqi.db")
    DATA_GOV_API_KEY: str = os.getenv("DATA_GOV_API_KEY", "")
    CPCB_API_KEY: str = os.getenv("CPCB_API_KEY", "")
    DATA_GOV_RESOURCE_ID: str = os.getenv(
        "DATA_GOV_RESOURCE_ID", "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"
    )
    TIMEZONE: str = "Asia/Kolkata"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
