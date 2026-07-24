import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Radio, 
  RefreshCw
} from 'lucide-react';
import { AutomatedAlert, CitizenReport, AgentActivityLog, AgencyRole } from '../../shared/types';

interface NotificationLog {
  id: string;
  channel: 'fcm_push' | 'sms_gateway' | 'sse_broadcast';
  title: string;
  body: string;
  targetRole?: string;
  targetZone?: string;
  recipientsCount: number;
  deliveryStatus: 'sent' | 'delivered' | 'partially_failed';
  dispatchedBy: string;
  timestamp: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AutomatedAlert[];
  reports: CitizenReport[];
  agentLogs: AgentActivityLog[];
  onAcknowledgeAlert: (alertId: string) => void;
  agencyRole: AgencyRole;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  reports,
  agentLogs,
  onAcknowledgeAlert,
  agencyRole
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'broadcasts' | 'reports' | 'logs'>('alerts');
  const [broadcastLogs, setBroadcastLogs] = useState<NotificationLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState('');

  // Fetch real-time broadcast logs from backend
  const fetchNotificationLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const resp = await fetch('/api/notifications/logs');
      if (resp.ok) {
        const json = await resp.json();
        if (json.success && Array.isArray(json.data)) {
          setBroadcastLogs(json.data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch notification logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotificationLogs();
    }
  }, [isOpen]);

