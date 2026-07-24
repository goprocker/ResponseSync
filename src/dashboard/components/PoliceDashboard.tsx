import React from 'react';
import { 
  Siren, 
  Shield, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Compass, 
  Navigation, 
  Phone, 
  Truck, 
  PlusCircle, 
  CheckCircle2, 
  Zap,
  Lock
} from 'lucide-react';
import { EmergencyResource, CitizenReport, ZoneRisk, EvacuationRoute } from '../../shared/types';

interface PoliceDashboardProps {
  resources: EmergencyResource[];
  reports: CitizenReport[];
  zones: ZoneRisk[];
  evacuationRoute: EvacuationRoute | null;
  onOpenDispatchModal: (zoneId: string) => void;
}

export const PoliceDashboard: React.FC<PoliceDashboardProps> = ({
  resources,
  reports,
  zones,
  evacuationRoute,
  onOpenDispatchModal
}) => {
  // Police resources and traffic incidents
  const policeResources = resources.filter(r => ['police_patrol', 'relief_truck'].includes(r.type));
  const policePatrols = policeResources.filter(r => r.type === 'police_patrol');
  const reliefTrucks = policeResources.filter(r => r.type === 'relief_truck');

  const trafficIncidents = reports.filter(r => 
    ['traffic', 'evacuation', 'roadblock', 'security', 'waterlogging'].some(cat => 
      r.category.toLowerCase().includes(cat) || r.description.toLowerCase().includes(cat)
    )
  );

  return (
    <div className="space-y-6 text-[#e0e0e6] font-sans pb-8">
      
      {/* Agency Header Banner */}
      <div className="bg-[#0e0e14] border border-blue-500/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-sm bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/40">
                GREATER CHENNAI POLICE (GCP)
              </span>
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE TRAFFIC & SECURITY
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight font-sans mt-0.5">
              Traffic Diversion, Security & Evacuation Route Patrols
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Law enforcement command for subway blockades, arterial road detours, crowd security & relief convoys.
            </p>
          </div>
        </div>

        <button 
          onClick={() => onOpenDispatchModal('zone-velachery-south')}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Siren className="w-4 h-4" /> Dispatch Patrol Unit
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Police Patrols */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Patrol Units</span>
            <Siren className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{policePatrols.length} <span className="text-xs font-normal text-neutral-400">Units</span></div>
          <div className="text-[10px] text-emerald-400 font-mono">
            {policePatrols.filter(p => p.status === 'deployed').length} Active Highway Patrols
          </div>
        </div>

        {/* Relief Convoys */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Escort Convoys</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{reliefTrucks.length} <span className="text-xs font-normal text-neutral-400">Convoys</span></div>
          <div className="text-[10px] text-brand font-mono">
            Heavy Supply Escorts Active
          </div>
        </div>

        {/* Road Closures */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Subway & Road Blockades</span>
            <Lock className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">3 <span className="text-xs font-normal text-neutral-400">Impasse Points</span></div>
          <div className="text-[10px] text-red-400 font-mono">
            Guindy & Velachery Subways Closed
          </div>
        </div>

        {/* Traffic Bottlenecks */}
        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Evacuation Bottlenecks</span>
            <Navigation className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{trafficIncidents.length} <span className="text-xs font-normal text-neutral-400">Reports</span></div>
          <div className="text-[10px] text-yellow-400 font-mono">
            Detour via OMR/Taramani Active
          </div>
        </div>

      </div>

      {/* Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Police Patrol Roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider flex items-center gap-2">
              <Siren className="w-4 h-4 text-blue-400" /> Police Patrol Fleet & Security Units
            </h3>
            <span className="text-xs font-mono text-neutral-400">{policeResources.length} Units Active</span>
          </div>

          <div className="space-y-3">
            {policeResources.map((res) => (
              <div key={res.id} className="bg-[#0e0e14] border border-white/10 p-4 space-y-3 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm font-sans">{res.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-0.5">
                      <span className="text-blue-400 font-bold uppercase">{res.type.replace('_', ' ')}</span>
                      <span>• Contact: {res.contactNumber}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    res.status === 'deployed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                    res.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {res.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#050507] p-2.5 border border-white/5 text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase block">Police Officers</span>
                    <span className="font-bold text-white">{res.crewCount} Officers</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase block">Assigned Junction</span>
                    <span className="font-bold text-white">{res.assignedZoneId ? res.assignedZoneId.replace('zone-', '') : 'Main Control Room'}</span>
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

        {/* Traffic & Evacuation Incidents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" /> Traffic & Security Feed
            </h3>
            <span className="text-xs font-mono text-neutral-400">{trafficIncidents.length} Incident Points</span>
          </div>

          <div className="space-y-3">
            {trafficIncidents.map((report) => (
              <div key={report.id} className="bg-[#0e0e14] border border-blue-500/20 p-4 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase text-[11px] font-sans">
                    {report.category.replace('_', ' ')}
                  </span>
                  <span className="px-1.5 py-0.5 text-[8px] uppercase font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {report.severity}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 font-sans leading-tight">{report.description}</p>

                <div className="flex items-center justify-between text-[9px] text-neutral-400 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-400" /> {report.locationName}
                  </span>
                  <span className="text-emerald-400">Score: {report.aiValidationScore}%</span>
                </div>

                <button
                  onClick={() => onOpenDispatchModal('zone-velachery-south')}
                  className="w-full mt-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/40 text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <PlusCircle className="w-3 h-3" /> Dispatch Police Patrol Here
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
