"""Main API router combining all endpoint routers."""

from fastapi import APIRouter

from app.api.endpoints.evacuation import router as evacuation_router
from app.api.endpoints.health import router as health_router
from app.api.endpoints.hospitals import router as hospitals_router
from app.api.endpoints.recommendations import router as recommendations_router
from app.api.endpoints.reports import router as reports_router
from app.api.endpoints.resources import router as resources_router
from app.api.endpoints.risk import router as risk_router
from app.api.endpoints.shelters import router as shelters_router
from app.api.endpoints.simulation import router as simulation_router
from app.api.endpoints.weather import router as weather_router

api_router = APIRouter()

# Register endpoint routers
api_router.include_router(health_router, tags=["Health Check"])
api_router.include_router(weather_router, tags=["Weather & Telemetry"])
api_router.include_router(reports_router, tags=["Citizen Reports"])
api_router.include_router(risk_router, tags=["Digital Twin - Risk Zones"])
api_router.include_router(resources_router, tags=["Digital Twin - Resources"])
api_router.include_router(shelters_router, tags=["Digital Twin - Shelters"])
api_router.include_router(hospitals_router, tags=["Digital Twin - Hospitals"])
api_router.include_router(evacuation_router, tags=["Digital Twin - Evacuation Routes"])
api_router.include_router(simulation_router, tags=["Disaster Simulation"])
api_router.include_router(recommendations_router, tags=["AI Decision & Recommendations"])
