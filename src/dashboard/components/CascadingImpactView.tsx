import React, { useState, useEffect, useRef } from 'react';
import {
  InfrastructureNode,
  DependencyEdge,
  CascadingImpactPrediction,
  ResponseStrategy,
  WhatIfParameters,
  TimeIntervalForecast,
  ExplainableDecisionReport,
  AssetStatus,
  AssetCategory
} from '../../shared/cascadingTypes';
import {
  INITIAL_INFRASTRUCTURE_NODES,
  INITIAL_DEPENDENCY_EDGES,
  INITIAL_CASCADING_PREDICTIONS,
  INITIAL_RESPONSE_STRATEGIES,
  DEFAULT_WHAT_IF_PARAMS,
  INITIAL_TIME_FORECASTS,
  INITIAL_EXPLAINABLE_REPORT,
  recalculateCascadingSimulation
} from '../../shared/cascadingData';
import {
  Zap,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  GitBranch,
  ShieldAlert,
  Award,
  Clock,
  TrendingUp,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Info,
  Server,
  Layers,
  MapPin,
  Cpu,
  ChevronRight,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';

interface CascadingImpactViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export default function CascadingImpactView({ onNavigateToTab }: CascadingImpactViewProps) {
  // 1. Core State
  const [nodes, setNodes] = useState<InfrastructureNode[]>(INITIAL_INFRASTRUCTURE_NODES);
  const [edges, setEdges] = useState<DependencyEdge[]>(INITIAL_DEPENDENCY_EDGES);
  const [predictions, setPredictions] = useState<CascadingImpactPrediction[]>(INITIAL_CASCADING_PREDICTIONS);
  const [strategies, setStrategies] = useState<ResponseStrategy[]>(INITIAL_RESPONSE_STRATEGIES);
  const [whatIfParams, setWhatIfParams] = useState<WhatIfParameters>(DEFAULT_WHAT_IF_PARAMS);
  const [forecasts, setForecasts] = useState<TimeIntervalForecast[]>(INITIAL_TIME_FORECASTS);
  const [explainReport, setExplainReport] = useState<ExplainableDecisionReport>(INITIAL_EXPLAINABLE_REPORT);

  // Active View Tabs
  const [activeTab, setActiveTab] = useState<'graph' | 'strategies' | 'whatif' | 'report'>('graph');

  // Timeline Scrubber State
  const [timeIndex, setTimeIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Selected Node Inspector
  const [selectedNode, setSelectedNode] = useState<InfrastructureNode | null>(nodes[0]);

  // Loading / AI Re-calculation
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [approvedStrategyId, setApprovedStrategyId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showInfographic, setShowInfographic] = useState<boolean>(false);

  // Auto Scrubber Animation Effect
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeIndex((prev) => (prev + 1) % forecasts.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, forecasts.length]);

  // Current Forecast Interval
  const currentForecast = forecasts[timeIndex] || forecasts[0];

  // Auto-fetch simulation from Agent endpoint on mount
  useEffect(() => {
    handleCalculateSimulation(whatIfParams);
  }, []);

  // Re-calculate simulation on What-If parameters update
  const handleCalculateSimulation = async (updatedParams: WhatIfParameters) => {
    setIsSimulating(true);
    setWhatIfParams(updatedParams);

    try {
      // Call backend API for AI analysis
      const resp = await fetch('/api/ai/cascading-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedParams)
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.data) {
          if (json.data.nodes) {
            setNodes(json.data.nodes);
            setSelectedNode(json.data.nodes[0] || null);
          }
          if (json.data.edges) setEdges(json.data.edges);
          if (json.data.predictions) setPredictions(json.data.predictions);
          if (json.data.strategies) setStrategies(json.data.strategies);
          if (json.data.forecasts) setForecasts(json.data.forecasts);
          if (json.data.report) setExplainReport(json.data.report);
          setIsSimulating(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API call fallback to local calculation engine:', err);
    }

    // Deterministic fallback engine
    const simResult = recalculateCascadingSimulation(INITIAL_INFRASTRUCTURE_NODES, INITIAL_DEPENDENCY_EDGES, updatedParams);
    setNodes(simResult.updatedNodes);
    setPredictions(simResult.updatedPredictions);
    setStrategies(simResult.updatedStrategies);
    setForecasts(simResult.updatedForecasts);
    setExplainReport(simResult.updatedReport);
    setIsSimulating(false);
  };

  const handleResetWhatIf = () => {
    handleCalculateSimulation(DEFAULT_WHAT_IF_PARAMS);
  };

  const handleToggleBridge = (nodeId: string) => {
    const closed = whatIfParams.closedBridges.includes(nodeId)
      ? whatIfParams.closedBridges.filter(id => id !== nodeId)
      : [...whatIfParams.closedBridges, nodeId];
    handleCalculateSimulation({ ...whatIfParams, closedBridges: closed });
  };

  const handleTogglePower = (nodeId: string) => {
    const disabled = whatIfParams.disabledPowerStations.includes(nodeId)
      ? whatIfParams.disabledPowerStations.filter(id => id !== nodeId)
      : [...whatIfParams.disabledPowerStations, nodeId];
    handleCalculateSimulation({ ...whatIfParams, disabledPowerStations: disabled });
  };

  const handleToggleHospital = (nodeId: string) => {
    const disabled = whatIfParams.disabledHospitals.includes(nodeId)
      ? whatIfParams.disabledHospitals.filter(id => id !== nodeId)
      : [...whatIfParams.disabledHospitals, nodeId];
    handleCalculateSimulation({ ...whatIfParams, disabledHospitals: disabled });
  };

  // Helper to get disaster specific parameter ranges and labels
  const paramMeta = (() => {
    switch (whatIfParams.activeDisasterType) {
      case 'cyclone':
        return {
          param1Label: 'Sustained Wind Speed Escalation:',
          param1Unit: '%',
          param1Min: 0,
          param1Max: 100,
          param1Step: 5,
          param2Label: 'Tidal Storm Surge Depth:',
          param2Unit: ' m',
          param2Min: 1,
          param2Max: 10,
          param2Step: 0.5,
        };
      case 'earthquake':
        return {
          param1Label: 'Seismic Shock Escalation:',
          param1Unit: '%',
          param1Min: 0,
          param1Max: 100,
          param1Step: 5,
          param2Label: 'Peak Ground Acceleration:',
          param2Unit: ' m/s²',
          param2Min: 50,
          param2Max: 500,
          param2Step: 25,
        };
      case 'wildfire':
        return {
          param1Label: 'Flame Spread Velocity Increase:',
          param1Unit: '%',
          param1Min: 0,
          param1Max: 100,
          param1Step: 5,
          param2Label: 'Wind Gust & Thermal Radiation:',
          param2Unit: ' km/h',
          param2Min: 20,
          param2Max: 200,
          param2Step: 10,
        };
      case 'landslide':
        return {
          param1Label: 'Soil Saturation Escalation:',
          param1Unit: '%',
          param1Min: 0,
          param1Max: 100,
          param1Step: 5,
          param2Label: 'Slope Debris Flow Discharge:',
          param2Unit: ' m³/s',
          param2Min: 50,
          param2Max: 600,
          param2Step: 25,
        };
      case 'tsunami':
        return {
          param1Label: 'Inundation Surge Elevation:',
          param1Unit: '%',
          param1Min: 0,
          param1Max: 100,
          param1Step: 5,
          param2Label: 'Coastal Wave Velocity:',
          param2Unit: ' m/s',
          param2Min: 10,
          param2Max: 100,
          param2Step: 5,
        };
      case 'flood':
      default:
        return {
          param1Label: 'Rainfall Rate Increase:',
          param1Unit: '%',
          param1Min: 0,
          param1Max: 100,
          param1Step: 5,
          param2Label: 'Chembarambakkam Dam Release:',
          param2Unit: ' m³/s',
          param2Min: 100,
          param2Max: 800,
          param2Step: 25,
        };
    }
  })();

  const timeMinutesMap: Record<string, number> = {
    '0m': 0,
    '30m': 30,
    '1h': 60,
    '3h': 180,
    '6h': 360,
    '12h': 720,
    '24h': 1440
  };
  const scrubbedMinutes = timeMinutesMap[currentForecast?.timeInterval || '0m'] || 0;

  const getLayoutPos = (id: string) => {
    const idx = nodes.findIndex(n => n.id === id);
    const index = idx >= 0 ? idx : 0;
    const layoutGrid = [
      { x: 14, y: 25 },
      { x: 32, y: 28 },
      { x: 52, y: 22 },
      { x: 78, y: 20 },
      { x: 82, y: 55 },
      { x: 32, y: 68 },
      { x: 58, y: 72 },
      { x: 50, y: 48 },
    ];
    if (index < layoutGrid.length) return layoutGrid[index];
    const angle = (index / Math.max(1, nodes.length)) * 2 * Math.PI;
    return { x: Math.round(50 + 35 * Math.cos(angle)), y: Math.round(50 + 35 * Math.sin(angle)) };
  };

  // Helper colors for status
  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'OPERATIONAL':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OPERATIONAL</span>;
      case 'AT_RISK':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">AT RISK</span>;
      case 'DISRUPTED':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">DISRUPTED</span>;
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">CRITICAL</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-600 text-black border border-red-500 font-extrabold">FAILED</span>;
      default:
        return null;
    }
  };

  const getNodeColor = (status: AssetStatus) => {
    switch (status) {
      case 'OPERATIONAL': return '#10b981';
      case 'AT_RISK': return '#f59e0b';
      case 'DISRUPTED': return '#f97316';
      case 'CRITICAL': return '#ef4444';
      case 'FAILED': return '#dc2626';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050507] text-[#e0e0e6] font-sans overflow-y-auto no-scrollbar pb-12">
      
      {/* 1. Header & Scrubber Control Bar */}
      <div className="bg-[#0e0e14] border-b border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand/20 border border-brand/40 flex items-center justify-center rounded-sm">
            <Zap className="w-5 h-5 text-brand animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white uppercase tracking-tight font-sans">
                AI Multi-Disaster Cascading Impact Prediction
              </h1>
              <span className="bg-brand text-black text-[9px] font-mono font-extrabold px-2 py-0.5 tracking-wider">
                PRO ACTIVE AI
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              Modeling N-th Order Urban Asset Failures & Dynamic Response Strategy Optimization
            </p>
          </div>
        </div>

        {/* Disaster Type Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={whatIfParams.activeDisasterType}
            onChange={(e) => handleCalculateSimulation({ ...whatIfParams, activeDisasterType: e.target.value as any })}
            className="bg-[#14141e] border border-white/10 text-xs font-mono text-white px-3 py-1.5 focus:outline-none focus:border-brand"
          >
            <option value="flood">🌊 Flood & Urban Inundation</option>
            <option value="cyclone">🌀 Cyclone & Storm Surge</option>
            <option value="earthquake">🌋 Earthquake & Structural Risk</option>
            <option value="wildfire">🔥 Wildfire & Heat Anomaly</option>
            <option value="landslide">⛰️ Landslide & Debris Flow</option>
            <option value="tsunami">🌊 Tsunami Coastal Surge</option>
          </select>

          <button
            onClick={() => setShowInfographic(true)}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-brand/20 text-brand border border-brand/40 hover:bg-brand/30 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Infographic Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('whatif')}
            className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'whatif' ? 'bg-brand text-black' : 'bg-[#14141e] text-neutral-300 border border-white/10 hover:border-white/30'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>What-If Lab</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 text-xs font-mono font-bold bg-[#14141e] text-neutral-300 border border-white/10 hover:border-brand/40 hover:text-white flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-brand" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Timeline Scrubber & Forecast Player */}
      <div className="bg-[#0a0a0f] border-b border-white/10 px-5 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-sm bg-brand/20 border border-brand/40 text-brand flex items-center justify-center hover:bg-brand/30 transition-colors"
            title={isPlaying ? 'Pause Timeline' : 'Play Forecast Animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-brand" /> : <Play className="w-4 h-4 text-brand" />}
          </button>

          <button
            onClick={() => { setIsPlaying(false); setTimeIndex(0); }}
            className="p-1.5 text-neutral-400 hover:text-white border border-white/10 bg-[#12121a]"
            title="Reset to Live Current"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Forecast Interval</span>
            <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand" />
              {currentForecast.label}
            </span>
          </div>
        </div>

        {/* Interval Buttons Bar */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 max-w-2xl">
          {forecasts.map((f, idx) => {
            const isSelected = idx === timeIndex;
            return (
              <button
                key={f.timeInterval}
                onClick={() => { setIsPlaying(false); setTimeIndex(idx); }}
                className={`flex-1 min-w-[70px] py-1.5 px-2 text-center text-[10px] font-mono font-bold transition-all border ${
                  isSelected
                    ? 'bg-brand/20 border-brand text-brand'
                    : 'bg-[#12121a] border-white/5 text-neutral-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div>{f.timeInterval}</div>
                <div className="text-[8px] text-neutral-500 font-normal">{f.failedAssetsCount} Failed</div>
              </button>
            );
          })}
        </div>

        {/* Current Interval Metrics Summary Pill */}
        <div className="flex items-center gap-4 text-[11px] font-mono bg-[#12121a] px-3 py-1.5 border border-white/5 flex-shrink-0">
          <div>
            <span className="text-neutral-500">Flooded Area: </span>
            <span className="text-brand font-bold">{currentForecast.floodedAreaSqKm} sq km</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-neutral-500">At-Risk Pop: </span>
            <span className="text-amber-400 font-bold">{currentForecast.atRiskPopulation.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* 3. Main Navigation Tab Selector */}
      <div className="px-5 pt-4 border-b border-white/10 bg-[#07070b] flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('graph')}
          className={`py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'graph' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Dependency Graph & Cascades ({predictions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('strategies')}
          className={`py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'strategies' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Response Strategy Optimizer ({strategies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('whatif')}
          className={`py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'whatif' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>What-If Scenario Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'report' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Explainable AI Report</span>
        </button>
      </div>

      {/* 4. Tab Contents */}
      <div className="p-5 flex-1 min-h-0">

        {/* TAB 1: DEPENDENCY GRAPH & FAILURE CASCADES */}
        {activeTab === 'graph' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Graph Visualization & Canvas Node Map */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              
              <div className="bg-[#0e0e14] border border-white/10 p-4 relative min-h-[420px] flex flex-col justify-between">
                
                {/* Canvas Overlay Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-brand" />
                    <span className="text-xs font-mono font-bold uppercase text-white">
                      Infrastructure Dependency Topology Map
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Operational</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> At Risk</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"></span> Failed</span>
                  </div>
                </div>

                {/* SVG Interconnected Directed Graph Display */}
                <div className="relative w-full h-[360px] bg-[#05050a] my-2 border border-white/5 rounded-sm p-4 overflow-hidden flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* SVG Connecting Edges */}
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                      </marker>
                      <marker id="arrow-critical" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                      </marker>
                    </defs>

                    {edges.map((edge) => {
                      const srcNode = nodes.find(n => n.id === edge.sourceNodeId);
                      const tgtNode = nodes.find(n => n.id === edge.targetNodeId);
                      if (!srcNode || !tgtNode) return null;

                      const p1 = getLayoutPos(edge.sourceNodeId);
                      const p2 = getLayoutPos(edge.targetNodeId);
                      const isCritical = srcNode.status === 'FAILED' || srcNode.status === 'CRITICAL';

                      return (
                        <g key={edge.id}>
                          <line
                            x1={`${p1.x}%`}
                            y1={`${p1.y}%`}
                            x2={`${p2.x}%`}
                            y2={`${p2.y}%`}
                            stroke={isCritical ? '#ef4444' : '#2563eb'}
                            strokeWidth={isCritical ? '2.5' : '1.5'}
                            strokeDasharray={isCritical ? '6,4' : 'none'}
                            opacity={0.8}
                            markerEnd={isCritical ? 'url(#arrow-critical)' : 'url(#arrow)'}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Interactive Nodes Placed over SVG */}
                  <div className="relative w-full h-full">
                    {nodes.map((node) => {
                      const pos = getLayoutPos(node.id);
                      const isSelected = selectedNode?.id === node.id;
                      const statusColor = getNodeColor(node.status);

                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNode(node)}
                          style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            borderColor: isSelected ? '#38bdf8' : statusColor
                          }}
                          className={`absolute z-10 cursor-pointer p-2 rounded-sm border transition-all bg-[#0e0e18] shadow-lg flex items-center gap-2 hover:scale-105 ${
                            isSelected ? 'ring-2 ring-brand' : ''
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: statusColor }}
                          />
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-bold font-mono text-white leading-none whitespace-nowrap">
                              {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
                            </span>
                            <span className="text-[8px] font-mono text-neutral-400">
                              {node.category} • {node.healthPct}% Health
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Topology Stats Bar */}
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-2 border-t border-white/10">
                  <span>Total Nodes: <strong className="text-white">{nodes.length}</strong></span>
                  <span>Active Dependencies: <strong className="text-white">{edges.length}</strong></span>
                  <span>Critical Failure Chains: <strong className="text-rose-400">{predictions.length}</strong></span>
                </div>

              </div>

              {/* Node Inspector Card */}
              {selectedNode && (
                <div className="bg-[#0e0e14] border border-white/10 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand" />
                      <span className="text-xs font-mono font-bold uppercase text-white">
                        Asset Telemetry Inspector: {selectedNode.name}
                      </span>
                    </div>
                    {getStatusBadge(selectedNode.status)}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3 text-xs font-mono">
                    <div className="bg-[#14141e] p-2 border border-white/5">
                      <span className="text-neutral-500 text-[10px] block">Category</span>
                      <span className="text-white font-bold">{selectedNode.category}</span>
                    </div>
                    <div className="bg-[#14141e] p-2 border border-white/5">
                      <span className="text-neutral-500 text-[10px] block">Health Status</span>
                      <span className={`font-bold ${selectedNode.healthPct < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedNode.healthPct}%
                      </span>
                    </div>
                    <div className="bg-[#14141e] p-2 border border-white/5">
                      <span className="text-neutral-500 text-[10px] block">Failure Prob.</span>
                      <span className="text-amber-400 font-bold">{selectedNode.failureProbability}%</span>
                    </div>
                    <div className="bg-[#14141e] p-2 border border-white/5">
                      <span className="text-neutral-500 text-[10px] block">Capacity / Load</span>
                      <span className="text-white font-bold text-[10px]">{selectedNode.currentLoad}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 font-sans leading-relaxed bg-[#0a0a0f] p-2.5 border border-white/5">
                    {selectedNode.description}
                  </p>
                </div>
              )}

            </div>

            {/* Right Live Cascading Predictions Stream */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-[#0e0e14] border border-white/10 p-4 flex flex-col h-full">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase text-white">
                      Predicted Cascading Impacts ({predictions.length})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Real-Time AI
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto no-scrollbar max-h-[580px]">
                  {predictions.map((pred) => {
                    const isTriggered = pred.estimatedTimeMin <= scrubbedMinutes;

                    return (
                      <div
                        key={pred.id}
                        className={`bg-[#12121a] border p-3 transition-all text-xs font-sans space-y-2 ${
                          isTriggered ? 'border-rose-500/80 shadow-md shadow-rose-950/40 bg-[#16121a]' : 'border-white/10 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className={`px-1.5 py-0.5 font-bold uppercase ${
                            isTriggered ? 'bg-rose-500 text-black font-extrabold animate-pulse' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {isTriggered ? 'CASCADE BREACH ACTIVE' : 'PROJECTED CASCADE'}
                          </span>
                          <span className="text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-brand" />
                            {isTriggered ? `Active @ T+${pred.estimatedTimeMin}m` : `Est in ${pred.estimatedTimeMin} mins`}
                          </span>
                        </div>

                        <div className="font-bold text-white text-xs flex items-center gap-2">
                          <span>{pred.sourceAssetName}</span>
                          <ArrowRight className="w-3 h-3 text-rose-400 flex-shrink-0" />
                          <span className="text-rose-300">{pred.targetAssetName}</span>
                        </div>

                        <p className="text-neutral-300 text-[11px] leading-relaxed bg-[#0a0a0f] p-2 border border-white/5">
                          {pred.explanation}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-white/5">
                          <span>Confidence: <strong className="text-emerald-400">{pred.confidenceScore}%</strong></span>
                          <span className="text-amber-400 font-bold">{pred.recommendedPriority}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: RESPONSE STRATEGY OPTIMIZER */}
        {activeTab === 'strategies' && (
          <div className="space-y-6">
            
            <div className="bg-[#0e0e14] border border-white/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-sans flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand" />
                  Dynamic Response Strategy Multi-Metric Optimization
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Simulating alternative response plans & trade-offs across response time, casualties, and grid safety
                </p>
              </div>

              {approvedStrategyId && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Approved Strategy Active & Dispatched</span>
                </div>
              )}
            </div>

            {/* Strategy Comparison Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {strategies.map((strat) => {
                const isApproved = approvedStrategyId === strat.id;

                return (
                  <div
                    key={strat.id}
                    className={`bg-[#0e0e14] border p-5 flex flex-col justify-between transition-all relative ${
                      strat.isOptimal
                        ? 'border-brand shadow-lg shadow-brand/10 bg-[#0f0f18]'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Optimal Badge */}
                    {strat.isOptimal && (
                      <div className="absolute -top-3 left-4 bg-brand text-black text-[9px] font-mono font-extrabold px-2.5 py-0.5 uppercase tracking-wider shadow">
                        ⭐ #1 RECOMMENDED OPTIMAL STRATEGY
                      </div>
                    )}

                    <div className="space-y-4 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400 uppercase font-bold">Rank #{strat.rank}</span>
                          <span className="text-brand font-extrabold text-sm">{strat.metrics.overallScore} / 100 PTS</span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{strat.name}</h3>
                        <p className="text-xs text-neutral-400 font-mono mt-1">{strat.tagline}</p>
                      </div>

                      {/* Multi-Metric Scores List */}
                      <div className="bg-[#05050a] p-3 border border-white/5 space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400">Response Time:</span>
                          <span className="text-white font-bold">{strat.metrics.responseTimeMins} mins</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400">Evacuation Efficiency:</span>
                          <span className="text-emerald-400 font-bold">{strat.metrics.evacuationEfficiencyPct}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400">Infrastructure Protection:</span>
                          <span className="text-blue-400 font-bold">{strat.metrics.infrastructureProtectionPct}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-400">Est. Casualties:</span>
                          <span className={`font-bold ${strat.metrics.estimatedCasualties === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {strat.metrics.estimatedCasualties}
                          </span>
                        </div>
                      </div>

                      {/* Action Plan Items */}
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
                          Action Deployments:
                        </span>
                        <ul className="space-y-1 text-xs text-neutral-300">
                          {strat.actions.map((act, i) => (
                            <li key={i} className="flex items-start gap-1.5 bg-[#12121a] p-1.5 border border-white/5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-white">{act.action}</strong>
                                <span className="text-neutral-400 font-mono text-[10px] block">→ {act.target} ({act.resourcesAssigned})</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Trade-offs Analysis */}
                      <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                        <div>
                          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">
                            ✓ Key Benefits
                          </span>
                          <ul className="list-disc list-inside text-neutral-300 space-y-0.5 text-[11px]">
                            {strat.tradeoffs.pros.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block mb-1">
                            ⚠ Trade-off Cons
                          </span>
                          <ul className="list-disc list-inside text-neutral-400 space-y-0.5 text-[11px]">
                            {strat.tradeoffs.cons.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      </div>

                    </div>

                    {/* Approve Action Button */}
                    <div className="pt-4 mt-4 border-t border-white/10">
                      <button
                        onClick={() => setApprovedStrategyId(strat.id)}
                        disabled={isApproved}
                        className={`w-full py-2 px-3 text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                          isApproved
                            ? 'bg-emerald-500 text-black cursor-default font-extrabold'
                            : strat.isOptimal
                            ? 'bg-brand hover:bg-brand/90 text-black font-extrabold'
                            : 'bg-[#14141e] hover:bg-white/10 text-white border border-white/10'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Strategy Approved & Executed</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Approve & Dispatch Strategy</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: WHAT-IF SCENARIO LAB */}
        {activeTab === 'whatif' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Controls Column */}
            <div className="lg:col-span-5 bg-[#0e0e14] border border-white/10 p-5 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand" />
                  <span className="text-xs font-mono font-bold uppercase text-white">
                    What-If Disaster Parameters
                  </span>
                </div>
                <button
                  onClick={handleResetWhatIf}
                  className="text-[10px] font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Baseline</span>
                </button>
              </div>

              {/* Slider 1: Intensity Parameter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-300">{paramMeta.param1Label}</span>
                  <span className="text-brand font-bold">+{whatIfParams.rainfallIncreasePct}{paramMeta.param1Unit}</span>
                </div>
                <input
                  type="range"
                  min={paramMeta.param1Min}
                  max={paramMeta.param1Max}
                  step={paramMeta.param1Step}
                  value={whatIfParams.rainfallIncreasePct}
                  onChange={(e) => handleCalculateSimulation({ ...whatIfParams, rainfallIncreasePct: Number(e.target.value) })}
                  className="w-full accent-brand bg-white/10 h-1.5 cursor-pointer"
                />
              </div>

              {/* Slider 2: Disaster Specific Flow / Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-300">{paramMeta.param2Label}</span>
                  <span className="text-brand font-bold">{whatIfParams.damDischargeRateM3s}{paramMeta.param2Unit}</span>
                </div>
                <input
                  type="range"
                  min={paramMeta.param2Min}
                  max={paramMeta.param2Max}
                  step={paramMeta.param2Step}
                  value={whatIfParams.damDischargeRateM3s}
                  onChange={(e) => handleCalculateSimulation({ ...whatIfParams, damDischargeRateM3s: Number(e.target.value) })}
                  className="w-full accent-brand bg-white/10 h-1.5 cursor-pointer"
                />
              </div>

              {/* Critical Asset Disruption Toggles */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-mono font-bold text-white uppercase block">
                  Simulate Critical Asset Failures / Closures:
                </span>

                <div className="space-y-2 text-xs font-mono max-h-48 overflow-y-auto no-scrollbar">
                  {nodes.map((node) => {
                    const isPower = node.category === 'Power Stations';
                    const isHospital = node.category === 'Hospitals';
                    const isChecked = isPower
                      ? whatIfParams.disabledPowerStations.includes(node.id)
                      : isHospital
                      ? whatIfParams.disabledHospitals.includes(node.id)
                      : whatIfParams.closedBridges.includes(node.id);

                    const toggleNode = () => {
                      if (isPower) handleTogglePower(node.id);
                      else if (isHospital) handleToggleHospital(node.id);
                      else handleToggleBridge(node.id);
                    };

                    return (
                      <label key={node.id} className="flex items-center justify-between p-2 bg-[#12121a] border border-white/5 cursor-pointer hover:border-white/20">
                        <span className="truncate pr-2">
                          <strong className="text-white">{node.name}</strong>{' '}
                          <span className="text-neutral-500 text-[10px]">({node.category})</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={toggleNode}
                          className="accent-brand flex-shrink-0"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom Operator Prompt / AI Query */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <span className="text-xs font-mono font-bold text-white uppercase block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  Ask AI Agent / Custom Operator Scenario Query:
                </span>
                <textarea
                  rows={2}
                  value={whatIfParams.customNotes || ''}
                  onChange={(e) => setWhatIfParams({ ...whatIfParams, customNotes: e.target.value })}
                  placeholder="e.g., What happens if Velachery hospital generator fails at 2 AM under peak flood?"
                  className="w-full bg-[#12121a] border border-white/10 text-xs font-mono text-white p-2.5 focus:outline-none focus:border-brand placeholder:text-neutral-600 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() => handleCalculateSimulation(whatIfParams)}
                  disabled={isSimulating}
                  className="w-full py-2.5 px-3 bg-brand hover:bg-brand/90 text-black font-mono font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSimulating ? 'AI Agent Analyzing N-th Order Cascades...' : 'Run Agent AI Cascading Simulation'}</span>
                </button>
              </div>

            </div>

            {/* Right Comparison & Recalculated Output Column */}
            <div className="lg:col-span-7 bg-[#0e0e14] border border-white/10 p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase text-white">
                    Simulated Impact Delta vs. Baseline
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">
                  Confidence Score: <strong className="text-emerald-400">{explainReport.confidenceRatingPct}%</strong>
                </span>
              </div>

              {/* Delta Comparison Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-[#12121a] p-3 border border-white/5">
                  <span className="text-neutral-400 text-[10px] block">Flooded Area</span>
                  <span className="text-brand text-sm font-extrabold block">{currentForecast.floodedAreaSqKm} sq km</span>
                  <span className="text-[9px] text-amber-400 mt-1 block">
                    +{Math.round((whatIfParams.rainfallIncreasePct / 20) * 10) / 10} sq km vs baseline
                  </span>
                </div>

                <div className="bg-[#12121a] p-3 border border-white/5">
                  <span className="text-neutral-400 text-[10px] block">Failed Assets</span>
                  <span className="text-rose-400 text-sm font-extrabold block">{currentForecast.failedAssetsCount} Nodes</span>
                  <span className="text-[9px] text-rose-300 mt-1 block">
                    {whatIfParams.disabledPowerStations.length + whatIfParams.closedBridges.length} manually disabled
                  </span>
                </div>

                <div className="bg-[#12121a] p-3 border border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-neutral-400 text-[10px] block">At-Risk Citizens</span>
                  <span className="text-amber-400 text-sm font-extrabold block">{currentForecast.atRiskPopulation.toLocaleString()}</span>
                  <span className="text-[9px] text-neutral-400 mt-1 block">Escalated Risk Level</span>
                </div>
              </div>

              {/* Simulation Explanation Summary */}
              <div className="bg-[#05050a] p-4 border border-white/5 space-y-2">
                <span className="text-[10px] font-mono text-brand font-bold uppercase tracking-wider block">
                  AI Cascading Impact Summary:
                </span>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {explainReport.summary}
                </p>
              </div>

              {/* Top Ranked Strategy Under Scenario */}
              {strategies.length > 0 && (
                <div className="bg-brand/10 border border-brand/30 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-brand font-bold uppercase flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Recommended Strategy Under Scenario
                    </span>
                    <span className="text-white font-extrabold">{strategies[0].name}</span>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans">
                    {strategies[0].description}
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 4: EXPLAINABLE AI REPORT */}
        {activeTab === 'report' && (
          <div className="bg-[#0e0e14] border border-white/10 p-6 space-y-6 max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase font-sans flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand" />
                  Explainable AI Decision Audit & Preventative Report
                </h2>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Generated at {explainReport.timestamp} • Evidence-backed causal explanations
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                Confidence: {explainReport.confidenceRatingPct}%
              </span>
            </div>

            {/* Root Causes */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
                1. Primary Disaster Root Causes:
              </h3>
              <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                {explainReport.rootCauses.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[#12121a] p-2.5 border border-white/5">
                    <Info className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chain Reaction Timeline */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
                2. N-th Order Causal Chain Reaction:
              </h3>
              <div className="bg-[#05050a] p-3 border border-white/5 text-xs font-mono text-neutral-200 leading-relaxed">
                {explainReport.chainReactionDescription}
              </div>
            </div>

            {/* Strategy Recommendation Justification */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
                3. Strategy Recommendation Rationale:
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed bg-[#12121a] p-3 border border-white/5">
                {explainReport.strategyRecommendationJustification}
              </p>
            </div>

            {/* Tradeoff Analysis */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
                4. Key Resource & Mortality Trade-off Analysis:
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed bg-[#12121a] p-3 border border-white/5">
                {explainReport.keyTradeoffAnalysis}
              </p>
            </div>

            {/* Preventative Action Items */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
                5. Immediate Action Recommendations:
              </h3>
              <ul className="space-y-1.5 text-xs text-neutral-300 font-sans">
                {explainReport.preventativeActionItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 bg-[#12121a] p-2.5 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>

      {/* Futuristic Infographic Architecture Modal */}
      {showInfographic && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c14] border border-brand/50 max-w-5xl w-full p-6 space-y-6 shadow-2xl relative text-white">
            <button
              onClick={() => setShowInfographic(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white font-mono text-sm border border-white/10 px-2 py-1 bg-[#14141e]"
            >
              ✕ ESC
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2 bg-brand/20 border border-brand/50 text-brand">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold uppercase font-mono tracking-tight text-white flex items-center gap-2">
                  AI-Powered Multi-Disaster Cascading Impact Prediction
                  <span className="text-[10px] bg-brand text-black px-2 py-0.5 font-extrabold">SYSTEM ARCHITECTURE</span>
                </h2>
                <p className="text-xs text-neutral-400 font-mono">
                  GNN Topology • Hydrodynamic Cascade Modeling • Dynamic Response Optimization Engine
                </p>
              </div>
            </div>

            {/* Interactive Futuristic Infographic Canvas */}
            <div className="bg-[#05050a] border border-white/10 p-5 rounded-sm relative overflow-hidden space-y-6">
              
              {/* Background Cyber Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

              {/* Infographic 3-Stage Pipeline Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">
                
                {/* STAGE 1: Primary Trigger */}
                <div className="bg-[#12121e] border border-amber-500/30 p-4 space-y-3 relative">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 font-bold uppercase border border-amber-500/30">
                      STAGE 1: PRIMARY TRIGGER
                    </span>
                    <span className="text-amber-300 font-bold">SEISMIC / METEOROLOGICAL</span>
                  </div>

                  <div className="p-3 bg-[#08080f] border border-amber-500/20 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg font-mono">
                      ⚡
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono uppercase">EARTHQUAKE MAG 7.2 / SURGE</div>
                      <div className="text-[10px] text-amber-400/90 font-mono">Ground Acceleration: 320 m/s²</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                    Initiating physical shockwave across critical river basins, causing high-pressure dam discharge and ground tremors.
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-2 border-t border-white/5">
                    <span>Trigger Confidence: <strong className="text-emerald-400">98.4%</strong></span>
                    <span>Zone Alpha</span>
                  </div>
                </div>

                {/* STAGE 2: Secondary Cascades */}
                <div className="bg-[#12121e] border border-rose-500/30 p-4 space-y-3 relative">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 font-bold uppercase border border-rose-500/30">
                      STAGE 2: PREDICTION ENGINE
                    </span>
                    <span className="text-rose-300 font-bold">GNN CASCADE GRAPH</span>
                  </div>

                  <div className="p-3 bg-[#08080f] border border-rose-500/20 space-y-1 font-mono text-[10px]">
                    <div className="text-rose-400 font-bold flex items-center justify-between">
                      <span>DAM BREACH (P: 0.89)</span>
                      <span className="text-white">T+15m</span>
                    </div>
                    <div className="text-amber-400 flex items-center justify-between">
                      <span>↓ FLASH FLOOD INUNDATION</span>
                      <span className="text-white">T+30m</span>
                    </div>
                    <div className="text-rose-400 font-bold flex items-center justify-between">
                      <span>↓ 110kV GRID FAILURE</span>
                      <span className="text-white">T+45m</span>
                    </div>
                    <div className="text-rose-300 flex items-center justify-between">
                      <span>↓ ICU POWER & TELECOM TRIP</span>
                      <span className="text-white">T+60m</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                    N-th order graph neural network maps interdependent infrastructure node failures before physical breach occurs.
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-2 border-t border-white/5">
                    <span>Cascade Depth: <strong className="text-amber-400">Level 4</strong></span>
                    <span>9 Infrastructure Assets</span>
                  </div>
                </div>

                {/* STAGE 3: Dynamic Response Optimization */}
                <div className="bg-[#12121e] border border-emerald-500/30 p-4 space-y-3 relative">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 font-bold uppercase border border-emerald-500/30">
                      STAGE 3: RESPONSE OPTIMIZER
                    </span>
                    <span className="text-emerald-300 font-bold">DYNAMIC DISPATCH</span>
                  </div>

                  <div className="p-3 bg-[#08080f] border border-emerald-500/20 space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>🚁 Aerial Supply Drones</span>
                      <span className="text-white font-bold">12 Active</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>🚒 Evacuation Route Vector</span>
                      <span className="text-white font-bold">Bypassing Flyover</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>⚡ Mobile Genset Deploy</span>
                      <span className="text-white font-bold">Apollo ICU</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                    Autonomous dispatch optimizer reroutes emergency fleets over unflooded arterial roads and pre-positions power generators.
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-2 border-t border-white/5">
                    <span>Lives Protected: <strong className="text-emerald-400">14,200 Est.</strong></span>
                    <span>Optimized: 94%</span>
                  </div>
                </div>

              </div>

              {/* Schematic Map Representation Overlay */}
              <div className="bg-[#0a0a10] border border-white/10 p-4 relative text-center font-mono">
                <div className="text-xs text-brand font-bold uppercase tracking-wider mb-2">
                  🗺️ GIS LAYER SIMULATION & INFRASTRUCTURE TOPOLOGY MAP
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                  <div className="p-2 bg-[#12121c] border border-white/5">
                    <span className="text-neutral-400 block">Inundation Layer</span>
                    <span className="text-sky-400 font-bold">Chembarambakkam Basin</span>
                  </div>
                  <div className="p-2 bg-[#12121c] border border-white/5">
                    <span className="text-neutral-400 block">Grid Dependency</span>
                    <span className="text-amber-400 font-bold">Velachery 110kV</span>
                  </div>
                  <div className="p-2 bg-[#12121c] border border-white/5">
                    <span className="text-neutral-400 block">Corridor Bypass</span>
                    <span className="text-emerald-400 font-bold">GST Arterial Route</span>
                  </div>
                  <div className="p-2 bg-[#12121c] border border-white/5">
                    <span className="text-neutral-400 block">Priority Safe Zone</span>
                    <span className="text-purple-400 font-bold">Anna University Shelter</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowInfographic(false)}
                className="px-5 py-2 bg-brand text-black font-mono font-extrabold text-xs uppercase hover:bg-brand/90 transition-all"
              >
                Close Architecture Guide
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e14] border border-white/20 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white font-sans uppercase flex items-center gap-2">
                <Download className="w-4 h-4 text-brand" />
                Export Decision Report
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed">
              Download complete Cascading Impact Graph, Infrastructure Failure Predictions, and Ranked Strategy Analysis as official PDF or JSON telemetry package for emergency command records.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ explainReport, predictions, strategies, nodes }, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `cascading_impact_report_${Date.now()}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                  setShowExportModal(false);
                }}
                className="w-full py-2 bg-brand text-black font-mono font-extrabold text-xs uppercase flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON Telemetry Data</span>
              </button>

              <button
                onClick={() => { window.print(); setShowExportModal(false); }}
                className="w-full py-2 bg-[#14141e] hover:bg-white/10 text-white border border-white/10 font-mono text-xs uppercase flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-brand" />
                <span>Print Executive Briefing Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
