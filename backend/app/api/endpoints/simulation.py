"""Disaster simulation API endpoints."""

import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.simulation import SimulationCreate, SimulationResponse
from app.services.simulation_service import SimulationService

router = APIRouter()


@router.post(
    "/simulate",
    response_model=SimulationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Run Disaster Simulation",
    description="Executes a parameterized disaster simulation (rainfall, dam discharge) and stores results.",
)
async def create_simulation(
    sim_in: SimulationCreate, db: AsyncSession = Depends(get_db)
) -> SimulationResponse:
    """Run new disaster scenario simulation."""
    return await SimulationService.create_simulation(db, sim_in)


@router.get(
    "/simulations",
    response_model=List[SimulationResponse],
    status_code=status.HTTP_200_OK,
    summary="List Simulation Runs",
)
async def list_simulations(db: AsyncSession = Depends(get_db)) -> List[SimulationResponse]:
    """Retrieve historical simulation runs."""
    return await SimulationService.list_simulations(db)


@router.get(
    "/simulation/{simulation_id}",
    response_model=SimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Specific Simulation",
)
async def get_simulation(
    simulation_id: uuid.UUID, db: AsyncSession = Depends(get_db)
) -> SimulationResponse:
    """Get simulation details by UUID."""
    return await SimulationService.get_simulation_by_id(db, simulation_id)
