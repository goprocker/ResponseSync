import React from 'react';
import { Ruler, Trash2, X } from 'lucide-react';

interface MapMeasurementDrawerProps {
  isMeasuring: boolean;
  measurePoints: [number, number][];
  totalDistanceMeters: number;
  onToggleMeasuring: () => void;
  onClearPoints: () => void;
}

export const MapMeasurementDrawer: React.FC<MapMeasurementDrawerProps> = ({
  isMeasuring,
  measurePoints,
  totalDistanceMeters,
  onToggleMeasuring,
  onClearPoints
}) => {
  const distanceKm = (totalDistanceMeters / 1000).toFixed(2);

  return (
    <div className="bg-[#0b0c10]/95 backdrop-blur-md border border-white/10 p-2.5 rounded-md shadow-2xl font-mono text-[11px]">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onToggleMeasuring}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors text-[10px] font-bold uppercase cursor-pointer border ${
            isMeasuring
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse'
              : 'bg-white/5 text-neutral-300 hover:text-white border-white/10 hover:border-white/20'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>{isMeasuring ? 'Click Map Waypoints' : 'Measure Distance'}</span>
        </button>

        {measurePoints.length > 0 && (
          <div className="flex items-center gap-2 text-neutral-200 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            <span className="text-cyan-400 font-bold text-xs">{totalDistanceMeters} m</span>
            <span className="text-neutral-400 text-[10px]">({distanceKm} km)</span>
            <button
              onClick={onClearPoints}
              className="text-neutral-400 hover:text-red-400 transition-colors p-0.5 cursor-pointer ml-1"
              title="Clear Measurement"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
