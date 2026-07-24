"""Pydantic schemas for Simulation and SimulationResult entities."""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class SimulationCreate(BaseModel):
    name: str
    description: str = ""
    input_parameters: dict  # e.g., {"rainfall_mm": 120.0, "dam_discharge_cumecs": 500.0}


class SimulationResultResponse(BaseModel):
    id: uuid.UUID
    simulation_id: uuid.UUID
    flood_spread_data: dict
    recommended_evacuation_plan: dict
    recommended_resource_plan: dict
    effectiveness_score: float
    ai_confidence_pct: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SimulationResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str
    input_parameters: dict
    status: str
    created_at: datetime
    results: List[SimulationResultResponse] = []

    model_config = ConfigDict(from_attributes=True)
