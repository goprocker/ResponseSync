import { useEffect, useRef } from 'react';
import { CitizenReport, AgentActivityLog, AutomatedAlert } from '../shared/types';

interface UseSSEStreamProps {
  onNewReport: (report: CitizenReport) => void;
  onNewLog: (log: AgentActivityLog) => void;
  onNewAlert?: (alert: AutomatedAlert) => void;
}

export function useSSEStream({ onNewReport, onNewLog, onNewAlert }: UseSSEStreamProps) {
  // Use refs so the effect never needs to re-run when callback identity changes
  const onNewReportRef = useRef(onNewReport);
  const onNewLogRef = useRef(onNewLog);
  const onNewAlertRef = useRef(onNewAlert);

  useEffect(() => { onNewReportRef.current = onNewReport; }, [onNewReport]);
  useEffect(() => { onNewLogRef.current = onNewLog; }, [onNewLog]);
  useEffect(() => { onNewAlertRef.current = onNewAlert; }, [onNewAlert]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type === 'citizen_report_created' && parsed.payload) {
            const r = parsed.payload;
            const formattedReport: CitizenReport = {
              id: r.id || `rep-sse-${Date.now()}`,
              reporterName: r.reporterName || 'Live Citizen',
              phone: r.phone || '+91 90000 00000',
              timestamp: 'Just now (Live SSE)',
              lat: r.coordinates?.lat || 12.978,
              lng: r.coordinates?.lng || 80.222,
              locationName: r.locationName || 'Velachery Hazard Point',
              category: r.hazardType || 'waterlogging',
              severity: r.severity || 'critical',
              description: r.description || 'Live hazard report',
              imageUrl: r.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
              aiValidationScore: r.aiValidationScore || 95,
              aiValidatedCategory: r.aiValidatedCategory || 'Verified Live Hazard',
              aiSummary: r.aiSummary || 'Ingested via real-time SSE event pipeline.',
              status: 'verified'
            };

            onNewReportRef.current(formattedReport);

            const sseLog: AgentActivityLog = {
              id: `log-sse-${Date.now()}`,
              agentName: 'Citizen Intelligence Agent',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: 'Real-Time SSE Incident Intake',
              details: `Broadcasted report from ${formattedReport.reporterName} at ${formattedReport.locationName}.`,
              severity: 'alert'
            };

            onNewLogRef.current(sseLog);

            if (onNewAlertRef.current) {
              onNewAlertRef.current({
                id: `alert-sse-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                headline: `REAL-TIME SOS: ${formattedReport.locationName}`,
                zone: formattedReport.locationName,
                severity: formattedReport.severity === 'critical' ? 'critical' : 'warning',
                agenciesNotified: ['Disaster Mgmt HQ', 'Fire & Rescue', '108 Ambulance'],
                instructions: formattedReport.description,
                acknowledged: false
              });
            }
          }
        } catch (err) {
          console.warn('Error parsing SSE event in useSSEStream:', err);
        }
      };

      eventSource.onerror = () => {
        console.warn('SSE stream error, retrying in background...');
      };
    } catch (err) {
      console.warn('Failed to initialize SSE EventSource:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []); // ← empty deps: connect once on mount, use refs for latest callbacks
}
