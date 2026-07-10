# backend/db/database.py
# PostgreSQL connection using SQLAlchemy

from sqlalchemy.ext.asyncio import (
    create_async_engine, 
    AsyncSession, 
    async_sessionmaker
)
from sqlalchemy.orm import DeclarativeBase
from core.config import get_settings

settings = get_settings()

# Convert postgresql:// to postgresql+asyncpg://
# Also strip out Neon's specific query parameters that asyncpg doesn't understand
BASE_URL = settings.DATABASE_URL.split("?")[0]
DATABASE_URL = BASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,       # Set True for SQL query logging
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,   # Recycle connections every 5 mins to avoid stale connections
    pool_pre_ping=True, # Test connection health before using it
    connect_args={"ssl": "require"}
)

AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

# Dependency for FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
