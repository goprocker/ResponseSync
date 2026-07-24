import React, { useState, useEffect } from 'react';
import { SimulationParams, SimulationResult, PredictedRoadCorridor, DeploymentRecommendation } from '../../shared/types';
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
  const rawZones = Math.floor((rain / 20) + (dam / 500) + (block / 30));
  const affectedZonesCount = Math.min(8, Math.max(1, rawZones));

  // Submerged area (km2)
  const predictedSubmergedAreaKm2 = Number(((rain * 0.032 + dam * 0.0019) * (1 + block / 100) * tide).toFixed(1));

  // Pop affected
  const estimatedAffectedPeople = Math.round((5000 + rain * 520 + dam * 28) * (1 + block / 120) * (dur / 2.5));

  // Dynamic Rich Predicted Road Corridors
  const depthGuindy = Number((1.1 + (rain / 90) + (block / 70)).toFixed(1));
  const depthVelachery = Number((0.8 + (rain / 110) + (dam / 2000)).toFixed(1));
  const depthKotturpuram = Number((0.5 + (dam / 1200)).toFixed(1));
  const depthEstuary = Number((0.6 + (params.highTideOverlap ? 0.9 : 0.2)).toFixed(1));
  const depthOMR = Number((0.4 + (rain / 130)).toFixed(1));

  const predictedRoadCorridors: PredictedRoadCorridor[] = [
    {
      roadName: 'Guindy Railway Subway Corridor',
      submergenceDepthMeters: depthGuindy,
      timeToImpassableMin: Math.max(10, Math.round(45 - rain / 4)),
      status: depthGuindy >= 1.8 ? 'CLOSED' : 'RESTRICTED',
      recommendedDetour: 'Detour via Kathipara Flyover & Inner Ring Road Elevated Bypass',
      vehicleRestriction: depthGuindy >= 1.8 ? 'BARRED: All Civilian & Standard Emergency Vehicles' : 'RESTRICTED: Heavy Emergency Vehicles Only',
      affectedCorridorLengthKm: 1.4
    },
    {
      roadName: 'Velachery 100ft Road Vijaya Nagar Junction',
      submergenceDepthMeters: depthVelachery,
      timeToImpassableMin: Math.max(15, Math.round(50 - dam / 100)),
      status: rain >= 90 || dam >= 1800 ? 'CLOSED' : 'WARNING',
      recommendedDetour: 'Divert via Taramani Link Road & OMR Radial Expressway',
      vehicleRestriction: rain >= 90 ? 'BARRED: Light Motor Vehicles & Two-Wheelers' : 'SLOW: Heavy Transit Vehicles Only',
      affectedCorridorLengthKm: 2.8
    },
    {
      roadName: 'Kotturpuram Bridge Approach & Riverbank',
      submergenceDepthMeters: depthKotturpuram,
      timeToImpassableMin: Math.max(20, Math.round(60 - dam / 120)),
      status: dam >= 1200 ? 'CLOSED' : 'RESTRICTED',
      recommendedDetour: 'Divert via Anna Salai & Nandanam Signal Junction',
      vehicleRestriction: dam >= 1200 ? 'BARRED: Submerged Bank Approach' : 'CAUTION: River Surge Outflow',
      affectedCorridorLengthKm: 1.8
    },
    {
      roadName: 'Adyar Estuary Causeway & Beach Road',
      submergenceDepthMeters: depthEstuary,
      timeToImpassableMin: Math.max(12, Math.round(35 - (params.highTideOverlap ? 15 : 0))),
      status: params.highTideOverlap ? 'CLOSED' : 'WARNING',
      recommendedDetour: 'Detour via Thiruvanmiyur Signal & ECR Main Corridor',
      vehicleRestriction: params.highTideOverlap ? 'BARRED: High-Tide Estuarine Surge' : 'WARNING: Tidal Backwater Spray',
      affectedCorridorLengthKm: 3.1
    }
  ];

  if (rain >= 120) {
    predictedRoadCorridors.push({
      roadName: 'OMR Taramani IT Corridor Underpass',
      submergenceDepthMeters: depthOMR,
      timeToImpassableMin: Math.max(15, Math.round(40 - rain / 5)),
      status: 'CLOSED',
      recommendedDetour: 'Divert via Perungudi Bypass Expressway',
      vehicleRestriction: 'BARRED: All Light & Heavy Traffic',
      affectedCorridorLengthKm: 2.2
    });
  }

  // Legacy string array for backward compatibility
  const criticalRoadBlocks = predictedRoadCorridors.map(c => `${c.roadName} (${c.status} - Depth ${c.submergenceDepthMeters}m, Impassable T+${c.timeToImpassableMin}m)`);

  // Dynamic AI Recommended Deployments with Decision Knowledge Base Precedents
  const boatCount = Math.max(2, Math.floor(dam / 220 + rain / 35));
  const pumpCount = Math.max(2, Math.floor(rain / 12 + block / 18));
  const busCount = Math.max(4, Math.floor(rain / 8 + dam / 250));
  const generatorCount = rain >= 80 || dam >= 1200 ? Math.max(2, Math.floor(rain / 30)) : 0;

  const recommendedDeployments: DeploymentRecommendation[] = [
    {
      type: 'Rescue Boat Units',
      count: boatCount,
      zone: dam >= 1500 ? 'Kotturpuram Riverbank & Velachery South' : 'Velachery Vijaya Nagar Junction',
      priority: dam >= 1500 ? 'CRITICAL' : 'HIGH',
      expectedImpact: 'Cuts rescue response delay by 58% & neutralizes ground-floor entrapment',
      knowledgeBasePrecedent: 'Citing Dec 2015 Cloudburst (94% Match) - Pre-evacuation protocol'
    },
    {
      type: 'Heavy 500HP Dewatering Pumps',
      count: pumpCount,
      zone: block >= 50 ? 'Guindy Subway & Velachery Sluice Drains' : 'Taramani Canal Sluice Gate',
      priority: block >= 60 ? 'CRITICAL' : 'HIGH',
      expectedImpact: 'Prevents standing water accumulation & clears subway 14 hours faster',
      knowledgeBasePrecedent: 'Citing Nov 2021 Cyclone Nivar (86% Match) - Early dewatering placement'
    },
    {
      type: 'Evacuation Transit Buses',
      count: busCount,
      zone: 'Low-Lying Tenement Shelters & Kotturpuram',
      priority: 'HIGH',
      expectedImpact: 'Transport vulnerable citizens to high-ground relief centers prior to road closure',
      knowledgeBasePrecedent: 'Citing Dec 2023 Cyclone Michaung (89% Match) - Tenement evacuation'
    }
  ];
  if (generatorCount > 0) {
    recommendedDeployments.push({
      type: 'Emergency Diesel Generators',
      count: generatorCount,
      zone: 'Hospital Critical ICU Power Feeders (Apollo & Guindy Specialty)',
      priority: 'CRITICAL',
      expectedImpact: 'Maintains 100% ICU ventilator power continuity for critical patients',
      knowledgeBasePrecedent: 'Citing Dec 2023 Cyclone Michaung (89% Match) - ICU Power Redundancy'
    });
  }

  // Dynamic Inundation Risk Progress Timeline
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

  // Knowledge Base Citation
  let matchedEvent = 'November 2021 Cyclone Nivar Severe Inundation';
  let similarityPct = 86;
  let retrievedStrategy = 'Station high-capacity 500HP diesel dewatering pumps at 100ft road canal sluice gate and subway.';
  let historicalOutcome = 'Reduced standing water duration by 18 hours across Velachery South.';
  let aiRefinement = `Deploy ${pumpCount} mobile pumps 30 mins earlier based on live water depth derivative.`;

  if (rain >= 100 || dam >= 1800) {
    matchedEvent = 'December 2015 Chennai Cloudburst & Chembarambakkam Release';
    similarityPct = Math.min(99, Math.round(75 + (rain / 10) + (dam / 200)));
    retrievedStrategy = 'Deployment of 6 NDRF motorboat units to Velachery 100ft road; pre-evacuation of Kotturpuram riverbank tenements.';
    historicalOutcome = 'Rescued 14,200 stranded residents with 91% effectiveness score.';
    aiRefinement = `Apply 2015 rescue protocol for live conditions (${rain}mm/hr rain, ${dam}m³/s discharge) and enforce automated barricading at Guindy subway.`;
  } else if (rain >= 130) {
    matchedEvent = 'December 2023 Cyclone Michaung Catastrophic Inundation';
    similarityPct = 92;
    retrievedStrategy = 'Pre-position mobile emergency generators at hospital feeders and deploy amphibious rescue vehicles.';
    historicalOutcome = 'Maintained critical ICU power at 100% continuity; evacuated 6,800 citizens.';
    aiRefinement = 'Integrate SAR satellite mapping for live flood extent validation.';
  }

  const aiSummary = `[${severityLabel}] Simulated +${dur}h scenario (${rain} mm/hr rain, ${dam} m³/s release, ${block}% canal blockage, ${params.highTideOverlap ? 'High-Tide Surge ON' : 'Normal Tide'}). Hydrodynamic model predicts ${predictedSubmergedAreaKm2} km² submergence impacting ~${estimatedAffectedPeople.toLocaleString()} residents. Peak water depth reaches ${d120}m at T+120m. Citing ${matchedEvent} (${similarityPct}% Knowledge Base Match): Pre-position ${boatCount} boat units and ${pumpCount} heavy pumps prior to road closures.`;

  return {
    simulatedTime: `+${dur} Hours Scenario`,
    affectedZonesCount,
    predictedSubmergedAreaKm2,
    estimatedAffectedPeople,
    criticalRoadBlocks,
    predictedRoadCorridors,
    recommendedDeployments,
    riskTimeline,
    aiSummary,
    knowledgeBaseCitation: {
      matchedEvent,
      similarityPct,
      retrievedStrategy,
      historicalOutcome,
      aiRefinement
    }
  };
}

