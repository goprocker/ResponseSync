<p align="center">
  <img src="./assets/responsync-banner.png" alt="ResponSync — AI Decision Digital Twin for Predictive Flood Management" width="100%">
</p>

<h1 align="center">🌊 ResponSync</h1>
<h3 align="center">AI Decision Digital Twin for Predictive Flood Management</h3>
<p align="center"><strong>Learn from simulated disasters. Respond to real ones — before they happen.</strong></p>

<p align="center">

![Hackathon](https://img.shields.io/badge/24h-Hackathon-blueviolet)
![Focus](https://img.shields.io/badge/Focus-Flood%20Response-orange)
![Status](https://img.shields.io/badge/Status-MVP-brightgreen)
![Pilot](https://img.shields.io/badge/Pilot-Velachery%2C%20Chennai-informational)

</p>

---

## 🚨 The Problem

Urban flooding kills not because data is missing — but because it's **scattered**.

- 🌧️ **Weather** sits in one system, **dam levels** in another, **traffic** in a third.
- 🏥 Hospitals, shelters, and citizen reports never talk to each other.
- ⏱️ By the time authorities cross-reference sources, the **golden hours are gone**.
- 🧭 Evacuation routes are often **static maps** — useless once roads flood.

Chennai's 2015 and 2023 floods proved it: **fragmented systems = slow, reactive decisions.**

---

## 💡 The Solution

ResponSync is an AI-powered Decision Digital Twin that transforms flood management from real-time monitoring to intelligent decision support.

- 🔁 **Builds a Decision Knowledge Base** by running thousands of simulated flood scenarios.
- 🎯 **Correlates live conditions** with historical simulations to identify the most relevant response strategy.
- 🤖 **Recommends data-driven actions** based on the highest predicted effectiveness.
- 🔍 **Delivers Explainable AI** with transparent reasoning and confidence scores for every recommendation.
- 🕒 **Features a Time-Travel Slider** to forecast flood progression **+2h and +6h**, enabling proactive planning and resource deployment.

> **Traditional Digital Twin:** "This is the current situation."
> **ResponSync:** "This is what is likely to happen next — and the optimal course of action."

**The Workflow:**

```
Simulation → Knowledge Base → Live Data → Scenario Matching →
AI Optimization → Authority Recommendations → Citizen Alerts
```

Every simulation stored in the Knowledge Base carries: **input parameters, actions taken, performance metrics, outcome, AI confidence score,** and **lessons learned** — so the system gets smarter with every scenario it runs.

---

## ✨ Key Features

- 🗺️ **Live Geospatial Dashboard** — Mapbox GL dark-mode interface, built for control rooms
- ⏳ **Time-Travel Predictive Slider** — forecast flood spread at +2h / +6h intervals
- 🌧️ **Real-Time Flood Prediction** — powered by rainfall, soil moisture & elevation data
- 🚧 **Dynamic Evacuation Routing** — recalculates safe paths as flood zones shift
- 📡 **Multi-Agent AI Engine** — 12 specialized LangGraph agents covering weather, hydrology, risk & evacuation
- 🧪 **Disaster Simulation Engine** — runs parameterized flood scenarios (rainfall, dam release, traffic, shelter occupancy) before disaster strikes
- 🆘 **Citizen SOS Reporting** — crowdsourced ground-truth data feeds the twin live
- 🧠 **Decision Knowledge Base** — every simulation stored, ranked, and reusable
- 🔥 **Risk Heatmaps** — visualize danger zones before they become critical
- 🏢 **Authority Dashboard** — resource allocation & explainable recommendations at a glance

---

## 🛠️ Tech Stack & Data Sources

### Data Sources

| Source | Data Extracted | Purpose |
|---|---|---|
| **Open-Meteo API** | Rainfall, humidity, wind, soil moisture | Core weather & saturation input for flood modeling |
| **Open Topo Data API** | Elevation, terrain gradient | Determines flood flow direction & pooling zones |
| **TN-SMART / CWC (scraped)** | Live dam level, discharge rate | Predicts downstream river surge |
| **Citizen SOS Reports** | Geotagged crowdsourced reports | Real-time ground-truth validation |
| **OpenStreetMap / Mapbox** | Roads, buildings, terrain | Base layer for the Digital Twin |

### Application Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Tailwind CSS, Mapbox GL JS |
| **Backend** | FastAPI (Python) |
| **Database** | Supabase, PostgreSQL, PostGIS |
| **AI / Orchestration** | Gemini 2.5 Flash, LangGraph (multi-agent) |
| **ML / Geospatial** | XGBoost, Scikit-learn, GeoPandas, Shapely |
| **Deployment** | Docker, Vercel (frontend), Railway (backend) |
| **Notifications** | Firebase Cloud Messaging (push alerts) |
| **Realtime Sync** | Supabase Realtime / WebSockets |

---

## 🤖 Multi-Agent AI System

ResponSync's AI layer is not one model — it's **12 coordinated agents**, orchestrated via LangGraph, each owning a slice of the decision:

| Agent | Responsibility |
|---|---|
| **Coordinator** | Orchestrates the full agent pipeline end-to-end |
| **Weather** | Interprets rainfall, wind & humidity trends |
| **Hydrology** | Models river & dam behavior, discharge impact |
| **Traffic** | Assesses road congestion & accessibility |
| **Infrastructure** | Tracks hospitals, shelters & road/building status |
| **Citizen Intelligence** | Parses crowdsourced SOS reports for ground truth |
| **Risk Prediction** | Fuses all signals into a live flood-risk score |
| **Simulation** | Runs and scores parameterized disaster scenarios |
| **Resource Planner** | Allocates emergency resources optimally |
| **Evacuation Planner** | Generates & recalculates safe evacuation routes |
| **Decision** | Selects the best-matched historical response strategy |
| **Explainability** | Converts AI reasoning into human-readable justification |

Gemini 2.5 Flash powers situation summaries, recommended actions, explanations, and public advisories generated by these agents.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    EXTERNAL DATA SOURCES                 │
│  Open-Meteo │ Open Topo Data │ TN-SMART/CWC │ Citizen SOS │
└───────────────────────────┬───────────────────────────────┘
                             │  ingestion + scraping
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  DIGITAL TWIN ENGINE                      │
│      (Roads · Terrain · Water Levels · Resources)         │
└───────────────────────────┬───────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│               DISASTER SIMULATION ENGINE                   │
│   Parameterized runs: rainfall · dam release · traffic     │
│      Outputs: flood spread · evacuation · effectiveness    │
└───────────────────────────┬───────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│              DECISION KNOWLEDGE BASE                       │
│   Inputs · Actions · Outcomes · Confidence · Lessons        │
└───────────────────────────┬───────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│              SCENARIO MATCHING ENGINE                      │
│   Normalize → Similarity Score → Top-K Retrieval → Rank    │
└───────────────────────────┬───────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│           MULTI-AGENT AI RECOMMENDATION ENGINE              │
│  Coordinator → Weather → Hydrology → Risk → Evacuation     │
│         (LangGraph orchestration + Gemini reasoning)        │
└───────────────────────────┬───────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│         REST / WebSocket API LAYER (FastAPI)                │
└───────────────────────────┬───────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│           MAPBOX GL DASHBOARD (Authority + Citizen)         │
│     Risk Heatmap │ Time-Travel Slider │ Evacuation Routes   │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Visuals

`[INSERT SCREENSHOT/GIF HERE]`
📍 *Authority Dashboard — dark-mode Mapbox GL view of Velachery with live risk heatmap.*

`[INSERT SCREENSHOT/GIF HERE]`
🕒 *Time-Travel Slider in action — flood spread projected at +2h and +6h.*

`[INSERT SCREENSHOT/GIF HERE]`
🚧 *Dynamic evacuation route recalculating around a newly flooded zone.*

`[INSERT SCREENSHOT/GIF HERE]`
🆘 *Citizen SOS reporting flow — geotagged report appearing live on the twin.*

---

## 📡 API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Service health check |
| `/weather` | GET | Current weather snapshot |
| `/risk` | GET | Live flood risk score / heatmap data |
| `/resources` | GET | Emergency resource availability |
| `/recommendations` | GET | AI-generated response recommendations |
| `/evacuation` | GET | Current recommended evacuation routes |
| `/reports` | POST | Submit a citizen SOS report |
| `/simulate` | POST | Trigger a new disaster simulation |
| `/simulation/{id}` | GET | Retrieve results of a stored simulation |

---

## 🗄️ Database Schema

Built on **PostgreSQL + PostGIS** for spatial queries, via Supabase:

| Table | Stores |
|---|---|
| `users` | Authority & citizen accounts, roles |
| `reports` | Citizen SOS reports (geotagged) |
| `weather_cache` | Cached Open-Meteo responses |
| `risk_zones` | Computed flood risk polygons |
| `simulations` | Simulation run metadata |
| `simulation_results` | Flood spread, evacuation & resource outputs per run |
| `decision_knowledge` | Matched scenario outcomes & lessons learned |
| `resources` | Emergency resource inventory & location |
| `shelters` | Shelter locations & occupancy |
| `hospitals` | Hospital locations & capacity |
| `evacuation_routes` | Generated & recalculated safe routes |

---

## 🔐 Security

- 🔑 **JWT Authentication** — stateless, signed session tokens
- 🛂 **RBAC** — role-based access for Authority vs. Citizen dashboards
- 🔒 **HTTPS Everywhere** — encrypted transport by default
- ✅ **Input Validation** — sanitized citizen reports & API payloads
- 📜 **Audit Logging** — full trace of authority actions & recommendations
- 🚦 **API Rate Limiting** — protects ingestion endpoints under load

---

## 🧠 Technical Challenges & Workarounds

- **Unstructured Government Dam Data**
  TN-SMART/CWC portals expose dam levels via inconsistent, non-API HTML tables.
  → Built a **Python scraper** with resilient parsing rules and scheduled polling to normalize this into structured JSON.

- **API Rate Limits & Latency**
  Open-Meteo and Open Topo Data throttle high-frequency requests during live demos.
  → Implemented a **caching layer** (Supabase-backed) to serve recent responses and reduce redundant calls.

- **Elevation + Rainfall Fusion**
  Raw elevation data alone doesn't predict pooling — needed **terrain gradient + rainfall intensity fused** together.
  → Preprocessed elevation grids with GeoPandas to compute flow direction before feeding the flood model.

- **Real-Time Sync Across Clients**
  Multiple dashboard viewers needed **consistent live state** without polling storms.
  → Used **Supabase Realtime/WebSockets** to push deltas instead of full state on every update.

---

## 💻 How to Run Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- Supabase account (or local PostgreSQL + PostGIS)
- Mapbox API key
- Gemini API key

### 1. Clone & Configure

```bash
git clone https://github.com/<your-org>/responsync.git
cd responsync
cp .env.example .env
# Fill in: MAPBOX_TOKEN, GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the dam data scraper (populates live dam levels)
python scripts/dam_scraper.py

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## 🔮 Future Roadmap

- 🧬 **Vector DB for Historic Flood Memory** — semantic recall of past disaster patterns, not just structured matching
- 📲 **Twilio SMS Alerts** — reach citizens without smartphones or app access
- 🛰️ **Satellite & Drone Imagery** — Sentinel Hub + NASA FIRMS integration for real-time flood extent
- 📡 **IoT Sensor Network** — real-time water level sensors, not just polled dam data
- 🎥 **CCTV Analytics** — computer vision for traffic and waterlogging detection
- 🏙️ **Multi-City & Multi-Disaster Expansion** — cyclones, earthquakes, landslides
- 🎓 **Reinforcement Learning** — response strategies that improve with every real event

---

<p align="center">Built in 24 hours to make disaster response predictive, not reactive. 🌊</p>
