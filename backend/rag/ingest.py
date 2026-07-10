# backend/rag/ingest.py
# Run this ONCE to load FAQ into Chroma

from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from rag.vectorstore import get_vectorstore, get_embeddings
from langchain_chroma import Chroma
from core.config import get_settings

settings = get_settings()

def ingest():
    print("📄 Loading FAQ document...")
    
    loader = TextLoader(
        settings.FAQ_FILE_PATH, 
        encoding="utf-8"
    )
    documents = loader.load()
    
    for doc in documents:
        doc.metadata["source"] = "gigacorp_faq.txt"
    
    print(f"✅ Loaded {len(documents)} document(s)")
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=50,
        separators=["\n\n", "\n", " "] 
    )
    chunks = splitter.split_documents(documents)
    
    for i, chunk in enumerate(chunks):
        content = chunk.page_content
        line_ref = "Unknown"
        if "[Line " in content:
            start = content.find("[Line ")
            end = content.find("]", start)
            line_ref = content[start:end+1]
        
        chunk.metadata["line_reference"] = line_ref
        chunk.metadata["chunk_index"] = i
        
        sections = [
            "SHIPPING POLICIES",
            "RETURN PROCESSES", 
            "BUSINESS HOURS",
            "SERVICE TIERS",
            "ACCOUNT & BILLING"
        ]
        chunk.metadata["section"] = "GENERAL"
        for section in sections:
            if section in content:
                chunk.metadata["section"] = section
                break
    
    print(f"✅ Split into {len(chunks)} chunks")
    
    print("🔄 Embedding and storing in Chroma...")
    Chroma.from_documents(
        documents=chunks,
        embedding=get_embeddings(),
        collection_name="gigacorp_faq",
        persist_directory=settings.CHROMA_PERSIST_DIR
    )
    
    print(f"✅ Ingested {len(chunks)} chunks into Chroma!")
    print(f"📁 Stored at: {settings.CHROMA_PERSIST_DIR}")

if __name__ == "__main__":
    ingest()
