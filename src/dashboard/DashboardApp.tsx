import React, { useState, useEffect } from 'react';
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
  EvacuationRoute,
  EmergencyHospital
} from '../shared/types';
import {
  INITIAL_ZONES,
  INITIAL_IOT_SENSORS,
  INITIAL_RESOURCES,
  INITIAL_SHELTERS,
  INITIAL_CITIZEN_REPORTS,
  INITIAL_AGENT_LOGS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_ALERTS,
  INITIAL_HOSPITALS,
  MOCK_EVACUATION_ROUTE
} from '../shared/mockDigitalTwinData';

import { Header } from './components/Header';
import { DigitalTwinMap } from './components/DigitalTwinMap';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { SimulationStudio } from './components/SimulationStudio';
import { CitizenPortal } from './components/CitizenPortal';
import { AnalyticsHub } from './components/AnalyticsHub';
import { ExplainabilityModal } from './components/ExplainabilityModal';
import { ResourceDispatchModal } from './components/ResourceDispatchModal';
import { AlertNotificationBanner } from './components/AlertNotificationBanner';

import DashboardOverview from './components/DashboardOverview';
import HospitalsPanel from './components/HospitalsPanel';
import ResourcesPanel from './components/ResourcesPanel';
import SheltersPanel from './components/SheltersPanel';
import IncidentsPanel from './components/IncidentsPanel';
import SettingsPanel from './components/SettingsPanel';

import { 
  LayoutDashboard, 
  ShieldAlert, 
  Map, 
  Truck, 
  Home, 
  Hospital, 
  Cpu, 
  Sliders, 
  MessageSquare, 
  Settings, 
  Bell, 
  ChevronDown,
  RefreshCw,
  Activity,
  AlertTriangle
} from 'lucide-react';

import { useSSEStream } from '../hooks/useSSEStream';
import { useEvacuationRoute } from '../hooks/useEvacuationRoute';

