"""Pydantic validation schemas package exposing all request and response DTOs."""

from app.schemas.common import GeoJSONLineString, GeoJSONPoint, GeoJSONPolygon
from app.schemas.evacuation import EvacuationRouteCreate, EvacuationRouteResponse
from app.schemas.health import HealthResponse
from app.schemas.hospital import HospitalCreate, HospitalResponse
from app.schemas.knowledge import DecisionKnowledgeCreate, DecisionKnowledgeResponse
from app.schemas.report import ReportCreate, ReportResponse, ReportStatusUpdate
from app.schemas.resource import ResourceCreate, ResourceResponse
from app.schemas.risk_zone import RiskZoneCreate, RiskZoneResponse
from app.schemas.shelter import ShelterCreate, ShelterResponse
from app.schemas.simulation import (
    SimulationCreate,
    SimulationResponse,
    SimulationResultResponse,
)
from app.schemas.user import UserCreate, UserResponse
from app.schemas.weather import WeatherCreate, WeatherResponse

__all__ = [
    "HealthResponse",
    "GeoJSONPoint",
    "GeoJSONLineString",
    "GeoJSONPolygon",
    "UserCreate",
    "UserResponse",
    "ReportCreate",
    "ReportStatusUpdate",
    "ReportResponse",
    "WeatherCreate",
    "WeatherResponse",
    "RiskZoneCreate",
    "RiskZoneResponse",
    "ResourceCreate",
    "ResourceResponse",
    "ShelterCreate",
    "ShelterResponse",
    "HospitalCreate",
    "HospitalResponse",
    "EvacuationRouteCreate",
    "EvacuationRouteResponse",
    "SimulationCreate",
    "SimulationResponse",
    "SimulationResultResponse",
    "DecisionKnowledgeCreate",
    "DecisionKnowledgeResponse",
]
