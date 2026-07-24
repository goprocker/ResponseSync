"""Emergency shelters API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.shelter import Shelter
from app.schemas.shelter import ShelterResponse

router = APIRouter()


@router.get(
    "/shelters",
    response_model=List[ShelterResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Emergency Shelters",
    description="Returns emergency relief shelters, locations, total capacities, and live occupancy.",
)
async def get_shelters(db: AsyncSession = Depends(get_db)) -> List[ShelterResponse]:
    """Retrieve shelter locations and live occupancy."""
    result = await db.execute(select(Shelter))
    return list(result.scalars().all())
