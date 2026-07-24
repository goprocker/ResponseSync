import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  ZoneRisk,
  IoTSensorNode,
  EmergencyResource,
  EmergencyShelter,
  CitizenReport,
  EvacuationRoute
} from '../types';
import {
  Layers,
  Clock,
  MapPin,
  Maximize2,
  Navigation,
  ShieldAlert,
  Radio,
  Eye,
  Info,
  ChevronRight,
  Flame,
  LifeBuoy,
  Ambulance,
  Siren,
  Hospital
} from 'lucide-react';

interface DigitalTwinMapProps {
  zones: ZoneRisk[];
  sensors: IoTSensorNode[];
  resources: EmergencyResource[];
  shelters: EmergencyShelter[];
  reports: CitizenReport[];
  evacuationRoute?: EvacuationRoute;
  timeHorizon: 'live' | '30m' | '1h' | '2h';
  setTimeHorizon: (horizon: 'live' | '30m' | '1h' | '2h') => void;
  onSelectZone: (zone: ZoneRisk) => void;
  onSelectResource: (resource: EmergencyResource) => void;
  onSelectReport: (report: CitizenReport) => void;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({
  zones,
  sensors,
  resources,
  shelters,
  reports,
  evacuationRoute,
  timeHorizon,
  setTimeHorizon,
  onSelectZone,
  onSelectResource,
  onSelectReport
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer Visibility States
  const [showZones, setShowZones] = useState(true);
  const [showInundation, setShowInundation] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showRoute, setShowRoute] = useState(true);

  // Inspector Panel State
  const [selectedItem, setSelectedItem] = useState<{
    type: 'zone' | 'sensor' | 'resource' | 'shelter' | 'report';
    data: any;
  } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.988, 80.230], // Chennai Velachery - Adyar center
        zoom: 13,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Dark theme map tiles from CartoDB or standard OSM
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      layersGroupRef.current = layerGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Map Layers on State Changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    layerGroup.clearLayers();

    // 1. Render Zone Polygons
    if (showZones) {
      zones.forEach((zone) => {
        let color = '#10b981'; // safe
        let fillColor = '#10b981';
        if (zone.priorityLevel === 'CRITICAL') {
          color = '#ef4444';
          fillColor = '#f87171';
        } else if (zone.priorityLevel === 'HIGH') {
          color = '#f97316';
          fillColor = '#fb923c';
        } else if (zone.priorityLevel === 'MEDIUM') {
          color = '#eab308';
          fillColor = '#fde047';
        }

        const polygon = L.polygon(zone.coords, {
          color: color,
          weight: 2,
          opacity: 0.8,
          fillColor: fillColor,
          fillOpacity: 0.25,
          dashArray: zone.status === 'evacuating' ? '6, 6' : undefined
        });

        polygon.on('click', () => {
          setSelectedItem({ type: 'zone', data: zone });
          onSelectZone(zone);
        });

        polygon.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 12px; padding: 4px;">
            <strong style="color: ${color};">${zone.name}</strong><br/>
            Risk Score: <strong>${zone.riskScore}/100</strong><br/>
            Pop. at Risk: ${zone.populationAtRisk.toLocaleString()}<br/>
            Status: <span style="text-transform: uppercase;">${zone.status}</span>
          </div>
        `, { sticky: true });

        layerGroup.addLayer(polygon);
      });
    }

    // 2. Render Hydrodynamic Inundation Overlay depending on timeHorizon
    if (showInundation) {
      zones.forEach((zone) => {
        let depth = zone.currentWaterLevelMeters;
        let scale = 1.0;

        if (timeHorizon === '30m') {
          depth = zone.predictedWaterLevel30m;
          scale = 1.15;
        } else if (timeHorizon === '1h') {
          depth = zone.predictedWaterLevel1h;
          scale = 1.35;
        } else if (timeHorizon === '2h') {
          depth = zone.predictedWaterLevel2h;
          scale = 1.55;
        }

        if (depth > 0.3) {
          // Compute expanded inner inundation core
          const center = zone.center;
          const expandedCoords: [number, number][] = zone.coords.map(([lat, lng]) => [
            center[0] + (lat - center[0]) * scale,
            center[1] + (lng - center[1]) * scale
          ]);

          const opacity = Math.min(0.65, 0.2 + depth * 0.15);
          const floodColor = depth > 2.0 ? '#0284c7' : '#0284c7';

          const inundationPoly = L.polygon(expandedCoords, {
            color: '#38bdf8',
            weight: 1.5,
            fillColor: floodColor,
            fillOpacity: opacity
          });

          inundationPoly.bindTooltip(`
            <div style="font-size: 11px;">
              <strong>🌊 Flood Inundation Layer (${timeHorizon.toUpperCase()})</strong><br/>
              Est. Water Depth: <strong>${depth.toFixed(1)} m</strong>
            </div>
          `, { sticky: true });

          layerGroup.addLayer(inundationPoly);
        }
      });
    }

    // 3. Render IoT Sensor Nodes
    if (showSensors) {
      sensors.forEach((sensor) => {
        const iconHtml = `
          <div style="
            background: ${sensor.status === 'critical' ? '#ef4444' : sensor.status === 'warning' ? '#f97316' : '#10b981'};
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px rgba(0,0,0,0.4);
            font-size: 14px;
          ">
            📡
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-sensor-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([sensor.lat, sensor.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedItem({ type: 'sensor', data: sensor });
        });

        marker.bindTooltip(`
          <div>
            <strong>${sensor.name}</strong><br/>
            Reading: <strong>${sensor.currentValue} ${sensor.unit}</strong><br/>
            Battery: ${sensor.batteryPct}% | Signal: ${sensor.signalPct}%
          </div>
        `);

        layerGroup.addLayer(marker);
      });
    }

