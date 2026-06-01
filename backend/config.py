# backend/config.py

from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CHROMA_STORE_PATH: str = "chroma_db_nepali"
    DOCUMENTS_PATH: str = "documents"
    #EMBEDDING_MODEL: str = "jangedoo/all-MiniLM-L6-v2-nepali"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    class Config:
        env_file = Path(__file__).resolve().parent / ".env"

settings = Settings()