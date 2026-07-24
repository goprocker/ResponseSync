"""Pydantic schemas for health check endpoint."""

from typing import Dict, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Response model for /health endpoint."""

    status: str = Field(default="healthy", description="Current operational status of the service")
    app_name: Optional[str] = Field(default="ResponSync Backend", description="Application name")
    environment: Optional[str] = Field(default="development", description="Current environment")
    version: Optional[str] = Field(default="0.1.0", description="Application version")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp of health check")
    services: Optional[Dict[str, str]] = Field(default=None, description="Status of internal subsystems")

