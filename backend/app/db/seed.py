"""Seed script populating realistic PostGIS pilot data for Velachery, Chennai."""

import asyncio
import logging
from geoalchemy2.elements import WKTElement
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal
from app.models.enums import (
    EmergencyStatus,
    ResourceStatus,
    ResourceType,
    RiskLevel,
    UserRole,
)
from app.models.evacuation import EvacuationRoute
from app.models.hospital import Hospital
from app.models.knowledge import DecisionKnowledge
from app.models.resource import Resource
from app.models.risk_zone import RiskZone
from app.models.shelter import Shelter
from app.models.simulation import Simulation, SimulationResult
from app.models.user import User
from app.models.weather import WeatherCache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


async def seed_data() -> None:
    """Populate database with pilot data for Velachery, Chennai."""
    async with AsyncSessionLocal() as session:
        logger.info("Starting Velachery, Chennai pilot data seeding...")

        # 1. Seed Users (Authority & Admin)
        admin_user = User(
            email="admin@responsync.org",
            hashed_password="$2b$12$eImiTXuWVxfM37uY4JANjO5E/x./.2k2.z6.3k6",  # placeholder hash
            full_name="Disaster Management Admin",
            role=UserRole.ADMIN,
        )
        authority_user = User(
            email="officer.chennai@responsync.org",
            hashed_password="$2b$12$eImiTXuWVxfM37uY4JANjO5E/x./.2k2.z6.3k6",
            full_name="Chennai Emergency Commander",
            role=UserRole.AUTHORITY,
        )
        session.add_all([admin_user, authority_user])
        await session.flush()

        # 2. Seed Initial Weather Cache for Velachery
        weather = WeatherCache(
            location_name="Velachery, Chennai",
            location=WKTElement("POINT(80.2208 12.9785)", srid=4326),
            rainfall_mm=115.5,
            river_level_m=3.85,
            dam_level_m=14.2,
            dam_discharge_cumecs=450.0,
            wind_speed_kmh=42.0,
            humidity_pct=88.0,
            raw_data={"source": "IMD Open Weather Data", "region": "Chennai South"},
        )
        session.add(weather)

        # 3. Seed Shelters in Velachery
        shelter1 = Shelter(
            name="Velachery MRTS Relief Station",
            location=WKTElement("POINT(80.2208 12.9785)", srid=4326),
            total_capacity=500,
            current_occupancy=120,
            contact_number="+91-44-22430001",
            is_active=True,
        )
        shelter2 = Shelter(
            name="Phoenix Marketcity Community Shelter",
            location=WKTElement("POINT(80.2170 12.9915)", srid=4326),
            total_capacity=350,
            current_occupancy=45,
            contact_number="+91-44-22430002",
            is_active=True,
        )
        shelter3 = Shelter(
            name="AGS Colony Government School",
            location=WKTElement("POINT(80.2135 12.9710)", srid=4326),
            total_capacity=250,
            current_occupancy=80,
            contact_number="+91-44-22430003",
            is_active=True,
        )
        session.add_all([shelter1, shelter2, shelter3])
        await session.flush()

        # 4. Seed Hospitals in Velachery
        hosp1 = Hospital(
            name="Prashanth Super Speciality Hospital",
            location=WKTElement("POINT(80.2230 12.9810)", srid=4326),
            total_beds_available=45,
            icu_beds_available=8,
            emergency_status=EmergencyStatus.NORMAL,
            contact_number="+91-44-46805000",
        )
        hosp2 = Hospital(
            name="SRM Speciality Hospital",
            location=WKTElement("POINT(80.2185 12.9745)", srid=4326),
            total_beds_available=20,
            icu_beds_available=3,
            emergency_status=EmergencyStatus.BUSY,
            contact_number="+91-44-46806000",
        )
        session.add_all([hosp1, hosp2])

        # 5. Seed Risk Zones (PostGIS Polygons around Velachery inundation areas)
        zone1 = RiskZone(
            zone_name="Velachery Lake Surroundings",
            risk_level=RiskLevel.HIGH,
            boundary=WKTElement(
                "POLYGON((80.2150 12.9750, 80.2250 12.9750, 80.2250 12.9850, 80.2150 12.9850, 80.2150 12.9750))",
                srid=4326,
            ),
            flood_depth_m=0.85,
            affected_population=12000,
        )
        zone2 = RiskZone(
            zone_name="Taramani Link Road Corridor",
            risk_level=RiskLevel.MODERATE,
            boundary=WKTElement(
                "POLYGON((80.2250 12.9850, 80.2350 12.9850, 80.2350 12.9950, 80.2250 12.9950, 80.2250 12.9850))",
                srid=4326,
            ),
            flood_depth_m=0.40,
            affected_population=8500,
        )
        session.add_all([zone1, zone2])
        await session.flush()

        # 6. Seed Emergency Resources
        res1 = Resource(
            name="NDRF Rescue Boat Unit Alpha",
            resource_type=ResourceType.RESCUE_BOAT,
            status=ResourceStatus.AVAILABLE,
            current_location=WKTElement("POINT(80.2200 12.9790)", srid=4326),
            assigned_zone_id=zone1.id,
            capacity=15,
        )
        res2 = Resource(
            name="Chennai Fire & Rescue Squad 1",
            resource_type=ResourceType.FIRE_TRUCK,
            status=ResourceStatus.AVAILABLE,
            current_location=WKTElement("POINT(80.2150 12.9860)", srid=4326),
            capacity=6,
        )
        res3 = Resource(
            name="108 Emergency Ambulance 3",
            resource_type=ResourceType.AMBULANCE,
            status=ResourceStatus.AVAILABLE,
            current_location=WKTElement("POINT(80.2240 12.9750)", srid=4326),
            capacity=2,
        )
        session.add_all([res1, res2, res3])

        # 7. Seed Evacuation Route (PostGIS LineString to Velachery MRTS Shelter)
        route1 = EvacuationRoute(
            route_name="Taramani-Velachery Safe Corridor A",
            start_location=WKTElement("POINT(80.2280 12.9880)", srid=4326),
            destination_shelter_id=shelter1.id,
            route_geometry=WKTElement(
                "LINESTRING(80.2280 12.9880, 80.2240 12.9830, 80.2208 12.9785)",
                srid=4326,
            ),
            is_blocked=False,
            estimated_travel_time_mins=12.5,
            safety_score=0.92,
        )
        session.add(route1)

        # 8. Seed Pre-Computed Simulation & Knowledge Base Scenarios for Matching
        sim1 = Simulation(
            name="Velachery Heavy Downpour 150mm Run",
            description="Pre-simulated run with 150mm rainfall and Chembarambakkam 500 cumecs discharge",
            input_parameters={
                "rainfall_mm": 150.0,
                "river_level_m": 4.2,
                "dam_discharge_cumecs": 500.0,
            },
            status="COMPLETED",
        )
        session.add(sim1)
        await session.flush()

        knowledge1 = DecisionKnowledge(
            simulation_id=sim1.id,
            scenario_vector={
                "rainfall_mm": 150.0,
                "river_level_m": 4.2,
                "dam_discharge_cumecs": 500.0,
                "inundation_risk_index": 0.85,
            },
            input_conditions={
                "location": "Velachery, Chennai",
                "weather_severity": "HIGH",
            },
            recommended_actions={
                "primary_shelter": "Velachery MRTS Relief Station",
                "dispatch_units": ["NDRF Rescue Boat Unit Alpha"],
                "evacuation_routes": ["Taramani-Velachery Safe Corridor A"],
            },
            outcome_effectiveness=94.5,
            lessons_learned="Prioritize MRTS station elevation for non-inundated evacuee staging.",
        )
        session.add(knowledge1)

        await session.commit()
        logger.info("Velachery pilot data successfully seeded into database!")


if __name__ == "__main__":
    asyncio.run(seed_data())