  const handleSendTestBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSendingBroadcast(true);
    setBroadcastSuccessMsg('');
    try {
      // 1. Trigger FCM Push
      const fcmResp = await fetch('/api/notifications/fcm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `⚠️ EMERGENCY BROADCAST [${agencyRole.toUpperCase()}]`,
          body: broadcastMessage,
          targetRole: 'all',
          priority: 'high'
        })
      });

      // 2. Trigger SMS Gateway
      const smsResp = await fetch('/api/notifications/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: broadcastMessage,
          targetZone: 'Chennai Flood Corridor'
        })
      });

      if (fcmResp.ok && smsResp.ok) {
        setBroadcastSuccessMsg('FCM Push & Emergency SMS Broadcast Sent Successfully!');
        setBroadcastMessage('');
        fetchNotificationLogs();
      }
    } catch (err) {
      console.error('Failed to send broadcast:', err);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  if (!isOpen) return null;

  const unackAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-xs font-sans" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-[#0e0e14] border-l border-white/10 flex flex-col h-full shadow-2xl text-[#e0e0e6] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#050507]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand text-black rounded-none font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm font-sans tracking-tight uppercase flex items-center gap-2">
                Emergency Notifications
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-brand/15 text-brand border border-brand/30">
                  LIVE
                </span>
              </h2>
              <p className="text-[10px] text-neutral-400 font-mono">
                Role: <span className="text-brand uppercase font-bold">{agencyRole.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 bg-[#08080c] font-mono text-xs">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-2.5 px-2 text-center font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-brand text-brand bg-brand/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Alerts ({unackAlerts.length})
          </button>

          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`flex-1 py-2.5 px-2 text-center font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'broadcasts'
                ? 'border-brand text-brand bg-brand/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Broadcasts
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2.5 px-2 text-center font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'reports'
                ? 'border-brand text-brand bg-brand/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Reports
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2.5 px-2 text-center font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'border-brand text-brand bg-brand/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Logs
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          
          {/* TAB 1: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 font-mono text-xs">
                  No automated alerts recorded.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 border space-y-3 transition-all ${
                      !alert.acknowledged 
                        ? 'bg-red-500/10 border-red-500/40 text-white' 
                        : 'bg-[#050507] border-white/5 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className={`w-4 h-4 shrink-0 ${!alert.acknowledged ? 'text-red-500 animate-pulse' : 'text-neutral-400'}`} />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-400">
                          {alert.severity || 'CRITICAL'} ALERT
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">{alert.timestamp}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{alert.headline}</h4>
                      <p className="text-xs text-neutral-300 font-mono mt-1">Zone: {alert.zone}</p>
                      {alert.instructions && (
                        <p className="text-xs text-neutral-400 mt-1 italic">"{alert.instructions}"</p>
                      )}
                    </div>

                    {!alert.acknowledged ? (
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/notifications/fcm/send', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                title: `⚠️ ACKNOWLEDGED ALERT: ${alert.headline}`,
                                body: alert.instructions || 'Emergency broadcast dispatched.',
                                targetRole: 'all',
                                priority: 'high'
                              })
                            });
                          } catch (e) {}
                          onAcknowledgeAlert(alert.id);
                        }}
                        className="w-full py-1.5 bg-brand hover:bg-brand-deep text-black font-bold uppercase font-mono text-[10px] tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Acknowledge & Dispatch FCM/SMS
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Acknowledged & Broadcasted
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: BROADCASTS (FCM & SMS) */}
          {activeTab === 'broadcasts' && (
            <div className="space-y-4">
              
              {/* Send Broadcast Form */}
              <form onSubmit={handleSendTestBroadcast} className="bg-[#050507] p-3 border border-white/10 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand uppercase text-[10px] tracking-wider flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-brand" /> Instant FCM / SMS Broadcast
                  </span>
                  <span className="text-[9px] text-neutral-400">Target: All Devices</span>
                </div>

                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type emergency alert message for broadcast..."
                  rows={2}
                  className="w-full bg-[#0e0e14] border border-white/10 p-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand resize-none font-sans"
                />

                <button
                  type="submit"
                  disabled={isSendingBroadcast || !broadcastMessage.trim()}
                  className="w-full py-1.5 bg-brand hover:bg-brand-deep text-black font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSendingBroadcast ? 'Broadcasting...' : 'Broadcast FCM Push & SMS'}
                </button>

                {broadcastSuccessMsg && (
                  <p className="text-[10px] text-emerald-400 text-center font-mono mt-1">
                    ✓ {broadcastSuccessMsg}
                  </p>
                )}
              </form>

              {/* History list */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span className="uppercase text-[10px] tracking-wider">Broadcast History</span>
                  <button onClick={fetchNotificationLogs} className="hover:text-brand flex items-center gap-1 cursor-pointer">
                    <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>

                {broadcastLogs.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500 font-mono text-xs">
                    No broadcast logs found.
                  </div>
                ) : (
                  broadcastLogs.map((log) => (
                    <div key={log.id} className="bg-[#050507] border border-white/5 p-3 space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.2 text-[8px] font-bold uppercase rounded ${
                          log.channel === 'fcm_push' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {log.channel === 'fcm_push' ? 'FCM PUSH' : 'GOVT SMS'}
                        </span>
                        <span className="text-[9px] text-neutral-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h5 className="font-bold text-white text-xs font-sans">{log.title}</h5>
                      <p className="text-[11px] text-neutral-300 font-sans leading-tight">{log.body}</p>

                      <div className="flex items-center justify-between text-[9px] text-neutral-400 pt-1 border-t border-white/5">
                        <span>Recipients: <strong className="text-brand">{log.recipientsCount.toLocaleString()}</strong></span>
                        <span className="text-emerald-400">Status: {log.deliveryStatus}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 3: CITIZEN REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-3 font-mono text-xs">
              {reports.map((report) => (
                <div key={report.id} className="bg-[#050507] border border-white/5 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase text-[11px] font-sans">
                      {report.category.replace('_', ' ')}
                    </span>
                    <span className={`px-1.5 py-0.2 text-[8px] uppercase font-bold rounded ${
                      report.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {report.severity}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 font-sans">{report.description}</p>
                  
                  <div className="flex items-center justify-between text-[9px] text-neutral-400 pt-1">
                    <span>📍 {report.locationName}</span>
                    <span className="text-brand">Credibility: {report.aiValidationScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: AGENT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-2 font-mono text-xs">
              {agentLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="bg-[#050507] border border-white/5 p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-brand font-bold uppercase">{log.agentName}</span>
                    <span className="text-neutral-500">{log.timestamp}</span>
                  </div>
                  <div className="font-bold text-white text-[11px]">{log.action}</div>
                  <p className="text-[10px] text-neutral-400 font-sans leading-tight">{log.details}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-white/10 bg-[#050507] font-mono text-[9px] text-neutral-400 flex items-center justify-between">
          <span>ResponSync Emergency Push Engine</span>
          <span className="text-emerald-400">FCM & CAP Connected</span>
        </div>
      </div>
    </div>
  );
};
