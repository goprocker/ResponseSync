import React from 'react';
import { AutomatedAlert } from '../types';
import { ShieldAlert, Bell, CheckCircle2, X } from 'lucide-react';

interface AlertNotificationBannerProps {
  alerts: AutomatedAlert[];
  onAcknowledge: (alertId: string) => void;
}

export const AlertNotificationBanner: React.FC<AlertNotificationBannerProps> = ({
  alerts,
  onAcknowledge
}) => {
  const activeAlerts = alerts.filter(a => !a.acknowledged);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="bg-[#0a0a0f] border-b-2 border-[#ff4e00] px-4 py-2.5 z-30 relative font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white text-xs">
        
        <div className="flex items-center gap-3">
          <span className="p-1.5 bg-[#ff4e00] text-black rounded animate-pulse shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold uppercase text-[10px] tracking-widest bg-[#ff4e00]/20 text-[#ff4e00] px-2 py-0.5 rounded border border-[#ff4e00]/40">
                CRITICAL FLASH FLOOD ALERT
              </span>
              <span className="text-[10px] text-[#888] font-mono">{activeAlerts[0].timestamp}</span>
            </div>
            <p className="font-bold text-sm text-white mt-0.5 leading-tight font-sans">
              {activeAlerts[0].headline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-sans">
          <button
            onClick={() => onAcknowledge(activeAlerts[0].id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff4e00] hover:bg-[#ff6a2b] text-black font-bold uppercase tracking-wider rounded text-xs transition-all cursor-pointer shadow-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5 fill-black" />
            Acknowledge & Broadcast
          </button>
        </div>

      </div>
    </div>
  );
};
