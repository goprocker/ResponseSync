import React from 'react';
import { Truck, Shield, AlertTriangle, Users, Fuel, Phone, MapPin, Zap, RefreshCw, Send, Check, ShieldAlert } from 'lucide-react';
import { EmergencyResource, ZoneRisk } from '../../shared/types';

interface ResourcesPanelProps {
  resources: EmergencyResource[];
  zones?: ZoneRisk[];
  onConsumeResource?: (resourceId: string, amountPct?: number) => void;
  onRefillResource?: (resourceId: string, amountPct?: number) => void;
  onUpdateResource?: (resourceId: string, updates: Partial<EmergencyResource>) => void;
  onDispatchResource?: (resourceId: string, zoneId: string) => void;
}

export default function ResourcesPanel({
  resources,
  zones = [],
  onConsumeResource,
  onRefillResource,
  onUpdateResource,
  onDispatchResource
}: ResourcesPanelProps) {

  const totalFleet = resources.length;
  const deployedCount = resources.filter(r => r.status === 'deployed' || r.status === 'en_route').length;
  const avgSupplies = totalFleet > 0 
    ? Math.round(resources.reduce((acc, r) => acc + r.fuelOrSuppliesPct, 0) / totalFleet)
    : 0;
  const lowSupplyCount = resources.filter(r => r.fuelOrSuppliesPct < 30).length;

  const handleRefillAll = () => {
    resources.forEach(r => {
      if (onRefillResource) {
        onRefillResource(r.id, 50);
      }
    });
  };

  return (
    <div className="space-y-6 text-[#e0e0e6] font-sans">
      
      {/* Page Header */}
      <div className="bg-[#0e0e14] p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
              Fleet Operations & Supply Command
            </span>
            {lowSupplyCount > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {lowSupplyCount} Units Low Fuel
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Chennai Emergency Fleet Directory
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time status tracking, active consumption meters, and field supply restocking for emergency units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRefillResource && (
            <button
              onClick={handleRefillAll}
              className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 text-xs font-mono font-bold uppercase rounded flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refill All Fleet Units</span>
            </button>
          )}
          <div className="w-10 h-10 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Fleet Summary Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-neutral-400 block">Total Fleet Active</span>
          <div className="text-2xl font-bold text-white">{totalFleet} Units</div>
          <span className="text-[10px] font-mono text-brand block">{deployedCount} Currently Deployed</span>
        </div>

        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-neutral-400">Average Fleet Readiness</span>
            <span className={`text-xs font-mono font-bold ${
              avgSupplies >= 60 ? 'text-emerald-400' : avgSupplies >= 30 ? 'text-amber-400' : 'text-red-400'
            }`}>{avgSupplies}%</span>
          </div>
          <div className="w-full h-2 bg-[#050507] border border-white/5 rounded-none overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                avgSupplies >= 60 ? 'bg-emerald-500' : avgSupplies >= 30 ? 'bg-amber-500' : 'bg-red-500'
              }`} 
              style={{ width: `${avgSupplies}%` }}
            />
          </div>
        </div>

        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-neutral-400 block">Low Supply Units</span>
          <div className={`text-2xl font-bold ${lowSupplyCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {lowSupplyCount} {lowSupplyCount === 1 ? 'Unit' : 'Units'}
          </div>
          <span className="text-[10px] font-mono text-neutral-400 block">Requires Fuel/Equipment Restock</span>
        </div>

        <div className="bg-[#0e0e14] border border-white/10 p-4 space-y-1">
          <span className="text-[10px] uppercase font-mono text-neutral-400 block">Operations Control</span>
          <div className="text-xs font-mono text-neutral-300 font-bold">Interactive Resource Meter</div>
          <span className="text-[10px] font-mono text-neutral-400 block">Use buttons below to consume/refill</span>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {resources.map((res) => {
          const isLow = res.fuelOrSuppliesPct < 30;
          const isMedium = res.fuelOrSuppliesPct >= 30 && res.fuelOrSuppliesPct < 60;

          return (
            <div key={res.id} className="bg-[#0e0e14] border border-white/10 p-5 space-y-4 shadow-sm relative overflow-hidden">
              
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm font-sans flex items-center gap-2">
                    {res.name}
                    {isLow && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-extrabold uppercase bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                        Low Supplies
                      </span>
                    )}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 capitalize">
                      {res.type.replace('_', ' ')}
                    </span>
                    
                    {/* Zone Assignment Dropdown */}
                    {zones.length > 0 && onDispatchResource ? (
                      <div className="flex items-center gap-1 bg-[#050507] px-2 py-0.5 border border-white/10 rounded">
                        <span className="text-neutral-500">Zone:</span>
                        <select
                          value={res.assignedZoneId || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              onDispatchResource(res.id, e.target.value);
                            }
                          }}
                          className="bg-transparent text-brand font-mono text-[10px] focus:outline-none cursor-pointer"
                        >
                          <option value="" className="bg-[#0e0e14] text-neutral-400">-- Unassigned --</option>
                          {zones.map(z => (
                            <option key={z.id} value={z.id} className="bg-[#0e0e14] text-white">
                              {z.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : res.assignedZoneId ? (
                      <span className="text-[#888] truncate">
                        • Assigned: {res.assignedZoneId.replace('zone-', '')}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Status Dropdown / Badge */}
                {onUpdateResource ? (
                  <select
                    value={res.status}
                    onChange={(e) => onUpdateResource(res.id, { status: e.target.value as any })}
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded border cursor-pointer focus:outline-none ${
                      res.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      res.status === 'en_route' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      res.status === 'deployed' ? 'bg-brand/10 text-brand border-brand/20' :
                      'bg-neutral-500/10 text-neutral-400 border-white/10'
                    }`}
                  >
                    <option value="available" className="bg-[#0e0e14] text-emerald-400">Available</option>
                    <option value="en_route" className="bg-[#0e0e14] text-blue-400">En Route</option>
                    <option value="deployed" className="bg-[#0e0e14] text-brand">Deployed</option>
                    <option value="maintenance" className="bg-[#0e0e14] text-red-400">Maintenance</option>
                  </select>
                ) : (
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    res.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    res.status === 'en_route' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    res.status === 'deployed' ? 'bg-brand/10 text-brand border-brand/20' :
                    'bg-neutral-500/10 text-neutral-400 border-white/10'
                  }`}>
                    {res.status.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* DYNAMIC FUEL / SUPPLIES PERCENTAGE METER */}
              <div className="bg-[#050507] p-3 border border-white/5 space-y-2 rounded-none">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Fuel className={`w-4 h-4 ${isLow ? 'text-red-400 animate-bounce' : isMedium ? 'text-amber-400' : 'text-emerald-400'}`} />
                    <span className="uppercase text-[10px] text-neutral-400">Fuel & Supplies Level Meter</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${
                    isLow ? 'text-red-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {res.fuelOrSuppliesPct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-[#0e0e14] border border-white/10 rounded-none overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isLow ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${res.fuelOrSuppliesPct}%` }}
                  />
                </div>

                {/* OPERATIONAL RESOURCE CONSUMPTION & REFILL CONTROLS */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-mono text-neutral-500">Consume:</span>
                    <button
                      onClick={() => onConsumeResource && onConsumeResource(res.id, 10)}
                      disabled={res.fuelOrSuppliesPct <= 0}
                      className="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/20 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Simulate light operational use"
                    >
                      <Zap className="w-3 h-3" />
                      <span>-10%</span>
                    </button>
                    <button
                      onClick={() => onConsumeResource && onConsumeResource(res.id, 25)}
                      disabled={res.fuelOrSuppliesPct <= 0}
                      className="px-2 py-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/30 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Simulate heavy rescue or pumping operation"
                    >
                      <Zap className="w-3 h-3" />
                      <span>-25% Heavy</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-mono text-neutral-500">Refill:</span>
                    <button
                      onClick={() => onRefillResource && onRefillResource(res.id, 25)}
                      disabled={res.fuelOrSuppliesPct >= 100}
                      className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Restock fuel or emergency supplies"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>+25%</span>
                    </button>
                    <button
                      onClick={() => onRefillResource && onRefillResource(res.id, 100)}
                      disabled={res.fuelOrSuppliesPct >= 100}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Full fuel tank & supply restock"
                    >
                      <span>100% Full</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Crew and Equipment row */}
              <div className="grid grid-cols-2 gap-4 py-1 text-xs font-mono border-t border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-400" />
                  <div>
                    <span className="text-neutral-400 block text-[9px] uppercase">Crew Size</span>
                    <span className="font-bold text-white">{res.crewCount} Personnel</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand" />
                  <div>
                    <span className="text-neutral-400 block text-[9px] uppercase">Specialization</span>
                    <span className="font-bold text-neutral-200 capitalize">{res.type.replace('_', ' ')}</span>
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

