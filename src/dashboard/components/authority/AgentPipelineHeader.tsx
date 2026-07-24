import React from 'react';
import { Cpu, RefreshCw, Activity, Zap } from 'lucide-react';

interface AgentPipelineHeaderProps {
  isRunning: boolean;
  onRunPipeline: (preset: 'normal' | 'moderate' | 'flood') => void;
  lastPreset: 'normal' | 'moderate' | 'flood';
  rainfallMmHr?: number;
  dischargeM3s?: number;
}

export const AgentPipelineHeader: React.FC<AgentPipelineHeaderProps> = ({
  isRunning,
  onRunPipeline,
  lastPreset,
  rainfallMmHr = 110,
  dischargeM3s = 1850
}) => {
  return (
    <div className="bg-[#0e1017] border border-white/10 p-4 rounded-lg shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: System Status Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-sans">
                3-Agent AI Autonomous Pipeline
              </h2>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono rounded font-bold">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Live Telemetry: Rain <span className="text-cyan-300 font-bold">{rainfallMmHr} mm/hr</span> | Basin Discharge <span className="text-cyan-300 font-bold">{dischargeM3s} m³/s</span>
            </p>
          </div>
        </div>

        {/* Right: Presets & Trigger Button */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <span className="text-neutral-400 text-[11px] uppercase mr-1">Preset:</span>
          {(['normal', 'moderate', 'flood'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => onRunPipeline(preset)}
              disabled={isRunning}
              className={`px-3 py-1.5 rounded uppercase font-bold text-[11px] transition-colors cursor-pointer border ${
                lastPreset === preset
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 text-neutral-400 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              {preset}
            </button>
          ))}

          <button
            onClick={() => onRunPipeline(lastPreset)}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 text-black font-extrabold uppercase tracking-wider text-xs rounded hover:bg-cyan-400 transition-colors cursor-pointer disabled:opacity-50 ml-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Agents...' : 'Sync Agents'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
