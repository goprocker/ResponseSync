import React from 'react';
import {
  ShieldAlert,
  Activity,
  Radio,
  CloudRain,
  Cpu,
  Users,
  Building2,
  Flame,
  Siren,
  Hospital,
  RefreshCw,
  Clock,
  MapPin,
  ChevronRight,
  Sliders,
  Layers,
  FileText
} from 'lucide-react';
import { DisasterType, AgencyRole } from '../../shared/types';

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
  disasterType,
  setDisasterType,
  agencyRole,
  setAgencyRole,
  activeTab,
  setActiveTab,
  isSyncing,
  onTriggerSync,
  alertsCount,
  lastSyncTime,
  activePreset = 'flood'
}) => {
  return (
    <header className="bg-[#050507] border-b border-white/10 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-2.5 shadow-none">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand & Pilot Indicator */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-7 h-7 bg-brand rounded-none rotate-45 flex items-center justify-center transition-transform hover:scale-105">
                <div className="w-3.5 h-3.5 border border-black rotate-45"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tighter text-[#e0e0e6] font-sans uppercase">
                  RESPON<span className="text-white">SYNC</span>
                </h1>
                <span className="px-1.5 py-0.5 rounded-none text-[8px] font-mono font-bold tracking-widest uppercase bg-brand/10 text-[#e0e0e6] border border-brand/40">
                  COMMAND_OS
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-brand/60">
                <span className="uppercase tracking-widest">PILOT REGION:</span>
                <span className="text-brand">CHENNAI_VELACHERY_04</span>
              </div>
            </div>
          </div>

          {/* Quick Warning / Mobile Sync Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="p-1.5 bg-brand/10 hover:bg-brand/20 text-[#e0e0e6] border border-brand/40 rounded-none transition-all"
              title="Trigger AI Multi-Agent Sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#050507] p-0.5 rounded-none border border-white/10 overflow-x-auto w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('twin_map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'twin_map'
                ? 'bg-brand text-black'
                : 'text-brand hover:text-[#e0e0e6] hover:bg-brand/5'
            }`}
          >
            <Layers className="w-3 h-3" />
            Digital Twin
          </button>

          <button
            onClick={() => setActiveTab('multi_agent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'multi_agent'
                ? 'bg-brand text-black'
                : 'text-brand hover:text-[#e0e0e6] hover:bg-brand/5'
            }`}
          >
            <Cpu className="w-3 h-3" />
            Authority HQ
            {alertsCount > 0 && (
              <span className={`ml-1 px-1 py-0.2 text-[9px] font-mono font-extrabold ${
                activeTab === 'multi_agent' ? 'bg-[#050507] text-[#e0e0e6]' : 'bg-brand text-black'
              }`}>
                {alertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-brand text-black'
                : 'text-brand hover:text-[#e0e0e6] hover:bg-brand/5'
            }`}
          >
            <Sliders className="w-3 h-3" />
            Simulation Studio
          </button>

          <button
            onClick={() => setActiveTab('citizen_portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'citizen_portal'
                ? 'bg-brand text-black'
                : 'text-brand hover:text-[#e0e0e6] hover:bg-brand/5'
            }`}
          >
            <Users className="w-3 h-3" />
            Citizen Portal
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-brand text-black'
                : 'text-brand hover:text-[#e0e0e6] hover:bg-brand/5'
            }`}
          >
            <Activity className="w-3 h-3" />
            Data Fusion
          </button>
        </nav>

        {/* Judge Demo Scenario Presets */}
        <div className="flex items-center gap-1 bg-[#050507] p-1 rounded-none border border-white/10">
          <span className="text-[9px] uppercase font-mono font-bold text-amber-400 px-1.5 hidden xl:inline">
            JUDGE DEMO:
          </span>
          <button
            onClick={() => onTriggerSync('normal')}
            disabled={isSyncing}
            className={`px-2 py-1 rounded-none text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activePreset === 'normal'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-brand/60 hover:text-brand'
            }`}
            title="Simulate Normal Clear Operational Day (2.4mm/hr Rain)"
          >
            ☀️ Normal Day
          </button>

          <button
            onClick={() => onTriggerSync('moderate')}
            disabled={isSyncing}
            className={`px-2 py-1 rounded-none text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activePreset === 'moderate'
                ? 'bg-amber-500 text-black shadow'
                : 'text-brand/60 hover:text-amber-400'
            }`}
            title="Simulate Not So Normal Day (42mm/hr Heavy Rain)"
          >
            🌦️ Not So Normal Day
          </button>

          <button
            onClick={() => onTriggerSync('flood')}
            disabled={isSyncing}
            className={`px-2 py-1 rounded-none text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activePreset === 'flood'
                ? 'bg-red-500 text-white shadow'
                : 'text-brand/60 hover:text-red-400'
            }`}
            title="Simulate Catastrophic Cloudburst Flood Scenario (110mm/hr Rain)"
          >
            🚨 Simulate Flood
          </button>
        </div>

        {/* Agency Selector & Telemetry Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Agency View Dropdown */}
          <div className="flex items-center gap-2 bg-[#050507] px-3 py-1.5 rounded-none border border-white/10">
            <span className="text-[9px] uppercase font-mono tracking-widest text-brand/60 hidden xl:inline">Role:</span>
            <select
              value={agencyRole}
              onChange={(e) => setAgencyRole(e.target.value as AgencyRole)}
              className="bg-transparent text-xs font-mono font-bold text-[#e0e0e6] focus:outline-none cursor-pointer"
            >
              <option value="authority" className="bg-[#0e0e14] text-[#e0e0e6]">🏛️ Disaster Mgmt HQ</option>
              <option value="fire_rescue" className="bg-[#0e0e14] text-[#e0e0e6]">🚒 Fire & Rescue</option>
              <option value="police" className="bg-[#0e0e14] text-[#e0e0e6]">🚓 Police Traffic</option>
              <option value="health_hospitals" className="bg-[#0e0e14] text-[#e0e0e6]">🏥 Health & Hospitals</option>
              <option value="citizen" className="bg-[#0e0e14] text-[#e0e0e6]">👤 Citizen Public View</option>
            </select>
          </div>

          {/* Live Sync Status Badge */}
          <div className="px-3 py-1 bg-[#050507] border border-white/10 rounded-none hidden sm:flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-mono uppercase text-brand">AI Sync: ACTIVE</span>
          </div>

        </div>

      </div>
    </header>
  );
};
