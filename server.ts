import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize Gemini Client server-side securely
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TDD REST API Endpoints
app.get('/api/weather', (req, res) => {
  res.json({
    location: 'Chennai Velachery-Adyar Corridor',
    rainfallMmHr: 85,
    description: 'Convective Heavy Cloudburst',
    temperatureC: 27.5,
    humidityPct: 94,
    windSpeedKmh: 42,
    highTideStatus: 'Rising Estuarine High Tide (Peak at 11:15 AM)',
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/risk', (req, res) => {
  res.json({
    pilotRegion: 'Chennai Velachery',
    averageRiskScore: 75.4,
    criticalZonesCount: 2,
    totalPopulationAtRisk: 95100,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/resources', (req, res) => {
  res.json({
    totalUnits: 18,
    deployedCount: 8,
    enRouteCount: 4,
    availableCount: 6,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/recommendations', (req, res) => {
  res.json({
    activeCount: 2,
    pendingApprovalCount: 2,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/evacuation', (req, res) => {
  res.json({
    origin: 'Velachery 100ft Road',
    destination: 'Velachery Community Center Relief Camp',
    safetyScorePct: 98,
    hazardsAvoided: ['Guindy Railway Subway', 'Velachery Lake Sluice Breach Zone'],
    timestamp: new Date().toISOString()
  });
});

app.post('/api/reports', (req, res) => {
  const reportData = req.body;
  res.json({
    success: true,
    message: 'Citizen report received and stored in Digital Twin state',
    reportId: `report-${Date.now()}`,
    data: reportData
  });
});

app.get('/api/simulation/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    simulationId: id,
    title: 'Chennai Velachery Cloudburst + Dam Discharge Simulation',
    simulatedTime: '+3 Hours Scenario',
    affectedZonesCount: 4,
    predictedSubmergedAreaKm2: 4.8,
    estimatedAffectedPeople: 68500,
    lessonsLearned: 'Pre-positioning rescue boats prior to T+30 minutes reduces medical transport delay by 42%.',
    effectivenessScore: 92
  });
});

// Scenario Matching Engine Endpoint (TDD Section 10)
app.post('/api/ai/scenario-match', async (req, res) => {
  try {
    const { liveConditions } = req.body;

    const prompt = `
Act as ResponSync Scenario Matching Engine (PRD/TDD Section 10).
Given live disaster conditions for Chennai (Velachery/Adyar):
- Live Rainfall: ${liveConditions?.rainfallMmHr || 85} mm/hr
- Dam Discharge: ${liveConditions?.damDischarge || 1500} m³/s
- River Stage: ${liveConditions?.riverStage || 3.4} meters
- Traffic Congestion: ${liveConditions?.trafficCongestion || 82}%

Search the Decision Knowledge Base and retrieve the Top 3 most similar historical disaster scenarios (e.g. 2015 Chennai Heavy Inundation, 2021 Cyclone Nivar Cloudburst, 2023 Cyclone Michaung Overflow).

Calculate similarity percentage, retrieved effective strategy, outcome, and AI refinement recommendation.

Return JSON response:
{
  "matchedScenarios": [
    {
      "id": "sim-2015-12-01",
      "historicalEvent": "December 2015 Chennai Cloudburst & Chembarambakkam Release",
      "similarityPct": 94,
      "keyMatches": ["85mm/hr rain intensity", "High tide backwater overlap", "Lake sluice breach"],
      "retrievedStrategy": "Immediate deployment of 4 NDRF boat units to Velachery Vijaya Nagar & pre-evacuation of Kotturpuram tenements",
      "historicalOutcome": "Saved 4,200 stranded residents with 91% effectiveness score",
      "aiRefinement": "Apply 2015 strategy but add automated road barricading at Guindy subway to avoid vehicle stalling."
    },
    {
      "id": "sim-2021-11-25",
      "historicalEvent": "November 2021 Cyclone Nivar Waterlogging",
      "similarityPct": 86,
      "keyMatches": ["Heavy rainfall in Adyar catchment", "Urban drainage congestion 80%"],
      "retrievedStrategy": "High-capacity dewatering pumps stationed at 100ft road canal sluice",
      "historicalOutcome": "Reduced standing water duration by 14 hours",
      "aiRefinement": "Deploy pumps 30 minutes earlier based on live IoT sensor water depth derivative."
    }
  ],
  "recommendedMasterPlan": "Combine 2015 pre-evacuation protocol with 2021 early dewatering pump placement."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in scenario-match:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Multi-Agent AI System Run Endpoint
app.post('/api/ai/multiagent-run', async (req, res) => {
  try {
    const { zones, sensors, reports, weatherCondition } = req.body;

    const prompt = `
You are ResponSync's Multi-Agent AI System coordinating disaster response for the Chennai pilot region (Velachery & Adyar).
Analyze the incoming live inputs:
- Weather: ${JSON.stringify(weatherCondition || { rainfallRateMmHr: 85, description: 'Heavy Cloudburst' })}
- IoT Sensors: ${JSON.stringify(sensors || [])}
- Risk Zones: ${JSON.stringify(zones || [])}
- Citizen Reports: ${JSON.stringify(reports || [])}

Perform multi-agent coordination:
1. Weather Agent & Flood Prediction Agent: Calculate short-term flood propagation.
2. Traffic & Evacuation Agent: Assess road submergence and routing bottlenecks.
3. Resource Planner Agent: Determine optimal deployment of boats, ambulances, fire trucks, and NDRF.
4. Explainability Agent: Build explainable recommendations with evidence data.

Return a JSON object matching this schema:
{
  "updatedZones": [
    {
      "id": "zone-id",
      "riskScore": 0-100,
      "priorityLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "predictedWaterLevel30m": number,
      "predictedWaterLevel1h": number,
      "status": "safe" | "monitoring" | "warning" | "evacuating" | "submerged"
    }
  ],
  "agentLogs": [
    {
      "agentName": "Weather Agent" | "Traffic Agent" | "Infrastructure Agent" | "Citizen Intelligence Agent" | "Satellite Agent" | "Flood Prediction Agent" | "Resource Planner Agent" | "Evacuation Agent" | "Simulation Agent" | "Decision Agent" | "Explainability Agent" | "Coordinator Agent",
      "action": "short summary",
      "details": "detailed analysis",
      "severity": "info" | "warning" | "alert" | "success"
    }
  ],
  "recommendation": {
    "title": "Clear action title",
    "targetZoneId": "zone-id",
    "targetZoneName": "Zone Name",
    "actionType": "evacuate" | "deploy_boats" | "open_sluice_gate" | "block_road" | "setup_relief" | "medical_dispatch",
    "priority": "CRITICAL" | "HIGH" | "MEDIUM",
    "recommendedResources": [{"resourceType": "Rescue Boat Unit", "quantity": 2}],
    "reasoning": {
      "coreReason": "Core justification string",
      "evidenceData": ["Evidence 1", "Evidence 2"],
      "confidencePct": 95,
      "supportingMetrics": [{"metric": "Rainfall", "value": "85mm/hr"}],
      "riskExplanation": "Risk if delayed",
      "alternativeRisk": "Alternative scenario risk"
    }
  },
  "automatedAlert": {
    "headline": "Alert headline",
    "zone": "Zone Name",
    "severity": "critical" | "danger" | "warning",
    "agenciesNotified": ["Disaster Management", "Fire & Rescue", "Police"],
    "instructions": "Public guidance instructions"
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in multiagent-run:', err);
    res.status(500).json({ success: false, error: err.message || 'AI processing failed' });
  }
});

// 2. What-If Disaster Simulation Endpoint
app.post('/api/ai/simulate', async (req, res) => {
  try {
    const { params } = req.body; // rainfallMmHr, chembarambakkamReleaseM3s, canalBlockagePct, bridgeStatus, durationHours, highTideOverlap

    const prompt = `
Act as ResponSync Hydrodynamic & Disaster Simulation Engine for South Chennai (Velachery - Adyar).
Run a what-if simulation scenario with parameters:
- Rainfall Rate: ${params?.rainfallMmHr || 120} mm/hr
- Upstream Dam Discharge: ${params?.chembarambakkamReleaseM3s || 1500} m³/s
- Drainage/Canal Blockage: ${params?.canalBlockagePct || 75}%
- Bridge Status: ${params?.bridgeStatus || 'restricted'}
- Duration: ${params?.durationHours || 3} Hours
- High Tide Overlap: ${params?.highTideOverlap ? 'Yes' : 'No'}

Calculate predicted cascade effects across Velachery South, Adyar River Bank, Kotturpuram, Taramani OMR Corridor, and Guindy Railway Subway.

Return JSON response:
{
  "simulatedTime": "+3 Hours Scenario",
  "affectedZonesCount": 4,
  "predictedSubmergedAreaKm2": 4.8,
  "estimatedAffectedPeople": 68500,
  "criticalRoadBlocks": ["Guindy Subway", "Velachery 100ft Road Vijaya Nagar Junction", "Kotturpuram Bridge Approach"],
  "recommendedDeployments": [
    {"type": "Rescue Boat Units", "count": 6, "zone": "Velachery South"},
    {"type": "Heavy Dewatering Pumps", "count": 8, "zone": "Guindy Subway & Taramani"},
    {"type": "Evacuation Buses", "count": 15, "zone": "Kotturpuram Slums"}
  ],
  "riskTimeline": [
    {"minute": 15, "floodedZones": 2, "maxWaterDepthMeters": 0.8},
    {"minute": 30, "floodedZones": 3, "maxWaterDepthMeters": 1.4},
    {"minute": 60, "floodedZones": 4, "maxWaterDepthMeters": 2.2},
    {"minute": 120, "floodedZones": 5, "maxWaterDepthMeters": 2.9}
  ],
  "aiSummary": "Comprehensive simulation summary detailing peak inundation timing, primary bottlenecks, and priority evacuation steps."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in simulate:', err);
    res.status(500).json({ success: false, error: err.message || 'Simulation engine error' });
  }
});

// 3. Citizen Report AI Validation Endpoint
app.post('/api/ai/validate-report', async (req, res) => {
  try {
    const { description, category, locationName, hasImage } = req.body;

    const prompt = `
You are the Citizen Intelligence Agent for ResponSync.
Analyze and validate this public emergency report:
- Reported Location: ${locationName}
- User Selected Category: ${category}
- Description: "${description}"
- Photo Attached: ${hasImage ? 'Yes' : 'No'}

Determine:
1. Credibility Validation Score (0-100)
2. Verified Hazard Classification
3. Urgency Level (critical, high, medium, low)
4. AI Summary & recommended action for authority dispatch

Return JSON:
{
  "aiValidationScore": number,
  "aiValidatedCategory": "Verified Hazard Name",
  "urgency": "critical" | "high" | "medium" | "low",
  "aiSummary": "Concise assessment string",
  "recommendedAction": "Action string"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in validate-report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Explainable AI Deep Dive Endpoint
app.post('/api/ai/explain-decision', async (req, res) => {
  try {
    const { recommendation } = req.body;

    const prompt = `
Act as ResponSync Explainability Agent.
Generate an in-depth explainable decision document for the authority recommendation:
${JSON.stringify(recommendation)}

Return a structured JSON with:
{
  "title": "${recommendation?.title || 'Decision Explanation'}",
  "confidenceScore": 95,
  "evidenceChain": [
    "Sensor Reading Proof",
    "Satellite SAR Overlay Proof",
    "Citizen Crowdsource Verification",
    "Historical Hydrodynamic Similarity"
  ],
  "causalChain": [
    "Step 1: Unprecedented convective cloudburst (85mm/hr)",
    "Step 2: Velachery Lake Sluice capacity exceeded by 140%",
    "Step 3: Inundation of 100ft road blocking rescue ambulances",
    "Step 4: Immediate motorboat deployment required to bypass road block"
  ],
  "counterfactualAnalysis": "If this recommendation is rejected, water levels will rise by 0.5m within 30 mins, trapping ~850 citizens without boat accessibility.",
  "tradeoffs": [
    {"tradeoff": "Resource diversion", "impact": "Temporarily delays non-critical pumps in Taramani"},
    {"tradeoff": "Traffic diversion", "impact": "Adds 12 mins commute time via GST flyover"}
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in explain-decision:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ResponSync Server] Digital Twin Engine listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
