import React, { useState } from 'react';
import { EmergencyResource, ZoneRisk } from '../types';
import { ShieldAlert, X, Send, LifeBuoy, Ambulance, Flame, Siren } from 'lucide-react';

interface ResourceDispatchModalProps {
  zoneId: string | null;
  zones: ZoneRisk[];
  resources: EmergencyResource[];
  onDispatch: (resourceId: string, zoneId: string) => void;
  onClose: () => void;
}

export const ResourceDispatchModal: React.FC<ResourceDispatchModalProps> = ({
  zoneId,
  zones,
  resources,
  onDispatch,
  onClose
}) => {
  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0]?.id || '');
  const [targetZoneId, setTargetZoneId] = useState<string>(zoneId || zones[0]?.id || '');

  if (!zoneId && zones.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResourceId && targetZoneId) {
      onDispatch(selectedResourceId, targetZoneId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d0d14] border border-[#ffffff15] w-full max-w-lg rounded-lg shadow-2xl p-6 text-[#e0e0e6] font-sans space-y-5">
        
        <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#ff4e00]" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-sans">
              Dispatch Emergency Fleet Unit
            </h3>
          </div>
          <button onClick={onClose} className="text-[#888] hover:text-white p-1 rounded hover:bg-[#ffffff10]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[#888] font-mono uppercase text-[10px] block mb-1">Select Available Fleet Unit:</label>
            <select
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value)}
              className="w-full bg-[#151520] border border-[#ffffff15] text-[#ff4e00] font-mono font-bold rounded p-2.5 focus:outline-none"
            >
              {resources.map((res) => (
                <option key={res.id} value={res.id}>
                  {res.name} ({res.crewCount} Crew, {res.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#888] font-mono uppercase text-[10px] block mb-1">Target Inundation Sector:</label>
            <select
              value={targetZoneId}
              onChange={(e) => setTargetZoneId(e.target.value)}
              className="w-full bg-[#151520] border border-[#ffffff15] text-white font-mono font-bold rounded p-2.5 focus:outline-none"
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} (Risk Score: {zone.riskScore}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#151520] p-3 rounded border border-[#ffffff10] text-[#aaa] font-sans leading-relaxed">
            Dispatching unit will automatically broadcast routing instructions via encrypted VHF & 4G telemetry to the field squad.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-[#ffffff08] border border-[#ffffff20] text-[#ccc] font-bold uppercase text-xs rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#ff4e00] hover:bg-[#ff6a2b] text-black font-bold uppercase tracking-wider text-xs rounded shadow-lg shadow-[#ff4e00]/20 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 fill-black" />
              Confirm Fleet Dispatch
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
