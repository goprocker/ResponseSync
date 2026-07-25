import React, { useState, useMemo } from 'react';
import {
  ZoneRisk,
  AgentActivityLog,
  ExplainableAIRecommendation,
  CitizenReport,
  EmergencyResource,
  AutomatedAlert
} from '../../shared/types';
import { AgentPipelineHeader } from './authority/AgentPipelineHeader';
import { AgentActivityStream } from './authority/AgentActivityStream';
import { MasterRecommendationCard } from './authority/MasterRecommendationCard';
import { useAgentPipeline } from '../../hooks/useAgentPipeline';
import { HelpCircle, FileText, Send, Radio, Zap } from 'lucide-react';

interface AuthorityDashboardProps {
  zones: ZoneRisk[];
  agentLogs: AgentActivityLog[];
  recommendations: ExplainableAIRecommendation[];
  reports?: CitizenReport[];
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
  agentLogs: initialAgentLogs,
  recommendations,
  reports = [],
  resources,
  alerts,
  onApproveRecommendation,
  onOpenExplainModal,
  onOpenDispatchModal,
  isSyncing,
  onTriggerSync
}) => {
  const { isRunning, agentLogs, activeRecommendation, executePipeline, lastPreset } = useAgentPipeline();
  const [dispatchedRecIds, setDispatchedRecIds] = useState<Record<string, boolean>>({});
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Active captured incident report
  const activeReport = useMemo(() => {
    if (!reports || reports.length === 0) return null;
    return reports.find(r => r.id === selectedReportId) || reports[0];
  }, [reports, selectedReportId]);

  const handleRunPipeline = (preset: 'normal' | 'moderate' | 'flood') => {
    executePipeline(preset);
    onTriggerSync();
  };

  const handleDispatch = (rec: any) => {
    if (rec.id) {
      setDispatchedRecIds((prev) => ({ ...prev, [rec.id]: true }));
      onApproveRecommendation(rec.id);
    }
    if (rec.targetZoneId) {
      onOpenDispatchModal(rec.targetZoneId);
    }
  };

  // Map hook logs to initial logs if empty
  const displayLogs = agentLogs.length > 0 ? agentLogs : initialAgentLogs.map((l, idx) => ({
    id: l.id || `init-log-${idx}`,
    agentName: l.agentName,
    action: l.action,
    details: l.details,
    timestamp: l.timestamp,
    severity: (l.severity as any) || 'info'
  }));

  const primaryRecommendation = activeRecommendation || (recommendations[0] as any) || null;

  // Synchronize target location in recommendation with captured incident location in reports
  const synchronizedRecommendation = useMemo(() => {
    if (!primaryRecommendation) return null;
    const targetLoc = activeReport?.locationName || primaryRecommendation.targetZoneName;
    return {
      ...primaryRecommendation,
      targetZoneName: targetLoc
    };
  }, [primaryRecommendation, activeReport]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-5 space-y-6 text-[#e0e0e6] font-sans">
      {/* 3-Agent Pipeline Command Header */}
      <AgentPipelineHeader
        isRunning={isRunning || isSyncing}
        onRunPipeline={handleRunPipeline}
        lastPreset={lastPreset}
      />

      {/* Main Grid: Left Master Recommendation, Right 3-Agent Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <MasterRecommendationCard
            recommendation={synchronizedRecommendation}
            reports={reports}
            activeReport={activeReport}
            onSelectReport={(repId) => setSelectedReportId(repId)}
            onDispatchFleet={handleDispatch}
            isDispatched={synchronizedRecommendation?.id ? dispatchedRecIds[synchronizedRecommendation.id] : false}
          />

          {/* Quick Manual Emergency Actions */}
          <div className="bg-[#0e1017] border border-white/10 p-4 rounded-lg shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 font-mono">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Emergency Fleet & Agency Broadcast Actions
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">MANUAL OVERRIDE READY</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <button
                onClick={() => onOpenDispatchModal(zones[0]?.id || 'zone-velachery-south')}
                className="flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-cyan-500/10 text-cyan-400 border border-white/10 hover:border-cyan-500/40 rounded transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Dispatch Fleet</span>
              </button>

              <button
                onClick={() => synchronizedRecommendation && onOpenExplainModal(synchronizedRecommendation)}
                className="flex items-center justify-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 rounded transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Audit XAI Rationale</span>
              </button>

              <button
                onClick={() => alert('Emergency C-DOT SMS Broadcast Dispatched to Chennai Citizens.')}
                className="flex items-center justify-center gap-2 p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast SMS Alert</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <AgentActivityStream logs={displayLogs} />
        </div>
      </div>
    </div>
  );
};