    // 4. Render Emergency Resources
    if (showResources) {
      resources.forEach((res) => {
        let symbol = '🚤';
        if (res.type === 'ambulance') symbol = '🚑';
        if (res.type === 'fire_truck') symbol = '🚒';
        if (res.type === 'police_patrol') symbol = '🚓';
        if (res.type === 'relief_truck') symbol = '🚚';

        const iconHtml = `
          <div style="
            background: #0f172a;
            border: 2px solid #38bdf8;
            border-radius: 8px;
            padding: 3px 6px;
            color: white;
            font-size: 14px;
            box-shadow: 0 0 12px rgba(56,189,248,0.5);
            display: flex;
            align-items: center;
            gap: 4px;
            font-weight: bold;
          ">
            <span>${symbol}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-resource-icon',
          iconSize: [32, 28],
          iconAnchor: [16, 14]
        });

        const marker = L.marker([res.lat, res.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedItem({ type: 'resource', data: res });
          onSelectResource(res);
        });

        marker.bindTooltip(`
          <div>
            <strong>${res.name}</strong><br/>
            Status: <span style="text-transform: uppercase;">${res.status}</span><br/>
            Crew: ${res.crewCount} personnel
          </div>
        `);

        layerGroup.addLayer(marker);
      });
    }

    // 5. Render Emergency Shelters
    if (showShelters) {
      shelters.forEach((shelter) => {
        const iconHtml = `
          <div style="
            background: #0284c7;
            border: 2px solid #e0f2fe;
            border-radius: 8px;
            padding: 2px 6px;
            color: white;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(2,132,199,0.5);
          ">
            ⛺
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-shelter-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([shelter.lat, shelter.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedItem({ type: 'shelter', data: shelter });
        });

        marker.bindTooltip(`
          <div>
            <strong>${shelter.name}</strong><br/>
            Occupancy: ${shelter.currentOccupancy} / ${shelter.totalCapacity}<br/>
            Rations: ${shelter.foodSuppliesDays} Days
          </div>
        `);

        layerGroup.addLayer(marker);
      });
    }

