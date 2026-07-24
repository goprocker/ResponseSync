import React from 'react';
import { Activity, CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { AgentLog } from '../../../hooks/useAgentPipeline.js';

interface AgentActivityStreamProps {
  logs: AgentLog[];
}

export const AgentActivityStream: React.FC<AgentActivityStreamProps> = ({ logs }) => {
  const getSeverityBadge = (severity: AgentLog['severity']) => {
    switch (severity) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'alert':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="bg-[#0e1017] border border-white/10 p-4 rounded-lg shadow-xl font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2 text-white">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-sans">
            Live 3-Agent Activity Stream
          </h3>
        </div>
        <span className="text-[10px] text-neutral-400">{logs.length} events logged</span>
      </div>

      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No agent activity logged. Click <span className="text-cyan-400">Sync Agents</span> above to run reasoning loop.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="bg-[#07080c] border border-white/5 p-3 rounded hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-white font-sans">{log.agentName}</span>
                  <span className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded border ${getSeverityBadge(log.severity)}`}>
                    {log.action}
                  </span>
                </div>
                <span className="text-[9.5px] text-neutral-500">{log.timestamp}</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed font-sans mt-1">
                {log.details}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
