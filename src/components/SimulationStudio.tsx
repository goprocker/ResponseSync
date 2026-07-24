import React, { useState } from 'react';
import { SimulationParams, SimulationResult } from '../types';
import {
  Sliders,
  Play,
  RotateCcw,
  CloudRain,
  Waves,
  ShieldAlert,
  Users,
  MapPin,
  TrendingUp,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Database,
  GitCompare,
  Search,
  BookOpen,
  Zap
} from 'lucide-react';

export const SimulationStudio: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'simulation' | 'knowledge_base'>('simulation');

  const [params, setParams] = useState<SimulationParams>({
    rainfallMmHr: 110,
    chembarambakkamReleaseM3s: 1800,
    canalBlockagePct: 80,
    bridgeStatus: 'restricted',
    durationHours: 3,
    highTideOverlap: true
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>({
    simulatedTime: '+3 Hours Scenario',
    affectedZonesCount: 4,
    predictedSubmergedAreaKm2: 4.8,
    estimatedAffectedPeople: 68500,
    criticalRoadBlocks: [
      'Guindy Railway Subway (Water Depth 1.8m)',
      'Velachery 100ft Road Vijaya Nagar Junction',
      'Kotturpuram Bridge Approach'
    ],
    recommendedDeployments: [
      { type: 'Rescue Boat Units', count: 6, zone: 'Velachery South' },
      { type: 'Heavy Dewatering Pumps', count: 8, zone: 'Guindy Subway & Taramani' },
      { type: 'Evacuation Buses', count: 15, zone: 'Kotturpuram Slums' }
    ],
    riskTimeline: [
      { minute: 15, floodedZones: 2, maxWaterDepthMeters: 0.8 },
      { minute: 30, floodedZones: 3, maxWaterDepthMeters: 1.4 },
      { minute: 60, floodedZones: 4, maxWaterDepthMeters: 2.2 },
      { minute: 120, floodedZones: 5, maxWaterDepthMeters: 2.9 }
    ],
    aiSummary: 'Simulated +3 hour cloudburst scenario combined with 1,800 m³/s dam release and estuarine high-tide backwater. Peak inundation occurs at T+90 minutes in Velachery South & Kotturpuram. Immediate pre-positioning of 6 boat units recommended before road corridors submerge.'
  });

  // Scenario Matching State
  const [isMatching, setIsMatching] = useState(false);
  const [scenarioMatches, setScenarioMatches] = useState<any | null>({
    matchedScenarios: [
      {
        id: 'sim-2015-12-01',
        historicalEvent: 'December 2015 Chennai Flood & Chembarambakkam Sluice Discharge',
        similarityPct: 94,
        keyMatches: ['85mm/hr Cloudburst intensity', 'High tide estuarine backwater', 'Velachery Lake sluice overflow'],
        retrievedStrategy: 'Immediate deployment of 4 NDRF boat units to Vijaya Nagar & pre-evacuation of Kotturpuram tenements',
        historicalOutcome: 'Rescued 4,200 stranded residents with 91% effectiveness score',
        aiRefinement: 'Apply 2015 strategy but add automated road barricading at Guindy subway to prevent vehicle stalling.'
      },
      {
        id: 'sim-2021-11-25',
        historicalEvent: 'November 2021 Cyclone Nivar Severe Inundation',
        similarityPct: 86,
        keyMatches: ['Heavy catchment rain in Adyar', 'Drainage silt blockage 80%'],
        retrievedStrategy: 'High-capacity 500HP dewatering pumps stationed at 100ft road canal sluice',
        historicalOutcome: 'Reduced standing water duration by 14 hours across Velachery South',
        aiRefinement: 'Deploy pumps 30 minutes earlier based on live IoT sensor water depth derivative.'
      }
    ],
    recommendedMasterPlan: 'Combine 2015 pre-evacuation protocol with 2021 early dewatering pump placement.'
  });

  const handleRunSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScenarioMatch = async () => {
    setIsMatching(true);
    try {
      const response = await fetch('/api/ai/scenario-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveConditions: {
            rainfallMmHr: params.rainfallMmHr,
            damDischarge: params.chembarambakkamReleaseM3s,
            riverStage: 3.4,
            trafficCongestion: params.canalBlockagePct
          }
        })
      });
      const data = await response.json();
      if (data.success && data.data) {
        setScenarioMatches(data.data);
      }
    } catch (err) {
      console.error('Scenario match error:', err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleReset = () => {
    setParams({
      rainfallMmHr: 85,
      chembarambakkamReleaseM3s: 1200,
      canalBlockagePct: 60,
      bridgeStatus: 'open',
      durationHours: 2,
      highTideOverlap: false
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-5 space-y-5 text-[#e0e0e6] font-sans">
      
      {/* Title Header */}
      <div className="bg-[#101018] p-5 rounded-lg border border-[#ffffff12] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit mb-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Simulation & Decision Knowledge Base Studio
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">
            Disaster Hydrodynamic Simulation & Scenario Engine
          </h2>
          <p className="text-xs text-[#888899]">
            Run hydrodynamic what-if simulations, match live events against historical disaster knowledge, and extract refined AI response strategies.
          </p>
        </div>

        {/* Sub-Tab Navigation Switch */}
        <div className="flex items-center gap-1.5 bg-[#151520] p-1 rounded border border-[#ffffff15]">
          <button
            onClick={() => setActiveSubTab('simulation')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'simulation'
                ? 'bg-[#ff4e00] text-black shadow-md shadow-[#ff4e00]/20'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Simulation Engine
          </button>
          <button
            onClick={() => setActiveSubTab('knowledge_base')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'knowledge_base'
                ? 'bg-[#ff4e00] text-black shadow-md shadow-[#ff4e00]/20'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Decision Knowledge Base
          </button>
        </div>
      </div>

      {activeSubTab === 'simulation' ? (
        /* Grid: Controls (Left) + AI Results (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Parameter Controls (5 cols) */}
          <div className="lg:col-span-5 bg-[#0d0d14] rounded-lg border border-[#ffffff15] p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                <Sliders className="w-4 h-4 text-[#ff4e00]" />
                Scenario Input Controls
              </h3>
              <button
                onClick={handleReset}
                className="text-[10px] text-[#888] hover:text-white font-mono uppercase underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Rainfall Intensity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#ccc] font-semibold flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-[#ff4e00]" />
                  Rainfall Rate Intensity
                </span>
                <span className="font-mono font-bold text-[#ff4e00]">{params.rainfallMmHr} mm/hr</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={params.rainfallMmHr}
                onChange={(e) => setParams({ ...params, rainfallMmHr: Number(e.target.value) })}
                className="w-full accent-[#ff4e00] bg-[#151520] rounded cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-[#666] font-mono">
                <span>20 mm/hr (Light)</span>
                <span>100 mm/hr (Heavy)</span>
                <span>200 mm/hr (Cloudburst)</span>
              </div>
            </div>

            {/* Chembarambakkam Dam Discharge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#ccc] font-semibold flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-blue-400" />
                  Upstream Dam Release Discharge
                </span>
                <span className="font-mono font-bold text-blue-400">{params.chembarambakkamReleaseM3s} m³/s</span>
              </div>
              <input
                type="range"
                min="100"
                max="3500"
                step="100"
                value={params.chembarambakkamReleaseM3s}
                onChange={(e) => setParams({ ...params, chembarambakkamReleaseM3s: Number(e.target.value) })}
                className="w-full accent-blue-500 bg-[#151520] rounded cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-[#666] font-mono">
                <span>100 m³/s</span>
                <span>1800 m³/s</span>
                <span>3500 m³/s (Sluice Open)</span>
              </div>
            </div>

            {/* Canal & Drainage Congestion */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#ccc] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Drainage & Canal Silt Blockage
                </span>
                <span className="font-mono font-bold text-amber-400">{params.canalBlockagePct}% Blocked</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.canalBlockagePct}
                onChange={(e) => setParams({ ...params, canalBlockagePct: Number(e.target.value) })}
                className="w-full accent-amber-500 bg-[#151520] rounded cursor-pointer h-2"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#ccc] font-semibold">Simulation Duration</span>
                <span className="font-mono font-bold text-white">{params.durationHours} Hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={params.durationHours}
                onChange={(e) => setParams({ ...params, durationHours: Number(e.target.value) })}
                className="w-full accent-gray-400 bg-[#151520] rounded cursor-pointer h-2"
              />
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-[#ffffff15] space-y-3">
              <label className="flex items-center justify-between cursor-pointer text-xs">
                <span className="text-[#ccc] font-semibold">High-Tide Estuarine Backwater Overlap</span>
                <input
                  type="checkbox"
                  checked={params.highTideOverlap}
                  onChange={(e) => setParams({ ...params, highTideOverlap: e.target.checked })}
                  className="w-4 h-4 accent-[#ff4e00] rounded cursor-pointer"
                />
              </label>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#ccc] font-semibold">Adyar Bridges Corridor</span>
                <select
                  value={params.bridgeStatus}
                  onChange={(e) => setParams({ ...params, bridgeStatus: e.target.value as any })}
                  className="bg-[#151520] border border-[#ffffff15] text-xs font-mono font-bold text-[#ff4e00] rounded p-1.5 focus:outline-none"
                >
                  <option value="open">Open (All Lanes Clear)</option>
                  <option value="restricted">Restricted (1 Lane Submerged)</option>
                  <option value="closed">Closed (Submerged/Barricaded)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isLoading}
              className="w-full py-3 bg-[#ff4e00] hover:bg-[#ff6a2b] text-black font-bold uppercase tracking-wider text-xs rounded shadow-lg shadow-[#ff4e00]/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-black ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Running Hydrodynamic Physics Model...' : 'Execute What-If Simulation'}</span>
            </button>

          </div>

          {/* Right Column: AI Simulation Results (7 cols) */}
          <div className="lg:col-span-7 bg-[#0d0d14] rounded-lg border border-[#ffffff15] p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                <Cpu className="w-4 h-4 text-[#ff4e00]" />
                Simulation Forecast Output
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/30 uppercase tracking-widest">
                {result?.simulatedTime || '+3h Scenario'}
              </span>
            </div>

            {result ? (
              <div className="space-y-5">
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#151520] p-3.5 rounded border border-[#ffffff10] text-center font-mono">
                    <span className="text-[10px] text-[#888] uppercase font-bold block tracking-wider">Flooded Sectors</span>
                    <span className="text-xl font-bold text-[#ff4e00] mt-1 block">{result.affectedZonesCount} Zones</span>
                  </div>
                  <div className="bg-[#151520] p-3.5 rounded border border-[#ffffff10] text-center font-mono">
                    <span className="text-[10px] text-[#888] uppercase font-bold block tracking-wider">Submerged Area</span>
                    <span className="text-xl font-bold text-blue-400 mt-1 block">{result.predictedSubmergedAreaKm2} km²</span>
                  </div>
                  <div className="bg-[#151520] p-3.5 rounded border border-[#ffffff10] text-center font-mono">
                    <span className="text-[10px] text-[#888] uppercase font-bold block tracking-wider">Pop. Impacted</span>
                    <span className="text-xl font-bold text-amber-400 mt-1 block">{result.estimatedAffectedPeople.toLocaleString()}</span>
                  </div>
                </div>

                {/* AI Narrative */}
                <div className="bg-[#151520] border-l-4 border-[#ff4e00] border-t border-b border-r border-[#ffffff10] p-4 rounded text-xs space-y-1.5 font-sans">
                  <span className="font-mono font-bold text-[#ff4e00] uppercase text-[10px] tracking-widest block">
                    AI Hydrodynamic Rationale:
                  </span>
                  <p className="text-[#ccc] leading-relaxed font-medium">
                    {result.aiSummary}
                  </p>
                </div>

                {/* Critical Road Closures */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-widest">
                    Predicted Road & Corridor Closures:
                  </h4>
                  <div className="space-y-1.5">
                    {result.criticalRoadBlocks.map((block, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#151520] p-2.5 rounded border border-[#ff4e00]/30 text-xs text-[#ff4e00] font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ff4e00] shrink-0" />
                        <span>{block}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommended Pre-Positioning */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-widest">
                    AI Recommended Pre-Positioning:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {result.recommendedDeployments.map((dep, idx) => (
                      <div key={idx} className="bg-[#151520] p-2.5 rounded border border-[#ffffff10] text-xs font-mono">
                        <span className="font-bold text-emerald-400 block">{dep.count}x {dep.type}</span>
                        <span className="text-[10px] text-[#888]">Target: {dep.zone}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-[#666] text-xs font-mono">
                Adjust scenario inputs and click "Execute What-If Simulation" to view hydrodynamic forecasts.
              </div>
            )}

          </div>

        </div>
      ) : (
        /* Decision Knowledge Base & Scenario Matching View */
        <div className="space-y-6">
          
          {/* Matcher Trigger Banner */}
          <div className="bg-[#0d0d14] p-5 rounded-lg border border-[#ffffff15] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 w-fit mb-2">
                <GitCompare className="w-3.5 h-3.5 text-blue-400" />
                Live-to-Knowledge Base Matcher
              </span>
              <h3 className="text-lg font-bold text-white font-sans">
                Match Live Disaster State Against Top-K Historical Simulations
              </h3>
              <p className="text-xs text-[#aaa]">
                Performs multi-dimensional vector matching across rainfall rates, river levels, dam releases, and traffic bottlenecks to extract historically proven strategies.
              </p>
            </div>

            <button
              onClick={handleRunScenarioMatch}
              disabled={isMatching}
              className="px-5 py-2.5 bg-[#ff4e00] hover:bg-[#ff6a2b] text-black font-bold uppercase tracking-wider text-xs rounded shadow-lg shadow-[#ff4e00]/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Search className={`w-3.5 h-3.5 ${isMatching ? 'animate-spin' : ''}`} />
              <span>{isMatching ? 'Searching Knowledge Base...' : 'Run Scenario Matching Engine'}</span>
            </button>
          </div>

          {/* Matched Scenarios Display */}
          {scenarioMatches && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#ffffff15] pb-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#ff4e00]">
                  Top Matched Historical Disaster Scenarios:
                </h4>
                <span className="text-[10px] font-mono text-[#888]">
                  Master Strategy: {scenarioMatches.recommendedMasterPlan}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarioMatches.matchedScenarios.map((sim: any) => (
                  <div key={sim.id} className="bg-[#0d0d14] border border-[#ffffff15] p-5 rounded-lg space-y-3 font-sans">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                          {sim.similarityPct}% HISTORICAL SIMILARITY
                        </span>
                        <h4 className="font-bold text-white text-sm mt-1.5">{sim.historicalEvent}</h4>
                      </div>
                    </div>

                    <div className="bg-[#151520] p-3 rounded border border-[#ffffff10] text-xs space-y-1.5 font-mono">
                      <span className="text-[10px] text-[#888] uppercase block font-bold">Key Pattern Matches:</span>
                      <ul className="list-disc list-inside text-[#ccc] space-y-0.5 text-[11px]">
                        {sim.keyMatches.map((km: string, idx: number) => (
                          <li key={idx}>{km}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono font-bold text-[#ff4e00] uppercase block">Retrieved Effective Strategy:</span>
                      <p className="text-[#ccc] bg-[#151520] p-2.5 rounded border border-[#ffffff10] font-sans">
                        {sim.retrievedStrategy}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase block">AI Refinement For Live Event:</span>
                      <p className="text-[#ccc] bg-[#151520] p-2.5 rounded border border-emerald-500/30 font-sans">
                        {sim.aiRefinement}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Knowledge Base Repository Table */}
          <div className="bg-[#0d0d14] rounded-lg border border-[#ffffff15] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ffffff15] pb-3">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                <BookOpen className="w-4 h-4 text-[#ff4e00]" />
                Decision Knowledge Base Repository
              </h3>
              <span className="text-[10px] font-mono text-[#888]">
                Stored Simulations: 124 Events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#ccc]">
                <thead className="bg-[#0a0a0f] text-[#888] uppercase text-[10px] font-mono tracking-widest border-b border-[#ffffff15]">
                  <tr>
                    <th className="p-3">Scenario ID</th>
                    <th className="p-3">Rainfall / Dam Parameters</th>
                    <th className="p-3">Generated Actions</th>
                    <th className="p-3">Effectiveness Score</th>
                    <th className="p-3">Lessons Learned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ffffff10] font-mono">
                  <tr className="hover:bg-[#151520] transition-all">
                    <td className="p-3 font-bold text-white">SIM-2015-12-01</td>
                    <td className="p-3 text-[#aaa]">Rain: 120mm/hr | Dam: 2200m³/s</td>
                    <td className="p-3 text-emerald-400">Pre-evacuate Kotturpuram + Deploy 6 Boats</td>
                    <td className="p-3 font-bold text-emerald-400">92% Score</td>
                    <td className="p-3 text-[#888] font-sans">Pre-positioning boats prior to T+30m cuts rescue delays by 42%.</td>
                  </tr>
                  <tr className="hover:bg-[#151520] transition-all">
                    <td className="p-3 font-bold text-white">SIM-2021-11-25</td>
                    <td className="p-3 text-[#aaa]">Rain: 85mm/hr | Silt Block: 80%</td>
                    <td className="p-3 text-emerald-400">Station 500HP Pumps at Velachery Canal</td>
                    <td className="p-3 font-bold text-emerald-400">88% Score</td>
                    <td className="p-3 text-[#888] font-sans">Early dewatering prevents standing water accumulation in ground floors.</td>
                  </tr>
                  <tr className="hover:bg-[#151520] transition-all">
                    <td className="p-3 font-bold text-white">SIM-2023-12-04</td>
                    <td className="p-3 text-[#aaa]">Rain: 140mm/hr | High Tide Overlap</td>
                    <td className="p-3 text-amber-400">Automated Barrier at Guindy Railway Subway</td>
                    <td className="p-3 font-bold text-emerald-400">95% Score</td>
                    <td className="p-3 text-[#888] font-sans">Early subway closure prevents vehicle trapping and traffic gridlock.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
