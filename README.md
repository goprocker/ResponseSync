<div align="center">
  <h1>ResponSync ⚡</h1>
  <p><strong>AI-Powered Emergency Response & Disaster Management Platform</strong></p>
  <p>Real-time disaster coordination with multi-agent AI intelligence, geospatial analysis, and live citizen reporting.</p>

  <p>
    <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Python_3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/PostGIS-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostGIS" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
    <img src="https://img.shields.io/badge/SQLAlchemy_2.0-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy" />
  </p>
</div>

<br />

## 📖 Project Overview

**ResponSync** is a production-grade, full-stack emergency response platform that transforms how disaster situations are managed — from citizen reporting to AI-driven resource allocation.

Traditional disaster management relies on fragmented communication, delayed response chains, and manual resource coordination. ResponSync eliminates these bottlenecks by combining **real-time geospatial intelligence**, **multi-agent AI orchestration**, and **live citizen hazard reporting** into a unified command platform.

Powered by **Google Gemini** and a multi-agent architecture (Threat Assessment → Strategic Planning → Explainability), ResponSync autonomously analyzes incoming reports, predicts risk propagation, optimizes evacuation routes, and dispatches resources — all while providing transparent, explainable reasoning to emergency coordinators.

---

## ✨ Key Features

- **🚨 Citizen Hazard Reporting:** Citizens submit geo-tagged emergency reports (floods, road blocks, medical emergencies) with severity levels and real-time status tracking through a complete lifecycle (Pending → Verified → Dispatched → Resolved).
- **🤖 Multi-Agent AI Orchestration:** Three specialized Gemini agents work in concert — a **Threat Assessment Agent** analyzes incoming data, a **Strategic Planner Agent** generates optimized response plans, and an **Explainability Agent** translates AI decisions into human-readable reasoning.
- **🗺️ Geospatial Intelligence:** Full PostGIS/GeoAlchemy2 integration for spatial queries — risk zone detection, nearest-shelter routing, hospital proximity analysis, and evacuation zone management with real-time geographic coordinates.
- **🏥 Hospital & Shelter Management:** Track hospital capacity (bed counts, emergency status), shelter availability, and resource deployment status across the disaster zone with live updates.
- **📊 Disaster Simulation Engine:** Run predictive simulations with configurable parameters (population, severity, affected area) to forecast resource needs, generate risk scores, and plan preemptive evacuations.
- **🌦️ Weather Intelligence:** Real-time OpenWeather API integration for weather monitoring, flood risk assessment, and environmental condition tracking in affected zones.
- **⚡ Resource Matching & Dispatch:** Intelligent matching service that optimizes deployment of rescue boats, ambulances, fire trucks, food supplies, and personnel based on proximity, urgency, and availability.
- **📡 Real-time Health Monitoring:** Live fullstack integration dashboard with backend health checks, service status monitoring, latency tracking, and automatic reconnection.

---

## 🏗️ System Architecture

ResponSync follows a fully decoupled, production-grade architecture with a React SPA frontend communicating through a Vite dev proxy to a FastAPI async backend, backed by Supabase PostgreSQL with PostGIS extensions and AI-powered by Google Gemini.

### High-Level Architecture

```mermaid
flowchart TD
    %% Define Nodes
    User([👤 Citizen / Authority])

    subgraph Client ["🖥️ Frontend SPA"]
        UI["React 19 + Vite 8<br/>TypeScript"]
        Dashboard["Integration Dashboard<br/>Health Monitor"]
    end

    subgraph Gateway ["🔀 API Gateway"]
        Proxy["Vite Dev Proxy<br/>:5173 → :8000"]
        CORS["CORS Middleware"]
        Logger["Request Logging<br/>Middleware"]
    end

    subgraph API ["⚡ FastAPI Backend"]
        Router["API Router<br/>/api/v1/*"]
        Health["Health Check<br/>/health"]
        Endpoints["Endpoint Handlers<br/>Reports · Resources · Shelters"]
    end

    subgraph Services ["🧩 Business Logic"]
        ReportSvc["Report Service"]
        WeatherSvc["Weather Service"]
        MatchSvc["Matching Service"]
        SimSvc["Simulation Service"]
    end

    subgraph Intelligence ["🤖 AI Agent Layer"]
        Orchestrator["Agent Orchestrator"]
        ThreatAgent["Threat Assessment<br/>Agent"]
        PlannerAgent["Strategic Planner<br/>Agent"]
        ExplainAgent["Explainability<br/>Agent"]
    end

    subgraph Data ["🗄️ Data Layer"]
        ORM["SQLAlchemy 2.0<br/>(Async)"]
        Geo["GeoAlchemy2<br/>PostGIS"]
        Alembic["Alembic<br/>Migrations"]
    end

    subgraph Storage ["☁️ Cloud Infrastructure"]
        DB[("Supabase<br/>PostgreSQL")]
        PostGIS[("PostGIS<br/>Spatial Index")]
    end

    subgraph External ["🌐 External APIs"]
        Gemini["Google Gemini<br/>GenAI SDK"]
        OpenWeather["OpenWeather API"]
        Mapbox["Mapbox GL<br/>Geocoding"]
    end

    %% Connections
    User -->|Submits Reports| UI
    User -->|Views Dashboard| Dashboard
    UI --> Proxy
    Dashboard --> Proxy
    Proxy --> CORS --> Logger --> Router
    Proxy --> Health

    Router --> Endpoints
    Endpoints --> ReportSvc & WeatherSvc & MatchSvc & SimSvc

    ReportSvc --> Orchestrator
    SimSvc --> Orchestrator
    Orchestrator --> ThreatAgent & PlannerAgent & ExplainAgent
    ThreatAgent & PlannerAgent & ExplainAgent --> Gemini

    WeatherSvc --> OpenWeather
    MatchSvc --> Geo

    ReportSvc & MatchSvc & SimSvc --> ORM
    ORM --> DB
    Geo --> PostGIS
    Alembic --> DB
```