interface DashboardAppProps {
  onBackToLanding: () => void;
  initialTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export default function DashboardApp({ onBackToLanding, initialTab, onNavigateTab }: DashboardAppProps) {
  // Global State
  const [disasterType, setDisasterType] = useState<DisasterType>('flood');
  const [agencyRole, setAgencyRole] = useState<AgencyRole>('authority');
  const [activeTab, setActiveTabState] = useState<string>(initialTab || 'dashboard');

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  const [zones, setZones] = useState<ZoneRisk[]>(INITIAL_ZONES);
  const [sensors, setSensors] = useState<IoTSensorNode[]>(INITIAL_IOT_SENSORS);
  const [resources, setResources] = useState<EmergencyResource[]>(INITIAL_RESOURCES);
  const [shelters, setShelters] = useState<EmergencyShelter[]>(INITIAL_SHELTERS);
  const [hospitals, setHospitals] = useState<EmergencyHospital[]>(INITIAL_HOSPITALS);
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

  // Syncing & Judge Demo Scenario Preset state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [activePreset, setActivePreset] = useState<'normal' | 'moderate' | 'flood'>('flood');

  // Trigger Multi-Agent AI System Run with Judge Demo Scenario Presets
  const handleTriggerSync = async (presetTarget?: 'normal' | 'moderate' | 'flood') => {
    const selectedPreset = presetTarget || activePreset;
    setActivePreset(selectedPreset);
    setIsSyncing(true);
    try {
      const response = await fetch('/api/ai/multiagent-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: selectedPreset,
          zones,
          sensors,
          reports,
          weatherCondition: { rainfallRateMmHr: selectedPreset === 'normal' ? 2.4 : selectedPreset === 'moderate' ? 42 : 110 }
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

  // Route Shelter Selector
  const handleSelectRouteShelter = (shelterId: string) => {
    selectShelter(shelterId);
  };

  // Alert Acknowledgment
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const activeReportsCount = reports.filter(r => r.status !== 'resolved').length;
  const activeAlert = alerts.filter(a => !a.acknowledged)[0] || alerts[0];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, badge: activeReportsCount },
    { id: 'twin_map', label: 'Map View', icon: Map },
    { id: 'resources', label: 'Resources', icon: Truck },
    { id: 'shelters', label: 'Shelters', icon: Home },
    { id: 'hospitals', label: 'Hospitals', icon: Hospital },
    { id: 'multi_agent', label: 'Authority HQ', icon: Cpu, badge: alerts.filter(a => !a.acknowledged).length },
    { id: 'simulation', label: 'Simulations', icon: Sliders },
    { id: 'citizen_portal', label: 'Reports', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen overflow-hidden bg-black text-[#e0e0e6] flex font-sans">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <aside className="w-[240px] border-r border-white/10 bg-[#0e0e14] flex flex-col h-full z-30 select-none flex-shrink-0">
        
        {/* Logo Section */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-7 h-7 bg-brand rounded-sm rotate-45 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-black -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-tighter text-sm font-sans uppercase">
              RESPON<span className="text-brand">SYNC</span>
            </span>
            <span className="text-[9px] text-neutral-400 uppercase font-mono tracking-wider">AI Emergency Command</span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all rounded-none cursor-pointer ${
                  isActive
                    ? 'bg-brand text-black font-extrabold'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[8px] font-bold ${
                    isActive ? 'bg-[#050507] text-[#e0e0e6]' : 'bg-brand/15 text-brand border border-brand/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status Footers */}
        <div className="p-4 border-t border-white/10 space-y-2.5 font-mono text-[9px] mt-auto">
          <div className="flex items-center justify-between text-neutral-400">
            <span>System Status</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
          <div className="flex items-center justify-between text-neutral-400">
            <span>AI Sync</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>

      </aside>

      {/* 2. Right Operations Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-[#050507]">
        
        {/* Return to Home Switcher Ribbon */}
        <div 
          onClick={onBackToLanding}
          className="bg-[#0d0d12] hover:bg-white/5 text-brand hover:text-[#e0e0e6] text-[10px] font-mono font-bold uppercase tracking-wider py-1 px-4 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 select-none z-50 border-b border-white/10 flex-shrink-0"
        >
          <span>⚡ Viewing LIVE ResponSync Command OS. Click here to return to the UgoRound Landing Page.</span>
        </div>

        {/* Alert Notification Banner */}
        <AlertNotificationBanner alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />

        {/* Top Header Bar */}
        <header className="h-[55px] bg-[#0e0e14] border-b border-white/10 px-5 flex items-center justify-between flex-shrink-0 z-20">
          
          {/* Active Flashing Alert Box */}
          <div className="flex items-center gap-2">
            {activeAlert ? (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 text-[11px] font-sans font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span className="uppercase tracking-wider">FLASH FLOOD ALERT</span>
                <span className="text-[#e0e0e6] font-normal font-mono">• {activeAlert.zone}</span>
                <span className="text-neutral-500 font-normal font-mono ml-1">{activeAlert.timestamp}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#050507] border border-white/5 text-neutral-400 px-3 py-1 text-xs">
                <span>ALL SECTORS SECURE</span>
              </div>
            )}
          </div>

          {/* User Profile and Roles */}
          <div className="flex items-center gap-4">
            
            {/* Sync trigger shortcut */}
            <button 
              onClick={() => handleTriggerSync()}
              disabled={isSyncing}
              className="p-1.5 border border-white/10 hover:border-brand/40 text-brand bg-[#050507] hover:bg-brand/5 cursor-pointer disabled:opacity-50"
              title="Run 12 Agents Sync Loop"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            {/* Notification bell badge */}
            <div className="relative cursor-pointer text-neutral-400 hover:text-white p-1">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-brand text-black text-[8px] font-extrabold rounded-full flex items-center justify-center font-mono">
                3
              </span>
            </div>

            {/* User Initial Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-sm bg-brand text-black font-extrabold text-xs flex items-center justify-center font-mono select-none">
                DM
              </div>
              
              {/* Dropdown details */}
              <div className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-[#e0e0e6] select-none">
                <select 
                  value={agencyRole} 
                  onChange={(e) => setAgencyRole(e.target.value as AgencyRole)}
                  className="bg-transparent border-none text-neutral-300 hover:text-white font-mono uppercase focus:outline-none cursor-pointer text-[10px] tracking-wide"
                >
                  <option value="authority" className="bg-[#0e0e14]">Disaster Mgmt HQ</option>
                  <option value="fire_rescue" className="bg-[#0e0e14]">Fire & Rescue</option>
                  <option value="police" className="bg-[#0e0e14]">Police Dept</option>
                  <option value="health_hospitals" className="bg-[#0e0e14]">Hospitals Group</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </div>
            </div>

          </div>

        </header>

        {/* 3. Main Workspace Screen */}
        <main className={`flex-1 min-h-0 relative overflow-hidden ${activeTab === 'twin_map' ? 'p-0' : 'p-6 overflow-y-auto no-scrollbar'}`}>
          
          {/* Tab Render Router */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              zones={zones}
              sensors={sensors}
              resources={resources}
              shelters={shelters}
              reports={reports}
              hospitals={hospitals}
              agentLogs={agentLogs}
              evacuationRoute={evacuationRoute}
              timeHorizon={timeHorizon}
              setTimeHorizon={setTimeHorizon}
              onSelectReport={(rep) => setActiveTab('incidents')}
              onSelectZone={(zoneId) => setDispatchZoneId(zoneId)}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsPanel 
              reports={reports} 
              onOpenDispatchModal={(zoneId) => setDispatchZoneId(zoneId)} 
            />
          )}

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

          {activeTab === 'resources' && (
            <ResourcesPanel 
              resources={resources} 
            />
          )}

          {activeTab === 'shelters' && (
            <SheltersPanel 
              shelters={shelters} 
            />
          )}

          {activeTab === 'hospitals' && (
            <HospitalsPanel 
              hospitals={hospitals} 
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
              onSelectRouteShelter={handleSelectRouteShelter}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel />
          )}

        </main>

      </div>

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

    </div>
  );
}
