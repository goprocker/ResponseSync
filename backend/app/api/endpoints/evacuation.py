"""Evacuation route API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.evacuation import EvacuationRoute
from app.schemas.evacuation import EvacuationRouteResponse

router = APIRouter()


@router.get(
    "/evacuation",
    response_model=List[EvacuationRouteResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Evacuation Routes",
    description="Returns calculated evacuation LineStrings, blockage status, travel time, and safety scores.",
)
async def get_evacuation_routes(db: AsyncSession = Depends(get_db)) -> List[EvacuationRouteResponse]:
    """Retrieve evacuation routes."""
    result = await db.execute(select(EvacuationRoute))
    return list(result.scalars().all())
