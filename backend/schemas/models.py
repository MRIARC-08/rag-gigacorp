# backend/schemas/models.py
# All Pydantic request and response models

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ── Request Models ──────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(
        ..., 
        min_length=1, 
        max_length=1000,
        description="User's chat message"
    )
    session_id: str = Field(
        ..., 
        description="Unique session identifier"
    )
    user_id: Optional[str] = Field(
        None, 
        description="User ID from Google OAuth (optional for anonymous)"
    )

class NewSessionRequest(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None

# ── Source / Citation Models ─────────────────────────

class SourceDocument(BaseModel):
    content: str = Field(description="The retrieved FAQ chunk")
    source_file: str = Field(description="Filename of source")
    line_number: Optional[str] = Field(
        None, 
        description="Line number reference from FAQ"
    )
    section: Optional[str] = Field(
        None,
        description="FAQ section name e.g. SHIPPING POLICIES"
    )

# ── Response Models ──────────────────────────────────

class ChatResponse(BaseModel):
    answer: str = Field(description="LLM generated answer")
    sources: List[SourceDocument] = Field(
        default=[],
        description="Retrieved source documents with citations"
    )
    session_id: str
    message_id: str

class HistoryMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    sources: Optional[List[SourceDocument]] = None
    created_at: datetime

class HistoryResponse(BaseModel):
    session_id: str
    messages: List[HistoryMessage]

class SessionResponse(BaseModel):
    session_id: str
    created_at: datetime

class SessionListItem(BaseModel):
    session_id: str
    created_at: datetime
    preview: Optional[str] = None  # First message preview

class SessionListResponse(BaseModel):
    sessions: List[SessionListItem]