### Multi-Agent AI Workflow

The intelligence layer uses a coordinated multi-agent pipeline where each agent has a specialized role in the decision chain:

```mermaid
sequenceDiagram
    participant C as 🚨 Citizen Report
    participant O as 🎯 Orchestrator
    participant T as 🔍 Threat Agent
    participant P as 📋 Planner Agent
    participant E as 💬 Explainability Agent
    participant G as 🤖 Gemini API
    participant D as 🗄️ Database

    C->>O: New hazard report received
    O->>D: Fetch context (nearby reports, resources, weather)
    D-->>O: Contextual data

    O->>T: Analyze threat level & propagation risk
    T->>G: Threat assessment prompt + context
    G-->>T: Risk score, affected zones, urgency
    T-->>O: Threat analysis result

    O->>P: Generate strategic response plan
    P->>G: Planning prompt + threat data + resources
    G-->>P: Optimized plan (evacuations, dispatch, priorities)
    P-->>O: Strategic plan

    O->>E: Explain AI decisions in human terms
    E->>G: Explain prompt + threat + plan data
    G-->>E: Transparent reasoning & justifications
    E-->>O: Explainable summary

    O->>D: Store final assessment + plan
    O-->>C: Response dispatched ✅
```

### Request Lifecycle

```mermaid
flowchart LR
    A["HTTP Request"] --> B["CORS Middleware"]
    B --> C["Logging Middleware"]
    C --> D["FastAPI Router"]
    D --> E{"Route Match?"}
    E -->|Yes| F["Endpoint Handler"]
    E -->|No| G["404 Response"]
    F --> H["Pydantic Validation"]
    H -->|Valid| I["Service Layer"]
    H -->|Invalid| J["422 Validation Error"]
    I --> K["SQLAlchemy ORM"]
    K --> L[("Supabase DB")]
    L --> K
    K --> I
    I --> F
    F --> M["Pydantic Response"]
    M --> N["JSON Response"]

    style A fill:#4A90D9,color:#fff
    style L fill:#3ECF8E,color:#fff
    style N fill:#009688,color:#fff
```

---

## 🗄️ Database Schema

The data model is defined with SQLAlchemy 2.0 ORM and runs on PostgreSQL with PostGIS spatial extensions. The schema captures users, hazard reports, emergency resources, shelters, hospitals, risk zones, evacuation routes, weather data, simulation runs, and AI knowledge bases.

