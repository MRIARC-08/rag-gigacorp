# backend/core/config.py
# Central configuration — all env vars loaded here

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Groq LLM
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"  

    # Supabase / PostgreSQL
    DATABASE_URL: str  

    # NextAuth / JWT verification
    NEXTAUTH_SECRET: str
    
    # Google OAuth (used by NextAuth on frontend)
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # Chroma vector store path
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    # FAQ file path
    FAQ_FILE_PATH: str = "./data/gigacorp_faq.txt"

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }

@lru_cache()
def get_settings():
    return Settings()
