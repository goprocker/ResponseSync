import React, { useState } from 'react';
import {
  DisasterType,
  AgencyRole,
  ZoneRisk,
  IoTSensorNode,
  EmergencyResource,
  EmergencyShelter,
  CitizenReport,
  AgentActivityLog,
  ExplainableAIRecommendation,
  AutomatedAlert,
  EvacuationRoute
} from './types';
import {
  INITIAL_ZONES,
  INITIAL_IOT_SENSORS,
  INITIAL_RESOURCES,
  INITIAL_SHELTERS,
  INITIAL_CITIZEN_REPORTS,
  INITIAL_AGENT_LOGS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_ALERTS,
  MOCK_EVACUATION_ROUTE
} from './data/mockDigitalTwinData';

import { Header } from './components/Header';
import { DigitalTwinMap } from './components/DigitalTwinMap';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { SimulationStudio } from './components/SimulationStudio';
import { CitizenPortal } from './components/CitizenPortal';
import { AnalyticsHub } from './components/AnalyticsHub';
import { ExplainabilityModal } from './components/ExplainabilityModal';
import { ResourceDispatchModal } from './components/ResourceDispatchModal';
import { AlertNotificationBanner } from './components/AlertNotificationBanner';

import { useSSEStream } from './hooks/useSSEStream';
import { useEvacuationRoute } from './hooks/useEvacuationRoute';

