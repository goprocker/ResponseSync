import { useEffect, useState } from 'react';
import './App.css';

// --- API Data Interfaces ---

interface HealthData {
  status: string;
  app_name?: string;
  environment?: string;
  version?: string;
  timestamp?: string;
  services?: Record<string, string>;
}

interface WeatherData {
  id: string;
  location_name: string;
  location: { type: string; coordinates: [number, number] };
  rainfall_mm: number;
  river_level_m: number;
  dam_level_m: number;
  dam_discharge_cumecs: number;
  wind_speed_kmh: number;
  humidity_pct: number;
  cached_at: string;
}

interface ReportData {
  id: string;
  reporter_name?: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  location: { type: string; coordinates: [number, number] };
  media_urls?: string[];
  created_at: string;
}

interface ShelterData {
  id: string;
  name: string;
  location: { type: string; coordinates: [number, number] };
  total_capacity: number;
  current_occupancy: number;
  contact_phone?: string;
  status: string;
}

interface HospitalData {
  id: string;
  name: string;
  location: { type: string; coordinates: [number, number] };
  total_beds: number;
  icu_beds_available: number;
  emergency_status: string;
  contact_phone?: string;
}

interface ResourceData {
  id: string;
  name: string;
  resource_type: string;
  status: string;
  current_location: { type: string; coordinates: [number, number] };
  contact_channel?: string;
}

interface RiskZoneData {
  id: string;
  name: string;
  risk_level: string;
  boundary: { type: string; coordinates: any };
  flood_depth_m: number;
  historical_floods_count: number;
}

interface EvacuationData {
  id: string;
  route_name: string;
  start_location: { type: string; coordinates: [number, number] };
  route_geometry: { type: string; coordinates: [number, number][] };
  max_capacity: number;
  is_blocked: boolean;
}

interface SimulationResultData {
  id: string;
  flood_spread_data: {
    projected_depth_m: number;
    high_risk_zones: string[];
    inundated_area_sq_km: number;
  };
  recommended_evacuation_plan: {
    primary_corridor: string;
    target_shelter: string;
  };
  recommended_resource_plan: {
    rescue_boats_needed: number;
    ambulances_assigned: number;
  };
  effectiveness_score: number;
  ai_confidence_pct: number;
}

interface SimulationData {
  id: string;
  name: string;
  input_parameters: Record<string, any>;
  status: string;
  created_at: string;
  results: SimulationResultData[];
}

