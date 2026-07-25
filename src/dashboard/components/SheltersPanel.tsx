import React from 'react';
import { Home, Zap, Heart, CheckCircle2, AlertCircle, Phone, MapPin, Navigation } from 'lucide-react';
import { EmergencyShelter, censorPhoneNumber } from '../../shared/types';

interface SheltersPanelProps {
  shelters: EmergencyShelter[];
}

export default function SheltersPanel({ shelters }: SheltersPanelProps) {
  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-[#0e0e14] p-5 border border-white/10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
              Crisis Relocation
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Chennai Emergency Shelters Directory
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time tracking of camp capacity, food reserves, emergency medical staffs, and backup power grids.
          </p>
        </div>
        <div className="w-10 h-10 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
          <Home className="w-5 h-5" />
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((shelter) => {
          const occupancyPct = Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100);
          return (
            <div key={shelter.id} className="bg-[#0e0e14] border border-white/10 p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm font-sans">{shelter.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-brand" />
                    <span>{shelter.address}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  shelter.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  shelter.status === 'near_capacity' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  shelter.status === 'full' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-neutral-500/10 text-neutral-400 border-white/10'
                }`}>
                  {shelter.status.replace('_', ' ')}
                </span>
              </div>

              {/* Occupancy Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Occupancy</span>
                  <span className="text-white font-bold">{shelter.currentOccupancy} / {shelter.totalCapacity} ({occupancyPct}%)</span>
                </div>
                <div className="w-full h-2 bg-[#050507] border border-white/5">
                  <div className={`h-full ${
                    occupancyPct >= 95 ? 'bg-red-500' :
                    occupancyPct >= 80 ? 'bg-yellow-500' :
                    'bg-brand'
                  }`} style={{ width: `${occupancyPct}%` }}></div>
                </div>
              </div>

              {/* Supplies & Power grids */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5 text-xs font-mono text-center">
                <div className="bg-[#050507] border border-white/5 p-2 rounded">
                  <span className="text-neutral-400 block text-[9px] uppercase">Food Supply</span>
                  <span className="font-bold text-white">{shelter.foodSuppliesDays} Days</span>
                </div>
                <div className="bg-[#050507] border border-white/5 p-2 rounded">
                  <span className="text-neutral-400 block text-[9px] uppercase">Medical Staff</span>
                  <span className="font-bold text-white flex items-center justify-center gap-1">
                    {shelter.medicalStaffPresent ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-neutral-500 inline" />
                    )}
                    {shelter.medicalStaffPresent ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="bg-[#050507] border border-white/5 p-2 rounded">
                  <span className="text-neutral-400 block text-[9px] uppercase">Power Grid</span>
                  <span className="font-bold text-white flex items-center justify-center gap-1">
                    {shelter.powerBackup ? (
                      <Zap className="w-3.5 h-3.5 text-yellow-400 inline animate-pulse" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-neutral-500 inline" />
                    )}
                    {shelter.powerBackup ? 'Active' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Contact info & Direct Google Maps Navigation */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>Camp Lead: {shelter.contactPerson}</span>
                  <span className="flex items-center gap-1 text-brand">
                    <Phone className="w-3.5 h-3.5" /> {censorPhoneNumber(shelter.phone)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const lat = shelter.lat || (shelter as any).location?.coordinates?.[0] || 12.9830;
                    const lng = shelter.lng || (shelter as any).location?.coordinates?.[1] || 80.2182;
                    const launchUrl = (origStr?: string) => {
                      let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
                      if (origStr) url += `&origin=${origStr}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    };

                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => launchUrl(`${pos.coords.latitude},${pos.coords.longitude}`),
                        () => launchUrl(),
                        { timeout: 3500 }
                      );
                    } else {
                      launchUrl();
                    }
                  }}
                  className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 text-[11px] font-mono font-bold uppercase rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate Here in Google Maps ↗</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
