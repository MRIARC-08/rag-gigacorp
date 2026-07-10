# 🚀 GigaCorp AI Customer Support

A full-stack Retrieval-Augmented Generation (RAG) chatbot designed for GigaCorp's customer support. It features a modern, animated Next.js frontend and a lightning-fast Python FastAPI backend powered by LangChain, Groq, and ChromaDB.

## 🌟 Features

- **Conversational AI**: Context-aware RAG pipeline using LangChain and Groq LLMs.
- **Modern UI/UX**: Built with Next.js, Tailwind CSS, and Framer Motion for buttery smooth micro-animations.
- **Authentication**: Seamless Google OAuth integration using NextAuth.
- **Persistent Chat History**: PostgreSQL database (Neon) stores users, sessions, and messages.
- **Source Citations**: AI answers include clickable citations pointing to the exact document and line number used.
- **Markdown Support**: Beautifully rendered tables, bold text, and lists in the AI's responses.
- **Real-time Streaming (Simulated)**: Non-blocking UI that allows users to type while fetching history.

---

## 🏗️ Architecture

```mermaid
graph TD
    %% Users
    User((User))
    
    %% Frontend
    subgraph Frontend ["Next.js Frontend"]
        UI["React/Tailwind UI"]
        NextAuth["NextAuth.js"]
    end
    
    %% Backend
    subgraph Backend ["FastAPI Backend"]
        Router["API Routers"]
        Chain["LangChain RAG Chain"]
        Embedder["HuggingFace Embeddings"]
    end
    
    %% External Services
    Google["Google OAuth"]
    Groq["Groq LLM API"]
    
    %% Databases
    subgraph Databases ["Data Storage"]
        Neon[("Neon PostgreSQL")]
        Chroma[("ChromaDB Vector Store")]
        Doc["gigacorp_faq.txt"]
    end
    
    %% Relationships
    User -->|Interacts| UI
    UI <-->|"JSON over HTTP"| Router
    UI <-->|"Login/Callback"| NextAuth
    NextAuth <-->|Verify| Google
    
    Router <-->|"Save/Load Chats"| Neon
    Router <-->|"Ask Question"| Chain
    
    Chain -->|"1. Create Embedding"| Embedder
    Chain -->|"2. Similarity Search"| Chroma
    Chain <-->|"3. Generate Answer"| Groq
    
    Doc -->|"Ingested into"| Chroma
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Auth**: NextAuth.js (Google Provider)
- **Markdown**: `react-markdown` + `remark-gfm`

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **LLM Orchestration**: LangChain
- **LLM Provider**: Groq API
- **Embeddings**: HuggingFace (`all-MiniLM-L6-v2`)
- **Vector Database**: ChromaDB
- **Relational Database**: PostgreSQL (Neon) with SQLAlchemy ORM

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A PostgreSQL database (e.g., [Neon.tech](https://neon.tech))
- A [Groq](https://groq.com) API Key
- Google Cloud Console OAuth Credentials

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` folder:
   ```env
   GROQ_API_KEY="your_groq_key"
   GROQ_MODEL="openai/gpt-oss-120b"
   DATABASE_URL="postgresql+asyncpg://user:password@host/dbname"
   FAQ_FILE_PATH="./data/gigacorp_faq.txt"
   CHROMA_PERSIST_DIR="./chroma_db"
   ```
5. Ingest the data into ChromaDB (only needed once):
   ```bash
   python rag/ingest.py
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend` folder:
   ```env
   NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate_a_random_secret_string"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser!



---

## 📝 License
This project is open-source and available under the MIT License.
