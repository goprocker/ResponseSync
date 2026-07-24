"""Disaster simulation engine service."""

import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException
from app.models.simulation import Simulation, SimulationResult
from app.schemas.simulation import SimulationCreate


class SimulationService:
    """Service executing parameterized disaster simulations and recording outcomes."""

    @classmethod
    async def create_simulation(
        cls, session: AsyncSession, sim_in: SimulationCreate
    ) -> Simulation:
        """Run a parameterized disaster simulation and save output predictions."""
        sim = Simulation(
            name=sim_in.name,
            description=sim_in.description,
            input_parameters=sim_in.input_parameters,
            status="RUNNING",
        )
        session.add(sim)
        await session.flush()

        # Execute simulation calculation (hydrology & flood depth projection)
        rainfall = float(sim_in.input_parameters.get("rainfall_mm", 100.0))
        dam_discharge = float(sim_in.input_parameters.get("dam_discharge_cumecs", 300.0))

        projected_depth = round((rainfall * 0.005) + (dam_discharge * 0.0008), 2)
        effectiveness = round(max(50.0, 100.0 - (projected_depth * 25.0)), 2)

        result_entry = SimulationResult(
            simulation_id=sim.id,
            flood_spread_data={
                "projected_depth_m": projected_depth,
                "high_risk_zones": ["Velachery Lake Surroundings", "100 Feet Bypass Road"],
                "inundated_area_sq_km": round(projected_depth * 1.8, 2),
            },
            recommended_evacuation_plan={
                "primary_corridor": "Taramani-Velachery Safe Corridor A",
                "target_shelter": "Velachery MRTS Relief Station",
            },
            recommended_resource_plan={
                "rescue_boats_needed": 3 if projected_depth > 0.5 else 1,
                "ambulances_assigned": 2,
            },
            effectiveness_score=effectiveness,
            ai_confidence_pct=91.5,
        )

        sim.status = "COMPLETED"
        session.add(result_entry)
        await session.commit()

        # Re-fetch simulation with eagerly loaded results relationship
        return await cls.get_simulation_by_id(session, sim.id)

    @classmethod
    async def get_simulation_by_id(
        cls, session: AsyncSession, sim_id: uuid.UUID
    ) -> Simulation:
        """Fetch simulation metadata and results by ID."""
        result = await session.execute(
            select(Simulation).options(selectinload(Simulation.results)).where(Simulation.id == sim_id)
        )
        sim = result.scalars().first()
        if not sim:
            raise NotFoundException(f"Simulation '{sim_id}' not found.")
        return sim

    @classmethod
    async def list_simulations(cls, session: AsyncSession) -> List[Simulation]:
        """List all historical simulation runs."""
        result = await session.execute(
            select(Simulation).options(selectinload(Simulation.results)).order_by(Simulation.created_at.desc())
        )
        return list(result.scalars().all())
