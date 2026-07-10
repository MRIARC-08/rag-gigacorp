# backend/db/models.py
# SQLAlchemy ORM table definitions

from sqlalchemy import (
    Column, String, Text, DateTime, 
    ForeignKey, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sessions = relationship("ChatSession", back_populates="user")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"), 
        nullable=True  # Allow anonymous sessions
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="sessions")
    messages = relationship("ChatMessage", back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    session_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("chat_sessions.id"), 
        nullable=False
    )
    role = Column(String, nullable=False)      # "user" or "assistant"
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)       # Store citations as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("ChatSession", back_populates="messages")