// Knowledge Base Scenario Matching Engine Function
function computeScenarioMatches(params: SimulationParams) {
  const rain = params.rainfallMmHr;
  const dam = params.chembarambakkamReleaseM3s;
  const block = params.canalBlockagePct;
  const tide = params.highTideOverlap;

  // 2015 Cloudburst Vector Match calculation
  const diff2015 = Math.abs(rain - 120) / 1.5 + Math.abs(dam - 2200) / 30 + Math.abs(block - 60) / 2 + (tide ? 0 : 15);
  const sim2015 = Math.min(99, Math.max(45, Math.round(100 - diff2015 / 1.8)));

  // 2021 Nivar Vector Match calculation
  const diff2021 = Math.abs(rain - 85) / 1.2 + Math.abs(dam - 800) / 15 + Math.abs(block - 85) / 1.5 + (tide ? 10 : 0);
  const sim2021 = Math.min(98, Math.max(40, Math.round(100 - diff2021 / 1.6)));

  // 2023 Michaung Vector Match calculation
  const diff2023 = Math.abs(rain - 140) / 1.8 + Math.abs(dam - 1500) / 25 + Math.abs(block - 75) / 2 + (tide ? 0 : 20);
  const sim2023 = Math.min(99, Math.max(38, Math.round(100 - diff2023 / 1.9)));

  const matchedScenarios = [
    {
      id: 'sim-2015-12-01',
      historicalEvent: 'December 2015 Chennai Cloudburst & Chembarambakkam Release',
      similarityPct: sim2015,
      keyMatches: [
        `${rain}mm/hr Cloudburst intensity vector match`,
        `${dam} m³/s Chembarambakkam discharge comparison`,
        tide ? 'Estuarine high tide backwater overlap (1.8m surge)' : 'Micro-drainage outflow pattern',
        `Canal silt blockage at ${block}%`
      ],
      retrievedStrategy: 'Deployment of 6 NDRF motorboat units to Velachery Vijaya Nagar 100ft road; pre-evacuation of Kotturpuram riverbank tenements.',
      historicalOutcome: 'Rescued 14,200 stranded residents with 91% effectiveness score.',
      aiRefinement: `Based on your live ${rain}mm/hr rainfall input, enforce automated hydraulic flood barricading at Guindy Railway Subway 40 mins prior to peak surge.`
    },
    {
      id: 'sim-2021-11-25',
      historicalEvent: 'November 2021 Cyclone Nivar Severe Inundation',
      similarityPct: sim2021,
      keyMatches: [
        `Catchment rainfall match (${rain}mm/hr vs 85mm/hr historical)`,
        `Drainage silt blockage ${block}% capacity bottleneck`,
        'Waterlogging accumulation in Velachery South & Dhandeeswaram'
      ],
      retrievedStrategy: 'Station high-capacity 500HP diesel dewatering pumps at 100ft road canal sluice gate and Velachery station subway.',
      historicalOutcome: 'Reduced standing water duration by 18 hours across Velachery South.',
      aiRefinement: `Deploy ${Math.max(4, Math.floor(rain / 15))} mobile pumps 30 minutes earlier based on live parameter derivative.`
    },
    {
      id: 'sim-2023-12-04',
      historicalEvent: 'December 2023 Cyclone Michaung Catastrophic Inundation',
      similarityPct: sim2023,
      keyMatches: [
        `Extreme storm precipitation profile (${rain}mm/hr)`,
        `Subway inundation risk in Guindy & Velachery bypass`,
        'Widespread 11kV electrical grid safety isolation'
      ],
      retrievedStrategy: 'Pre-position mobile emergency diesel generators at hospital feeders (Gleneagles & Guindy Super Specialty), deploy amphibious vehicles.',
      historicalOutcome: 'Maintained critical ICU power at 100% continuity; safely evacuated 6,800 citizens.',
      aiRefinement: 'Integrate synthetic aperture radar (SAR) satellite mapping for live flood boundary validation.'
    }
  ].sort((a, b) => b.similarityPct - a.similarityPct);

  const topMatch = matchedScenarios[0];
  const recommendedMasterPlan = `Synthesize ${topMatch.historicalEvent} strategy with dynamic pre-positioning of ${Math.max(2, Math.floor(dam / 250 + rain / 40))} boat units and ${Math.max(3, Math.floor(rain / 12 + block / 18))} dewatering pumps for input conditions (${rain}mm/hr rain, ${dam}m³/s dam release).`;

  return {
    matchedScenarios,
    recommendedMasterPlan
  };
}

