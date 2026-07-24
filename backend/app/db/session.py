"""FastAPI dependency for injecting async database sessions."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session for request handling."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
