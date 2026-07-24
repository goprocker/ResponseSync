"""SQLAlchemy 2.0 declarative base setup with spatial / GeoAlchemy2 readiness."""

from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase


class Base(AsyncAttrs, DeclarativeBase):
    """Base declarative class for all SQLAlchemy models in ResponSync."""

    pass