export const SimulationStudio: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'simulation' | 'knowledge_base'>('simulation');

  const DEFAULT_PARAMS: SimulationParams = {
    rainfallMmHr: 110,
    chembarambakkamReleaseM3s: 1800,
    canalBlockagePct: 80,
    bridgeStatus: 'restricted',
    durationHours: 3,
    highTideOverlap: true
  };

  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Scenario Matching State
  const [isMatching, setIsMatching] = useState(false);
  const [scenarioMatches, setScenarioMatches] = useState<any | null>(() => computeScenarioMatches(DEFAULT_PARAMS));

  // Derive result directly from params — always in sync, no stale state
  const [result, setResult] = useState<SimulationResult>(() => computeHydrodynamicSimulation(DEFAULT_PARAMS));

  // Re-calculate simulation & scenario matches instantly on ANY slider/control change
  useEffect(() => {
    const newResult = computeHydrodynamicSimulation(params);
    setResult(newResult);
    setScenarioMatches(computeScenarioMatches(params));
  }, [
    params.rainfallMmHr,
    params.chembarambakkamReleaseM3s,
    params.canalBlockagePct,
    params.canalBlockagePct,
    params.durationHours,
    params.highTideOverlap,
    params.bridgeStatus
  ]);

  const handleRunSimulation = async () => {
    setIsLoading(true);
    // Immediately update result from local engine (instant feedback)
    const localResult = computeHydrodynamicSimulation(params);
    setResult(localResult);

    try {
      const response = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params })
      });
      const data = await response.json();
      if (data.success && data.data) {
        // Merge: keep locally computed road corridors & deployments,
        // enrich with live KB citation and AI summary from backend
        setResult(prev => ({
          ...localResult,
          ...data.data,
          // Always prefer the richer local predictedRoadCorridors
          predictedRoadCorridors: data.data.predictedRoadCorridors || localResult.predictedRoadCorridors,
          recommendedDeployments: data.data.recommendedDeployments || localResult.recommendedDeployments,
          knowledgeBaseCitation: data.data.knowledgeBaseCitation || localResult.knowledgeBaseCitation
        }));
      }
    } catch (err) {
      console.warn('Simulation API enrichment failed, using dynamic input engine:', err);
      // Already set localResult above — nothing to do
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
      console.warn('Scenario match fallback triggered, using dynamic matcher:', err);
      setScenarioMatches(computeScenarioMatches(params));
    } finally {
      setIsMatching(false);
    }
  };

  const handleLoadHistoricalEvent = (eventParams: Partial<SimulationParams>) => {
    const newParams: SimulationParams = {
      ...params,
      ...eventParams
    };
    setParams(newParams);
    setResult(computeHydrodynamicSimulation(newParams));
    setScenarioMatches(computeScenarioMatches(newParams));
    setActiveSubTab('simulation');
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

                {/* Decision Knowledge Base Citation Banner */}
                {result.knowledgeBaseCitation && (
                  <div className="bg-[#050507] border border-blue-500/30 p-3.5 rounded text-xs space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        Decision Knowledge Base Citation:
                      </span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/30">
                        {result.knowledgeBaseCitation.similarityPct}% VECTOR MATCH
                      </span>
                    </div>
                    <div className="font-bold text-[#e0e0e6] text-xs font-sans">
                      {result.knowledgeBaseCitation.matchedEvent}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
                      <div className="bg-[#050507] p-2 rounded border border-white/5 space-y-1 font-mono">
                        <span className="text-[9px] text-[#888] uppercase block font-bold">Retrieved Proven Strategy:</span>
                        <p className="text-[#ccc] text-[10px] font-sans">{result.knowledgeBaseCitation.retrievedStrategy}</p>
                      </div>
                      <div className="bg-[#050507] p-2 rounded border border-emerald-500/20 space-y-1 font-mono">
                        <span className="text-[9px] text-brand uppercase block font-bold">AI Dynamic Refinement:</span>
                        <p className="text-[#ccc] text-[10px] font-sans">{result.knowledgeBaseCitation.aiRefinement}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Predicted Road & Corridor Closures */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Predicted Road & Corridor Closures:
                    </h4>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                      {result.predictedRoadCorridors?.length || result.criticalRoadBlocks.length} Corridors Impacted
                    </span>
                  </div>

                  {result.predictedRoadCorridors && result.predictedRoadCorridors.length > 0 ? (
                    <div className="space-y-2">
                      {result.predictedRoadCorridors.map((corridor, idx) => (
                        <div key={idx} className="bg-[#050507] p-3 rounded border border-brand/30 text-xs font-mono space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <span className="font-bold text-[#e0e0e6] block font-sans text-xs">{corridor.roadName}</span>
                              <span className="text-[10px] text-[#888] block">Corridor Length: {corridor.affectedCorridorLengthKm} km</span>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                                corridor.status === 'CLOSED' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                corridor.status === 'RESTRICTED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              }`}>
                                {corridor.status}
                              </span>
                              <span className="text-[10px] text-red-400 font-bold">
                                Submerged: {corridor.submergenceDepthMeters}m ({Number((corridor.submergenceDepthMeters * 3.28).toFixed(1))}ft)
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-white/5 font-sans">
                            <div className="text-[#ccc] bg-[#050507] p-1.5 rounded border border-white/5 flex items-center gap-1.5">
                              <ShieldAlert className="w-3 h-3 text-red-400 shrink-0" />
                              <span className="font-mono">{corridor.vehicleRestriction}</span>
                            </div>
                            <div className="text-emerald-300 bg-[#050507] p-1.5 rounded border border-emerald-500/20 flex items-center gap-1.5">
                              <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="font-mono">{corridor.recommendedDetour}</span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {result.criticalRoadBlocks.map((block, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#050507] p-2.5 rounded border border-brand/30 text-xs text-[#e0e0e6] font-mono">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#e0e0e6] shrink-0" />
                          <span>{block}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Recommended Pre-Positioning */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-brand" />
                      AI Recommended Pre-Positioning (Knowledge Base Grounded):
                    </h4>
                    <span className="text-[10px] font-mono text-brand font-bold">
                      {result.recommendedDeployments.length} Units Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.recommendedDeployments.map((dep, idx) => (
                      <div key={idx} className="bg-[#050507] p-3 rounded border border-white/10 text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand block">{dep.count}x {dep.type}</span>
                          {dep.priority && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              dep.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {dep.priority}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#aaa] block font-sans"><strong>Target:</strong> {dep.zone}</span>
                        {dep.expectedImpact && (
                          <span className="text-[10px] text-emerald-300 block font-sans bg-[#050507] p-1.5 rounded border border-emerald-500/20">
                            <strong>Impact:</strong> {dep.expectedImpact}
                          </span>
                        )}
                        {dep.knowledgeBasePrecedent && (
                          <span className="text-[9px] text-[#888] block font-mono">
                            {dep.knowledgeBasePrecedent}
                          </span>
                        )}
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
                  <tr
                    onClick={() => handleLoadHistoricalEvent({ rainfallMmHr: 120, chembarambakkamReleaseM3s: 2200, canalBlockagePct: 60, bridgeStatus: 'closed', durationHours: 4, highTideOverlap: true })}
                    className="hover:bg-[#111118] transition-all cursor-pointer group"
                    title="Click to seed simulation controls with 2015 historical scenario"
                  >
                    <td className="p-3 font-bold text-[#e0e0e6] group-hover:text-brand flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-brand opacity-0 group-hover:opacity-100 transition-all" />
                      <span>SIM-2015-12-01</span>
                    </td>
                    <td className="p-3 text-[#aaa]">Rain: 120mm/hr | Dam: 2200m³/s | High Tide</td>
                    <td className="p-3 text-brand">Pre-evacuate Kotturpuram + Deploy 6 Boats</td>
                    <td className="p-3 font-bold text-brand">92% Score</td>
                    <td className="p-3 text-[#888] font-sans">Pre-positioning boats prior to T+30m cuts rescue delays by 42%. <span className="text-[10px] text-brand underline font-mono ml-1">Load Controls &rarr;</span></td>
                  </tr>
                  <tr
                    onClick={() => handleLoadHistoricalEvent({ rainfallMmHr: 85, chembarambakkamReleaseM3s: 800, canalBlockagePct: 85, bridgeStatus: 'restricted', durationHours: 3, highTideOverlap: false })}
                    className="hover:bg-[#111118] transition-all cursor-pointer group"
                    title="Click to seed simulation controls with 2021 historical scenario"
                  >
                    <td className="p-3 font-bold text-[#e0e0e6] group-hover:text-brand flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-brand opacity-0 group-hover:opacity-100 transition-all" />
                      <span>SIM-2021-11-25</span>
                    </td>
                    <td className="p-3 text-[#aaa]">Rain: 85mm/hr | Dam: 800m³/s | Silt: 85%</td>
                    <td className="p-3 text-brand">Station 500HP Pumps at Velachery Canal</td>
                    <td className="p-3 font-bold text-brand">88% Score</td>
                    <td className="p-3 text-[#888] font-sans">Early dewatering prevents standing water accumulation in ground floors. <span className="text-[10px] text-brand underline font-mono ml-1">Load Controls &rarr;</span></td>
                  </tr>
                  <tr
                    onClick={() => handleLoadHistoricalEvent({ rainfallMmHr: 140, chembarambakkamReleaseM3s: 1500, canalBlockagePct: 75, bridgeStatus: 'closed', durationHours: 5, highTideOverlap: true })}
                    className="hover:bg-[#111118] transition-all cursor-pointer group"
                    title="Click to seed simulation controls with 2023 historical scenario"
                  >
                    <td className="p-3 font-bold text-[#e0e0e6] group-hover:text-brand flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-brand opacity-0 group-hover:opacity-100 transition-all" />
                      <span>SIM-2023-12-04</span>
                    </td>
                    <td className="p-3 text-[#aaa]">Rain: 140mm/hr | Dam: 1500m³/s | High Tide</td>
                    <td className="p-3 text-amber-400">Automated Barrier at Guindy Railway Subway</td>
                    <td className="p-3 font-bold text-brand">95% Score</td>
                    <td className="p-3 text-[#888] font-sans">Early subway closure prevents vehicle trapping and traffic gridlock. <span className="text-[10px] text-brand underline font-mono ml-1">Load Controls &rarr;</span></td>
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
