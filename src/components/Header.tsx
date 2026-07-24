import React from 'react';
import {
  ShieldAlert,
  Activity,
  Cpu,
  Users,
  RefreshCw,
  Sliders,
  Layers,
  MapPin
} from 'lucide-react';
import { DisasterType, AgencyRole } from '../types';

interface HeaderProps {
  disasterType: DisasterType;
  setDisasterType: (type: DisasterType) => void;
  agencyRole: AgencyRole;
  setAgencyRole: (role: AgencyRole) => void;
  activeTab: 'twin_map' | 'multi_agent' | 'simulation' | 'citizen_portal' | 'analytics';
  setActiveTab: (tab: 'twin_map' | 'multi_agent' | 'simulation' | 'citizen_portal' | 'analytics') => void;
  isSyncing: boolean;
  onTriggerSync: (preset?: 'normal' | 'moderate' | 'flood') => void;
  alertsCount: number;
  lastSyncTime: string;
  activePreset?: 'normal' | 'moderate' | 'flood';
}

export const Header: React.FC<HeaderProps> = ({
  agencyRole,
  setAgencyRole,
  activeTab,
  setActiveTab,
  isSyncing,
  onTriggerSync,
  alertsCount,
  activePreset = 'flood'
}) => {
  return (
    <header className="bg-[#08080c] border-b border-[#ffffff12] sticky top-0 z-50 backdrop-blur-md px-4 sm:px-6 py-2.5">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Pilot Location */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center font-black text-black text-xs tracking-tighter">
              RS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white font-sans">
                  RESPON<span className="text-amber-500">SYNC</span>
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                  OS v2.4
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#888]">
                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                <span>CHENNAI_VELACHERY_PILOT</span>
              </div>
            </div>
          </div>

          {/* Mobile Refresh Button */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="md:hidden p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Portal Switcher (Govt HQ vs Citizen Portal) */}
        <div className="flex items-center gap-1.5 bg-[#101018] p-1 rounded-lg border border-[#ffffff12]">
          <button
            onClick={() => {
              setAgencyRole('authority');
              if (activeTab === 'citizen_portal') setActiveTab('twin_map');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              agencyRole === 'authority' && activeTab !== 'citizen_portal'
                ? 'bg-amber-500 text-black shadow'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Govt HQ</span>
          </button>

          <button
            onClick={() => {
              setAgencyRole('citizen');
              setActiveTab('citizen_portal');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              agencyRole === 'citizen' || activeTab === 'citizen_portal'
                ? 'bg-cyan-500 text-black shadow'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </button>
        </div>

        {/* Judge Demo Scenario Presets */}
        <div className="flex items-center gap-1 bg-[#101018] p-1 rounded-lg border border-[#ffffff12]">
          <span className="text-[9px] uppercase font-mono font-bold text-amber-500 px-1.5 hidden xl:inline">
            JUDGE DEMO:
          </span>
          <button
            onClick={() => onTriggerSync('normal')}
            disabled={isSyncing}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activePreset === 'normal'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-[#888] hover:text-emerald-400'
            }`}
            title="Simulate Normal Clear Operational Day (2.4mm/hr Rain)"
          >
            ☀️ Normal Day
          </button>

          <button
            onClick={() => onTriggerSync('moderate')}
            disabled={isSyncing}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activePreset === 'moderate'
                ? 'bg-amber-500 text-black shadow'
                : 'text-[#888] hover:text-amber-400'
            }`}
            title="Simulate Not So Normal Day (42mm/hr Heavy Rain)"
          >
            🌦️ Not So Normal Day
          </button>

          <button
            onClick={() => onTriggerSync('flood')}
            disabled={isSyncing}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activePreset === 'flood'
                ? 'bg-red-500 text-white shadow'
                : 'text-[#888] hover:text-red-400'
            }`}
            title="Simulate Catastrophic Cloudburst Flood Scenario (110mm/hr Rain)"
          >
            🚨 Simulate Flood
          </button>
        </div>

        {/* Navigation Sub-Tabs & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <nav className="flex items-center gap-1 bg-[#101018] p-1 rounded-lg border border-[#ffffff12]">
            {agencyRole === 'authority' && activeTab !== 'citizen_portal' ? (
              <>
                <button
                  onClick={() => setActiveTab('twin_map')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'twin_map' ? 'bg-[#ffffff15] text-white' : 'text-[#888] hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  <span>Digital Twin</span>
                </button>

                <button
                  onClick={() => setActiveTab('multi_agent')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'multi_agent' ? 'bg-[#ffffff15] text-white' : 'text-[#888] hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>12 Agents</span>
                  {alertsCount > 0 && (
                    <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-red-500 text-white">
                      {alertsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('simulation')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'simulation' ? 'bg-[#ffffff15] text-white' : 'text-[#888] hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sim Studio</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'analytics' ? 'bg-[#ffffff15] text-white' : 'text-[#888] hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-[#888]" />
                  <span>Analytics</span>
                </button>
              </>
            ) : (
              <span className="px-3 py-1 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Emergency Intake & Safe Router
              </span>
            )}
          </nav>

          {/* AI Trigger */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Running...' : 'Run 12 Agents'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
