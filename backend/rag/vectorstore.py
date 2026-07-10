# backend/rag/vectorstore.py
# Chroma vector store setup

import os
import warnings
import logging

# Suppress the harmless Chroma telemetry errors (PostHog incompatibility in 0.5.x)
os.environ["ANONYMIZED_TELEMETRY"] = "False"
logging.getLogger("chromadb.telemetry").setLevel(logging.CRITICAL)

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
# Note: Using HuggingFace embeddings (FREE, no API key needed)

from core.config import get_settings

settings = get_settings()

# Cache the embeddings model so it's only loaded once (not on every request)
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}
        )
    return _embeddings

def get_vectorstore():
    embeddings = get_embeddings()
    
    vectorstore = Chroma(
        collection_name="gigacorp_faq",
        embedding_function=embeddings,
        persist_directory=settings.CHROMA_PERSIST_DIR
    )
    
    return vectorstore

def get_retriever(k: int = 3):
    """Get retriever that returns top-k most relevant chunks"""
    vectorstore = get_vectorstore()
    return vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": k}
    )
