-- Migration: Initial Schema for ResponseSync
-- Applied to Supabase Project: ipusfdckrmhsuxgcxtfo

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE userrole AS ENUM ('CITIZEN', 'AUTHORITY', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reportcategory AS ENUM ('FLOOD', 'ROAD_BLOCKED', 'MEDICAL_EMERGENCY', 'SHELTER_NEEDED', 'HAZARD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severitylevel AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reportstatus AS ENUM ('PENDING', 'VERIFIED', 'DISPATCHED', 'RESOLVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risklevel AS ENUM ('SAFE', 'LOW', 'MODERATE', 'HIGH', 'SEVERE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resourcetype AS ENUM ('RESCUE_BOAT', 'AMBULANCE', 'FIRE_TRUCK', 'FOOD_SUPPLIES', 'PERSONNEL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resourcestatus AS ENUM ('AVAILABLE', 'DEPLOYED', 'MAINTENANCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE emergencystatus AS ENUM ('NORMAL', 'BUSY', 'FULL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role userrole NOT NULL DEFAULT 'CITIZEN',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- 2. Risk Zones Table
CREATE TABLE IF NOT EXISTS risk_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name VARCHAR(255) NOT NULL,
    risk_level risklevel NOT NULL DEFAULT 'SAFE',
    boundary GEOMETRY(POLYGON, 4326) NOT NULL,
    flood_depth_m DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    affected_population INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_risk_zones_risk_level ON risk_zones(risk_level);
CREATE INDEX IF NOT EXISTS ix_risk_zones_boundary ON risk_zones USING GIST(boundary);

-- 3. Shelters Table
CREATE TABLE IF NOT EXISTS shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location GEOMETRY(POINT, 4326) NOT NULL,
    total_capacity INTEGER NOT NULL DEFAULT 100,
    current_occupancy INTEGER NOT NULL DEFAULT 0,
    contact_number VARCHAR(50) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_shelters_location ON shelters USING GIST(location);

-- 4. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location GEOMETRY(POINT, 4326) NOT NULL,
    icu_beds_available INTEGER NOT NULL DEFAULT 0,
    total_beds_available INTEGER NOT NULL DEFAULT 0,
    emergency_status emergencystatus NOT NULL DEFAULT 'NORMAL',
    contact_number VARCHAR(50) NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_hospitals_location ON hospitals USING GIST(location);

-- 5. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category reportcategory NOT NULL,
    severity severitylevel NOT NULL DEFAULT 'MEDIUM',
    status reportstatus NOT NULL DEFAULT 'PENDING',
    location GEOMETRY(POINT, 4326) NOT NULL,
    media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS ix_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS ix_reports_location ON reports USING GIST(location);
CREATE INDEX IF NOT EXISTS ix_reports_created_at ON reports(created_at);

-- 6. Weather Cache Table
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_name VARCHAR(255) NOT NULL,
    location GEOMETRY(POINT, 4326) NOT NULL,
    rainfall_mm DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    river_level_m DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    dam_level_m DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    dam_discharge_cumecs DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    wind_speed_kmh DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    humidity_pct DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_weather_cache_location_name ON weather_cache(location_name);
CREATE INDEX IF NOT EXISTS ix_weather_cache_cached_at ON weather_cache(cached_at);

-- 7. Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    resource_type resourcetype NOT NULL,
    status resourcestatus NOT NULL DEFAULT 'AVAILABLE',
    current_location GEOMETRY(POINT, 4326) NOT NULL,
    assigned_zone_id UUID REFERENCES risk_zones(id) ON DELETE SET NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_resources_resource_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS ix_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS ix_resources_current_location ON resources USING GIST(current_location);

-- 8. Evacuation Routes Table
CREATE TABLE IF NOT EXISTS evacuation_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name VARCHAR(255) NOT NULL,
    start_location GEOMETRY(POINT, 4326) NOT NULL,
    destination_shelter_id UUID REFERENCES shelters(id) ON DELETE SET NULL,
    route_geometry GEOMETRY(LINESTRING, 4326) NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    estimated_travel_time_mins DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    safety_score DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_evacuation_routes_route_geometry ON evacuation_routes USING GIST(route_geometry);
CREATE INDEX IF NOT EXISTS ix_evacuation_routes_is_blocked ON evacuation_routes(is_blocked);

-- 9. Simulations Table
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    input_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_simulations_status ON simulations(status);
CREATE INDEX IF NOT EXISTS ix_simulations_created_at ON simulations(created_at);

-- 10. Simulation Results Table
CREATE TABLE IF NOT EXISTS simulation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    flood_spread_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommended_evacuation_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommended_resource_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
    effectiveness_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    ai_confidence_pct DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Decision Knowledge Base Table
CREATE TABLE IF NOT EXISTS decision_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID REFERENCES simulations(id) ON DELETE SET NULL,
    scenario_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
    input_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    recommended_actions JSONB NOT NULL DEFAULT '{}'::jsonb,
    outcome_effectiveness DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    lessons_learned TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_decision_knowledge_created_at ON decision_knowledge(created_at);
