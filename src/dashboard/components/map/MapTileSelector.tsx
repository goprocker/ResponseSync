import React from 'react';
import { Layers } from 'lucide-react';
import { BasemapStyle } from '../../../hooks/useMapControls.js';

interface MapTileSelectorProps {
  currentStyle: BasemapStyle;
  onStyleChange: (style: BasemapStyle) => void;
}

export const MapTileSelector: React.FC<MapTileSelectorProps> = ({ currentStyle, onStyleChange }) => {
  return (
    <div className="bg-[#0b0c10]/90 backdrop-blur-md border border-white/10 p-2 rounded-md shadow-2xl flex items-center gap-1.5 font-mono text-[11px]">
      <div className="flex items-center gap-1 text-neutral-400 px-1 border-r border-white/10 mr-1">
        <Layers className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline uppercase text-[9.5px] font-bold text-neutral-400">Tile</span>
      </div>
      {(['dark', 'voyager', 'satellite', 'streets'] as BasemapStyle[]).map((style) => (
        <button
          key={style}
          onClick={() => onStyleChange(style)}
          className={`px-2 py-1 rounded transition-colors uppercase text-[10px] font-bold cursor-pointer ${
            currentStyle === style
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
              : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          {style}
        </button>
      ))}
    </div>
  );
};