```mermaid
erDiagram
    USER ||--o{ REPORT : "submits"
    USER ||--o{ SIMULATION : "runs"

    REPORT ||--o{ RESOURCE : "triggers dispatch"
    REPORT }o--|| RISK_ZONE : "located in"

    RISK_ZONE ||--o{ EVACUATION_ROUTE : "evacuates from"
    RISK_ZONE ||--o{ SHELTER : "routes to"

    SHELTER ||--o{ RESOURCE : "hosts"
    HOSPITAL ||--o{ RESOURCE : "requests"

    WEATHER }o--|| RISK_ZONE : "affects"
    KNOWLEDGE_BASE }o--|| SIMULATION : "informs"

    USER {
        uuid id PK
        string email UK
        string password_hash
        enum role "CITIZEN | AUTHORITY | ADMIN"
        string phone
        point location "PostGIS POINT"
        datetime created_at
    }

    REPORT {
        uuid id PK
        uuid user_id FK
        enum category "FLOOD | ROAD_BLOCKED | MEDICAL | SHELTER | HAZARD"
        enum severity "LOW | MEDIUM | HIGH | CRITICAL"
        enum status "PENDING → VERIFIED → DISPATCHED → RESOLVED"
        text description
        point location "PostGIS POINT"
        datetime created_at
    }

    RESOURCE {
        uuid id PK
        enum type "RESCUE_BOAT | AMBULANCE | FIRE_TRUCK | FOOD | PERSONNEL"
        enum status "AVAILABLE | DEPLOYED | MAINTENANCE"
        point current_location "PostGIS POINT"
        uuid assigned_report FK
    }

    SHELTER {
        uuid id PK
        string name
        int capacity
        int current_occupancy
        point location "PostGIS POINT"
        boolean is_active
    }

    HOSPITAL {
        uuid id PK
        string name
        int total_beds
        int available_beds
        enum emergency_status "NORMAL | BUSY | FULL"
        point location "PostGIS POINT"
    }

    RISK_ZONE {
        uuid id PK
        string zone_name
        enum risk_level "SAFE | LOW | MODERATE | HIGH | SEVERE"
        polygon boundary "PostGIS POLYGON"
        float flood_probability
    }

    EVACUATION_ROUTE {
        uuid id PK
        uuid risk_zone_id FK
        uuid destination_shelter_id FK
        linestring path "PostGIS LINESTRING"
        float distance_km
        int estimated_time_min
    }

    WEATHER {
        uuid id PK
        point location "PostGIS POINT"
        float temperature
        float rainfall_mm
        float wind_speed
        string conditions
        datetime recorded_at
    }

    SIMULATION {
        uuid id PK
        uuid user_id FK
        string scenario_name
        json parameters
        json results
        float risk_score
        datetime created_at
    }

    KNOWLEDGE_BASE {
        uuid id PK
        string topic
        text content
        string source
        datetime created_at
    }
```

---

## 📁 Project Structure

```
responsync/
├── 📦 package.json                # Root frontend dependencies & scripts
├── 🔧 vite.config.ts             # Vite dev server + proxy configuration
├── 📝 tsconfig.json              # TypeScript configuration
├── 🚫 .gitignore                 # Git exclusion rules
│
├── src/                           # ── FRONTEND (React 19 + TypeScript) ──
│   ├── main.tsx                   # React DOM entry point
│   ├── App.tsx                    # Root component — Integration Dashboard
│   ├── App.css                    # Application styles
│   ├── index.css                  # Global CSS reset & variables
│   └── assets/                    # Static assets (images, icons)
│
├── public/                        # Static public files
├── dist/                          # Production build output
│
└── backend/                       # ── BACKEND (FastAPI + Python 3.12) ──
    ├── requirements.txt           # Python dependencies
    ├── alembic.ini                # Alembic migration configuration
    ├── .env.example               # Environment variables template
    │
    ├── alembic/                   # Database migration scripts
    │   ├── env.py                 # Migration environment config
    │   ├── script.py.mako         # Migration template
    │   └── versions/              # Versioned migration files
    │
    ├── app/
    │   ├── main.py                # FastAPI app factory & lifespan
    │   │
    │   ├── api/                   # API routing layer
    │   │   ├── router.py          # Central router aggregator
    │   │   └── endpoints/         # Route handlers
    │   │       └── health.py      # Health check endpoint
    │   │
    │   ├── core/                  # Application foundation
    │   │   ├── config.py          # Pydantic Settings (env management)
    │   │   ├── exceptions.py      # Custom exception handlers
    │   │   └── logging.py         # Structured logging setup
    │   │
    │   ├── db/                    # Database infrastructure
    │   │   ├── base.py            # SQLAlchemy declarative base
    │   │   ├── database.py        # Async engine factory
    │   │   └── session.py         # Session dependency injection
    │   │
    │   ├── models/                # SQLAlchemy ORM models
    │   │   ├── enums.py           # UserRole, Severity, Status enums
    │   │   ├── user.py            # User model
    │   │   ├── report.py          # Hazard report model
    │   │   ├── resource.py        # Emergency resource model
    │   │   ├── shelter.py         # Shelter model
    │   │   ├── hospital.py        # Hospital model
    │   │   ├── risk_zone.py       # Risk zone (PostGIS polygon)
    │   │   ├── evacuation.py      # Evacuation route model
    │   │   ├── weather.py         # Weather data model
    │   │   ├── simulation.py      # Simulation run model
    │   │   └── knowledge.py       # Knowledge base model
    │   │
    │   ├── schemas/               # Pydantic v2 request/response schemas
    │   │   ├── common.py          # Shared schema utilities
    │   │   ├── health.py          # Health check schemas
    │   │   ├── user.py            # User CRUD schemas
    │   │   ├── report.py          # Report schemas
    │   │   ├── resource.py        # Resource schemas
    │   │   ├── shelter.py         # Shelter schemas
    │   │   ├── hospital.py        # Hospital schemas
    │   │   ├── risk_zone.py       # Risk zone schemas
    │   │   ├── evacuation.py      # Evacuation schemas
    │   │   ├── weather.py         # Weather schemas
    │   │   ├── simulation.py      # Simulation schemas
    │   │   └── knowledge.py       # Knowledge base schemas
    │   │
    │   ├── services/              # Business logic layer
    │   │   ├── report_service.py  # Report CRUD & lifecycle
    │   │   ├── weather_service.py # OpenWeather API integration
    │   │   ├── matching_service.py# Resource-to-report matching
    │   │   └── simulation_service.py # Disaster simulation engine
    │   │
    │   ├── agents/                # AI Agent layer (Gemini)
    │   │   ├── orchestrator.py    # Multi-agent coordinator
    │   │   ├── threat_agent.py    # Threat assessment agent
    │   │   ├── planner_agent.py   # Strategic planning agent
    │   │   └── explainability_agent.py # Decision explainability
    │   │
    │   ├── middleware/            # ASGI middleware stack
    │   │   ├── cors.py            # CORS configuration
    │   │   └── logging.py         # Request/response logging
    │   │
    │   └── utils/                 # Helper utilities
    │
    └── tests/                     # Automated test suite
        ├── conftest.py            # Shared fixtures
        └── test_health.py         # Health endpoint tests
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
| :--- | :--- |
| **Node.js** | 20+ |
| **Python** | 3.12+ |
| **PostgreSQL** | 15+ with PostGIS extension |
| **Supabase** | Cloud project (or local) |

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/NINJA981/ResponseSync.git
cd ResponseSync
```

