# Feature 02: 12-Agent AI System & Authority HQ Dispatch

## 📌 Feature Overview
The **12-Agent AI System** coordinates emergency response operations for Authority HQ. It executes a Directed Acyclic Graph (DAG) across 12 specialized agents (Weather, Hydrology, Traffic, Infrastructure, Citizen Intelligence, Risk Prediction, Simulation, Resource Planner, Evacuation Planner, Decision, Explainability, and Coordinator).

---

## 🏗️ Architecture & Component Mapping
- **Frontend Component**: [AuthorityDashboard.tsx](file:///x:/Projects/response%20sync%202/src/components/AuthorityDashboard.tsx)
- **Header Component**: [Header.tsx](file:///x:/Projects/response%20sync%202/src/components/Header.tsx)
- **API Endpoint**: `POST /api/ai/multiagent-run`
- **AI Model**: Gemini 3.6 Flash
- **Telemetry Ingest**: Open-Meteo Weather API + Open-Meteo Flood API + Supabase Reports DB

---

## 🧪 Manual Testing Instructions

### Step 1: Trigger Manual Agent Synchronization
1. On the top header, click the cyan button **`Sync AI Multi-Agent System`**.
2. Observe the spinning loading indicator indicating live telemetry ingestion from Open-Meteo & Supabase.

### Step 2: Verify Agent Activity Logs
1. Click the **Authority HQ** tab.
2. Scroll to the **Live AI Agent Logs & Activity Stream**.
3. Verify new log entries appear from:
   - **Weather Agent**: Open-Meteo rainfall rate & convective intensity ingest
   - **Hydrology Agent**: Estuarine river discharge ($m^3/s$) evaluation
   - **Citizen Intelligence Agent**: Supabase crowdsourced report validation
   - **Traffic Agent**: Guindy subway barrier alert
   - **Resource Planner Agent**: Rescue boat fleet positioning
   - **Explainability Agent**: XAI justification synthesis

### Step 3: Test Recommendation Approval & Fleet Dispatch
1. Locate the top recommendation card (e.g., *"Deploy 4 NDRF Boat Units to Velachery South"*).
2. Click **`Approve & Dispatch Fleet`**.
3. Verify:
   - Recommendation status updates to **APPROVED** (green checkmark).
   - Resource Planner Agent emits a success log entry.
   - Available boat fleet count updates automatically.

### Expected Outcome
The 12 agents process live telemetry, update risk predictions, output actionable recommendations, and reflect fleet dispatches instantly across Authority HQ.
