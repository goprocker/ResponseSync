"""Middleware package."""

from app.middleware.cors import setup_cors_middleware
from app.middleware.logging import LoggingMiddleware

__all__ = ["setup_cors_middleware", "LoggingMiddleware"]
