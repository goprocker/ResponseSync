import { useState, useCallback } from 'react';
import { runMultiAgentPipeline } from '../services/api';
import { ZoneRisk, CitizenReport, ExplainableAIRecommendation } from '../shared/types';

export interface AgentLog {
  id: string;
  agentName: string;
  action: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
}

export function useAgentPipeline() {
  const [isRunning, setIsRunning] = useState(false);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [activeRecommendation, setActiveRecommendation] = useState<ExplainableAIRecommendation | null>(null);
  const [lastPreset, setLastPreset] = useState<'normal' | 'moderate' | 'flood'>('flood');

  const executePipeline = useCallback(async (preset: 'normal' | 'moderate' | 'flood' = 'flood') => {
    setIsRunning(true);
    setLastPreset(preset);
    try {
      const data = await runMultiAgentPipeline({ preset });
      if (data.agentLogs) {
        const formattedLogs: AgentLog[] = data.agentLogs.map((log: any, idx: number) => ({
          id: `log-${Date.now()}-${idx}`,
          agentName: log.agentName || 'Agent',
          action: log.action || 'Analysis',
          details: log.details || '',
          timestamp: new Date().toLocaleTimeString(),
          severity: log.severity || 'info'
        }));
        setAgentLogs((prev) => [...formattedLogs, ...prev].slice(0, 50));
      }
      if (data.recommendation) {
        setActiveRecommendation(data.recommendation);
      }
      return data;
    } catch (err) {
      console.error('3-Agent Pipeline Error:', err);
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    isRunning,
    agentLogs,
    activeRecommendation,
    executePipeline,
    lastPreset
  };
}
