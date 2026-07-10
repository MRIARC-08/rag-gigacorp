# backend/main.py
# FastAPI application entry point

import os
import sys
import io

# Suppress Chroma telemetry and HuggingFace progress bars (prevents tqdm crashes on Render)
os.environ["ANONYMIZED_TELEMETRY"] = "False"
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db.database import engine, Base
from routers import chat
from core.config import get_settings

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Auto-ingest RAG vectorstore if it doesn't exist
    if not os.path.exists(settings.CHROMA_PERSIST_DIR):
        print("Vector database not found. Running auto-ingestion...")
        from rag.ingest import ingest
        ingest()
        
    yield
    # Shutdown: cleanup if needed
    await engine.dispose()

app = FastAPI(
    title="GigaCorp Support RAG API",
    description="Customer support AI with RAG and memory",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — Allow Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
