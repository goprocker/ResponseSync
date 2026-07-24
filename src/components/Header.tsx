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
import { DisasterType, AgencyRole } from '../types';

interface HeaderProps {
  disasterType: DisasterType;
  setDisasterType: (type: DisasterType) => void;
  agencyRole: AgencyRole;
  setAgencyRole: (role: AgencyRole) => void;
  activeTab: 'twin_map' | 'multi_agent' | 'simulation' | 'citizen_portal' | 'analytics';
  setActiveTab: (tab: 'twin_map' | 'multi_agent' | 'simulation' | 'citizen_portal' | 'analytics') => void;
  isSyncing: boolean;
  onTriggerSync: () => void;
  alertsCount: number;
  lastSyncTime: string;
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
  lastSyncTime
}) => {
  return (
    <header className="bg-[#0a0a0f] border-b border-[#ffffff15] sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand & Pilot Indicator */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-[#ff4e00] rounded-sm rotate-45 flex items-center justify-center shadow-lg shadow-[#ff4e00]/30 transition-transform hover:scale-105">
                <div className="w-4 h-4 border-2 border-black rotate-45"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tighter text-white font-sans">
                  RESPON<span className="text-[#ff4e00]">SYNC</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase bg-[#ff4e00]/15 text-[#ff4e00] border border-[#ff4e00]/30">
                  COMMAND_OS
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#888]">
                <span className="uppercase tracking-widest text-[#666]">PILOT REGION:</span>
                <span className="text-[#ccc] font-mono">CHENNAI_VELACHERY_04</span>
              </div>
            </div>
          </div>

          {/* Quick Warning / Mobile Sync Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="p-2 bg-[#ff4e00]/20 hover:bg-[#ff4e00]/30 text-[#ff4e00] border border-[#ff4e00]/40 rounded transition-all"
              title="Trigger AI Multi-Agent Sync"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-[#050507] p-1 rounded-lg border border-[#ffffff10] overflow-x-auto w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('twin_map')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'twin_map'
                ? 'bg-[#ff4e00] text-black shadow-md shadow-[#ff4e00]/20'
                : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Digital Twin
          </button>

          <button
            onClick={() => setActiveTab('multi_agent')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'multi_agent'
                ? 'bg-[#ff4e00] text-black shadow-md shadow-[#ff4e00]/20'
                : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Authority HQ
            {alertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-extrabold bg-[#ff4e00] text-black">
                {alertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-[#ff4e00] text-black shadow-md shadow-[#ff4e00]/20'
                : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Simulation Studio
          </button>

          <button
            onClick={() => setActiveTab('citizen_portal')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'citizen_portal'
                ? 'bg-[#ff4e00] text-black shadow-md shadow-[#ff4e00]/20'
                : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Citizen Portal
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#ff4e00] text-black shadow-md shadow-[#ff4e00]/20'
                : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Data Fusion
          </button>
        </nav>

        {/* Agency Selector & Telemetry Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Agency View Dropdown */}
          <div className="flex items-center gap-2 bg-[#151520] px-3 py-1.5 rounded border border-[#ffffff15]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#888] hidden xl:inline">Role:</span>
            <select
              value={agencyRole}
              onChange={(e) => setAgencyRole(e.target.value as AgencyRole)}
              className="bg-transparent text-xs font-mono font-bold text-[#e0e0e6] focus:outline-none cursor-pointer"
            >
              <option value="authority" className="bg-[#0d0d14] text-white">🏛️ Disaster Mgmt HQ</option>
              <option value="fire_rescue" className="bg-[#0d0d14] text-white">🚒 Fire & Rescue</option>
              <option value="police" className="bg-[#0d0d14] text-white">🚓 Police Traffic</option>
              <option value="health_hospitals" className="bg-[#0d0d14] text-white">🏥 Health & Hospitals</option>
              <option value="citizen" className="bg-[#0d0d14] text-white">👤 Citizen Public View</option>
            </select>
          </div>

          {/* Sync Trigger */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#ff4e00] hover:bg-[#ff6a2b] text-black font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-black ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Agent Loop'}</span>
          </button>

          {/* Live Sync Status Badge */}
          <div className="px-3 py-1 bg-[#151520] border border-[#ffffff15] rounded hidden sm:flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-mono uppercase text-[#ccc]">AI Sync: ACTIVE</span>
          </div>

        </div>

      </div>
    </header>
  );
};
