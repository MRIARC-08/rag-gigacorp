# backend/db/crud.py
# All database read/write operations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from db.models import User, ChatSession, ChatMessage
import uuid

# ── User Operations ──────────────────────────────────

async def get_or_create_user(
    db: AsyncSession,
    email: str,
    name: str,
    google_id: str,
    avatar_url: str = None
) -> User:
    # Try to find existing user
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        user = User(
            email=email,
            name=name,
            google_id=google_id,
            avatar_url=avatar_url
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user

# ── Session Operations ───────────────────────────────

async def create_session(
    db: AsyncSession, 
    user_id: str = None
) -> ChatSession:
    session = ChatSession(
        user_id=uuid.UUID(user_id) if user_id else None
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

async def get_session(
    db: AsyncSession, 
    session_id: str
) -> ChatSession:
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == uuid.UUID(session_id)
        )
    )
    return result.scalar_one_or_none()

async def get_user_sessions(
    db: AsyncSession,
    user_id: str,
    limit: int = 20
) -> list[ChatSession]:
    """Get all sessions for a user, ordered by newest first"""
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == uuid.UUID(user_id))
        .order_by(desc(ChatSession.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())

async def get_first_message(
    db: AsyncSession,
    session_id: uuid.UUID
) -> str | None:
    """Get the first user message in a session (for preview)"""
    result = await db.execute(
        select(ChatMessage.content)
        .where(ChatMessage.session_id == session_id)
        .where(ChatMessage.role == "user")
        .order_by(ChatMessage.created_at)
        .limit(1)
    )
    row = result.scalar_one_or_none()
    return row

# ── Message Operations ───────────────────────────────

async def save_message(
    db: AsyncSession,
    session_id: str,
    role: str,
    content: str,
    sources: list = None
) -> ChatMessage:
    message = ChatMessage(
        session_id=uuid.UUID(session_id),
        role=role,
        content=content,
        sources=sources
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message

async def get_session_messages(
    db: AsyncSession,
    session_id: str,
    limit: int = 20
) -> list[ChatMessage]:
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == uuid.UUID(session_id))
        .order_by(desc(ChatMessage.created_at))
        .limit(limit)
    )
    messages = result.scalars().all()
    return list(reversed(messages))  # Return in chronological order
