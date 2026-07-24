import React, { useState } from 'react';
import {
  ZoneRisk,
  AgentActivityLog,
  ExplainableAIRecommendation,
  EmergencyResource,
  AutomatedAlert
} from '../types';
import {
  Cpu,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Users,
  Navigation,
  ArrowUpRight,
  Send,
  Zap,
  Activity,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  LifeBuoy,
  FileText,
  Sliders
} from 'lucide-react';

interface AuthorityDashboardProps {
  zones: ZoneRisk[];
  agentLogs: AgentActivityLog[];
  recommendations: ExplainableAIRecommendation[];
  resources: EmergencyResource[];
  alerts: AutomatedAlert[];
  onApproveRecommendation: (recId: string) => void;
  onRejectRecommendation: (recId: string) => void;
  onOpenExplainModal: (rec: ExplainableAIRecommendation) => void;
  onOpenDispatchModal: (zoneId: string) => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  zones,
  agentLogs,
  recommendations,
  resources,
  alerts,
  onApproveRecommendation,
  onRejectRecommendation,
  onOpenExplainModal,
  onOpenDispatchModal,
  isSyncing,
  onTriggerSync
}) => {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');

  const filteredLogs = selectedAgentFilter === 'all'
    ? agentLogs
    : agentLogs.filter(log => log.agentName === selectedAgentFilter);

  const availableAgents = [
    'Weather Agent',
    'Satellite Agent',
    'Flood Prediction Agent',
    'Traffic Agent',
    'Citizen Intelligence Agent',
    'Resource Planner Agent',
    'Evacuation Agent',
    'Explainability Agent'
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-5 space-y-5 text-[#e0e0e6] font-sans">
      
      {/* Top Banner & Multi-Agent Headline */}
      <div className="bg-[#101018] p-5 rounded-lg border border-[#ffffff12] shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              12-Agent AI Command OS
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              AUTONOMOUS_LOOP_ACTIVE
            </span>
          </div>

          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight font-sans">
            Disaster Management Command & Control HQ
          </h2>
          <p className="text-xs text-[#888899] max-w-2xl leading-relaxed">
            Continuously synchronizing weather radars, satellite imagery, IoT water depth sensors, traffic corridors, and citizen emergency calls into actionable, explainable AI decisions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 w-full lg:w-auto">
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs rounded shadow transition-all cursor-pointer disabled:opacity-50"
          >
            <Cpu className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Executing Loop...' : 'Run 12 Agents'}</span>
          </button>
        </div>
      </div>

      {/* Grid Layout: Agent Logs + Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Multi-Agent Intelligence Activity Feed (5 cols) */}
        <div className="lg:col-span-5 bg-[#101018] rounded-lg border border-[#ffffff12] p-5 shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ff4e00]" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider font-sans">
                Multi-Agent Execution Stream
              </h3>
            </div>
            <span className="text-[10px] text-[#888] font-mono">{filteredLogs.length} EVENTS</span>
          </div>

          {/* Agent Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            <button
              onClick={() => setSelectedAgentFilter('all')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                selectedAgentFilter === 'all'
                  ? 'bg-[#ff4e00] text-black'
                  : 'bg-[#151520] text-[#888] hover:text-white border border-[#ffffff10]'
              }`}
            >
              All 12 Agents
            </button>
            {availableAgents.map((agent) => (
              <button
                key={agent}
                onClick={() => setSelectedAgentFilter(agent)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  selectedAgentFilter === agent
                    ? 'bg-[#ff4e00] text-black'
                    : 'bg-[#151520] text-[#888] hover:text-white border border-[#ffffff10]'
                }`}
              >
                {agent}
              </button>
            ))}
          </div>

          {/* Logs Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredLogs.map((log) => {
              let borderCol = 'border-l-2 border-[#ff4e00]';
              let badgeBg = 'bg-[#ff4e00]/15 text-[#ff4e00] border border-[#ff4e00]/30';
              if (log.severity === 'alert') {
                borderCol = 'border-l-2 border-rose-500';
                badgeBg = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
              } else if (log.severity === 'warning') {
                borderCol = 'border-l-2 border-amber-500';
                badgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
              } else if (log.severity === 'success') {
                borderCol = 'border-l-2 border-emerald-500';
                badgeBg = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
              }

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded bg-[#151520] ${borderCol} border border-[#ffffff10] space-y-1.5 hover:border-[#ffffff20] transition-all`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase ${badgeBg}`}>
                      {log.agentName}
                    </span>
                    <span className="text-[10px] text-[#666] font-mono">{log.timestamp}</span>
                  </div>

                  <p className="font-bold text-xs text-white">
                    {log.action}
                  </p>
                  <p className="text-[11px] text-[#aaa] leading-normal font-sans">
                    {log.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: AI Explainable Recommendations Panel (7 cols) */}
        <div className="lg:col-span-7 bg-[#0d0d14] rounded-lg border border-[#ffffff15] p-5 shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ff4e00]" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider font-sans">
                AI Action Recommendations
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#ff4e00] bg-[#ff4e00]/15 px-2.5 py-1 rounded border border-[#ff4e00]/30 uppercase tracking-widest">
              {recommendations.filter(r => r.status === 'pending').length} Pending Approval
            </span>
          </div>

          {/* Recommendations List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {recommendations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#666] text-sm space-y-2 font-mono">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p>All recommendations executed. System optimal.</p>
              </div>
            ) : (
              recommendations.map((rec) => {
                const isCritical = rec.priority === 'CRITICAL';

                return (
                  <div
                    key={rec.id}
                    className={`p-4 rounded bg-[#151520] border ${
                      isCritical ? 'border-[#ff4e00] border-l-4' : 'border-[#ffffff15]'
                    } space-y-3 relative overflow-hidden`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${
                              isCritical ? 'bg-[#ff4e00] text-black' : 'bg-amber-500 text-black'
                            }`}
                          >
                            {rec.priority} PRIORITY
                          </span>
                          <span className="text-xs font-mono font-bold text-[#ff4e00]">
                            TARGET: {rec.targetZoneName}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug font-sans">
                          {rec.title}
                        </h4>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-emerald-400 block">
                          {rec.reasoning.confidencePct}% Confidence
                        </span>
                        <span className="text-[10px] text-[#666]">{rec.timestamp}</span>
                      </div>
                    </div>

                    {/* Reasoning & Evidence Summary */}
                    <div className="bg-[#0d0d14] p-3 rounded border border-[#ffffff10] text-xs space-y-1.5 font-sans">
                      <p className="text-[#ccc] font-medium leading-relaxed">
                        <strong className="text-[#ff4e00] font-mono uppercase text-[10px]">Rationale:</strong> {rec.reasoning.coreReason}
                      </p>
                      
                      <div className="pt-1 border-t border-[#ffffff10]">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#888] tracking-wider block mb-1">
                          Key Evidence & Data Fusion:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[#aaa] text-[11px]">
                          {rec.reasoning.evidenceData.slice(0, 2).map((ev, idx) => (
                            <li key={idx}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => onOpenExplainModal(rec)}
                        className="flex items-center gap-1.5 text-xs text-[#ff4e00] hover:underline font-mono font-bold cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Explain AI Rationale
                      </button>

                      <div className="flex items-center gap-2">
                        {rec.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => onRejectRecommendation(rec.id)}
                              className="px-3 py-1.5 bg-transparent border border-[#ffffff20] hover:bg-[#ffffff08] text-[#ccc] font-bold text-xs uppercase rounded transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => onApproveRecommendation(rec.id)}
                              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#ff4e00] hover:bg-[#ff6a2b] text-black font-bold text-xs uppercase tracking-wider rounded shadow-md shadow-[#ff4e00]/20 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve & Dispatch
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-mono font-bold uppercase">
                            ✓ {rec.status}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Bottom Section: Predictive Risk Matrix Table */}
      <div className="bg-[#0d0d14] rounded-lg border border-[#ffffff15] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#ffffff15] pb-3">
          <div>
            <h3 className="font-bold text-white text-base font-sans flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ff4e00]" />
              Predictive Disaster Risk Matrix (Chennai Pilot Region)
            </h3>
            <p className="text-xs text-[#888]">
              Live hydrodynamic predictions updated every 60 seconds across Velachery, Adyar, and Guindy sectors.
            </p>
          </div>

          <span className="text-[10px] text-[#888] font-mono uppercase tracking-widest">
            5 Risk Zones Tracked
          </span>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#ccc]">
            <thead className="bg-[#0a0a0f] text-[#888] uppercase text-[10px] font-mono tracking-widest border-b border-[#ffffff15]">
              <tr>
                <th className="p-3">Zone Sector</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Current Depth</th>
                <th className="p-3">Predicted +1h</th>
                <th className="p-3">Pop. at Risk</th>
                <th className="p-3">Lead Time</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff10] font-mono">
              {zones.map((zone) => {
                let badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                if (zone.priorityLevel === 'CRITICAL') badgeClass = 'bg-[#ff4e00]/20 text-[#ff4e00] border-[#ff4e00]/40 font-bold';
                if (zone.priorityLevel === 'HIGH') badgeClass = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
                if (zone.priorityLevel === 'MEDIUM') badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                return (
                  <tr key={zone.id} className="hover:bg-[#151520] transition-all">
                    <td className="p-3 font-bold text-white font-sans">
                      {zone.name}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#151520] h-2 rounded overflow-hidden border border-[#ffffff10]">
                          <div
                            className={`h-full ${
                              zone.riskScore > 80 ? 'bg-[#ff4e00]' : zone.riskScore > 60 ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${zone.riskScore}%` }}
                          ></div>
                        </div>
                        <span className="font-mono font-bold text-white">{zone.riskScore}/100</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-mono uppercase ${badgeClass}`}>
                        {zone.priorityLevel}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-blue-400 font-bold">
                      {zone.currentWaterLevelMeters} m
                    </td>
                    <td className="p-3 font-mono text-amber-400 font-bold">
                      {zone.predictedWaterLevel1h} m
                    </td>
                    <td className="p-3 font-mono text-white">
                      {zone.populationAtRisk.toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-[#ff4e00]">
                      {zone.estimatedTimeToInundationMin} Mins
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onOpenDispatchModal(zone.id)}
                        className="px-3 py-1 bg-[#ff4e00]/20 hover:bg-[#ff4e00]/30 text-[#ff4e00] border border-[#ff4e00]/40 rounded text-[11px] font-bold uppercase transition-all cursor-pointer"
                      >
                        Dispatch Fleet
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
