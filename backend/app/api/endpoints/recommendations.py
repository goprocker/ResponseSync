"""AI Recommendations and Decision Intelligence API endpoint."""

from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.orchestrator import DecisionOrchestrator
from app.db.session import get_db

router = APIRouter()


@router.get(
    "/recommendations",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get AI Decision & Explainable Recommendations",
    description="Runs the 3-stage multi-agent pipeline (Threat -> Optimizer -> Gemini XAI) and returns explainable recommendations.",
)
async def get_recommendations(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Execute AI decision intelligence pipeline."""
    return await DecisionOrchestrator.run_pipeline(db)
