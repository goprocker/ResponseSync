import React from 'react';
import { 
  AlertTriangle, 
  Truck, 
  Home, 
  Hospital, 
  CloudRain, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Activity, 
  ShieldAlert
} from 'lucide-react';
import { 
  ZoneRisk, 
  IoTSensorNode, 
  EmergencyResource, 
  EmergencyShelter, 
  CitizenReport, 
  EvacuationRoute,
  EmergencyHospital,
  AgentActivityLog
} from '../../shared/types';
import { DigitalTwinMap } from './DigitalTwinMap';

import { AgencyRole } from '../../shared/types';

interface DashboardOverviewProps {
  zones: ZoneRisk[];
  sensors: IoTSensorNode[];
  resources: EmergencyResource[];
  shelters: EmergencyShelter[];
  reports: CitizenReport[];
  hospitals: EmergencyHospital[];
  agentLogs?: AgentActivityLog[];
  evacuationRoute: EvacuationRoute | null;
  timeHorizon: number;
  setTimeHorizon: (val: number) => void;
  onSelectReport: (report: CitizenReport) => void;
  onSelectZone: (zoneId: string) => void;
  onNavigateToTab: (tabId: string) => void;
  agencyRole?: AgencyRole;
}

export default function DashboardOverview({
  zones,
  sensors,
  resources,
  shelters,
  reports,
  hospitals,
  agentLogs,
  evacuationRoute,
  timeHorizon,
  setTimeHorizon,
  onSelectReport,
  onSelectZone,
  onNavigateToTab,
  agencyRole = 'authority'
}: DashboardOverviewProps) {

  // Role-filtered resources
  const filteredResources = resources.filter(r => {
    if (agencyRole === 'fire_rescue') {
      return ['rescue_boat', 'fire_truck', 'ndrf_team'].includes(r.type);
    }
    if (agencyRole === 'police') {
      return ['police_patrol', 'relief_truck'].includes(r.type);
    }
    if (agencyRole === 'health_hospitals') {
      return ['ambulance', 'medical_unit'].includes(r.type);
    }
    return true;
  });

  // Dynamic calculations from datasets
  const activeReports = reports.filter(r => r.status !== 'resolved');
  const criticalReports = activeReports.filter(r => r.severity === 'critical' || r.severity === 'high');
  const deployedResources = filteredResources.filter(r => r.status === 'deployed' || r.status === 'en_route');
  const availableResources = filteredResources.filter(r => r.status === 'available');
  const openSheltersCount = shelters.filter(s => s.status === 'open' || s.status === 'near_capacity').length;
  const fullShelters = shelters.filter(s => s.status === 'near_capacity' || s.status === 'full').length;
  const capacityHospitalsCount = hospitals.filter(h => h.status === 'near_capacity' || h.status === 'full').length;

  return (
    <div className="space-y-6 text-[#e0e0e6] font-sans pb-8">
      
      {/* Active Agency Operational Mode Banner */}
      <div className="bg-[#0e0e14] border border-brand/30 p-3 flex items-center justify-between font-mono text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></span>
          <span className="font-bold text-white uppercase tracking-wider">
            {agencyRole === 'authority' && '🏛️ DISASTER MGMT HQ OPERATIONAL MODE'}
            {agencyRole === 'fire_rescue' && '🚒 FIRE & RESCUE OPERATIONAL MODE'}
            {agencyRole === 'police' && '🚓 POLICE DEPT OPERATIONAL MODE'}
            {agencyRole === 'health_hospitals' && '🏥 HEALTH & HOSPITALS OPERATIONAL MODE'}
            {agencyRole === 'citizen' && '👤 CITIZEN PUBLIC VIEW MODE'}
          </span>
          <span className="text-[10px] text-neutral-400 border-l border-white/10 pl-3 hidden sm:inline">
            {agencyRole === 'authority' && 'Cross-agency unified command telemetry'}
            {agencyRole === 'fire_rescue' && 'Rescue boats, dewatering fleets & inundation tracking'}
            {agencyRole === 'police' && 'Traffic control, patrol units & evacuation corridor management'}
            {agencyRole === 'health_hospitals' && 'Trauma units, ICU capacity & ambulance dispatch'}
            {agencyRole === 'citizen' && 'Public emergency announcements & safety routes'}
          </span>
        </div>
        <span className="text-[9px] bg-brand/15 text-brand border border-brand/40 px-2 py-0.5 font-bold uppercase">
          Role Filter Active
        </span>
      </div>

      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Active Incidents */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Active Incidents</span>
            <div className="text-2xl font-bold text-white">{activeReports.length}</div>
            <div className="text-[10px] text-red-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {criticalReports.length} Critical
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Resources Deployed */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Resources Deployed</span>
            <div className="text-2xl font-bold text-white">{deployedResources.length}</div>
            <div className="text-[10px] text-brand font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
              {availableResources.length} Available
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Open Shelters */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Open Shelters</span>
            <div className="text-2xl font-bold text-white">{openSheltersCount}</div>
            <div className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              {fullShelters} Near Capacity
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Home className="w-5 h-5" />
          </div>
        </div>

        {/* Hospitals Online */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Hospitals Online</span>
            <div className="text-2xl font-bold text-white">{hospitals.length}</div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {capacityHospitalsCount} At Capacity
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Hospital className="w-5 h-5" />
          </div>
        </div>

        {/* Rainfall (24h) */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Rainfall (24h)</span>
            <div className="text-2xl font-bold text-white">85 mm</div>
            <div className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
              High Risk
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <CloudRain className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* NEW: AI Multi-Disaster Cascading Impact Banner */}
      <div 
        onClick={() => onNavigateToTab('cascading_impact')}
        className="bg-gradient-to-r from-brand/15 via-[#0e0e18] to-purple-500/10 border border-brand/40 p-4 cursor-pointer hover:border-brand transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand text-black font-extrabold flex items-center justify-center rounded-sm flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-sans uppercase tracking-tight">
                AI Multi-Disaster Cascading Impact Prediction & Response Optimizer
              </span>
              <span className="px-1.5 py-0.2 text-[8px] font-mono font-extrabold bg-brand text-black uppercase">
                NEW FEATURE
              </span>
            </div>
            <p className="text-xs text-neutral-300 font-mono mt-0.5">
              Continuously predicts N-th order asset failures (Power → Hospital → Traffic → Shelters) & simulates optimal emergency strategies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand uppercase group-hover:text-white transition-colors flex-shrink-0">
          <span>Launch Cascading AI Workbench</span>
          <ArrowRight className="w-4 h-4 text-brand group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 2. Map & Incidents Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Map (2/3 width) */}
        <div className="lg:col-span-2 bg-[#0e0e14] border border-white/10 p-5 flex flex-col h-[480px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Live Situation Map
              </h3>
            </div>
            <button 
              onClick={() => onNavigateToTab('twin_map')}
              className="text-[10px] font-mono text-brand hover:text-white transition-colors cursor-pointer flex items-center gap-1 uppercase"
            >
              Expand View <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Embedded Leaflet Map */}
          <div className="flex-1 rounded-none overflow-hidden relative border border-white/5 bg-[#050507]">
            <DigitalTwinMap
              zones={zones}
              sensors={sensors}
              resources={resources}
              shelters={shelters}
              hospitals={hospitals}
              reports={reports}
              evacuationRoute={evacuationRoute}
              timeHorizon={timeHorizon}
              setTimeHorizon={setTimeHorizon}
              onSelectZone={(zone) => onSelectZone(zone.id)}
              onSelectResource={(res) => {}}
              onSelectReport={(rep) => {}}
            />
          </div>
        </div>

        {/* Right Column: Recent Incidents (1/3 width) */}
        <div className="bg-[#0e0e14] border border-white/10 p-5 flex flex-col h-[480px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Recent Incidents
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('citizen_portal')}
              className="text-[10px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer uppercase"
            >
              View All
            </button>
          </div>

          {/* Incidents Stream */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {reports.slice(0, 5).map((report) => (
              <div 
                key={report.id} 
                onClick={() => onSelectReport(report)}
                className="bg-[#050507] hover:bg-white/5 p-3.5 border border-white/5 transition-colors cursor-pointer flex items-start gap-3"
              >
                <div className={`p-2 rounded ${
                  report.severity === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  report.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                  report.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                  'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white capitalize truncate">{report.category.replace('_', ' ')}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      report.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      report.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      report.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {report.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate">{report.locationName}</p>
                  <div className="flex items-center justify-between pt-1 text-[9px] text-neutral-500 font-mono">
                    <span>{report.reporterName}</span>
                    <span>{report.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Bottom Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* AI Situation Summary */}
        <div className="bg-[#0e0e14] border border-white/10 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                AI Situation Summary
              </h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              Flash flood risk remains critical in Velachery and surrounding low-lying areas. Radars show continuous cloud density over the Adyar corridor, likely increasing water logging and drainage backup over the next 2 hours. Automated coordination loops have triggered alert warnings and rerouted emergency transit lines.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('multi_agent')}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand hover:bg-brand-deep text-black font-bold uppercase tracking-wider text-[10px] rounded transition-all cursor-pointer font-mono"
          >
            <span>View Full Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Resource Overview Progress Bars */}
        <div className="bg-[#0e0e14] border border-white/10 p-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Resource Overview
              </h3>
            </div>
            <button 
              onClick={() => onNavigateToTab('resources')}
              className="text-[10px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer uppercase"
            >
              View All
            </button>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-3.5">
            {/* Rescue Boats */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#e0e0e6] font-mono">Rescue Boats</span>
                <span className="font-bold text-white font-mono">6 / 10 Deployed</span>
              </div>
              <div className="w-full h-2.5 bg-[#050507] border border-white/5">
                <div className="h-full bg-brand" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Ambulances */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#e0e0e6] font-mono">Ambulances</span>
                <span className="font-bold text-white font-mono">7 / 12 Deployed</span>
              </div>
              <div className="w-full h-2.5 bg-[#050507] border border-white/5">
                <div className="h-full bg-emerald-500" style={{ width: '58%' }}></div>
              </div>
            </div>

            {/* Fire Trucks */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#e0e0e6] font-mono">Fire Trucks</span>
                <span className="font-bold text-white font-mono">4 / 8 Deployed</span>
              </div>
              <div className="w-full h-2.5 bg-[#050507] border border-white/5">
                <div className="h-full bg-orange-500" style={{ width: '50%' }}></div>
              </div>
            </div>

            {/* Relief Supplies */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#e0e0e6] font-mono">Relief Supplies</span>
                <span className="font-bold text-white font-mono">60% Remaining</span>
              </div>
              <div className="w-full h-2.5 bg-[#050507] border border-white/5">
                <div className="h-full bg-purple-500" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline & 12-Agent Intelligence Stream */}
        <div className="bg-[#0e0e14] border border-white/10 p-5 flex flex-col h-full max-h-[300px] lg:max-h-none overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                12-Agent Activity Feed
              </h3>
            </div>
            <button 
              onClick={() => onNavigateToTab('multi_agent')}
              className="text-[10px] font-mono text-brand hover:text-white transition-colors cursor-pointer uppercase font-bold flex items-center gap-1"
            >
              <span>HQ View ({agentLogs?.length || 0})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {(agentLogs && agentLogs.length > 0 ? agentLogs : [
              { id: '1', timestamp: '10:25 AM', agentName: 'Coordinator Agent', action: 'System Monitoring Active', details: 'Continuous telemetry stream ingest across 12 production agents', severity: 'info' }
            ]).map((log, i) => (
              <div key={log.id || i} className="flex gap-2.5 text-xs items-start border-b border-white/5 pb-2">
                <span className="text-[10px] text-neutral-400 font-mono pt-0.5 min-w-[55px]">{log.timestamp}</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white text-[11px] font-mono">{log.agentName}</span>
                    <span className={`text-[9px] px-1 rounded font-mono uppercase font-semibold ${
                      log.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      log.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      log.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      log.severity === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {log.action}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-300 truncate mt-0.5">{log.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
