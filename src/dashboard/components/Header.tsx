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
    <header className="bg-[#0e0e14] border-b border-white/10 sticky top-0 z-40 px-4 lg:px-6 py-2">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1800px] mx-auto">
        
        {/* Brand & Pilot Region Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 bg-brand rounded-sm rotate-45 shrink-0 shadow-sm">
            <Activity className="w-4 h-4 text-black -rotate-45" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-sans uppercase">
                RESPON<span className="text-brand">SYNC</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-brand/15 text-brand border border-brand/30">
                COMMAND OS v2.4
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
              <span className="uppercase text-neutral-500">PILOT:</span>
              <span className="text-brand font-semibold">CHENNAI_VELACHERY_04</span>
            </div>
          </div>
        </div>

        {/* Demo Scenario Presets */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#050507] p-1 rounded border border-white/10">
          <span className="text-[9px] uppercase font-mono font-bold text-amber-400 px-2 tracking-wider">
            SCENARIO:
          </span>
          <button
            onClick={() => onTriggerSync('normal')}
            disabled={isSyncing}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activePreset === 'normal'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
            title="Simulate Normal Operational Day (2.4mm/hr Rain)"
          >
            ☀️ Normal
          </button>

          <button
            onClick={() => onTriggerSync('moderate')}
            disabled={isSyncing}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activePreset === 'moderate'
                ? 'bg-amber-500 text-black shadow'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
            title="Simulate Moderate Rain (42mm/hr)"
          >
            🌦️ Heavy Rain
          </button>

          <button
            onClick={() => onTriggerSync('flood')}
            disabled={isSyncing}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
              activePreset === 'flood'
                ? 'bg-red-500 text-white shadow animate-pulse'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
            title="Simulate Severe Flash Flood (110mm/hr)"
          >
            🚨 Flash Flood
          </button>
        </div>

        {/* Agency Selector & Telemetry Controls */}
        <div className="flex items-center gap-3">
          
          {/* 12-Agent Sync Button */}
          <button
            onClick={() => onTriggerSync(activePreset)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-1.5 bg-brand/15 hover:bg-brand/25 text-brand border border-brand/40 rounded text-xs font-mono font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
            title="Trigger 12-Agent Autonomous Sync Loop"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">12-Agent Sync</span>
          </button>

          {/* Role Dropdown */}
          <div className="flex items-center gap-2 bg-[#050507] px-3 py-1.5 rounded border border-white/10">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 hidden xl:inline">Role:</span>
            <select
              value={agencyRole}
              onChange={async (e) => {
                const newRole = e.target.value as AgencyRole;
                setAgencyRole(newRole);
                try {
                  const resp = await fetch('/api/auth/switch-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: newRole })
                  });
                  if (resp.ok) {
                    const data = await resp.json();
                    if (data.token) {
                      localStorage.setItem('jwt_token', data.token);
                      localStorage.setItem('user_payload', JSON.stringify(data.user));
                    }
                  }
                } catch (err) {
                  console.warn('JWT role switch sync error:', err);
                }
              }}
              className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer appearance-none [-webkit-appearance:none] [-moz-appearance:none]"
            >
              <option value="authority" className="bg-[#0e0e14] text-white">🏛️ Disaster Mgmt HQ</option>
              <option value="fire_rescue" className="bg-[#0e0e14] text-white">🚒 Fire & Rescue</option>
              <option value="police" className="bg-[#0e0e14] text-white">🚓 Police Dept</option>
              <option value="health_hospitals" className="bg-[#0e0e14] text-white">🏥 Health & Hospitals</option>
              <option value="citizen" className="bg-[#0e0e14] text-white">👤 Citizen Public View</option>
            </select>
          </div>

          {/* System Status Pill */}
          <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded hidden lg:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase font-semibold text-emerald-400">ONLINE</span>
          </div>

        </div>

      </div>
    </header>
  );
};
