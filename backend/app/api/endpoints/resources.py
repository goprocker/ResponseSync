"""Emergency response resources API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.resource import Resource
from app.schemas.resource import ResourceResponse

router = APIRouter()


@router.get(
    "/resources",
    response_model=List[ResourceResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Emergency Response Assets",
    description="Returns rescue boats, ambulances, fire trucks, and relief teams with current PostGIS location.",
)
async def get_resources(db: AsyncSession = Depends(get_db)) -> List[ResourceResponse]:
    """Retrieve emergency resource units."""
    result = await db.execute(select(Resource))
    return list(result.scalars().all())
