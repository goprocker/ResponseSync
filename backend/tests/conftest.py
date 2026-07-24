"""Pytest fixtures for ResponSync backend testing with in-memory test database override."""

import asyncio
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app

# Create in-memory SQLite engine for fast offline test execution
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
)


@event.listens_for(test_engine.sync_engine, "connect")
def _register_sqlite_spatial_stubs(dbapi_connection, connection_record):
    """Register SQLite C function stubs on raw stdlib sqlite3 connection."""
    raw_sqlite_conn = getattr(dbapi_connection, "_conn", dbapi_connection)
    if hasattr(raw_sqlite_conn, "create_function"):
        raw_sqlite_conn.create_function("GeomFromEWKT", 1, lambda val: val)
        raw_sqlite_conn.create_function("ST_GeomFromEWKT", 1, lambda val: val)
        raw_sqlite_conn.create_function("ST_GeomFromText", 1, lambda val: val)
        raw_sqlite_conn.create_function("ST_AsText", 1, lambda val: val)


TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(autouse=True)
async def prepare_test_db():
    """Create all database tables before test run and clean up after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """Override FastAPI get_db dependency with in-memory test session."""
    async with TestingSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client fixture configured for testing FastAPI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as client:
        yield client