interface RecommendationPipelineData {
  pipeline_status: string;
  threat_assessment: {
    threat_level: string;
    threat_score: number;
    summary: string;
    risk_factors: string[];
  };
  resource_plan: {
    rescue_boats: number;
    ambulances: number;
    evacuation_corridor: string;
    target_shelter: string;
  };
  explainability: {
    executive_rationale: string;
    public_advisory: string;
    confidence_score: number;
  };
}

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Backend state
  const [health, setHealth] = useState<HealthData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [shelters, setShelters] = useState<ShelterData[]>([]);
  const [hospitals, setHospitals] = useState<HospitalData[]>([]);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZoneData[]>([]);
  const [evacuations, setEvacuations] = useState<EvacuationData[]>([]);
  const [simulations, setSimulations] = useState<SimulationData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationPipelineData | null>(null);

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);
  const [runningSimulation, setRunningSimulation] = useState<boolean>(false);
  const [runningAI, setRunningAI] = useState<boolean>(false);
  const [refreshingWeather, setRefreshingWeather] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [newReport, setNewReport] = useState({
    reporter_name: '',
    title: '',
    category: 'FLOODING',
    severity: 'HIGH',
    longitude: 80.2208,
    latitude: 12.9785,
  });

  const [simParams, setSimParams] = useState({
    name: 'Velachery Live Scenario Run',
    rainfall_mm: 150,
    dam_discharge_cumecs: 450,
  });

  // --- API Functions ---

  const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/health');
      if (res.ok) setHealth(await res.json());
    } catch {
      setHealth(null);
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await fetch('/weather');
      if (res.ok) setWeather(await res.json());
    } catch (e) {
      console.error('Weather fetch error', e);
    }
  };

  const refreshWeather = async () => {
    setRefreshingWeather(true);
    try {
      const res = await fetch('/weather/refresh', { method: 'POST' });
      if (res.ok) {
        setWeather(await res.json());
        showNotify('Hydrology telemetry refreshed live!');
      }
    } catch (e) {
      showNotify('Failed to refresh telemetry', 'error');
    } finally {
      setRefreshingWeather(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('/reports');
      if (res.ok) setReports(await res.json());
    } catch (e) {
      console.error('Reports fetch error', e);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.title) return;
    setSubmittingReport(true);
    try {
      const res = await fetch('/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
      });
      if (res.ok) {
        showNotify('Incident report submitted successfully!');
        setNewReport({
          reporter_name: '',
          title: '',
          category: 'FLOODING',
          severity: 'HIGH',
          longitude: 80.2208,
          latitude: 12.9785,
        });
        fetchReports();
      } else {
        showNotify('Failed to submit report', 'error');
      }
    } catch (e) {
      showNotify('Error submitting report', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleVerifyReport = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`/reports/${id}/status?status=${status}`, { method: 'PATCH' });
      if (res.ok) {
        showNotify(`Report marked as ${status}`);
        fetchReports();
      }
    } catch (e) {
      showNotify('Failed to update report status', 'error');
    }
  };

  const fetchSpatialData = async () => {
    try {
      const [rShelters, rHospitals, rResources, rRisk, rEvac] = await Promise.all([
        fetch('/shelters').then((r) => (r.ok ? r.json() : [])),
        fetch('/hospitals').then((r) => (r.ok ? r.json() : [])),
        fetch('/resources').then((r) => (r.ok ? r.json() : [])),
        fetch('/risk').then((r) => (r.ok ? r.json() : [])),
        fetch('/evacuation').then((r) => (r.ok ? r.json() : [])),
      ]);
      setShelters(rShelters);
      setHospitals(rHospitals);
      setResources(rResources);
      setRiskZones(rRisk);
      setEvacuations(rEvac);
    } catch (e) {
      console.error('Spatial data fetch error', e);
    }
  };

  const fetchSimulations = async () => {
    try {
      const res = await fetch('/simulations');
      if (res.ok) setSimulations(await res.json());
    } catch (e) {
      console.error('Simulations fetch error', e);
    }
  };

  const handleRunSimulation = async () => {
    setRunningSimulation(true);
    try {
      const res = await fetch('/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: simParams.name,
          description: `Velachery Hydrology Run (${simParams.rainfall_mm}mm rain, ${simParams.dam_discharge_cumecs} cumecs discharge)`,
          input_parameters: {
            rainfall_mm: simParams.rainfall_mm,
            dam_discharge_cumecs: simParams.dam_discharge_cumecs,
          },
        }),
      });
      if (res.ok) {
        showNotify('Disaster simulation completed!');
        fetchSimulations();
      } else {
        showNotify('Failed to run simulation', 'error');
      }
    } catch (e) {
      showNotify('Error running simulation', 'error');
    } finally {
      setRunningSimulation(false);
    }
  };

  const fetchRecommendations = async () => {
    setRunningAI(true);
    try {
      const res = await fetch('/recommendations');
      if (res.ok) {
        setRecommendations(await res.json());
        showNotify('Multi-Agent AI Decision Pipeline Executed!');
      } else {
        showNotify('AI Pipeline error', 'error');
      }
    } catch (e) {
      showNotify('Error calling AI pipeline', 'error');
    } finally {
      setRunningAI(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchHealth(),
        fetchWeather(),
        fetchReports(),
        fetchSpatialData(),
        fetchSimulations(),
      ]);
      setLoading(false);
    };
    loadAll();

    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = health && health.status === 'healthy';

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="header">
        <div className="brand">
          <div className="brand-logo">⚡</div>
          <div className="brand-text">
            <h1>ResponSync</h1>
            <span>Emergency Command & Digital Twin Platform</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`nav-tab ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            🌡️ Weather Feed
          </button>
          <button
            className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            🚨 Incident Reports ({reports.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'spatial' ? 'active' : ''}`}
            onClick={() => setActiveTab('spatial')}
          >
            🗺️ Digital Twin Hub
          </button>
          <button
            className={`nav-tab ${activeTab === 'simulate' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulate')}
          >
            🌊 Disaster Simulator
          </button>
          <button
            className={`nav-tab ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            🤖 AI Decision XAI
          </button>
        </nav>

        <div className="header-status">
          <div className={`status-badge ${isConnected ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            <span>{isConnected ? 'FastAPI Backend Online' : loading ? 'Syncing...' : 'Backend Offline'}</span>
          </div>
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="api-docs-btn">
            Docs ↗
          </a>
        </div>
      </header>

      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <section className="hero-banner">
              <div className="hero-text">
                <h2>Velachery Emergency Command Dashboard</h2>
                <p>Live Synchronization between React Command Interface & Supabase PostGIS Engine</p>
              </div>
              <div className="banner-actions">
                <button className="refresh-btn" onClick={refreshWeather} disabled={refreshingWeather}>
                  {refreshingWeather ? 'Refreshing Feed...' : '⚡ Refresh Telemetry'}
                </button>
                <button className="ai-btn" onClick={fetchRecommendations} disabled={runningAI}>
                  {runningAI ? 'Running Multi-Agent AI...' : '🤖 Run AI Pipeline'}
                </button>
              </div>
            </section>

            {/* Metrics Overview Cards */}
            <section className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">🌧️</span>
                  <span className="metric-title">Live Rainfall</span>
                </div>
                <div className="metric-value">{weather ? `${weather.rainfall_mm} mm` : '0 mm'}</div>
                <div className="metric-sub">Velachery Telemetry Station</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">🌊</span>
                  <span className="metric-title">River Water Level</span>
                </div>
                <div className="metric-value">{weather ? `${weather.river_level_m} m` : '0 m'}</div>
                <div className="metric-sub">Adyar-Velachery Hydrology</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">🚨</span>
                  <span className="metric-title">Active Reports</span>
                </div>
                <div className="metric-value">{reports.length}</div>
                <div className="metric-sub">
                  {reports.filter((r) => r.status === 'VERIFIED').length} Verified by Authority
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">🏥</span>
                  <span className="metric-title">Available ICU Beds</span>
                </div>
                <div className="metric-value">
                  {hospitals.reduce((acc, h) => acc + h.icu_beds_available, 0)}
                </div>
                <div className="metric-sub">{hospitals.length} Operational Hospitals</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-icon">⛺</span>
                  <span className="metric-title">Shelter Capacity</span>
                </div>
                <div className="metric-value">
                  {shelters.reduce((acc, s) => acc + (s.total_capacity - s.current_occupancy), 0)} spaces
                </div>
                <div className="metric-sub">{shelters.length} Active Relief Centers</div>
              </div>
            </section>

            {/* Live Telemetry & Recommendation Snapshot */}
            <section className="details-section">
              <div className="card">
                <div className="card-header">
                  <h3>📡 Telemetry Station Status</h3>
                  <span className="pulse-indicator">LIVE FEED</span>
                </div>
                <div className="card-body">
                  {weather ? (
                    <div className="telemetry-table">
                      <div className="telemetry-row">
                        <span className="t-label">Location:</span>
                        <span className="t-val">{weather.location_name}</span>
                      </div>
                      <div className="telemetry-row">
                        <span className="t-label">Coordinates:</span>
                        <span className="t-val">
                          [{weather.location.coordinates[0]}, {weather.location.coordinates[1]}]
                        </span>
                      </div>
                      <div className="telemetry-row">
                        <span className="t-label">Dam Discharge Rate:</span>
                        <span className="t-val">{weather.dam_discharge_cumecs} cumecs</span>
                      </div>
                      <div className="telemetry-row">
                        <span className="t-label">Wind Speed:</span>
                        <span className="t-val">{weather.wind_speed_kmh} km/h</span>
                      </div>
                      <div className="telemetry-row">
                        <span className="t-label">Humidity:</span>
                        <span className="t-val">{weather.humidity_pct}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="loading-text">Loading telemetry feed...</p>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>🤖 Multi-Agent AI Recommendation Snapshot</h3>
                </div>
                <div className="card-body">
                  {recommendations ? (
                    <div className="ai-snapshot">
                      <div className="threat-badge-row">
                        <span className="threat-tag">Threat Level:</span>
                        <span className={`threat-level-badge ${recommendations.threat_assessment.threat_level.toLowerCase()}`}>
                          {recommendations.threat_assessment.threat_level} ({recommendations.threat_assessment.threat_score}/100)
                        </span>
                      </div>
                      <p className="ai-summary">{recommendations.threat_assessment.summary}</p>
                      <div className="plan-highlights">
                        <div><strong>Rescue Boats:</strong> {recommendations.resource_plan.rescue_boats}</div>
                        <div><strong>Ambulances:</strong> {recommendations.resource_plan.ambulances}</div>
                        <div><strong>Corridor:</strong> {recommendations.resource_plan.evacuation_corridor}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-ai">
                      <p>No active AI decision run.</p>
                      <button className="ai-btn" onClick={fetchRecommendations} disabled={runningAI}>
                        Execute 3-Stage Pipeline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: WEATHER & TELEMETRY */}
        {activeTab === 'weather' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h2>Hydrology & Weather Telemetry Station</h2>
              <button className="refresh-btn" onClick={refreshWeather} disabled={refreshingWeather}>
                {refreshingWeather ? 'Refreshing...' : '⚡ Trigger Hydrology Poll'}
              </button>
            </div>
            {weather && (
              <div className="telemetry-grid">
                <div className="t-card">
                  <div className="t-card-val">{weather.rainfall_mm} <small>mm</small></div>
                  <div className="t-card-lbl">Accumulated Rainfall</div>
                </div>
                <div className="t-card">
                  <div className="t-card-val">{weather.river_level_m} <small>m</small></div>
                  <div className="t-card-lbl">Adyar River Gauge Level</div>
                </div>
                <div className="t-card">
                  <div className="t-card-val">{weather.dam_level_m} <small>m</small></div>
                  <div className="t-card-lbl">Chembarambakkam Reservoir Level</div>
                </div>
                <div className="t-card">
                  <div className="t-card-val">{weather.dam_discharge_cumecs} <small>cumecs</small></div>
                  <div className="t-card-lbl">Reservoir Sluice Gate Discharge</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CITIZEN REPORTING & VERIFICATION */}
        {activeTab === 'reports' && (
          <div className="tab-pane">
            <div className="pane-grid">
              {/* Submit Form */}
              <div className="card">
                <div className="card-header">
                  <h3>📢 Submit Citizen Incident Report</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleReportSubmit} className="report-form">
                    <div className="form-group">
                      <label>Reporter Name / Alias</label>
                      <input
                        type="text"
                        placeholder="e.g. Velachery Resident"
                        value={newReport.reporter_name}
                        onChange={(e) => setNewReport({ ...newReport, reporter_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Incident Description / Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2ft water logging at 100ft bypass road"
                        value={newReport.title}
                        onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          value={newReport.category}
                          onChange={(e) => setNewReport({ ...newReport, category: e.target.value })}
                        >
                          <option value="FLOODING">FLOODING</option>
                          <option value="STRANDED_CITIZEN">STRANDED CITIZEN</option>
                          <option value="ROAD_BLOCKAGE">ROAD BLOCKAGE</option>
                          <option value="POWER_OUTAGE">POWER OUTAGE</option>
                          <option value="MEDICAL_EMERGENCY">MEDICAL EMERGENCY</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Severity</label>
                        <select
                          value={newReport.severity}
                          onChange={(e) => setNewReport({ ...newReport, severity: e.target.value })}
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={newReport.longitude}
                          onChange={(e) => setNewReport({ ...newReport, longitude: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={newReport.latitude}
                          onChange={(e) => setNewReport({ ...newReport, latitude: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <button type="submit" className="submit-btn" disabled={submittingReport}>
                      {submittingReport ? 'Submitting...' : '🚀 Submit Geotagged Report'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Reports Table & Verification */}
              <div className="card">
                <div className="card-header">
                  <h3>🚨 Live Incident Feed & Authority Verification</h3>
                  <span className="badge-count">{reports.length} Total</span>
                </div>
                <div className="card-body scroll-body">
                  {reports.length === 0 ? (
                    <p className="empty-text">No citizen reports recorded yet.</p>
                  ) : (
                    <div className="reports-list">
                      {reports.map((report) => (
                        <div key={report.id} className="report-item">
                          <div className="report-main">
                            <div className="report-tags">
                              <span className={`badge-sev ${report.severity.toLowerCase()}`}>{report.severity}</span>
                              <span className="badge-cat">{report.category}</span>
                              <span className={`badge-status ${report.status.toLowerCase()}`}>{report.status}</span>
                            </div>
                            <h4 className="report-title">{report.title}</h4>
                            <p className="report-meta">
                              By {report.reporter_name || 'Anonymous'} • Location: [{report.location.coordinates[0]}, {report.location.coordinates[1]}]
                            </p>
                          </div>
                          <div className="report-actions">
                            {report.status === 'PENDING' && (
                              <>
                                <button
                                  className="btn-verify"
                                  onClick={() => handleVerifyReport(report.id, 'VERIFIED')}
                                >
                                  ✓ Verify
                                </button>
                                <button
                                  className="btn-reject"
                                  onClick={() => handleVerifyReport(report.id, 'REJECTED')}
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DIGITAL TWIN SPATIAL HUB */}
        {activeTab === 'spatial' && (
          <div className="tab-pane">
            <div className="spatial-grid">
              {/* Shelters */}
              <div className="card">
                <div className="card-header">
                  <h3>⛺ Relief Shelters ({shelters.length})</h3>
                </div>
                <div className="card-body scroll-body">
                  {shelters.map((s) => (
                    <div key={s.id} className="spatial-item">
                      <div className="item-title">{s.name}</div>
                      <div className="item-sub">
                        Capacity: {s.current_occupancy} / {s.total_capacity} people • Status: {s.status}
                      </div>
                      <div className="capacity-bar">
                        <div
                          className="capacity-fill"
                          style={{ width: `${(s.current_occupancy / s.total_capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hospitals */}
              <div className="card">
                <div className="card-header">
                  <h3>🏥 Hospitals & ICU Capacity ({hospitals.length})</h3>
                </div>
                <div className="card-body scroll-body">
                  {hospitals.map((h) => (
                    <div key={h.id} className="spatial-item">
                      <div className="item-title">{h.name}</div>
                      <div className="item-sub">
                        ICU Beds Available: <strong>{h.icu_beds_available}</strong> / {h.total_beds} Total Beds
                      </div>
                      <span className="badge-status online">{h.emergency_status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Resources */}
              <div className="card">
                <div className="card-header">
                  <h3>🚤 Emergency Resource Units ({resources.length})</h3>
                </div>
                <div className="card-body scroll-body">
                  {resources.map((r) => (
                    <div key={r.id} className="spatial-item">
                      <div className="item-title">{r.name}</div>
                      <div className="item-sub">Type: {r.resource_type} • Status: {r.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Zones */}
              <div className="card">
                <div className="card-header">
                  <h3>🌊 Identified Risk Polygons ({riskZones.length})</h3>
                </div>
                <div className="card-body scroll-body">
                  {riskZones.map((rz) => (
                    <div key={rz.id} className="spatial-item">
                      <div className="item-title">{rz.name}</div>
                      <div className="item-sub">
                        Risk Level: <strong>{rz.risk_level}</strong> • Projected Depth: {rz.flood_depth_m}m • Historical Floods: {rz.historical_floods_count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evacuation Corridors */}
              <div className="card">
                <div className="card-header">
                  <h3>🛣️ Evacuation Corridors ({evacuations.length})</h3>
                </div>
                <div className="card-body scroll-body">
                  {evacuations.map((e) => (
                    <div key={e.id} className="spatial-item">
                      <div className="item-title">{e.route_name}</div>
                      <div className="item-sub">
                        Max Capacity: {e.max_capacity} vehicles/hr • {e.is_blocked ? '🔴 BLOCKED' : '🟢 CLEAR & PASSABLE'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DISASTER SIMULATOR */}
        {activeTab === 'simulate' && (
          <div className="tab-pane">
            <div className="pane-grid">
              <div className="card">
                <div className="card-header">
                  <h3>🌊 Execute Parameterized Flood Simulation</h3>
                </div>
                <div className="card-body">
                  <div className="sim-controls">
                    <div className="form-group">
                      <label>Simulation Run Title</label>
                      <input
                        type="text"
                        value={simParams.name}
                        onChange={(e) => setSimParams({ ...simParams, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Projected Rainfall (mm): <strong>{simParams.rainfall_mm} mm</strong></label>
                      <input
                        type="range"
                        min="10"
                        max="350"
                        value={simParams.rainfall_mm}
                        onChange={(e) => setSimParams({ ...simParams, rainfall_mm: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Dam Discharge Rate (cumecs): <strong>{simParams.dam_discharge_cumecs} cumecs</strong></label>
                      <input
                        type="range"
                        min="50"
                        max="1200"
                        step="10"
                        value={simParams.dam_discharge_cumecs}
                        onChange={(e) => setSimParams({ ...simParams, dam_discharge_cumecs: parseInt(e.target.value) })}
                      />
                    </div>
                    <button className="submit-btn" onClick={handleRunSimulation} disabled={runningSimulation}>
                      {runningSimulation ? 'Running Simulation Models...' : '🚀 Trigger Disaster Simulation'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>📜 Simulation Run History ({simulations.length})</h3>
                </div>
                <div className="card-body scroll-body">
                  {simulations.map((sim) => (
                    <div key={sim.id} className="sim-history-item">
                      <div className="sim-head">
                        <h4>{sim.name}</h4>
                        <span className="badge-status online">{sim.status}</span>
                      </div>
                      <p className="sim-params">
                        Rainfall: {sim.input_parameters?.rainfall_mm}mm • Discharge: {sim.input_parameters?.dam_discharge_cumecs} cumecs
                      </p>
                      {sim.results && sim.results[0] && (
                        <div className="sim-result-box">
                          <div><strong>Projected Depth:</strong> {sim.results[0].flood_spread_data.projected_depth_m} m</div>
                          <div><strong>Inundated Area:</strong> {sim.results[0].flood_spread_data.inundated_area_sq_km} sq km</div>
                          <div><strong>Rescue Boats Needed:</strong> {sim.results[0].recommended_resource_plan.rescue_boats_needed}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AI DECISION XAI */}
        {activeTab === 'ai' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h2>3-Stage Multi-Agent AI Decision Intelligence (Gemini 2.0)</h2>
              <button className="ai-btn" onClick={fetchRecommendations} disabled={runningAI}>
                {runningAI ? 'Executing Pipeline...' : '🤖 Trigger Multi-Agent Pipeline'}
              </button>
            </div>

            {recommendations ? (
              <div className="ai-full-grid">
                {/* Stage 1 */}
                <div className="card ai-card">
                  <div className="card-header">
                    <h3>1. Threat Assessment Agent</h3>
                    <span className={`threat-level-badge ${recommendations.threat_assessment.threat_level.toLowerCase()}`}>
                      {recommendations.threat_assessment.threat_level}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="ai-desc"><strong>Threat Score:</strong> {recommendations.threat_assessment.threat_score}/100</p>
                    <p className="ai-desc">{recommendations.threat_assessment.summary}</p>
                    <div className="risk-factors">
                      <strong>Identified Risk Factors:</strong>
                      <ul>
                        {recommendations.threat_assessment.risk_factors.map((rf, idx) => (
                          <li key={idx}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="card ai-card">
                  <div className="card-header">
                    <h3>2. Resource & Route Optimizer</h3>
                  </div>
                  <div className="card-body">
                    <div className="plan-grid">
                      <div className="plan-item">
                        <span className="p-lbl">Rescue Boats:</span>
                        <span className="p-val">{recommendations.resource_plan.rescue_boats} Units</span>
                      </div>
                      <div className="plan-item">
                        <span className="p-lbl">Ambulances:</span>
                        <span className="p-val">{recommendations.resource_plan.ambulances} Units</span>
                      </div>
                      <div className="plan-item">
                        <span className="p-lbl">Primary Evacuation Corridor:</span>
                        <span className="p-val">{recommendations.resource_plan.evacuation_corridor}</span>
                      </div>
                      <div className="plan-item">
                        <span className="p-lbl">Designated Shelter:</span>
                        <span className="p-val">{recommendations.resource_plan.target_shelter}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="card ai-card full-width">
                  <div className="card-header">
                    <h3>3. Gemini Explainability (XAI) Agent</h3>
                    <span className="pulse-indicator">GEMINI 2.0 EXPLAINABILITY</span>
                  </div>
                  <div className="card-body">
                    <div className="xai-block">
                      <h4>🏛️ Executive Decision Rationale</h4>
                      <p className="xai-text">{recommendations.explainability.executive_rationale}</p>
                    </div>
                    <div className="xai-block advisory">
                      <h4>📢 Public Safety Advisory</h4>
                      <p className="xai-text">{recommendations.explainability.public_advisory}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-ai-center">
                <p>Click below to execute the stateful 3-Stage AI Decision Graph across live PostGIS data.</p>
                <button className="ai-btn" onClick={fetchRecommendations} disabled={runningAI}>
                  {runningAI ? 'Executing Pipeline...' : '🤖 Execute Multi-Agent AI Pipeline'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>ResponSync Emergency Response & Digital Twin Platform &copy; 2026 | React Vite + Supabase PostGIS + FastAPI</p>
      </footer>
    </div>
  );
}
