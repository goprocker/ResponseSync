import { useEffect, useState } from 'react';
import './App.css';

interface HealthData {
  status: string;
  app_name?: string;
  environment?: string;
  version?: string;
  timestamp?: string;
  services?: Record<string, string>;
}

export default function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const fetchBackendHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      // Fetch health through the Vite proxy or directly
      const response = await fetch('/health');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: HealthData = await response.json();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(data);
    } catch (err: unknown) {
      console.error('Backend health fetch error:', err);
      const end = performance.now();
      setLatency(Math.round(end - start));
      setError(err instanceof Error ? err.message : 'Failed to connect to backend server');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendHealth();
    const interval = setInterval(fetchBackendHealth, 15000);
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
            <span>Emergency Response Platform</span>
          </div>
        </div>

        <div className="header-status">
          <div className={`status-badge ${isConnected ? 'online' : loading ? 'connecting' : 'offline'}`}>
            <span className="status-dot"></span>
            <span>{isConnected ? 'Backend Connected' : loading ? 'Checking Connection...' : 'Backend Offline'}</span>
          </div>
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="api-docs-btn">
            FastAPI Docs ↗
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Banner Section */}
        <section className="hero-banner">
          <div className="hero-text">
            <h2>Fullstack Integration Dashboard</h2>
            <p>Real-time coordination between React Vite Frontend & FastAPI Supabase Backend</p>
          </div>
          <button className="refresh-btn" onClick={fetchBackendHealth} disabled={loading}>
            {loading ? 'Pinging Backend...' : '⚡ Test Connection'}
          </button>
        </section>

        {/* Metrics Overview */}
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🟢</span>
              <span className="metric-title">API Gateway</span>
            </div>
            <div className="metric-value">{isConnected ? 'HEALTHY' : 'UNAVAILABLE'}</div>
            <div className="metric-sub">{latency !== null ? `Latency: ${latency} ms` : 'Testing connection...'}</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🗄️</span>
              <span className="metric-title">Database Subsystem</span>
            </div>
            <div className="metric-value">{health?.services?.database ? health.services.database.toUpperCase() : 'CONFIGURED'}</div>
            <div className="metric-sub">Supabase PostgreSQL + PostGIS</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🤖</span>
              <span className="metric-title">AI Decision Engine</span>
            </div>
            <div className="metric-value">{health?.services?.ai_engine ? health.services.ai_engine.toUpperCase() : 'READY'}</div>
            <div className="metric-sub">Google Gemini Integration</div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🗺️</span>
              <span className="metric-title">GIS & Mapping</span>
            </div>
            <div className="metric-value">{health?.services?.gis_mapping ? health.services.gis_mapping.toUpperCase() : 'ACTIVE'}</div>
            <div className="metric-sub">GeoAlchemy2 + Mapbox GL</div>
          </div>
        </section>

        {/* System Payload & Connection Details */}
        <section className="details-section">
          <div className="card console-card">
            <div className="card-header">
              <h3>📡 Live Backend Payload (`/health`)</h3>
              <span className="pulse-indicator">LIVE</span>
            </div>
            <div className="card-body">
              {loading && !health ? (
                <div className="loading-state">Pinging backend endpoint...</div>
              ) : error ? (
                <div className="error-state">
                  <p>⚠️ <strong>Connection Error:</strong> {error}</p>
                  <p className="hint">Ensure backend is running at <code>http://127.0.0.1:8000</code></p>
                </div>
              ) : (
                <pre className="json-preview">{JSON.stringify(health, null, 2)}</pre>
              )}
            </div>
          </div>

          <div className="card info-card">
            <div className="card-header">
              <h3>⚙️ Active System Info</h3>
            </div>
            <div className="card-body">
              <div className="info-list">
                <div className="info-item">
                  <span className="label">Application:</span>
                  <span className="value">{health?.app_name || 'ResponSync Backend'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Environment:</span>
                  <span className="value badge-env">{health?.environment || 'development'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Backend Version:</span>
                  <span className="value">{health?.version || '0.1.0'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Last Health Ping:</span>
                  <span className="value">{health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Frontend Server:</span>
                  <span className="value">Vite React (Port 5173)</span>
                </div>
                <div className="info-item">
                  <span className="label">Proxy Target:</span>
                  <span className="value">http://127.0.0.1:8000</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>ResponSync Emergency Response Platform &copy; 2026 | Fullstack React + FastAPI</p>
      </footer>
    </div>
  );
}
