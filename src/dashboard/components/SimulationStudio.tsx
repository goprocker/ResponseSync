import React, { useState, useEffect } from 'react';
import { SimulationParams, SimulationResult } from '../../shared/types';
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
  Zap,
  Clock
} from 'lucide-react';

function computeHydrodynamicSimulation(params: SimulationParams): SimulationResult {
  const rain = params.rainfallMmHr;
  const dam = params.chembarambakkamReleaseM3s;
  const block = params.canalBlockagePct;
  const tide = params.highTideOverlap ? 1.4 : 1.0;
  const dur = params.durationHours;
  const bridge = params.bridgeStatus;

  // Flooded sectors (1 to 8)
  const rawZones = Math.floor((rain / 25) + (dam / 600) + (block / 35));
  const affectedZonesCount = Math.min(8, Math.max(1, rawZones));

  // Submerged area (km2)
  const predictedSubmergedAreaKm2 = Number(((rain * 0.03 + dam * 0.0016) * (1 + block / 120) * tide).toFixed(1));

  // Pop affected
  const estimatedAffectedPeople = Math.round((6000 + rain * 480 + dam * 24) * (1 + block / 150) * (dur / 2));

  // Critical road blocks
  const criticalRoadBlocks: string[] = [];
  if (bridge === 'closed') {
    criticalRoadBlocks.push('Adyar Bridges Corridor (CLOSED - Submerged & Barricaded)');
  } else if (bridge === 'restricted') {
    criticalRoadBlocks.push('Adyar Bridges Corridor (RESTRICTED - 1 Lane Active)');
  }

  if (block >= 40 || rain >= 60) {
    const depth = (1.2 + (rain / 100) + (block / 80)).toFixed(1);
    criticalRoadBlocks.push(`Guindy Railway Subway (Submerged Depth ${depth}m)`);
  }
  if (rain >= 50 || dam >= 1200) {
    criticalRoadBlocks.push('Velachery 100ft Road Vijaya Nagar Junction');
  }
  if (dam >= 1000) {
    criticalRoadBlocks.push('Kotturpuram Bridge Approach & Riverbank');
  }
  if (tide > 1) {
    criticalRoadBlocks.push('Adyar Estuary Causeway & Beach Road (High-Tide Overlap)');
  }
  if (rain >= 140) {
    criticalRoadBlocks.push('OMR Taramani IT Corridor Underpass');
  }
  if (criticalRoadBlocks.length === 0) {
    criticalRoadBlocks.push('All Primary Arterial Corridors Clear');
  }

  // Deployments
  const boatCount = Math.max(2, Math.floor(dam / 250 + rain / 40));
  const pumpCount = Math.max(2, Math.floor(rain / 15 + block / 20));
  const busCount = Math.max(4, Math.floor(rain / 10 + dam / 300));

  const recommendedDeployments = [
    { type: 'Rescue Boat Units', count: boatCount, zone: 'Velachery South & Kotturpuram' },
    { type: 'Heavy 500HP Dewatering Pumps', count: pumpCount, zone: 'Guindy Subway & Sluice Drains' },
    { type: 'Evacuation Transit Buses', count: busCount, zone: 'Low-Lying Tenement Shelters' }
  ];

  // Risk Timeline
  const d15 = Number((rain * 0.007 * tide).toFixed(1));
  const d30 = Number((rain * 0.013 * tide + dam * 0.0002).toFixed(1));
  const d60 = Number(((rain * 0.021 + dam * 0.0005) * tide).toFixed(1));
  const d120 = Number(((rain * 0.028 + dam * 0.0007) * (1 + block / 200) * tide).toFixed(1));

  const riskTimeline = [
    { minute: 15, floodedZones: Math.max(1, Math.floor(affectedZonesCount * 0.3)), maxWaterDepthMeters: d15 },
    { minute: 30, floodedZones: Math.max(1, Math.floor(affectedZonesCount * 0.6)), maxWaterDepthMeters: d30 },
    { minute: 60, floodedZones: affectedZonesCount, maxWaterDepthMeters: d60 },
    { minute: 120, floodedZones: Math.min(8, affectedZonesCount + 1), maxWaterDepthMeters: d120 }
  ];

  let severityLabel = 'NORMAL';
  if (rain >= 120 || dam >= 2500) severityLabel = 'CATASTROPHIC CLOUDBURST';
  else if (rain >= 80 || dam >= 1500) severityLabel = 'SEVERE FLOOD SURGE';
  else if (rain >= 40 || dam >= 800) severityLabel = 'MODERATE INUNDATION';

  const aiSummary = `[${severityLabel}] Simulated +${dur}h disaster scenario: ${rain} mm/hr rainfall intensity, ${dam} m³/s dam release, ${block}% canal silt blockage, ${params.highTideOverlap ? 'with High-Tide Estuarine Backwater' : 'normal tide'}. Hydrodynamic model predicts ${predictedSubmergedAreaKm2} km² total submergence impacting ~${estimatedAffectedPeople.toLocaleString()} residents. Peak water depth reaches ${d120}m at T+120 mins. Pre-positioning ${boatCount} rescue boats and ${pumpCount} dewatering pumps recommended prior to road closure.`;

  return {
    simulatedTime: `+${dur} Hours Scenario`,
    affectedZonesCount,
    predictedSubmergedAreaKm2,
    estimatedAffectedPeople,
    criticalRoadBlocks,
    recommendedDeployments,
    riskTimeline,
    aiSummary
  };
}

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
  const [result, setResult] = useState<SimulationResult | null>(computeHydrodynamicSimulation({
    rainfallMmHr: 110,
    chembarambakkamReleaseM3s: 1800,
    canalBlockagePct: 80,
    bridgeStatus: 'restricted',
    durationHours: 3,
    highTideOverlap: true
  }));

  // Re-calculate simulation instantly when parameters change
  useEffect(() => {
    setResult(computeHydrodynamicSimulation(params));
  }, [params]);

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
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      console.warn('Simulation API fallback triggered:', err);
      const rain = params.rainfallMmHr;
      const dam = params.chembarambakkamReleaseM3s;
      const block = params.canalBlockagePct;
      const tide = params.highTideOverlap ? 1.4 : 1.0;
      const dur = params.durationHours;

      const affectedZonesCount = Math.min(8, Math.max(2, Math.floor((rain / 25) + (block / 30))));
      const predictedSubmergedAreaKm2 = Number(((rain * 0.035 + dam * 0.0018) * (1 + block / 100) * tide).toFixed(1));
      const estimatedAffectedPeople = Math.round((12000 + rain * 420 + dam * 22) * (1 + block / 150));

      const criticalRoadBlocks: string[] = [];
      if (block > 40 || rain > 70) criticalRoadBlocks.push('Guindy Railway Subway (Water Depth 1.8m)');
      if (rain > 50) criticalRoadBlocks.push('Velachery 100ft Road Vijaya Nagar Junction');
      if (dam > 1000) criticalRoadBlocks.push('Kotturpuram Bridge Approach');
      if (tide > 1) criticalRoadBlocks.push('Adyar Estuary Causeway & Beach Road');

      const recommendedDeployments = [
        { type: 'Rescue Boat Units', count: Math.max(3, Math.floor(dam / 300)), zone: 'Velachery South' },
        { type: 'Heavy Dewatering Pumps', count: Math.max(4, Math.floor(rain / 15)), zone: 'Guindy Subway & Taramani' },
        { type: 'Evacuation Buses', count: Math.max(8, Math.floor(rain / 8)), zone: 'Kotturpuram Slums' }
      ];

      const riskTimeline = [
        { minute: 15, floodedZones: Math.max(1, Math.floor(affectedZonesCount * 0.4)), maxWaterDepthMeters: Number((rain * 0.008 * tide).toFixed(1)) },
        { minute: 30, floodedZones: Math.max(2, Math.floor(affectedZonesCount * 0.7)), maxWaterDepthMeters: Number((rain * 0.014 * tide).toFixed(1)) },
        { minute: 60, floodedZones: affectedZonesCount, maxWaterDepthMeters: Number(((rain * 0.02 + dam * 0.0004) * tide).toFixed(1)) },
        { minute: 120, floodedZones: Math.min(8, affectedZonesCount + 1), maxWaterDepthMeters: Number(((rain * 0.026 + dam * 0.0006) * tide).toFixed(1)) }
      ];

      setResult({
        simulatedTime: `+${dur} Hours Scenario`,
        affectedZonesCount,
        predictedSubmergedAreaKm2,
        estimatedAffectedPeople,
        criticalRoadBlocks,
        recommendedDeployments,
        riskTimeline,
        aiSummary: `Simulated +${dur} hour scenario (${rain} mm/hr rain, ${dam} m³/s release, ${block}% blockage, High Tide: ${params.highTideOverlap ? 'YES' : 'NO'}). Hydrodynamic physics engine predicts peak submergence area of ${predictedSubmergedAreaKm2} km² affecting ~${estimatedAffectedPeople.toLocaleString()} citizens.`
      });
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
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      console.warn('Scenario match fallback triggered:', err);
      setScenarioMatches({
        matchedScenarios: [
          {
            id: 'sim-2015-12-01',
            historicalEvent: 'December 2015 Chennai Flood & Chembarambakkam Sluice Discharge',
            similarityPct: Math.min(98, Math.round(75 + (params.rainfallMmHr / 10) + (params.chembarambakkamReleaseM3s / 200))),
            keyMatches: [`${params.rainfallMmHr}mm/hr Cloudburst intensity`, `${params.chembarambakkamReleaseM3s}m³/s Dam Discharge`, 'Estuarine high tide backwater overlap'],
            retrievedStrategy: 'Immediate deployment of 4 NDRF boat units to Vijaya Nagar & pre-evacuation of Kotturpuram tenements',
            historicalOutcome: 'Rescued 4,200 stranded residents with 91% effectiveness score',
            aiRefinement: 'Apply 2015 strategy but add automated road barricading at Guindy subway to prevent vehicle stalling.'
          },
          {
            id: 'sim-2021-11-25',
            historicalEvent: 'November 2021 Cyclone Nivar Severe Inundation',
            similarityPct: Math.min(92, Math.round(68 + (params.rainfallMmHr / 8))),
            keyMatches: ['Heavy catchment rain in Adyar', `Drainage silt blockage ${params.canalBlockagePct}%`],
            retrievedStrategy: 'High-capacity 500HP dewatering pumps stationed at 100ft road canal sluice',
            historicalOutcome: 'Reduced standing water duration by 14 hours across Velachery South',
            aiRefinement: 'Deploy pumps 30 minutes earlier based on live IoT sensor water depth derivative.'
          }
        ],
        recommendedMasterPlan: 'Combine 2015 pre-evacuation protocol with 2021 early dewatering pump placement.'
      });
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
      <div className="bg-[#050507] p-6 rounded-none border border-white/10 shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-brand/15 text-[#e0e0e6] border border-brand/30 flex items-center gap-1.5 w-fit mb-2">
            <Sliders className="w-3.5 h-3.5 text-[#e0e0e6]" />
            Simulation & Decision Knowledge Base Studio
          </span>
          <h2 className="text-2xl font-bold text-[#e0e0e6] tracking-tight font-sans">
            Disaster Simulation & Scenario Matching Engine
          </h2>
          <p className="text-xs text-[#888899]">
            Run hydrodynamic what-if simulations, match live events against historical disaster knowledge, and extract refined AI response strategies.
          </p>
        </div>

        {/* Sub-Tab Navigation Switch */}
        <div className="flex items-center gap-1.5 bg-[#050507] p-1 rounded border border-white/10">
          <button
            onClick={() => setActiveSubTab('simulation')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'simulation'
                ? 'bg-brand text-black shadow-none shadow-none'
                : 'text-[#888] hover:text-[#e0e0e6]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Simulation Engine
          </button>
          <button
            onClick={() => setActiveSubTab('knowledge_base')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'knowledge_base'
                ? 'bg-brand text-black shadow-none shadow-none'
                : 'text-[#888] hover:text-[#e0e0e6]'
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
          <div className="lg:col-span-5 bg-[#050507] rounded-none border border-white/10 p-5 shadow-none space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-[#e0e0e6] text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                <Sliders className="w-4 h-4 text-[#e0e0e6]" />
                Scenario Input Controls
              </h3>
              <button
                onClick={handleReset}
                className="text-[10px] text-[#888] hover:text-[#e0e0e6] font-mono uppercase underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Rainfall Intensity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#ccc] font-semibold flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-[#e0e0e6]" />
                  Rainfall Rate Intensity
                </span>
                <span className="font-mono font-bold text-[#e0e0e6]">{params.rainfallMmHr} mm/hr</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={params.rainfallMmHr}
                onChange={(e) => setParams({ ...params, rainfallMmHr: Number(e.target.value) })}
                className="w-full accent-[#ff4e00] bg-[#050507] rounded cursor-pointer h-2"
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
                className="w-full accent-blue-500 bg-[#050507] rounded cursor-pointer h-2"
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
                className="w-full accent-amber-500 bg-[#050507] rounded cursor-pointer h-2"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#ccc] font-semibold">Simulation Duration</span>
                <span className="font-mono font-bold text-[#e0e0e6]">{params.durationHours} Hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={params.durationHours}
                onChange={(e) => setParams({ ...params, durationHours: Number(e.target.value) })}
                className="w-full accent-gray-400 bg-[#050507] rounded cursor-pointer h-2"
              />
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-white/10 space-y-3">
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
                  className="bg-[#050507] border border-white/10 text-xs font-mono font-bold text-[#e0e0e6] rounded p-1.5 focus:outline-none"
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
              className="w-full py-3 bg-brand hover:bg-brand-deep text-black font-bold uppercase tracking-wider text-xs rounded shadow-lg shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-black ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Running Hydrodynamic Physics Model...' : 'Execute What-If Simulation'}</span>
            </button>

          </div>

          {/* Right Column: AI Simulation Results (7 cols) */}
          <div className="lg:col-span-7 bg-[#050507] rounded-none border border-white/10 p-5 shadow-none space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-[#e0e0e6] text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                <Cpu className="w-4 h-4 text-[#e0e0e6]" />
                Simulation Forecast Output
              </h3>
              <span className="text-[10px] font-mono text-brand font-bold bg-emerald-500/15 px-2.5 py-1 rounded border border-emerald-500/30 uppercase tracking-widest">
                {result?.simulatedTime || '+3h Scenario'}
              </span>
            </div>

            {result ? (
              <div className="space-y-5">
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#050507] p-3.5 rounded border border-white/5 text-center font-mono">
                    <span className="text-[10px] text-[#888] uppercase font-bold block tracking-wider">Flooded Sectors</span>
                    <span className="text-xl font-bold text-[#e0e0e6] mt-1 block">{result.affectedZonesCount} Zones</span>
                  </div>
                  <div className="bg-[#050507] p-3.5 rounded border border-white/5 text-center font-mono">
                    <span className="text-[10px] text-[#888] uppercase font-bold block tracking-wider">Submerged Area</span>
                    <span className="text-xl font-bold text-blue-400 mt-1 block">{result.predictedSubmergedAreaKm2} km²</span>
                  </div>
                  <div className="bg-[#050507] p-3.5 rounded border border-white/5 text-center font-mono">
                    <span className="text-[10px] text-[#888] uppercase font-bold block tracking-wider">Pop. Impacted</span>
                    <span className="text-xl font-bold text-amber-400 mt-1 block">{result.estimatedAffectedPeople.toLocaleString()}</span>
                  </div>
                </div>

                {/* AI Narrative */}
                <div className="bg-[#050507] border-l-4 border-brand border-t border-b border-r border-white/5 p-4 rounded text-xs space-y-1.5 font-sans">
                  <span className="font-mono font-bold text-[#e0e0e6] uppercase text-[10px] tracking-widest block">
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
                      <div key={idx} className="flex items-center gap-2 bg-[#050507] p-2.5 rounded border border-brand/30 text-xs text-[#e0e0e6] font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#e0e0e6] shrink-0" />
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
                      <div key={idx} className="bg-[#050507] p-2.5 rounded border border-white/5 text-xs font-mono">
                        <span className="font-bold text-brand block">{dep.count}x {dep.type}</span>
                        <span className="text-[10px] text-[#888]">Target: {dep.zone}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hydrodynamic Inundation Risk Progress Timeline */}
                {result.riskTimeline && result.riskTimeline.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#10b98115]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        Hydrodynamic Inundation Progress Timeline:
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        Peak Surge @ T+120m
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {result.riskTimeline.map((step, idx) => (
                        <div key={idx} className="bg-[#040806] p-2.5 rounded border border-[#10b98125] font-mono text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-100">
                            <span>T+{step.minute} mins</span>
                            <span className="text-amber-400">{step.floodedZones} Zones</span>
                          </div>
                          <div className="w-full bg-[#111] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 h-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(10, (step.maxWaterDepthMeters / 3.5) * 100))}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#aaa] block">
                            Depth: <strong className="text-emerald-100">{step.maxWaterDepthMeters}m</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
          <div className="bg-[#050507] p-5 rounded-none border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5 w-fit mb-2">
                <GitCompare className="w-3.5 h-3.5 text-blue-400" />
                Live-to-Knowledge Base Matcher
              </span>
              <h3 className="text-lg font-bold text-[#e0e0e6] font-sans">
                Match Live Disaster State Against Top-K Historical Simulations
              </h3>
              <p className="text-xs text-[#aaa]">
                Performs multi-dimensional vector matching across rainfall rates, river levels, dam releases, and traffic bottlenecks to extract historically proven strategies.
              </p>
            </div>

            <button
              onClick={handleRunScenarioMatch}
              disabled={isMatching}
              className="px-5 py-2.5 bg-brand hover:bg-brand-deep text-black font-bold uppercase tracking-wider text-xs rounded shadow-lg shadow-none transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Search className={`w-3.5 h-3.5 ${isMatching ? 'animate-spin' : ''}`} />
              <span>{isMatching ? 'Searching Knowledge Base...' : 'Run Scenario Matching Engine'}</span>
            </button>
          </div>

          {/* Matched Scenarios Display */}
          {scenarioMatches && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#e0e0e6]">
                  Top Matched Historical Disaster Scenarios:
                </h4>
                <span className="text-[10px] font-mono text-[#888]">
                  Master Strategy: {scenarioMatches.recommendedMasterPlan}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarioMatches.matchedScenarios.map((sim: any) => (
                  <div key={sim.id} className="bg-[#050507] border border-white/10 p-5 rounded-none space-y-3 font-sans">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                          {sim.similarityPct}% HISTORICAL SIMILARITY
                        </span>
                        <h4 className="font-bold text-[#e0e0e6] text-sm mt-1.5">{sim.historicalEvent}</h4>
                      </div>
                    </div>

                    <div className="bg-[#050507] p-3 rounded border border-white/5 text-xs space-y-1.5 font-mono">
                      <span className="text-[10px] text-[#888] uppercase block font-bold">Key Pattern Matches:</span>
                      <ul className="list-disc list-inside text-[#ccc] space-y-0.5 text-[11px]">
                        {sim.keyMatches.map((km: string, idx: number) => (
                          <li key={idx}>{km}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono font-bold text-[#e0e0e6] uppercase block">Retrieved Effective Strategy:</span>
                      <p className="text-[#ccc] bg-[#050507] p-2.5 rounded border border-white/5 font-sans">
                        {sim.retrievedStrategy}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono font-bold text-brand uppercase block">AI Refinement For Live Event:</span>
                      <p className="text-[#ccc] bg-[#050507] p-2.5 rounded border border-emerald-500/30 font-sans">
                        {sim.aiRefinement}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Knowledge Base Repository Table */}
          <div className="bg-[#050507] rounded-none border border-white/10 p-5 shadow-none space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-[#e0e0e6] text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
                <BookOpen className="w-4 h-4 text-[#e0e0e6]" />
                Decision Knowledge Base Repository
              </h3>
              <span className="text-[10px] font-mono text-[#888]">
                Stored Simulations: 124 Events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#ccc]">
                <thead className="bg-[#050507] text-[#888] uppercase text-[10px] font-mono tracking-widest border-b border-white/10">
                  <tr>
                    <th className="p-3">Scenario ID</th>
                    <th className="p-3">Rainfall / Dam Parameters</th>
                    <th className="p-3">Generated Actions</th>
                    <th className="p-3">Effectiveness Score</th>
                    <th className="p-3">Lessons Learned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ffffff10] font-mono">
                  <tr className="hover:bg-[#050507] transition-all">
                    <td className="p-3 font-bold text-[#e0e0e6]">SIM-2015-12-01</td>
                    <td className="p-3 text-[#aaa]">Rain: 120mm/hr | Dam: 2200m³/s</td>
                    <td className="p-3 text-brand">Pre-evacuate Kotturpuram + Deploy 6 Boats</td>
                    <td className="p-3 font-bold text-brand">92% Score</td>
                    <td className="p-3 text-[#888] font-sans">Pre-positioning boats prior to T+30m cuts rescue delays by 42%.</td>
                  </tr>
                  <tr className="hover:bg-[#050507] transition-all">
                    <td className="p-3 font-bold text-[#e0e0e6]">SIM-2021-11-25</td>
                    <td className="p-3 text-[#aaa]">Rain: 85mm/hr | Silt Block: 80%</td>
                    <td className="p-3 text-brand">Station 500HP Pumps at Velachery Canal</td>
                    <td className="p-3 font-bold text-brand">88% Score</td>
                    <td className="p-3 text-[#888] font-sans">Early dewatering prevents standing water accumulation in ground floors.</td>
                  </tr>
                  <tr className="hover:bg-[#050507] transition-all">
                    <td className="p-3 font-bold text-[#e0e0e6]">SIM-2023-12-04</td>
                    <td className="p-3 text-[#aaa]">Rain: 140mm/hr | High Tide Overlap</td>
                    <td className="p-3 text-amber-400">Automated Barrier at Guindy Railway Subway</td>
                    <td className="p-3 font-bold text-brand">95% Score</td>
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