    // 6. Render Citizen Reports
    if (showReports) {
      reports.forEach((rep) => {
        const iconHtml = `
          <div style="
            background: #e11d48;
            border: 2px solid white;
            border-radius: 50%;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            box-shadow: 0 0 10px rgba(225,29,72,0.6);
            animation: pulse 2s infinite;
          ">
            ⚠️
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-report-icon',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        const marker = L.marker([rep.lat, rep.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedItem({ type: 'report', data: rep });
          onSelectReport(rep);
        });

        marker.bindTooltip(`
          <div>
            <strong>Citizen Incident Report</strong><br/>
            Category: ${rep.category}<br/>
            AI Validation Score: ${rep.aiValidationScore}%
          </div>
        `);

        layerGroup.addLayer(marker);
      });
    }

    // 7. Render Evacuation Route
    if (showRoute && evacuationRoute && evacuationRoute.waypoints.length > 0) {
      const routePolyline = L.polyline(evacuationRoute.waypoints, {
        color: '#10b981',
        weight: 5,
        opacity: 0.9,
        dashArray: '8, 8'
      });

      routePolyline.bindTooltip(`
        <div>
          <strong>Dynamic Evacuation Route</strong><br/>
          Safety Score: <strong>${evacuationRoute.safetyScorePct}%</strong><br/>
          Destination: ${evacuationRoute.destinationShelterName}
        </div>
      `, { sticky: true });

      layerGroup.addLayer(routePolyline);
    }

  }, [
    zones,
    sensors,
    resources,
    shelters,
    reports,
    evacuationRoute,
    timeHorizon,
    showZones,
    showInundation,
    showSensors,
    showResources,
    showShelters,
    showReports,
    showRoute
  ]);

  return (
    <div className="relative w-full h-[calc(100vh-70px)] min-h-[550px] bg-[#050507] flex flex-col overflow-hidden">
      
      {/* Map Header Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#050507cc] p-2 rounded-lg border border-[#ffffff20] shadow-2xl backdrop-blur-md pointer-events-auto">
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#888] px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#ff4e00]" />
            Layers:
          </span>

          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showZones ? 'bg-[#ff4e00] text-black' : 'bg-[#151520] text-[#888] border border-[#ffffff10]'
            }`}
          >
            Risk Zones
          </button>

          <button
            onClick={() => setShowInundation(!showInundation)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showInundation ? 'bg-[#3b82f6] text-white' : 'bg-[#151520] text-[#888] border border-[#ffffff10]'
            }`}
          >
            Flood Overlay
          </button>

          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showSensors ? 'bg-[#10b981] text-black' : 'bg-[#151520] text-[#888] border border-[#ffffff10]'
            }`}
          >
            IoT Sensors
          </button>

          <button
            onClick={() => setShowResources(!showResources)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showResources ? 'bg-[#a855f7] text-white' : 'bg-[#151520] text-[#888] border border-[#ffffff10]'
            }`}
          >
            Fleet Units
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showShelters ? 'bg-[#eab308] text-black' : 'bg-[#151520] text-[#888] border border-[#ffffff10]'
            }`}
          >
            Shelters
          </button>

          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showReports ? 'bg-[#f43f5e] text-white' : 'bg-[#151520] text-[#888] border border-[#ffffff10]'
            }`}
          >
            Reports
          </button>
        </div>

        {/* Time Horizon Slider */}
        <div className="flex items-center gap-2 bg-[#050507cc] p-2 rounded-lg border border-[#ffffff20] shadow-2xl backdrop-blur-md pointer-events-auto">
          <Clock className="w-3.5 h-3.5 text-[#ff4e00] ml-1" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#888] hidden sm:inline">Timeline:</span>
          
          <div className="flex items-center bg-[#0a0a0f] p-0.5 rounded border border-[#ffffff15]">
            <button
              onClick={() => setTimeHorizon('live')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                timeHorizon === 'live' ? 'bg-[#ff4e00] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              NOW
            </button>
            <button
              onClick={() => setTimeHorizon('30m')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                timeHorizon === '30m' ? 'bg-[#ff4e00] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              +30m
            </button>
            <button
              onClick={() => setTimeHorizon('1h')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                timeHorizon === '1h' ? 'bg-[#ff4e00] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              +1h
            </button>
            <button
              onClick={() => setTimeHorizon('2h')}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                timeHorizon === '2h' ? 'bg-[#ff4e00] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              +2h
            </button>
          </div>
        </div>

      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Selected Item Inspector Panel */}
      {selectedItem && (
        <div className="absolute bottom-12 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 bg-[#0d0d14] border border-[#ff4e0040] p-4 rounded-lg shadow-2xl backdrop-blur-md text-[#e0e0e6] animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between border-b border-[#ffffff15] pb-3 mb-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#ff4e00] px-2 py-0.5 bg-[#ff4e00]/15 rounded border border-[#ff4e00]/30">
                {selectedItem.type.toUpperCase()} INSPECTOR
              </span>
              <h3 className="text-base font-bold text-white mt-1.5 font-sans">
                {selectedItem.data.name || selectedItem.data.locationName || 'Selected Item'}
              </h3>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-[#888] hover:text-white p-1 rounded hover:bg-[#ffffff10] cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Details by Type */}
          {selectedItem.type === 'zone' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">RISK SCORE:</span>
                <span className="font-bold text-[#ff4e00]">{selectedItem.data.riskScore}/100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">CURRENT WATER DEPTH:</span>
                <span className="font-bold text-blue-400">{selectedItem.data.currentWaterLevelMeters} m</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">PREDICTED +1H DEPTH:</span>
                <span className="font-bold text-amber-400">{selectedItem.data.predictedWaterLevel1h} m</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">POPULATION AT RISK:</span>
                <span className="font-bold text-white">{selectedItem.data.populationAtRisk?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#888]">LEAD TIME TO INUNDATION:</span>
                <span className="font-bold text-[#ff4e00]">{selectedItem.data.estimatedTimeToInundationMin} MINS</span>
              </div>
            </div>
          )}

          {selectedItem.type === 'sensor' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">SENSOR ID:</span>
                <span className="font-bold text-white">{selectedItem.data.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">TELEMETRY READING:</span>
                <span className="font-bold text-emerald-400">{selectedItem.data.currentValue} {selectedItem.data.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">CRITICAL THRESHOLD:</span>
                <span className="text-[#ff4e00]">{selectedItem.data.thresholdCritical} {selectedItem.data.unit}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#888]">STATUS:</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedItem.data.batteryPct}% BAT | {selectedItem.data.signalPct}% SIG</span>
              </div>
            </div>
          )}

          {selectedItem.type === 'resource' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">FLEET UNIT:</span>
                <span className="font-bold text-white">{selectedItem.data.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">STATUS:</span>
                <span className="font-bold text-emerald-400 uppercase">{selectedItem.data.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">CREW SIZE:</span>
                <span className="text-[#ccc]">{selectedItem.data.crewCount} Personnel</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#888]">EQUIPMENT:</span>
                <span className="text-[#ccc] text-right">{selectedItem.data.equipment?.join(', ')}</span>
              </div>
            </div>
          )}

          {selectedItem.type === 'shelter' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">ADDRESS:</span>
                <span className="text-[#ccc]">{selectedItem.data.address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">CAPACITY UTILIZATION:</span>
                <span className="font-bold text-amber-400">{selectedItem.data.currentOccupancy} / {selectedItem.data.totalCapacity}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#888]">RATIONS:</span>
                <span className="text-emerald-400 font-bold">{selectedItem.data.foodSuppliesDays} Days Food Supply</span>
              </div>
            </div>
          )}

          {selectedItem.type === 'report' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">INCIDENT CATEGORY:</span>
                <span className="font-bold text-[#ff4e00] uppercase">{selectedItem.data.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ffffff10]">
                <span className="text-[#888]">CREDIBILITY:</span>
                <span className="font-bold text-emerald-400">{selectedItem.data.aiValidationScore}% AI Verified</span>
              </div>
              <p className="text-[#ccc] font-sans italic bg-[#151520] p-2.5 rounded border border-[#ffffff10]">
                "{selectedItem.data.description}"
              </p>
            </div>
          )}

        </div>
      )}

      {/* Legend Footer Bar */}
      <div className="bg-[#0a0a0f] border-t border-[#ffffff15] px-6 h-10 flex flex-wrap items-center justify-between text-[10px] font-mono text-[#555] z-20">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4e00]"></span>
            <span>HIGH_RISK_ZONE</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>FLOOD_INUNDATION</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>RESCUE_UNITS_DEPLOYED</span>
          </div>
        </div>
        <div>
          <span className="text-[#888]">COORDINATES:</span> <span className="text-white">12.9784° N, 80.2185° E</span>
        </div>
      </div>

    </div>
  );
};