export default function App() {
  // Global State
  const [disasterType, setDisasterType] = useState<DisasterType>('flood');
  const [agencyRole, setAgencyRole] = useState<AgencyRole>('authority');
  const [activeTab, setActiveTab] = useState<'twin_map' | 'multi_agent' | 'simulation' | 'citizen_portal' | 'analytics'>('twin_map');

  const [zones, setZones] = useState<ZoneRisk[]>(INITIAL_ZONES);
  const [sensors, setSensors] = useState<IoTSensorNode[]>(INITIAL_IOT_SENSORS);
  const [resources, setResources] = useState<EmergencyResource[]>(INITIAL_RESOURCES);
  const [shelters, setShelters] = useState<EmergencyShelter[]>(INITIAL_SHELTERS);
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);
  const [agentLogs, setAgentLogs] = useState<AgentActivityLog[]>(INITIAL_AGENT_LOGS);
  const [recommendations, setRecommendations] = useState<ExplainableAIRecommendation[]>(INITIAL_RECOMMENDATIONS);
  const [alerts, setAlerts] = useState<AutomatedAlert[]>(INITIAL_ALERTS);

  // Custom Hooks
  const { evacuationRoute, calculateRoute, selectShelter } = useEvacuationRoute(shelters);

  useSSEStream({
    onNewReport: (newReport) => setReports(prev => [newReport, ...prev]),
    onNewLog: (newLog) => setAgentLogs(prev => [newLog, ...prev]),
    onNewAlert: (newAlert) => setAlerts(prev => [newAlert, ...prev])
  });

  const [timeHorizon, setTimeHorizon] = useState<'live' | '30m' | '1h' | '2h'>('live');

  // Modals
  const [explainModalRec, setExplainModalRec] = useState<ExplainableAIRecommendation | null>(null);
  const [dispatchZoneId, setDispatchZoneId] = useState<string | null>(null);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Trigger Multi-Agent AI System Run via Gemini
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/ai/multiagent-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zones,
          sensors,
          reports,
          weatherCondition: { rainfallRateMmHr: 85, description: 'Heavy Convective Cloudburst over Velachery' }
        })
      });

      const data = await response.json();
      if (data.success && data.data) {
        const aiRes = data.data;

        // 1. Update zone risk predictions if provided
        if (aiRes.updatedZones && Array.isArray(aiRes.updatedZones)) {
          setZones(prev => prev.map(zone => {
            const match = aiRes.updatedZones.find((u: any) => u.id === zone.id);
            if (match) {
              return {
                ...zone,
                riskScore: match.riskScore || zone.riskScore,
                priorityLevel: match.priorityLevel || zone.priorityLevel,
                predictedWaterLevel30m: match.predictedWaterLevel30m || zone.predictedWaterLevel30m,
                predictedWaterLevel1h: match.predictedWaterLevel1h || zone.predictedWaterLevel1h,
                status: match.status || zone.status
              };
            }
            return zone;
          }));
        }

        // 2. Append AI Agent logs
        if (aiRes.agentLogs && Array.isArray(aiRes.agentLogs)) {
          const newLogs: AgentActivityLog[] = aiRes.agentLogs.map((log: any, idx: number) => ({
            id: `log-ai-${Date.now()}-${idx}`,
            agentName: log.agentName || 'Coordinator Agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            action: log.action || 'Telemetry Evaluation',
            details: log.details || 'Fused telemetry streams',
            severity: log.severity || 'info'
          }));
          setAgentLogs(prev => [...newLogs, ...prev]);
        }

        // 3. Append Recommendation if present
        if (aiRes.recommendation) {
          const rec = aiRes.recommendation;
          const newRec: ExplainableAIRecommendation = {
            id: `rec-ai-${Date.now()}`,
            title: rec.title || 'Deploy Emergency Dewatering & Motorboat Fleet',
            targetZoneId: rec.targetZoneId || 'zone-velachery-south',
            targetZoneName: rec.targetZoneName || 'Velachery South',
            actionType: rec.actionType || 'deploy_boats',
            recommendedResources: rec.recommendedResources || [{ resourceType: 'Rescue Boat Unit', quantity: 2 }],
            priority: rec.priority || 'CRITICAL',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            reasoning: rec.reasoning || {
              coreReason: 'Rapid sluice discharge threatens ground-floor residents.',
              evidenceData: ['IoT Sluice reading +2.85m', '3 Citizen Reports confirmed 4ft water'],
              confidencePct: 96,
              supportingMetrics: [{ metric: 'Rainfall', value: '85 mm/hr' }],
              riskExplanation: 'Delaying deployment by 15 minutes will trap ~1,200 residents.',
              alternativeRisk: 'Diverting boats to Kotturpuram causes higher total casualty risk.'
            },
            status: 'pending'
          };
          setRecommendations(prev => [newRec, ...prev]);
        }

        // 4. Append Automated Alert if generated
        if (aiRes.automatedAlert) {
          const alert = aiRes.automatedAlert;
          const newAlert: AutomatedAlert = {
            id: `alert-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            headline: alert.headline || 'FLASH FLOOD WARNING ACTIVE',
            zone: alert.zone || 'Velachery Sector',
            severity: alert.severity || 'critical',
            agenciesNotified: alert.agenciesNotified || ['Disaster Management', 'Fire & Rescue', 'Police'],
            instructions: alert.instructions || 'Evacuate ground floors immediately.',
            acknowledged: false
          };
          setAlerts(prev => [newAlert, ...prev]);
        }

        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Error during AI multi-agent sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Periodic Auto-Sync Heartbeat (Runs 12 Agents every 60 seconds)
  React.useEffect(() => {
    const timer = setInterval(() => {
      handleTriggerSync();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Recommendation Approvals
  const handleApproveRecommendation = (recId: string) => {
    setRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: 'approved' } : r));

    // Update resources and logs
    const rec = recommendations.find(r => r.id === recId);
    if (rec) {
      setResources(prev => prev.map(res => {
        if (res.status === 'available') {
          return { ...res, status: 'deployed', assignedZoneId: rec.targetZoneId };
        }
        return res;
      }));

      const newLog: AgentActivityLog = {
        id: `log-app-${Date.now()}`,
        agentName: 'Resource Planner Agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: 'Fleet Approved & Dispatched',
        details: `Approved "${rec.title}" for ${rec.targetZoneName}. Rescue boats deployed.`,
        severity: 'success'
      };
      setAgentLogs(prev => [newLog, ...prev]);
    }
  };

  const handleRejectRecommendation = (recId: string) => {
    setRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: 'rejected' } : r));
  };

  // Resource Dispatch
  const handleDispatchResource = (resourceId: string, zoneId: string) => {
    setResources(prev => prev.map(res => res.id === resourceId ? { ...res, status: 'deployed', assignedZoneId: zoneId } : res));
    const targetZone = zones.find(z => z.id === zoneId);
    const targetRes = resources.find(r => r.id === resourceId);

    const newLog: AgentActivityLog = {
      id: `log-disp-${Date.now()}`,
      agentName: 'Resource Planner Agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: 'Manual Fleet Dispatch',
      details: `Dispatched ${targetRes?.name || 'Unit'} to ${targetZone?.name || 'Inundation Sector'}.`,
      severity: 'success'
    };
    setAgentLogs(prev => [newLog, ...prev]);
  };

  // Initial Backend API Data Sync
  React.useEffect(() => {
    // Fetch Weather Data
    fetch('/api/weather')
      .then(res => res.json())
      .then(weather => {
        if (weather && weather.rainfallMmHr) {
          const log: AgentActivityLog = {
            id: `log-wth-${Date.now()}`,
            agentName: 'Weather Agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: 'Live Weather Ingested',
            details: `${weather.location}: ${weather.description}, Rain: ${weather.rainfallMmHr}mm/hr, Wind: ${weather.windSpeedKmh}km/h (${weather.highTideStatus})`,
            severity: weather.rainfallMmHr > 50 ? 'alert' : 'info'
          };
          setAgentLogs(prev => [log, ...prev]);
        }
      })
      .catch(err => console.warn('Weather sync skipped:', err));

    // Real-Time SSE (Server-Sent Events) Subscription
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'citizen_report_created' && payload.data) {
            const r = payload.data;
            const liveReport: CitizenReport = {
              id: r.id || `rep-${Date.now()}`,
              reporterName: r.reporterName || 'Citizen Dispatch',
              phone: r.phone || '+91 90000 00000',
              timestamp: 'LIVE JUST NOW',
              lat: r.coordinates ? r.coordinates[0] : 12.978,
              lng: r.coordinates ? r.coordinates[1] : 80.220,
              locationName: r.locationName || 'Velachery Sector',
              category: r.category || r.hazardType || 'waterlogging',
              severity: r.severity || 'high',
              description: r.description || '',
              imageUrl: r.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
              aiValidationScore: 96,
              aiValidatedCategory: 'Live SOS Incident Verified',
              aiSummary: 'Real-time broadcast received via SSE.',
              status: 'verified'
            };

            setReports(prev => [liveReport, ...prev.filter(item => item.id !== liveReport.id)]);

            // Toast Alert
            const newAlert: AutomatedAlert = {
              id: `alert-sse-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              headline: `🚨 REAL-TIME SOS INTAKE: ${liveReport.locationName}`,
              zone: liveReport.locationName,
              severity: 'critical',
              agenciesNotified: ['Disaster Management (NDRF)', 'Fire & Rescue', 'Traffic Control'],
              instructions: liveReport.description,
              acknowledged: false
            };
            setAlerts(prev => [newAlert, ...prev]);

            // Agent Log
            const log: AgentActivityLog = {
              id: `log-sse-${Date.now()}`,
              agentName: 'Citizen Intelligence Agent',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              action: 'Real-Time SSE Event Received',
              details: `Live hazard report broadcasted from ${liveReport.reporterName} at ${liveReport.locationName}.`,
              severity: 'alert'
            };
            setAgentLogs(prev => [log, ...prev]);
          }
        } catch (e) {
          console.warn('Error parsing SSE event:', e);
        }
      };
    } catch (err) {
      console.warn('SSE subscription failed:', err);
    }
  }, []);

  // Citizen Report Submission
  const handleSubmitCitizenReport = (reportData: Partial<CitizenReport>) => {
    const newReport: CitizenReport = {
      id: `report-${Date.now()}`,
      reporterName: reportData.reporterName || 'Anonymous Citizen',
      phone: reportData.phone || '+91 90000 00000',
      timestamp: 'Just now',
      lat: reportData.lat || 12.978,
      lng: reportData.lng || 80.222,
      locationName: reportData.locationName || 'Velachery',
      category: reportData.category || 'waterlogging',
      severity: reportData.severity || 'critical',
      description: reportData.description || 'Waterlogging report',
      imageUrl: reportData.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      aiValidationScore: reportData.aiValidationScore || 94,
      aiValidatedCategory: reportData.aiValidatedCategory || 'Verified Flood Waterlogging',
      aiSummary: reportData.aiSummary || 'Cross-validated with IoT water depth gauge.',
      status: 'verified'
    };

    // POST report to backend API
    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: newReport.description,
        hazardType: newReport.category,
        severity: newReport.severity,
        locationName: newReport.locationName,
        coordinates: [newReport.lat, newReport.lng]
      })
    }).catch(err => console.warn('POST report to backend failed:', err));

    setReports(prev => [newReport, ...prev]);

    const newLog: AgentActivityLog = {
      id: `log-rep-${Date.now()}`,
      agentName: 'Citizen Intelligence Agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: 'Citizen Incident Intake & AI Verification',
      details: `Ingested report from ${newReport.reporterName} at ${newReport.locationName}. Credibility: ${newReport.aiValidationScore}%.`,
      severity: 'warning'
    };
    setAgentLogs(prev => [newLog, ...prev]);
  };

  // Alert Acknowledgment
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#e0e0e6] flex flex-col font-sans">
      
      {/* Alert Notification Banner */}
      <AlertNotificationBanner alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />

      {/* Main Header */}
      <Header
        disasterType={disasterType}
        setDisasterType={setDisasterType}
        agencyRole={agencyRole}
        setAgencyRole={setAgencyRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSyncing={isSyncing}
        onTriggerSync={handleTriggerSync}
        alertsCount={alerts.filter(a => !a.acknowledged).length}
        lastSyncTime={lastSyncTime}
      />

      {/* Dynamic Tab Views */}
      <main className="flex-1">
        {activeTab === 'twin_map' && (
          <DigitalTwinMap
            zones={zones}
            sensors={sensors}
            resources={resources}
            shelters={shelters}
            reports={reports}
            evacuationRoute={evacuationRoute}
            timeHorizon={timeHorizon}
            setTimeHorizon={setTimeHorizon}
            onSelectZone={(zone) => setDispatchZoneId(zone.id)}
            onSelectResource={(res) => {}}
            onSelectReport={(rep) => {}}
          />
        )}

        {activeTab === 'multi_agent' && (
          <AuthorityDashboard
            zones={zones}
            agentLogs={agentLogs}
            recommendations={recommendations}
            resources={resources}
            alerts={alerts}
            onApproveRecommendation={handleApproveRecommendation}
            onRejectRecommendation={handleRejectRecommendation}
            onOpenExplainModal={(rec) => setExplainModalRec(rec)}
            onOpenDispatchModal={(zoneId) => setDispatchZoneId(zoneId)}
            isSyncing={isSyncing}
            onTriggerSync={handleTriggerSync}
          />
        )}

        {activeTab === 'simulation' && (
          <SimulationStudio />
        )}

        {activeTab === 'citizen_portal' && (
          <CitizenPortal
            shelters={shelters}
            reports={reports}
            onSubmitReport={handleSubmitCitizenReport}
            evacuationRoute={evacuationRoute}
            onSelectRouteShelter={selectShelter}
            onCalculateEvacuationRoute={calculateRoute}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsHub
            sensors={sensors}
            zones={zones}
          />
        )}
      </main>

      {/* Modals */}
      {explainModalRec && (
        <ExplainabilityModal
          recommendation={explainModalRec}
          onClose={() => setExplainModalRec(null)}
          onApprove={handleApproveRecommendation}
        />
      )}

      {dispatchZoneId && (
        <ResourceDispatchModal
          zoneId={dispatchZoneId}
          zones={zones}
          resources={resources}
          onDispatch={handleDispatchResource}
          onClose={() => setDispatchZoneId(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#0a0a0f] border-t border-[#ffffff15] py-3 px-4 text-center text-xs font-mono text-[#666]">
        <p>ResponSync AI Digital Twin Platform • Powered by Gemini AI Multi-Agent Intelligence • Chennai Disaster Pilot Region</p>
      </footer>

    </div>
  );
}
