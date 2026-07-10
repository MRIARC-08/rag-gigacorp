# backend/routers/chat.py
# Chat API endpoints

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from db import crud
from rag.chain import run_chain
from schemas.models import (
    ChatRequest, 
    ChatResponse, 
    HistoryResponse,
    NewSessionRequest,
    SessionResponse,
    SessionListResponse,
    SessionListItem,
    SourceDocument
)
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/session", response_model=SessionResponse)
async def create_session(
    request: NewSessionRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat session (works for both anonymous and authenticated users)"""
    
    user_id_str = None
    
    # If user provides auth info, get or create them in DB
    if request.user_id and request.email:
        user = await crud.get_or_create_user(
            db=db,
            email=request.email,
            name=request.name or "Unknown",
            google_id=request.user_id
        )
        user_id_str = str(user.id)
    
    # Create session (with or without user)
    session = await crud.create_session(db, user_id_str)
    return SessionResponse(
        session_id=str(session.id),
        created_at=session.created_at
    )

@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """Send a message and get AI response"""
    
    # Validate session exists
    session = await crud.get_session(db, request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Save user message to DB
    await crud.save_message(
        db=db,
        session_id=request.session_id,
        role="user",
        content=request.message
    )
    
    # Run RAG chain with error handling
    try:
        result = await run_chain(
            session_id=request.session_id,
            question=request.message
        )
    except Exception as e:
        logger.error(f"RAG chain error: {e}", exc_info=True)
        fallback = "I'm sorry, I encountered an error while processing your question. Please try again."
        message = await crud.save_message(
            db=db,
            session_id=request.session_id,
            role="assistant",
            content=fallback,
            sources=[]
        )
        return ChatResponse(
            answer=fallback,
            sources=[],
            session_id=request.session_id,
            message_id=str(message.id)
        )
    
    # Format sources
    sources = [SourceDocument(**s) for s in result["sources"]]
    
    # Save assistant message to DB
    message = await crud.save_message(
        db=db,
        session_id=request.session_id,
        role="assistant",
        content=result["answer"],
        sources=[s.model_dump() for s in sources]
    )
    
    return ChatResponse(
        answer=result["answer"],
        sources=sources,
        session_id=request.session_id,
        message_id=str(message.id)
    )

@router.get("/history/{session_id}", response_model=HistoryResponse)
async def get_history(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get chat history for a session"""
    messages = await crud.get_session_messages(db, session_id)
    
    history = []
    for msg in messages:
        sources = None
        if msg.sources:
            sources = [SourceDocument(**s) for s in msg.sources]
        
        history.append({
            "role": msg.role,
            "content": msg.content,
            "sources": sources,
            "created_at": msg.created_at
        })
    
    return HistoryResponse(
        session_id=session_id,
        messages=history
    )

@router.get("/sessions/{user_id}", response_model=SessionListResponse)
async def get_user_sessions(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get all previous sessions for a logged-in user"""
    # First resolve the Google ID to a DB user
    from db.models import User
    from sqlalchemy import select
    
    result = await db.execute(
        select(User).where(User.google_id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        return SessionListResponse(sessions=[])
    
    sessions = await crud.get_user_sessions(db, str(user.id))
    
    items = []
    for s in sessions:
        preview = await crud.get_first_message(db, s.id)
        if not preview:
            continue  # Skip empty sessions with no messages
        items.append(SessionListItem(
            session_id=str(s.id),
            created_at=s.created_at,
            preview=preview[:80] + "..." if len(preview) > 80 else preview
        ))
    
    return SessionListResponse(sessions=items)
