import React from 'react';
import { Hospital, ShieldAlert, CheckCircle2, AlertCircle, Phone, MapPin } from 'lucide-react';
import { EmergencyHospital, censorPhoneNumber } from '../../shared/types';

interface HospitalsPanelProps {
  hospitals: EmergencyHospital[];
}

export default function HospitalsPanel({ hospitals }: HospitalsPanelProps) {
  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-[#0e0e14] p-5 border border-white/10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
              Medical Directory
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Chennai Emergency Hospitals Directory
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time monitor of emergency ward beds, critical ICU support systems, and trauma unit availabilities.
          </p>
        </div>
        <div className="w-10 h-10 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
          <Hospital className="w-5 h-5" />
        </div>
      </div>

      {/* Hospital list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hospitals.map((h: any) => {
          const totalCap = h.totalCapacity ?? h.total_beds ?? 100;
          const occCap = h.occupiedCapacity ?? (totalCap - (h.available_icu_beds ?? 0)) ?? 50;
          const icuAvail = h.icuBedsAvailable ?? h.available_icu_beds ?? 0;
          const icuTot = h.icuBedsTotal ?? Math.max(icuAvail, 10);
          const occupancyPct = totalCap > 0 ? Math.round((occCap / totalCap) * 100) : 0;
          const statusStr = (h.status || 'normal').replace('_', ' ');
          const traumaCenterActive = h.hasTraumaCenter ?? h.trauma_center_active ?? true;

          return (
            <div key={h.id} className="bg-[#0e0e14] border border-white/10 p-5 space-y-4 shadow-sm relative">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm font-sans">{h.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-brand" />
                    <span>{h.address || 'Chennai Emergency Sector'}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  h.status === 'normal' || h.status === 'operational' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  h.status === 'near_capacity' || h.status === 'strained' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {statusStr}
                </span>
              </div>

              {/* Progress and Bed Occupancy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Beds Occupancy</span>
                  <span className="text-white font-bold">{occCap} / {totalCap} ({occupancyPct}%)</span>
                </div>
                <div className="w-full h-2 bg-[#050507] border border-white/5">
                  <div className={`h-full ${
                    occupancyPct >= 90 ? 'bg-red-500' :
                    occupancyPct >= 75 ? 'bg-yellow-500' :
                    'bg-brand'
                  }`} style={{ width: `${occupancyPct}%` }}></div>
                </div>
              </div>

              {/* ICU details and trauma center flags */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 text-xs font-mono">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase">ICU Beds Available</span>
                  <span className={`font-bold ${icuAvail === 0 ? 'text-red-500' : 'text-white'}`}>
                    {icuAvail} / {icuTot}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase">Trauma Center</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    {traumaCenterActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Yes
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-neutral-500" /> No
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>Contact: {h.contactPerson || 'Disaster Desk'}</span>
                <span className="flex items-center gap-1 text-brand">
                  <Phone className="w-3.5 h-3.5" /> {censorPhoneNumber(h.phone)}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

