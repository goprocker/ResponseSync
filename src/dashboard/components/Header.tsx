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
    <header className="bg-[#040806] border-b border-[#10b98125] sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-2.5 shadow-none">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand & Pilot Indicator */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-7 h-7 bg-[#10b981] rounded-none rotate-45 flex items-center justify-center transition-transform hover:scale-105">
                <div className="w-3.5 h-3.5 border border-black rotate-45"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tighter text-emerald-100 font-sans uppercase">
                  RESPON<span className="text-white">SYNC</span>
                </h1>
                <span className="px-1.5 py-0.5 rounded-none text-[8px] font-mono font-bold tracking-widest uppercase bg-[#10b981]/10 text-emerald-100 border border-[#10b98140]">
                  COMMAND_OS
                </span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-[#10b981]/60">
                <span className="uppercase tracking-widest">PILOT REGION:</span>
                <span className="text-[#10b981]">CHENNAI_VELACHERY_04</span>
              </div>
            </div>
          </div>

          {/* Quick Warning / Mobile Sync Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="p-1.5 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-emerald-100 border border-[#10b98140] rounded-none transition-all"
              title="Trigger AI Multi-Agent Sync"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#040806] p-0.5 rounded-none border border-[#10b98125] overflow-x-auto w-full lg:w-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveTab('twin_map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'twin_map'
                ? 'bg-[#10b981] text-black'
                : 'text-[#10b981] hover:text-emerald-100 hover:bg-[#10b981]/5'
            }`}
          >
            <Layers className="w-3 h-3" />
            Digital Twin
          </button>

          <button
            onClick={() => setActiveTab('multi_agent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'multi_agent'
                ? 'bg-[#10b981] text-black'
                : 'text-[#10b981] hover:text-emerald-100 hover:bg-[#10b981]/5'
            }`}
          >
            <Cpu className="w-3 h-3" />
            Authority HQ
            {alertsCount > 0 && (
              <span className={`ml-1 px-1 py-0.2 text-[9px] font-mono font-extrabold ${
                activeTab === 'multi_agent' ? 'bg-[#040806] text-emerald-100' : 'bg-[#10b981] text-black'
              }`}>
                {alertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulation'
                ? 'bg-[#10b981] text-black'
                : 'text-[#10b981] hover:text-emerald-100 hover:bg-[#10b981]/5'
            }`}
          >
            <Sliders className="w-3 h-3" />
            Simulation Studio
          </button>

          <button
            onClick={() => setActiveTab('citizen_portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'citizen_portal'
                ? 'bg-[#10b981] text-black'
                : 'text-[#10b981] hover:text-emerald-100 hover:bg-[#10b981]/5'
            }`}
          >
            <Users className="w-3 h-3" />
            Citizen Portal
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#10b981] text-black'
                : 'text-[#10b981] hover:text-emerald-100 hover:bg-[#10b981]/5'
            }`}
          >
            <Activity className="w-3 h-3" />
            Data Fusion
          </button>
        </nav>

        {/* Agency Selector & Telemetry Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Agency View Dropdown */}
          <div className="flex items-center gap-2 bg-[#040806] px-3 py-1.5 rounded-none border border-[#10b98125]">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#10b981]/60 hidden xl:inline">Role:</span>
            <select
              value={agencyRole}
              onChange={(e) => setAgencyRole(e.target.value as AgencyRole)}
              className="bg-transparent text-xs font-mono font-bold text-emerald-100 focus:outline-none cursor-pointer"
            >
              <option value="authority" className="bg-[#020503] text-emerald-100">🏛️ Disaster Mgmt HQ</option>
              <option value="fire_rescue" className="bg-[#020503] text-emerald-100">🚒 Fire & Rescue</option>
              <option value="police" className="bg-[#020503] text-emerald-100">🚓 Police Traffic</option>
              <option value="health_hospitals" className="bg-[#020503] text-emerald-100">🏥 Health & Hospitals</option>
              <option value="citizen" className="bg-[#020503] text-emerald-100">👤 Citizen Public View</option>
            </select>
          </div>

          {/* Sync Trigger */}
          <button
            onClick={onTriggerSync}
            disabled={isSyncing}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981] hover:bg-[#0fa06e] text-black font-bold text-xs uppercase tracking-wider rounded-none transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 text-black ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Agent Loop'}</span>
          </button>

          {/* Live Sync Status Badge */}
          <div className="px-3 py-1 bg-[#040806] border border-[#10b98125] rounded-none hidden sm:flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400"></div>
            <span className="text-[10px] font-mono uppercase text-[#10b981]">AI Sync: ACTIVE</span>
          </div>

        </div>

      </div>
    </header>
  );
};
