import React from 'react';
import { AutomatedAlert } from '../../shared/types';
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
    <div className="bg-[#040806] border-b border-[#10b981] px-4 py-2 z-30 relative font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-100 text-xs">
        
        <div className="flex items-center gap-3">
          <span className="p-1 bg-[#10b981] text-black rounded-none animate-pulse shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold uppercase text-[9px] tracking-widest bg-[#10b981]/10 text-emerald-100 px-2 py-0.5 rounded-none border border-[#10b98140]">
                CRITICAL FLASH FLOOD ALERT
              </span>
              <span className="text-[9px] text-[#10b981] font-mono">{activeAlerts[0].timestamp}</span>
            </div>
            <p className="font-bold text-sm text-emerald-100 mt-0.5 leading-tight font-sans">
              {activeAlerts[0].headline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-sans">
          <button
            onClick={() => onAcknowledge(activeAlerts[0].id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981] hover:bg-[#0fa06e] text-black font-bold uppercase tracking-wider rounded-none text-[10px] transition-all cursor-pointer border border-[#10b981]"
          >
            <CheckCircle2 className="w-3 h-3 text-black" />
            Acknowledge & Broadcast
          </button>
        </div>

      </div>
    </div>
  );
};
