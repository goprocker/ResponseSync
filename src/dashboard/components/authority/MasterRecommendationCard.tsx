import React from 'react';
import { ShieldAlert, CheckCircle2, Zap } from 'lucide-react';
import { ExplainableAIRecommendation } from '../../../shared/types';

interface MasterRecommendationCardProps {
  recommendation: ExplainableAIRecommendation | null;
  onDispatchFleet: (recommendation: ExplainableAIRecommendation) => void;
  isDispatched?: boolean;
}

export const MasterRecommendationCard: React.FC<MasterRecommendationCardProps> = ({
  recommendation,
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

  return (
    <div className="bg-[#0e1017] border border-cyan-500/30 p-5 rounded-lg shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold uppercase rounded">
            {recommendation.priority || 'CRITICAL'} PRIORITY
          </span>
          <span className="text-xs text-neutral-400 font-mono">Target: {recommendation.targetZoneName}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-neutral-400">XAI Confidence:</span>
          <span className="text-cyan-400 font-extrabold text-sm">{confidencePct}%</span>
        </div>
      </div>

      {/* Title & Core Reason */}
      <h3 className="text-base font-bold text-white mb-2 font-sans">{recommendation.title}</h3>
      <p className="text-xs text-neutral-300 leading-relaxed font-sans mb-4">
        {recommendation.reasoning?.coreReason || recommendation.reasoning?.riskExplanation}
      </p>

      {/* Recommended Fleet Allocation */}
      {recommendation.recommendedResources && recommendation.recommendedResources.length > 0 && (
        <div className="bg-[#07080c] border border-white/10 p-3 rounded mb-4 font-mono">
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
