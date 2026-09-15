import os
import json
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator

class Settings(BaseSettings):
    APP_NAME: str = "Radja Wedding Management"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    DATABASE_URL: str = "sqlite:///./radja_wedding.db"
    
    SECRET_KEY: str = "radja-wedding-super-secret-key-signature-2026-production-ready"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    ADMIN_DEFAULT_EMAIL: str = "admin@radja.com"
    ADMIN_DEFAULT_PASSWORD: str = "admin123"
    STAFF_DEFAULT_EMAIL: str = "staf@radja.com"
    STAFF_DEFAULT_PASSWORD: str = "staf123"
    
    GOOGLE_CLIENT_ID: str = "mock-google-client-id.apps.googleusercontent.com"
    WA_GATEWAY_MOCK: bool = True
    DEFAULT_TEST_OTP: str = "123456"
    
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    ENABLE_AI_SIMULATION: bool = True
    
    UPLOAD_DIR: str = "./uploads"
    BASE_URL: str = "http://localhost:8000"
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "payments"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "products"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "gallery"), exist_ok=True)
