# backend/rag/vectorstore.py
# Chroma vector store setup

import os
import warnings
import logging

# Suppress the harmless Chroma telemetry errors (PostHog incompatibility in 0.5.x)
os.environ["ANONYMIZED_TELEMETRY"] = "False"
logging.getLogger("chromadb.telemetry").setLevel(logging.CRITICAL)

from langchain_chroma import Chroma
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
# Note: Using FastEmbed (extremely lightweight, no PyTorch needed, runs easily in 512MB RAM limit)

from core.config import get_settings

settings = get_settings()

import concurrent.futures

# Eagerly initialize the embeddings model synchronously on a separate thread
# This prevents an "I/O operation on uninitialized object" error when FastEmbed 
# tries to initialize its ONNX runtime inside Uvicorn's asyncio loop.
def _init_embeddings():
    from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
    return FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")

with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
    _embeddings = executor.submit(_init_embeddings).result()

def get_embeddings():
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
