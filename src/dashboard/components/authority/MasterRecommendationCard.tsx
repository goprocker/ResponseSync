import React from 'react';
import { ShieldAlert, CheckCircle2, Zap, MapPin, Camera, AlertTriangle, User, Check, Sparkles } from 'lucide-react';
import { ExplainableAIRecommendation, CitizenReport } from '../../../shared/types';

interface MasterRecommendationCardProps {
  recommendation: ExplainableAIRecommendation | null;
  reports?: CitizenReport[];
  activeReport?: CitizenReport | null;
  onSelectReport?: (reportId: string) => void;
  onDispatchFleet: (recommendation: ExplainableAIRecommendation) => void;
  isDispatched?: boolean;
}

export const MasterRecommendationCard: React.FC<MasterRecommendationCardProps> = ({
  recommendation,
  reports = [],
  activeReport,
  onSelectReport,
  onDispatchFleet,
  isDispatched = false
}) => {
  if (!recommendation) {
    return (
      <div className="bg-[#0e1017] border border-white/10 p-6 rounded-lg shadow-xl text-center font-mono">
        <ShieldAlert className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
        <p className="text-xs text-neutral-400">Awaiting 3-Agent AI Recommendation Output...</p>
      </div>
    );
  }

  const confidencePct = recommendation.reasoning?.confidencePct || 94;
  const capturedSiteName = activeReport?.locationName || recommendation.targetZoneName;

  return (
    <div className="bg-[#0e1017] border border-cyan-500/30 p-5 rounded-lg shadow-2xl relative overflow-hidden space-y-4">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge & Target Zone */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold uppercase rounded">
            {recommendation.priority || 'CRITICAL'} PRIORITY
          </span>
          <div className="flex items-center gap-1 text-xs text-cyan-400 font-mono font-bold bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Zone: {recommendation.targetZoneName}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-neutral-400">XAI Confidence:</span>
          <span className="text-cyan-400 font-extrabold text-sm">{confidencePct}%</span>
        </div>
      </div>

      {/* Captured Incident Site from Citizen Reports Panel */}
      {activeReport ? (
        <div className="bg-[#05070a] border border-amber-500/40 p-3.5 rounded-lg relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase tracking-wider">Captured Incident Site (Citizen Report)</span>
            </div>
            {activeReport.aiValidationScore && (
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                AI Verified ({activeReport.aiValidationScore}%)
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-3">
            {activeReport.imageUrl && (
              <div className="w-full sm:w-24 h-20 rounded bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                <img 
                  src={activeReport.imageUrl} 
                  alt="Captured incident site"
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="flex-1 space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-200">{activeReport.locationName}</span>
              </div>

              <p className="text-xs text-neutral-300 font-sans line-clamp-2">
                "{activeReport.description}"
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10.5px] font-mono text-neutral-400">
                <span className="flex items-center gap-1 text-neutral-300">
                  <User className="w-3 h-3 text-neutral-400" /> {activeReport.reporterName}
                </span>
                <span>•</span>
                <span className="text-neutral-400">{activeReport.timestamp}</span>
                <span>•</span>
                <span className={`uppercase font-bold ${
                  activeReport.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {activeReport.severity} severity
                </span>
              </div>
            </div>
          </div>

          {/* Selector if multiple captured citizen reports exist */}
          {reports.length > 1 && onSelectReport && (
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2 font-mono text-[10.5px]">
              <span className="text-neutral-400 shrink-0">Select Captured Incident Site:</span>
              <select
                value={activeReport.id}
                onChange={(e) => onSelectReport(e.target.value)}
                className="bg-[#0e1017] text-cyan-300 border border-cyan-500/40 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-400 font-mono w-full max-w-[280px]"
              >
                {reports.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    📍 {rep.locationName.slice(0, 32)}... ({rep.reporterName})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#05070a] border border-white/10 p-3 rounded text-xs text-neutral-400 font-mono flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Incident Location: <strong className="text-white">{capturedSiteName}</strong></span>
        </div>
      )}

      {/* Title & Core Reason */}
      <div>
        <h3 className="text-base font-bold text-white mb-1.5 font-sans">{recommendation.title}</h3>
        <p className="text-xs text-neutral-300 leading-relaxed font-sans">
          {recommendation.reasoning?.coreReason || recommendation.reasoning?.riskExplanation}
        </p>
      </div>

      {/* Recommended Fleet Allocation */}
      {recommendation.recommendedResources && recommendation.recommendedResources.length > 0 && (
        <div className="bg-[#07080c] border border-white/10 p-3 rounded font-mono">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-2">Recommended Fleet Units</span>
          <div className="grid grid-cols-2 gap-2">
            {recommendation.recommendedResources.map((res, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-white/5 px-2.5 py-1.5 rounded border border-white/5">
                <span className="text-neutral-300">{res.resourceType}</span>
                <span className="text-cyan-400 font-bold">x{res.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispatch Action Button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10.5px] font-mono text-neutral-500">
          Agent 3: Command & Dispatch System
        </span>
        <button
          onClick={() => onDispatchFleet(recommendation)}
          disabled={isDispatched}
          className={`flex items-center gap-2 px-5 py-2 rounded text-xs font-mono font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
            isDispatched
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
              : 'bg-cyan-500 hover:bg-cyan-400 text-black border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
          }`}
        >
          {isDispatched ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Fleet Dispatched</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Approve & Dispatch Fleet</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

