import React from 'react';
import { Truck, Shield, AlertTriangle, Users, Fuel, Phone, MapPin } from 'lucide-react';
import { EmergencyResource, AgencyRole } from '../../shared/types';

interface ResourcesPanelProps {
  resources: EmergencyResource[];
  agencyRole?: AgencyRole;
}

export default function ResourcesPanel({ resources, agencyRole = 'authority' }: ResourcesPanelProps) {
  const filteredResources = resources.filter(r => {
    if (agencyRole === 'fire_rescue') {
      return ['rescue_boat', 'fire_truck', 'ndrf_team'].includes(r.type);
    }
    if (agencyRole === 'police') {
      return ['police_patrol', 'relief_truck'].includes(r.type);
    }
    if (agencyRole === 'health_hospitals') {
      return ['ambulance', 'medical_unit'].includes(r.type);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-[#0e0e14] p-5 border border-white/10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
              Fleet Operations
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Chennai Emergency Fleet Directory
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time status tracking of heavy rescue boats, advanced life support ambulances, and fire pump responders.
          </p>
        </div>
        <div className="w-10 h-10 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
          <Truck className="w-5 h-5" />
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => {
          return (
            <div key={res.id} className="bg-[#0e0e14] border border-white/10 p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm font-sans">{res.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono capitalize">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                      {res.type.replace('_', ' ')}
                    </span>
                    {res.assignedZoneId && (
                      <span className="text-[#888] truncate flex items-center gap-0.5">
                        • Assigned: {res.assignedZoneId.replace('zone-', '')}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  res.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  res.status === 'en_route' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  res.status === 'deployed' ? 'bg-brand/10 text-brand border-brand/20' :
                  'bg-neutral-500/10 text-neutral-400 border-white/10'
                }`}>
                  {res.status.replace('_', ' ')}
                </span>
              </div>

              {/* Supples and Crew row */}
              <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-white/5 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-400" />
                  <div>
                    <span className="text-neutral-400 block text-[9px] uppercase">Crew Size</span>
                    <span className="font-bold text-white">{res.crewCount} Personnel</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-neutral-400" />
                  <div className="flex-1">
                    <span className="text-neutral-400 block text-[9px] uppercase">Fuel/Supplies</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{res.fuelOrSuppliesPct}%</span>
                      <div className="flex-1 h-1.5 bg-[#050507] border border-white/5">
                        <div className={`h-full ${
                          res.fuelOrSuppliesPct < 40 ? 'bg-red-500' : 'bg-brand'
                        }`} style={{ width: `${res.fuelOrSuppliesPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment list */}
              <div className="space-y-1.5">
                <span className="text-neutral-400 font-mono text-[10px] uppercase block">Assigned Equipment</span>
                <div className="flex flex-wrap gap-1.5">
                  {res.equipment.map((eq, i) => (
                    <span key={i} className="text-[9px] font-mono bg-[#050507] text-[#e0e0e6]/80 px-2 py-0.5 border border-white/5">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact info */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand" /> Lat: {res.lat.toFixed(3)}, Lng: {res.lng.toFixed(3)}
                </span>
                <span className="flex items-center gap-1 text-brand">
                  <Phone className="w-3.5 h-3.5" /> {res.contactNumber}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
