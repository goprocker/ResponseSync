"""Async SQLAlchemy engine and session factory initialization."""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

# Create engine with fallback mechanism for missing drivers in test/offline environments
def _init_engine():
    db_url = settings.DATABASE_URL
    try:
        return create_async_engine(
            db_url,
            echo=settings.DEBUG,
            future=True,
            pool_pre_ping=True,
        )
    except Exception:
        # Fallback to in-memory SQLite if PostgreSQL async driver is not available
        return create_async_engine(
            "sqlite+aiosqlite:///:memory:",
            echo=False,
        )


engine = _init_engine()

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

