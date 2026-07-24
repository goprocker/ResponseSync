"""Pydantic schemas for health check endpoint."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Response model for /health endpoint."""

    status: str = Field(default="healthy", description="Current operational status of the service")
