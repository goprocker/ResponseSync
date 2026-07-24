import React from 'react';
import { 
  Flame, 
  Truck, 
  LifeBuoy, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  PlusCircle, 
  Zap,
  Droplets
} from 'lucide-react';
import { EmergencyResource, CitizenReport, ZoneRisk, IoTSensorNode } from '../../shared/types';

interface FireRescueDashboardProps {
  resources: EmergencyResource[];
  reports: CitizenReport[];
  zones: ZoneRisk[];
  sensors: IoTSensorNode[];
  onOpenDispatchModal: (zoneId: string) => void;
}

export const FireRescueDashboard: React.FC<FireRescueDashboardProps> = ({
  resources,
  reports,
  zones,
  sensors,
  onOpenDispatchModal
}) => {
  // Filter Fire & Rescue relevant items
  const fireResources = resources.filter(r => ['rescue_boat', 'fire_truck', 'ndrf_team'].includes(r.type));
  const activeBoats = fireResources.filter(r => r.type === 'rescue_boat');
  const fireTrucks = fireResources.filter(r => r.type === 'fire_truck');
  const ndrfTeams = fireResources.filter(r => r.type === 'ndrf_team');

  const rescueIncidents = reports.filter(r => 
    ['waterlogging', 'flooding', 'rescue', 'structural', 'fire'].some(cat => 
      r.category.toLowerCase().includes(cat) || r.description.toLowerCase().includes(cat)
    )
  );

  const highWaterSensors = sensors.filter(s => s.type === 'water_level' && (s.status === 'warning' || s.status === 'critical'));

  return (
    <div className="space-y-6 text-[#e0e0e6] font-sans pb-8">
      
      {/* Agency Header Banner */}
      <div className="bg-[#0e0e14] border border-orange-500/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-sm bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40">
                TAMIL NADU FIRE & RESCUE SERVICES (TNFRS)
              </span>
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE RESPONSE MODE
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight font-sans mt-0.5">
              Fire, Dewatering & Aquatic Rescue Operations
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Command center for motorboat fleets, dewatering pumps, NDRF storm response & inundation rescues.
            </p>
          </div>
        </div>

        <button 
          onClick={() => onOpenDispatchModal('zone-velachery-south')}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black font-bold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shrink-0"
        >
          <LifeBuoy className="w-4 h-4" /> Dispatch Rescue Fleet
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Rescue Boats Active */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Motorboat Units</span>
            <LifeBuoy className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{activeBoats.length} <span className="text-xs font-normal text-neutral-400">Deployed</span></div>
          <div className="text-[10px] text-emerald-400 font-mono">
            {activeBoats.filter(b => b.status === 'deployed').length} Active in Velachery Sluice
          </div>
        </div>

        {/* Dewatering & Fire Units */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Fire & Pump Fleets</span>
            <Truck className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{fireTrucks.length} <span className="text-xs font-normal text-neutral-400">Units</span></div>
          <div className="text-[10px] text-brand font-mono">
            High-Capacity Submersible Dewatering
          </div>
        </div>

        {/* NDRF Teams */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">NDRF Strike Battalions</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{ndrfTeams.length} <span className="text-xs font-normal text-neutral-400">Teams</span></div>
          <div className="text-[10px] text-red-400 font-mono">
            Deep-Water Inundation Battalions
          </div>
        </div>

        {/* Submerged Sensor Warnings */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Critical Flood Gauges</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{highWaterSensors.length} <span className="text-xs font-normal text-neutral-400">Alert Gauges</span></div>
          <div className="text-[10px] text-yellow-400 font-mono">
            Sluice level exceeding +2.8m threshold
          </div>
        </div>

      </div>

      {/* Main Operations Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Fire & Rescue Fleet Roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-400" /> Active Rescue Fleet & Assets
            </h3>
            <span className="text-xs font-mono text-neutral-400">{fireResources.length} Registered Units</span>
          </div>

          <div className="space-y-3">
            {fireResources.map((res) => (
              <div key={res.id} className="bg-[#0e0e14] border border-white/10 p-4 space-y-3 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm font-sans">{res.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-0.5">
                      <span className="text-orange-400 font-bold uppercase">{res.type.replace('_', ' ')}</span>
                      <span>• Contact: {res.contactNumber}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    res.status === 'deployed' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                    res.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {res.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#050507] p-2.5 border border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase block">Crew Members</span>
                    <span className="font-bold text-white">{res.crewCount} Trained Rescuers</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase block">Assigned Sector</span>
                    <span className="font-bold text-white">{res.assignedZoneId ? res.assignedZoneId.replace('zone-', '') : 'Standby Base'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {res.equipment.map((eq, idx) => (
                    <span key={idx} className="text-[9px] font-mono bg-white/5 text-neutral-300 px-2 py-0.5 border border-white/10">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: High Priority Rescue Incidents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Active Rescue Incidents
            </h3>
            <span className="text-xs font-mono text-neutral-400">{rescueIncidents.length} Dispatch Alerts</span>
          </div>

          <div className="space-y-3">
            {rescueIncidents.map((report) => (
              <div key={report.id} className="bg-[#0e0e14] border border-red-500/20 p-4 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase text-[11px] font-sans">
                    {report.category.replace('_', ' ')}
                  </span>
                  <span className="px-1.5 py-0.5 text-[8px] uppercase font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    {report.severity}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 font-sans leading-tight">{report.description}</p>

                <div className="flex items-center justify-between text-[9px] text-neutral-400 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-400" /> {report.locationName}
                  </span>
                  <span className="text-emerald-400">Credibility: {report.aiValidationScore}%</span>
                </div>

                <button
                  onClick={() => onOpenDispatchModal('zone-velachery-south')}
                  className="w-full mt-2 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" /> Dispatch Rescue Team Here
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
