import React from 'react';
import { Navigation, MapPin, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { EmergencyShelter } from '../../../shared/types';

interface MapRouteEngineCardProps {
  shelters: EmergencyShelter[];
  selectedShelterId: string;
  onSelectShelter: (id: string) => void;
  originLat: number;
  originLng: number;
  isClickToPickOrigin: boolean;
  onTogglePickOrigin: () => void;
  onCalculateRoute: () => void;
  isCalculating: boolean;
  routeResult: any;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export const MapRouteEngineCard: React.FC<MapRouteEngineCardProps> = ({
  shelters,
  selectedShelterId,
  onSelectShelter,
  originLat,
  originLng,
  isClickToPickOrigin,
  onTogglePickOrigin,
  onCalculateRoute,
  isCalculating,
  routeResult,
  isMinimized,
  onToggleMinimize
}) => {
  return (
    <div className="bg-[#0e1017]/95 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-2xl font-mono text-[11px] max-w-xs w-full">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
          <Navigation className="w-4 h-4" />
          <span>OSRM Route Engine</span>
        </div>
        <button
          onClick={onToggleMinimize}
          className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
        >
          {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isMinimized && (
        <div className="space-y-2.5">
          {/* Target Shelter Selection */}
          <div>
            <label className="text-[9.5px] uppercase text-neutral-400 font-bold block mb-1">
              Destination Relief Camp
            </label>
            <select
              value={selectedShelterId}
              onChange={(e) => onSelectShelter(e.target.value)}
              className="w-full bg-[#050507] border border-white/15 text-neutral-200 text-[11px] p-1.5 rounded focus:outline-none focus:border-cyan-500/50"
            >
              {shelters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.currentOccupancy}/{s.totalCapacity})
                </option>
              ))}
            </select>
          </div>

          {/* Origin Picker Button */}
          <div className="flex items-center justify-between bg-white/5 p-1.5 rounded border border-white/10">
            <span className="text-[10px] text-neutral-400">
              Origin: {originLat.toFixed(4)}, {originLng.toFixed(4)}
            </span>
            <button
              onClick={onTogglePickOrigin}
              className={`p-1 rounded text-[10px] font-bold uppercase cursor-pointer border ${
                isClickToPickOrigin
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                  : 'bg-white/5 text-neutral-300 hover:text-white border-white/10'
              }`}
            >
              <MapPin className="w-3 h-3 inline mr-1" />
              {isClickToPickOrigin ? 'Click Map' : 'Set Pin'}
            </button>
          </div>

          {/* Calculate Route Trigger */}
          <button
            onClick={onCalculateRoute}
            disabled={isCalculating}
            className="w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 font-bold uppercase tracking-wider rounded text-[10.5px] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isCalculating ? 'Computing Avoidance Route...' : 'Compute Safe Evacuation Path'}
          </button>

          {/* Route Summary Result */}
          {routeResult && (
            <div className="mt-2 bg-cyan-950/30 border border-cyan-500/30 p-2 rounded text-[10px]">
              <div className="flex justify-between text-cyan-300 font-bold mb-1">
                <span>Distance: {(routeResult.distanceMeters / 1000).toFixed(1)} km</span>
                <span>Time: {Math.round(routeResult.durationMinutes)} mins</span>
              </div>
              <div className="text-neutral-400 text-[9.5px] flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Avoided {routeResult.submergedRoadsAvoided || 2} submerged corridors</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
