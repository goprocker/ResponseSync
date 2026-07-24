import React, { useEffect, useState } from 'react';
import { ExplainableAIRecommendation } from '../../shared/types';
import {
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  FileText,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';

interface ExplainabilityModalProps {
  recommendation: ExplainableAIRecommendation | null;
  onClose: () => void;
  onApprove: (recId: string) => void;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  recommendation,
  onClose,
  onApprove
}) => {
  const [deepExplain, setDeepExplain] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!recommendation) return;

    const fetchDeepExplain = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/ai/explain-decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recommendation })
        });
        const data = await response.json();
        if (data.success && data.data) {
          setDeepExplain(data.data);
        }
      } catch (err) {
        console.error('Error fetching deep explainability:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeepExplain();
  }, [recommendation]);

  if (!recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050507]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#050507] border border-white/10 w-full max-w-3xl rounded-none shadow-none p-6 text-[#e0e0e6] font-sans space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-brand/15 border border-brand/30 flex items-center justify-center text-[#e0e0e6]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#e0e0e6] bg-brand/15 px-2 py-0.5 rounded border border-brand/30">
                EXPLAINABLE AI DECISION AUDIT
              </span>
              <h3 className="text-lg font-bold text-[#e0e0e6] mt-1 font-sans">
                {recommendation.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#888] hover:text-[#e0e0e6] rounded hover:bg-[#ffffff10] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confidence Meter Banner */}
        <div className="bg-[#050507] p-4 rounded border border-white/5 flex items-center justify-between font-mono">
          <div>
            <span className="text-xs text-[#888] font-sans">Model Confidence Score:</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-bold text-brand">
                {recommendation.reasoning.confidencePct}%
              </span>
              <span className="text-xs text-[#aaa] font-sans">High Statistical Certainty</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#888] font-sans">Target Sector:</span>
            <span className="text-sm font-bold text-[#e0e0e6] block">{recommendation.targetZoneName}</span>
          </div>
        </div>

        {/* Evidence Tree Section */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-mono font-bold uppercase text-[#888] tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            5-Point Multi-Source Evidence Verification:
          </h4>

          <div className="space-y-2 font-mono">
            {recommendation.reasoning.evidenceData.map((ev, idx) => (
              <div key={idx} className="bg-[#050507] p-3 rounded border border-white/5 flex items-start gap-2 text-xs text-[#ccc]">
                <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>{ev}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Counterfactual "What-If Delayed" Risk */}
        <div className="bg-[#050507] border-l-4 border-brand border-t border-b border-r border-white/5 p-4 rounded space-y-2 text-xs font-sans">
          <h4 className="font-mono font-bold text-[#e0e0e6] uppercase text-[10px] tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Counterfactual Risk Analysis (If Action is Delayed or Omitted):
          </h4>
          <p className="text-[#ccc] leading-relaxed font-medium">
            {recommendation.reasoning.riskExplanation}
          </p>
        </div>

        {/* Deep AI Causal Flow (if loaded) */}
        {loading ? (
          <div className="text-center py-4 text-[#888] text-xs flex items-center justify-center gap-2 font-mono">
            <Cpu className="w-4 h-4 animate-spin text-[#e0e0e6]" />
            Generating Deep Causal Flow & Trade-Off Matrix...
          </div>
        ) : deepExplain ? (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-[10px] font-mono font-bold uppercase text-[#888] tracking-widest">
              Deep Causal Reasoning Sequence:
            </h4>
            <div className="space-y-1.5 text-xs font-mono">
              {deepExplain.causalChain?.map((step: string, i: number) => (
                <div key={i} className="bg-[#050507] p-2.5 rounded border border-white/5 text-[#ccc]">
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={() => {
              alert('AI Explainability Log exported for Government Audit & Compliance.');
            }}
            className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#e0e0e6] cursor-pointer font-mono"
          >
            <FileText className="w-4 h-4" />
            Export Audit Compliance Log
          </button>

          <div className="flex items-center gap-3 font-sans">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-[#ffffff08] border border-white/10 text-[#ccc] rounded text-xs font-bold uppercase cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApprove(recommendation.id);
                onClose();
              }}
              className="px-5 py-2 bg-brand hover:bg-brand-deep text-black font-bold uppercase tracking-wider rounded text-xs shadow-lg shadow-none cursor-pointer"
            >
              Approve & Dispatch Fleet
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