**Frontend Setup:**

```bash
# Install Node.js dependencies
npm install

# Start the Vite dev server (port 5173)
npm run dev
```

**Backend Setup:**

```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy the environment template
cp backend/.env.example backend/.env
```

Fill in your credentials:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL async connection string (`postgresql+asyncpg://...`) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_KEY` | Supabase Anon Key |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `OPENWEATHER_API_KEY` | OpenWeather API Key |
| `MAPBOX_API_KEY` | Mapbox GL API Key |
| `JWT_SECRET` | Secret key for JWT signing |
| `REDIS_URL` | Redis connection string (caching layer) |

### 3. Run Database Migrations

```bash
cd backend
alembic upgrade head
```

### 4. Start the Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 5. Access the Platform

| Service | URL |
| :--- | :--- |
| **Frontend Dashboard** | `http://localhost:5173` |
| **Backend API** | `http://127.0.0.1:8000` |
| **OpenAPI (Swagger)** | `http://127.0.0.1:8000/docs` |
| **ReDoc API Docs** | `http://127.0.0.1:8000/redoc` |
| **Health Check** | `http://127.0.0.1:8000/health` |

---

## ⚙️ Tech Stack Deep Dive

### Frontend

| Technology | Purpose |
| :--- | :--- |
| **React 19** | UI component library with latest concurrent features |
| **TypeScript 6** | Type-safe frontend development |
| **Vite 8** | Lightning-fast dev server with HMR & proxy |
| **Oxlint** | Blazing-fast linter (Rust-based) |

### Backend

| Technology | Purpose |
| :--- | :--- |
| **FastAPI** | Async Python web framework with auto OpenAPI docs |
| **SQLAlchemy 2.0** | Async ORM with modern mapped column syntax |
| **GeoAlchemy2** | PostGIS integration for spatial queries |
| **Pydantic v2** | Data validation & serialization |
| **Alembic** | Database schema migrations |
| **httpx** | Async HTTP client for external APIs |
| **Google GenAI SDK** | Gemini LLM integration for AI agents |

### Infrastructure

| Technology | Purpose |
| :--- | :--- |
| **Supabase (PostgreSQL)** | Managed database with PostGIS extensions |
| **PostGIS** | Geospatial indexing & spatial queries |
| **Redis** | Caching layer & session management |
| **OpenWeather API** | Real-time weather data |
| **Mapbox GL** | Map rendering & geocoding |

---

## 🧪 Running Tests

```bash
cd backend

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_health.py
```

---

## 🗄 Database Migrations

```bash
cd backend

# Generate a new migration after model changes
alembic revision --autogenerate -m "Add new table"

# Apply pending migrations
alembic upgrade head

# Downgrade one revision
alembic downgrade -1

# View migration history
alembic history
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

> **Note:** Always create a new dedicated branch for major code changes.

---

## 📄 License

MIT

---

<div align="center">
  <p><strong>ResponSync Emergency Response Platform</strong> © 2026</p>
  <p>Built with ⚡ by <a href="https://github.com/NINJA981">NINJA981</a></p>
</div>tell e from this tech stack
