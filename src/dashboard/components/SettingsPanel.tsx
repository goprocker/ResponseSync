import React, { useState } from 'react';
import { Settings, Cpu, Database, Bell, Eye, Save } from 'lucide-react';

export default function SettingsPanel() {
  const [radarSync, setRadarSync] = useState(true);
  const [modelTemp, setModelTemp] = useState(0.2);
  const [sseFreq, setSseFreq] = useState(5);
  const [dbBackup, setDbBackup] = useState(true);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-[#0e0e14] p-5 border border-white/10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
              System Settings
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            ResponSync AI Command System Settings
          </h2>
          <p className="text-xs text-neutral-400">
            Configure radar sync thresholds, Multi-Agent loops execution, Gemini AI temperature, and database backup persistence.
          </p>
        </div>
        <div className="w-10 h-10 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
          <Settings className="w-5 h-5" />
        </div>
      </div>

      {/* Settings Grid */}
      <div className="bg-[#0e0e14] border border-white/10 p-5 space-y-6 shadow-sm">
        
        {/* Radar & Multi-agent loop configuration */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-wider text-brand font-bold flex items-center gap-1.5 pb-2 border-b border-white/5">
            <Cpu className="w-4 h-4" /> Multi-Agent Engine Configurations
          </h3>

          <div className="flex items-center justify-between py-2 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Auto-Sync Radars</span>
              <span className="text-neutral-400 text-[10px] block">Periodically sync live weather radars and IoT water depth sensors.</span>
            </div>
            <input 
              type="checkbox" 
              checked={radarSync} 
              onChange={(e) => setRadarSync(e.target.checked)}
              className="w-8 h-4 rounded-full bg-neutral-800 accent-brand border-none cursor-pointer"
            />
          </div>

          <div className="space-y-2 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Gemini AI Model Temperature</span>
              <span className="font-mono text-brand text-[10px]">{modelTemp}</span>
            </div>
            <p className="text-neutral-400 text-[10px] pb-1">
              Lower temperatures force strict deterministic reasoning, higher values encourage alternative disaster prediction scenarios.
            </p>
            <input 
              type="range" 
              min="0.0" 
              max="1.0" 
              step="0.1" 
              value={modelTemp} 
              onChange={(e) => setModelTemp(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#050507] rounded-lg appearance-none cursor-pointer accent-brand"
            />
          </div>
        </div>

        {/* Database & Infrastructure sync config */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-wider text-brand font-bold flex items-center gap-1.5 pb-2 border-b border-white/5">
            <Database className="w-4 h-4" /> Database & API Settings
          </h3>

          <div className="flex items-center justify-between py-2 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Supabase PostGIS Sync</span>
              <span className="text-neutral-400 text-[10px] block">Periodically back up local incidents coordinates and telemetry to PostgreSQL database.</span>
            </div>
            <input 
              type="checkbox" 
              checked={dbBackup} 
              onChange={(e) => setDbBackup(e.target.checked)}
              className="w-8 h-4 rounded-full bg-neutral-800 accent-brand border-none cursor-pointer"
            />
          </div>

          <div className="space-y-2 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">SSE Live Broadcast Frequency</span>
              <span className="font-mono text-brand text-[10px]">{sseFreq} seconds</span>
            </div>
            <p className="text-neutral-400 text-[10px] pb-1">
              Update rate of live telemetry streams pushed to map overlays and responder interfaces.
            </p>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={sseFreq} 
              onChange={(e) => setSseFreq(parseInt(e.target.value))}
              className="w-full h-1 bg-[#050507] rounded-lg appearance-none cursor-pointer accent-brand"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-end">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-deep text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer font-mono">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>

      </div>

    </div>
  );
}
