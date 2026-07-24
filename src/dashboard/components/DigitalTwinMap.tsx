import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  ZoneRisk,
  IoTSensorNode,
  EmergencyResource,
  EmergencyShelter,
  CitizenReport,
  EvacuationRoute,
  EmergencyHospital
} from '../../shared/types';
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
  Hospital,
  CheckCircle2,
  Crosshair,
  AlertTriangle,
  X
} from 'lucide-react';

interface DigitalTwinMapProps {
  zones: ZoneRisk[];
  sensors: IoTSensorNode[];
  resources: EmergencyResource[];
  shelters: EmergencyShelter[];
  reports: CitizenReport[];
  hospitals?: EmergencyHospital[];
  evacuationRoute?: EvacuationRoute;
  timeHorizon: 'live' | '30m' | '1h' | '2h';
  setTimeHorizon: (horizon: 'live' | '30m' | '1h' | '2h') => void;
  onSelectZone: (zone: ZoneRisk) => void;
  onSelectResource: (resource: EmergencyResource) => void;
  onSelectReport: (report: CitizenReport) => void;
  onCalculateEvacuationRoute?: (originName: string, originCoords: [number, number], shelterId: string) => void;
  isCalculatingRoute?: boolean;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({
  zones,
  sensors,
  resources,
  shelters,
  reports,
  hospitals,
  evacuationRoute,
  timeHorizon,
  setTimeHorizon,
  onSelectZone,
  onSelectResource,
  onSelectReport,
  onCalculateEvacuationRoute,
  isCalculatingRoute
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
  const [showHospitals, setShowHospitals] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [showSentinelSAR, setShowSentinelSAR] = useState(true);
  const [showNASAFIRMS, setShowNASAFIRMS] = useState(true);

  // Satellite Data States
  const [sarData, setSarData] = useState<any>(null);
  const [firmsData, setFirmsData] = useState<any>(null);

  // Fetch Live Satellite GIS Data
  useEffect(() => {
    async function fetchSatelliteFeeds() {
      try {
        const [sarResp, firmsResp] = await Promise.all([
          fetch('/api/gis/satellite/sentinel-sar'),
          fetch('/api/gis/satellite/nasa-firms')
        ]);
        if (sarResp.ok) {
          const sarJson = await sarResp.json();
          if (sarJson.success && sarJson.data) setSarData(sarJson.data);
        }
        if (firmsResp.ok) {
          const firmsJson = await firmsResp.json();
          if (firmsJson.success && firmsJson.data) setFirmsData(firmsJson.data);
        }
      } catch (err) {
        console.warn('Satellite GIS feed fetch warning:', err);
      }
    }
    fetchSatelliteFeeds();
  }, []);

  // Interactive Route Planner State on Map View
  const [routeOriginName, setRouteOriginName] = useState('Velachery 100ft Road (Vijaya Nagar Junction)');
  const [routeOriginCoords, setRouteOriginCoords] = useState<[number, number]>([12.9785, 80.2205]);
  const [selectedShelterId, setSelectedShelterId] = useState(shelters[0]?.id || 'sh-01');
  const [isClickToPickOrigin, setIsClickToPickOrigin] = useState(false);
  const [showStepsDrawer, setShowStepsDrawer] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Inspector Panel State
  const [selectedItem, setSelectedItem] = useState<{
    type: 'zone' | 'sensor' | 'resource' | 'shelter' | 'report' | 'hospital';
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

  // Map click listener for setting dynamic passenger origin
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isClickToPickOrigin) {
        const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
        const name = `GPS Pin (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`;
        setRouteOriginName(name);
        setRouteOriginCoords(coords);
        setIsClickToPickOrigin(false);
        if (onCalculateEvacuationRoute) {
          onCalculateEvacuationRoute(name, coords, selectedShelterId);
        }
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isClickToPickOrigin, selectedShelterId, onCalculateEvacuationRoute]);

  // Render Map Layers on State Changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    layerGroup.clearLayers();

    // 1. Render Zone Polygons
    if (showZones && Array.isArray(zones)) {
      zones.forEach((zone) => {
        if (!zone || !Array.isArray(zone.coords) || zone.coords.length < 3) return;
        const validCoords = zone.coords
          .filter((c: any) => Array.isArray(c) && c.length >= 2 && !isNaN(Number(c[0])) && !isNaN(Number(c[1])))
          .map((c: any) => [Number(c[0]), Number(c[1])]) as [number, number][];
        if (validCoords.length < 3) return;

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

        const polygon = L.polygon(validCoords, {
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
    if (showInundation && Array.isArray(zones)) {
      zones.forEach((zone) => {
        if (!zone || !Array.isArray(zone.coords)) return;
        const validCoords = zone.coords
          .filter((c: any) => Array.isArray(c) && c.length >= 2 && !isNaN(Number(c[0])) && !isNaN(Number(c[1])))
          .map((c: any) => [Number(c[0]), Number(c[1])]) as [number, number][];
        if (validCoords.length < 3) return;

        let depth = Number(zone.currentWaterLevelMeters || 0);
        let scale = 1.0;

        if (timeHorizon === '30m') {
          depth = Number(zone.predictedWaterLevel30m || depth);
          scale = 1.15;
        } else if (timeHorizon === '1h') {
          depth = Number(zone.predictedWaterLevel1h || depth);
          scale = 1.35;
        } else if (timeHorizon === '2h') {
          depth = Number(zone.predictedWaterLevel2h || depth);
          scale = 1.55;
        }

        if (depth > 0.3) {
          // Compute expanded inner inundation core
          const center = (Array.isArray(zone.center) && zone.center.length >= 2 && !isNaN(Number(zone.center[0])) && !isNaN(Number(zone.center[1])))
            ? [Number(zone.center[0]), Number(zone.center[1])]
            : validCoords[0];

          const expandedCoords: [number, number][] = validCoords.map(([lat, lng]): [number, number] => [
            center[0] + (lat - center[0]) * scale,
            center[1] + (lng - center[1]) * scale
          ]).filter((coord): coord is [number, number] => !isNaN(coord[0]) && !isNaN(coord[1]));

          if (expandedCoords.length < 3) return;

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
    if (showSensors && Array.isArray(sensors)) {
      sensors.forEach((sensor) => {
        if (!sensor) return;
        const lat = Number(sensor.lat ?? (Array.isArray(sensor.coordinates) ? sensor.coordinates[0] : NaN));
        const lng = Number(sensor.lng ?? (Array.isArray(sensor.coordinates) ? sensor.coordinates[1] : NaN));
        if (isNaN(lat) || isNaN(lng)) return;

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

        const marker = L.marker([lat, lng], { icon: customIcon });

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
    if (showResources && Array.isArray(resources)) {
      resources.forEach((res) => {
        if (!res) return;
        const lat = Number(res.lat ?? (Array.isArray(res.coordinates) ? res.coordinates[0] : NaN));
        const lng = Number(res.lng ?? (Array.isArray(res.coordinates) ? res.coordinates[1] : NaN));
        if (isNaN(lat) || isNaN(lng)) return;

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

        const marker = L.marker([lat, lng], { icon: customIcon });

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
    if (showShelters && Array.isArray(shelters)) {
      shelters.forEach((shelter) => {
        if (!shelter) return;
        const lat = Number(shelter.lat ?? (Array.isArray(shelter.coordinates) ? shelter.coordinates[0] : NaN));
        const lng = Number(shelter.lng ?? (Array.isArray(shelter.coordinates) ? shelter.coordinates[1] : NaN));
        if (isNaN(lat) || isNaN(lng)) return;

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

        const marker = L.marker([lat, lng], { icon: customIcon });

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

    // Hospitals
    if (showHospitals && Array.isArray(hospitals)) {
      hospitals.forEach((hosp) => {
        if (!hosp) return;
        const lat = Number(hosp.lat ?? (Array.isArray(hosp.coordinates) ? hosp.coordinates[0] : NaN));
        const lng = Number(hosp.lng ?? (Array.isArray(hosp.coordinates) ? hosp.coordinates[1] : NaN));
        if (isNaN(lat) || isNaN(lng)) return;

        const iconHtml = `
          <div style="
            background: #10b981;
            border: 2px solid #a7f3d0;
            border-radius: 8px;
            padding: 2px 6px;
            color: white;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(16,185,129,0.5);
          ">
            🏥
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-hospital-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const totalBeds = hosp.totalCapacity ?? hosp.total_beds ?? 0;
        const availIcu = hosp.icuBedsAvailable ?? hosp.available_icu_beds ?? 0;

        const marker = L.marker([lat, lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedItem({ type: 'hospital', data: hosp });
        });

        marker.bindTooltip(`
          <div>
            <strong>${hosp.name}</strong><br/>
            Beds: ${availIcu} ICU / ${totalBeds} Total<br/>
            Status: <span style="text-transform: uppercase;">${hosp.status}</span>
          </div>
        `);

        layerGroup.addLayer(marker);
      });
    }

    // 6. Render Citizen Reports
    if (showReports && Array.isArray(reports)) {
      reports.forEach((rep) => {
        if (!rep) return;
        const lat = Number(rep.lat ?? (Array.isArray((rep as any).coordinates) ? (rep as any).coordinates[0] : NaN));
        const lng = Number(rep.lng ?? (Array.isArray((rep as any).coordinates) ? (rep as any).coordinates[1] : NaN));
        if (isNaN(lat) || isNaN(lng)) return;

        let catSymbol = '🚨';
        if (rep.category === 'waterlogging') catSymbol = '🌊';
        if (rep.category === 'stranded') catSymbol = '🚤';
        if (rep.category === 'power_outage') catSymbol = '⚡';

        const isCritical = rep.severity === 'critical';
        const isWarning = rep.severity === 'warning' || rep.severity === 'high';
        const bgColor = isCritical ? '#ef4444' : isWarning ? '#f97316' : '#0284c7';

        const iconHtml = `
          <div style="
            background: ${bgColor};
            border: 2px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            box-shadow: 0 0 14px ${bgColor};
            ${isCritical ? 'animation: pulse 1.5s infinite;' : ''}
          ">
            <span>${catSymbol}</span>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-report-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedItem({ type: 'report', data: rep });
          onSelectReport(rep);
        });

        marker.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: ${bgColor}; uppercase">⚠️ Citizen SOS Incident</strong><br/>
            Reporter: <strong>${rep.reporterName || 'Anonymous'}</strong><br/>
            Location: ${rep.locationName || 'Velachery Sector'}<br/>
            Category: <span style="text-transform: capitalize;">${(rep.category || 'waterlogging').replace('_', ' ')}</span><br/>
            AI Validation Score: <strong style="color: #10b981;">${rep.aiValidationScore || 90}% Verified</strong>
          </div>
        `);

        layerGroup.addLayer(marker);
      });
    }

    // 7. Render Evacuation Route & Waypoints
    if (showRoute && evacuationRoute && Array.isArray(evacuationRoute.waypoints) && evacuationRoute.waypoints.length > 0) {
      const validWaypoints = evacuationRoute.waypoints
        .map((wp: any) => [Number(wp[0]), Number(wp[1])])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng)) as [number, number][];

      if (validWaypoints.length > 0) {
        // Route Polyline
        const routePolyline = L.polyline(validWaypoints, {
          color: '#10b981',
          weight: 6,
          opacity: 0.95,
          dashArray: '10, 10'
        });

        routePolyline.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: #10b981;">⚡ Dynamic Safe Evacuation Route</strong><br/>
            Safety Score: <strong>${evacuationRoute.safetyScorePct}% SAFE</strong><br/>
            Distance: ${evacuationRoute.distanceKm} km • Est. Time: ${evacuationRoute.estimatedTimeMinutes} mins<br/>
            Destination: <strong>${evacuationRoute.destinationShelterName}</strong>
          </div>
        `, { sticky: true });

        layerGroup.addLayer(routePolyline);

        // Start Origin Beacon Marker
        const startCoords = validWaypoints[0];
        if (startCoords && !isNaN(startCoords[0]) && !isNaN(startCoords[1])) {
          const originHtml = `
            <div style="
              background: #2563eb;
              color: white;
              border: 2px solid #93c5fd;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              box-shadow: 0 0 16px rgba(37,99,235,0.8);
              animation: pulse 2s infinite;
            ">
              📍
            </div>
          `;
          const originIcon = L.divIcon({
            html: originHtml,
            className: 'origin-marker-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          const originMarker = L.marker(startCoords, { icon: originIcon });
          originMarker.bindTooltip(`
            <div style="font-family: sans-serif; font-size: 11px;">
              <strong style="color: #60a5fa;">📍 Passenger Origin Location</strong><br/>
              ${evacuationRoute.originName || 'Starting Point'}
            </div>
          `);
          layerGroup.addLayer(originMarker);
        }

        // Target Shelter Beacon Marker
        const endCoords = validWaypoints[validWaypoints.length - 1];
        if (endCoords && !isNaN(endCoords[0]) && !isNaN(endCoords[1])) {
          const shelterHtml = `
            <div style="
              background: #059669;
              color: white;
              border: 2px solid #a7f3d0;
              border-radius: 50%;
              width: 34px;
              height: 34px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              box-shadow: 0 0 18px rgba(16,185,129,0.9);
            ">
              ⛺
            </div>
          `;
          const shelterIcon = L.divIcon({
            html: shelterHtml,
            className: 'shelter-target-icon',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });
          const shelterMarker = L.marker(endCoords, { icon: shelterIcon });
          shelterMarker.bindTooltip(`
            <div style="font-family: sans-serif; font-size: 11px;">
              <strong style="color: #34d399;">⛺ Target Relief Shelter</strong><br/>
              ${evacuationRoute.destinationShelterName}
            </div>
          `);
          layerGroup.addLayer(shelterMarker);
        }
      }

      // Hazard Avoidance Warning Badge at Guindy Subway (13.0067, 80.2117)
      const hazardSubwayCoords: [number, number] = [13.0067, 80.2117];
      const hazardHtml = `
        <div style="
          background: #dc2626;
          color: white;
          border: 2px solid #fca5a5;
          border-radius: 6px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: bold;
          font-family: monospace;
          box-shadow: 0 0 12px rgba(220,38,38,0.8);
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          ⛔ SUBWAY SUBMERGED
        </div>
      `;
      const hazardIcon = L.divIcon({
        html: hazardHtml,
        className: 'hazard-subway-icon',
        iconSize: [140, 24],
        iconAnchor: [70, 12]
      });
      const hazardMarker = L.marker(hazardSubwayCoords, { icon: hazardIcon });
      hazardMarker.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 11px;">
          <strong style="color: #ef4444;">⛔ Guindy Railway Subway</strong><br/>
          Water Level: <strong>3.2 ft (IMPASSABLE)</strong><br/>
          <span style="color: #10b981;">AI Evacuation Engine Rerouted via Taramani Link Road</span>
        </div>
      `);
      layerGroup.addLayer(hazardMarker);
    }

    // 8. Render Sentinel-1 Synthetic Aperture Radar (SAR) Water Inundation Polygon Overlays
    if (showSentinelSAR && sarData && sarData.features && Array.isArray(sarData.features)) {
      sarData.features.forEach((feat: any) => {
        if (feat && feat.geometry && Array.isArray(feat.geometry.coordinates) && feat.geometry.coordinates[0]) {
          const latLngs = feat.geometry.coordinates[0]
            .map((coord: number[]) => [Number(coord[1]), Number(coord[0])])
            .filter(([lat, lng]: number[]) => !isNaN(lat) && !isNaN(lng)) as [number, number][];
          if (latLngs.length >= 3) {
            const sarPolygon = L.polygon(latLngs, {
              color: '#0284c7',
              weight: 2,
              fillColor: '#0369a1',
              fillOpacity: 0.35,
              dashArray: '6, 6'
            });

            sarPolygon.bindTooltip(`
              <div style="font-family: sans-serif; font-size: 11px;">
                <strong style="color: #38bdf8;">🛰️ ESA Sentinel-1 SAR Radar Inundation</strong><br/>
                Zone: <strong>${feat.properties?.riskZone || 'Adyar Basin'}</strong><br/>
                Backscatter Intensity: <strong>${feat.properties?.backscatterDb ?? -18.4} dB</strong> (Water Surface)<br/>
                Est. Inundation Depth: <strong>${feat.properties?.inundationDepthMeters ?? 1.2}m</strong><br/>
                Inundated Area: <strong>${feat.properties?.areaSqKm ?? 3.4} sq km</strong>
              </div>
            `);

            layerGroup.addLayer(sarPolygon);
          }
        }
      });
    }

    // 9. Render NASA FIRMS Satellite Thermal & High-Reflectance Hotspots
    if (showNASAFIRMS && firmsData && firmsData.hotspots && Array.isArray(firmsData.hotspots)) {
      firmsData.hotspots.forEach((hs: any) => {
        if (!hs) return;
        const lat = Number(hs.lat);
        const lng = Number(hs.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const firmsHtml = `
          <div style="
            background: #d97706;
            color: white;
            border: 2px solid #fef08a;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            box-shadow: 0 0 12px rgba(217,119,6,0.8);
          ">
            🛰️
          </div>
        `;

        const firmsIcon = L.divIcon({
          html: firmsHtml,
          className: 'nasa-firms-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const firmsMarker = L.marker([lat, lng], { icon: firmsIcon });
        firmsMarker.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px;">
            <strong style="color: #f59e0b;">🔥 NASA FIRMS NRT Satellite Anomaly</strong><br/>
            Satellite: <strong>${hs.satellite || 'VIIRS'}</strong><br/>
            Location: ${hs.locationName || 'Chennai Zone'}<br/>
            Brightness Temp: <strong>${hs.brightnessKelvin || 310} K</strong><br/>
            Confidence Score: <strong style="color: #10b981;">${hs.confidencePct || 92}% Verified</strong>
          </div>
        `);

        layerGroup.addLayer(firmsMarker);
      });
    }

  }, [
    zones,
    sensors,
    resources,
    shelters,
    hospitals,
    reports,
    evacuationRoute,
    timeHorizon,
    showZones,
    showInundation,
    showSensors,
    showResources,
    showShelters,
    showHospitals,
    showReports,
    showRoute,
    showSentinelSAR,
    showNASAFIRMS,
    sarData,
    firmsData
  ]);

  return (
    <div className="relative w-full h-full min-h-[450px] bg-[#050507] flex flex-col overflow-hidden">
      
      {/* Map Header Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#050507] p-1.5 rounded-none border border-white/10 shadow-none backdrop-blur-md pointer-events-auto">
          <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-brand/60 px-2.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#e0e0e6]" />
            Layers:
          </span>

          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showZones ? 'bg-brand text-black' : 'bg-[#0d0d12] text-brand/60 border border-white/5'
            }`}
          >
            Risk Zones
          </button>

          <button
            onClick={() => setShowInundation(!showInundation)}
            className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showInundation ? 'bg-brand text-black' : 'bg-[#0d0d12] text-brand/60 border border-white/5'
            }`}
          >
            Flood Inundation
          </button>

          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showSensors ? 'bg-brand text-black' : 'bg-[#0d0d12] text-brand/60 border border-white/5'
            }`}
          >
            IoT Sensors
          </button>

          <button
            onClick={() => setShowResources(!showResources)}
            className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showResources ? 'bg-brand text-black' : 'bg-[#0d0d12] text-brand/60 border border-white/5'
            }`}
          >
            Fleet Units
          </button>

          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showShelters ? 'bg-brand text-black' : 'bg-[#0d0d12] text-brand/60 border border-white/5'
            }`}
          >
            Shelters
          </button>

          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showHospitals ? 'bg-brand text-black' : 'bg-[#0d0d12] text-brand/60 border border-white/5'
            }`}
          >
            Hospitals
          </button>

          <button
            onClick={() => setShowReports(!showReports)}
            className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              showReports ? 'bg-brand text-black' : 'bg-[#0d0d12] text-brand/60 border border-white/5'
            }`}
          >
            Citizen SOS
          </button>

          <button
            onClick={() => setShowSentinelSAR(!showSentinelSAR)}
            className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              showSentinelSAR ? 'bg-sky-600 text-white border border-sky-400' : 'bg-[#0d0d12] text-sky-400/60 border border-white/5'
            }`}
            title="ESA Sentinel-1 C-Band Synthetic Aperture Radar (SAR)"
          >
            🛰️ Sentinel SAR
          </button>

          <button
            onClick={() => setShowNASAFIRMS(!showNASAFIRMS)}
            className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              showNASAFIRMS ? 'bg-amber-600 text-white border border-amber-400' : 'bg-[#0d0d12] text-amber-400/60 border border-white/5'
            }`}
            title="NASA FIRMS MODIS/VIIRS Satellite Detection Feed"
          >
            🔥 NASA FIRMS
          </button>
        </div>

        {/* Time Horizon Slider */}
        <div className="flex items-center gap-1.5 bg-[#050507] p-1.5 rounded-none border border-white/10 shadow-none backdrop-blur-md pointer-events-auto">
          <Clock className="w-3.5 h-3.5 text-brand ml-1" />
          <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-brand/60 hidden sm:inline">Timeline:</span>
          
          <div className="flex items-center bg-[#050507] p-0.5 rounded-none border border-white/5">
            <button
              onClick={() => setTimeHorizon('live')}
              className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                timeHorizon === 'live' ? 'bg-brand text-black' : 'text-brand hover:text-[#e0e0e6]'
              }`}
            >
              NOW
            </button>
            <button
              onClick={() => setTimeHorizon('30m')}
              className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                timeHorizon === '30m' ? 'bg-brand text-black' : 'text-brand hover:text-[#e0e0e6]'
              }`}
            >
              +30m
            </button>
            <button
              onClick={() => setTimeHorizon('1h')}
              className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                timeHorizon === '1h' ? 'bg-brand text-black' : 'text-brand hover:text-[#e0e0e6]'
              }`}
            >
              +1h
            </button>
            <button
              onClick={() => setTimeHorizon('2h')}
              className={`px-3 py-1 rounded-none text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                timeHorizon === '2h' ? 'bg-brand text-black' : 'text-brand hover:text-[#e0e0e6]'
              }`}
            >
              +2h
            </button>
          </div>
        </div>

      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Interactive Evacuation Route Controller */}
      <div className="absolute top-16 left-3 z-20 w-80 md:w-96 bg-[#08080c]/95 border border-white/10 p-3.5 rounded shadow-2xl backdrop-blur-md text-xs text-[#e0e0e6] space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-sm tracking-tight text-white font-sans">
              Passenger Safe Route Engine
            </span>
          </div>
          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-bold">
            Live Avoidance
          </span>
        </div>

        {/* Origin Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-neutral-400 uppercase font-bold block">
            1. Passenger Origin Location:
          </label>
          <div className="flex gap-1.5">
            <select
              value={routeOriginName}
              onChange={(e) => {
                const name = e.target.value;
                setRouteOriginName(name);
                const presets: Record<string, [number, number]> = {
                  'Velachery 100ft Road (Vijaya Nagar Junction)': [12.9785, 80.2205],
                  'Guindy Railway Station Corridor': [13.0067, 80.2117],
                  'Kotturpuram Adyar River Bank': [13.0231, 80.2411],
                  'Taramani 100ft Canal Link Road': [12.9863, 80.2432]
                };
                const coords = presets[name] || routeOriginCoords;
                setRouteOriginCoords(coords);
                if (onCalculateEvacuationRoute) {
                  onCalculateEvacuationRoute(name, coords, selectedShelterId);
                }
              }}
              className="flex-1 bg-[#101018] border border-white/10 text-xs text-[#e0e0e6] font-mono rounded p-1.5 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Velachery 100ft Road (Vijaya Nagar Junction)">📍 Velachery 100ft Road</option>
              <option value="Guindy Railway Station Corridor">📍 Guindy Station</option>
              <option value="Kotturpuram Adyar River Bank">📍 Kotturpuram Adyar</option>
              <option value="Taramani 100ft Canal Link Road">📍 Taramani Link Road</option>
              {routeOriginName.startsWith('GPS Pin') || routeOriginName.startsWith('Citizen') ? (
                <option value={routeOriginName}>🎯 {routeOriginName}</option>
              ) : null}
            </select>

            <button
              onClick={() => setIsClickToPickOrigin(!isClickToPickOrigin)}
              title="Click on the map to place origin pin"
              className={`px-2.5 py-1.5 rounded border text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                isClickToPickOrigin
                  ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                  : 'bg-[#141420] text-neutral-300 border-white/10 hover:border-white/30'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isClickToPickOrigin ? 'Click Map...' : 'Pick Pin'}</span>
            </button>
          </div>
        </div>

        {/* Destination Shelter Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-neutral-400 uppercase font-bold block">
            2. Relief Shelter Destination:
          </label>
          <select
            value={selectedShelterId}
            onChange={(e) => {
              const shId = e.target.value;
              setSelectedShelterId(shId);
              if (onCalculateEvacuationRoute) {
                onCalculateEvacuationRoute(routeOriginName, routeOriginCoords, shId);
              }
            }}
            className="w-full bg-[#101018] border border-white/10 text-xs text-[#e0e0e6] font-mono rounded p-1.5 focus:outline-none focus:border-emerald-500/50"
          >
            {shelters.map((s) => (
              <option key={s.id} value={s.id}>
                ⛺ {s.name} ({s.totalCapacity - s.currentOccupancy} Beds Available)
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (onCalculateEvacuationRoute) {
              onCalculateEvacuationRoute(routeOriginName, routeOriginCoords, selectedShelterId);
            }
          }}
          disabled={isCalculatingRoute}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow border border-emerald-400/40 uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isCalculatingRoute ? (
            <span>AI Computing Hazard-Free Path...</span>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>Calculate Safe Route</span>
            </>
          )}
        </button>

        {/* Active Route Summary Card */}
        {evacuationRoute && (
          <div className="bg-[#12121a] border border-emerald-500/40 p-2.5 rounded space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <div>
                <span className="text-[9px] text-emerald-400 uppercase font-bold block">Target Destination:</span>
                <span className="font-sans font-bold text-white">{evacuationRoute.destinationShelterName}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-emerald-400 block leading-tight">
                  {evacuationRoute.safetyScorePct}%
                </span>
                <span className="text-[9px] text-neutral-400 uppercase">Safety Index</span>
              </div>
            </div>

            <div className="flex justify-between text-[11px] bg-[#09090d] p-1.5 rounded border border-white/5">
              <span>Distance: <strong className="text-white">{evacuationRoute.distanceKm} km</strong></span>
              <span>Time: <strong className="text-white">{evacuationRoute.estimatedTimeMinutes} mins</strong></span>
            </div>

            <div className="text-[10px] text-neutral-300 bg-red-950/30 border border-red-500/30 p-1.5 rounded">
              <strong className="text-red-400 uppercase">Hazards Avoided:</strong>{' '}
              {evacuationRoute.hazardsAvoided.join(' • ')}
            </div>

            <button
              onClick={() => setShowStepsDrawer(!showStepsDrawer)}
              className="w-full text-left text-[10px] text-emerald-400 hover:underline flex items-center justify-between cursor-pointer pt-1"
            >
              <span>Turn-by-Turn Guidance ({evacuationRoute.turnByTurnInstructions.length} Steps)</span>
              <span>{showStepsDrawer ? '▲ Hide' : '▼ Expand'}</span>
            </button>

            {showStepsDrawer && (
              <ol className="list-decimal list-inside text-[10px] text-neutral-300 space-y-1 bg-[#09090d] p-2 rounded max-h-36 overflow-y-auto border border-white/5">
                {evacuationRoute.turnByTurnInstructions.map((step, idx) => (
                  <li key={idx} className="pb-1 border-b border-white/5 last:border-0">{step}</li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {imagePreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-[#0d0d12] border border-white/10 rounded p-3 space-y-2">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-bold text-white uppercase">Citizen Field Report Attachment</span>
              <button
                onClick={() => setImagePreviewUrl(null)}
                className="text-neutral-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={imagePreviewUrl} alt="Enlarged Report" className="w-full max-h-[70vh] object-contain rounded" />
          </div>
        </div>
      )}

      {/* Selected Item Inspector Panel */}
      {selectedItem && (
        <div className="absolute bottom-12 left-4 right-4 md:left-auto md:right-4 md:w-96 z-20 bg-[#0e0e14] border border-white/10 p-3 rounded-none shadow-none text-[#e0e0e6] animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between border-b border-white/5 pb-2.5 mb-2.5">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#e0e0e6] px-1.5 py-0.5 bg-brand/10 rounded-none border border-brand/40">
                {selectedItem.type.toUpperCase()} INSPECTOR
              </span>
              <h3 className="text-sm font-bold text-[#e0e0e6] mt-1.5 font-sans">
                {selectedItem.data.name || selectedItem.data.locationName || 'Selected Item'}
              </h3>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-brand hover:text-[#e0e0e6] p-1 rounded-none hover:bg-brand/5 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Details by Type */}
          {selectedItem.type === 'zone' && (
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">RISK SCORE:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.riskScore}/100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">CURRENT WATER DEPTH:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.currentWaterLevelMeters} m</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">PREDICTED +1H DEPTH:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.predictedWaterLevel1h} m</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">POPULATION AT RISK:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.populationAtRisk?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand/60">LEAD TIME TO INUNDATION:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.estimatedTimeToInundationMin} MINS</span>
              </div>
            </div>
          )}

          {selectedItem.type === 'sensor' && (
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">SENSOR ID:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">TELEMETRY READING:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.currentValue} {selectedItem.data.unit}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">CRITICAL THRESHOLD:</span>
                <span className="text-[#e0e0e6]">{selectedItem.data.thresholdCritical} {selectedItem.data.unit}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand/60">STATUS:</span>
                <span className="text-[#e0e0e6] font-bold uppercase">{selectedItem.data.batteryPct}% BAT | {selectedItem.data.signalPct}% SIG</span>
              </div>
            </div>
          )}

          {selectedItem.type === 'resource' && (
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">FLEET UNIT:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">STATUS:</span>
                <span className="font-bold text-[#e0e0e6] uppercase">{selectedItem.data.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">CREW SIZE:</span>
                <span className="text-brand">{selectedItem.data.crewCount} Personnel</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand/60">EQUIPMENT:</span>
                <span className="text-brand text-right">{selectedItem.data.equipment?.join(', ')}</span>
              </div>
            </div>
          )}

          {selectedItem.type === 'shelter' && (
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">ADDRESS:</span>
                <span className="text-brand">{selectedItem.data.address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">CAPACITY UTILIZATION:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.currentOccupancy} / {selectedItem.data.totalCapacity}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand/60">RATIONS:</span>
                <span className="text-[#e0e0e6] font-bold">{selectedItem.data.foodSuppliesDays} Days Supply</span>
              </div>
            </div>
          )}

          {selectedItem.type === 'hospital' && (
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">STATUS:</span>
                <span className="font-bold text-[#e0e0e6] uppercase">{selectedItem.data.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-brand/60">CAPACITY:</span>
                <span className="font-bold text-[#e0e0e6]">
                  {selectedItem.data.totalCapacity ?? selectedItem.data.total_beds ?? 0} Total Beds
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-brand/60">AVAILABLE ICU:</span>
                <span className="text-brand font-bold">
                  {selectedItem.data.icuBedsAvailable ?? selectedItem.data.available_icu_beds ?? 0} Beds
                </span>
              </div>
            </div>
          )}
          {selectedItem.type === 'report' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">REPORTER:</span>
                <span className="font-bold text-[#e0e0e6]">{selectedItem.data.reporterName || 'Anonymous Citizen'} ({selectedItem.data.phone || '108/112'})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">INCIDENT CATEGORY:</span>
                <span className="font-bold text-[#e0e0e6] uppercase">{selectedItem.data.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">AI CREDIBILITY SCORE:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {selectedItem.data.aiValidationScore || 94}% Verified
                </span>
              </div>
              <p className="text-[#e0e0e6] font-sans italic bg-[#0d0d12] p-2 rounded border border-white/5 text-[11px]">
                "{selectedItem.data.description || 'Citizen hazard report'}"
              </p>

              {selectedItem.data.imageUrl && (
                <div className="pt-1">
                  <span className="text-[10px] text-neutral-400 uppercase block mb-1">Attached Incident Photo:</span>
                  <img
                    src={selectedItem.data.imageUrl}
                    alt="Citizen report photo"
                    onClick={() => setImagePreviewUrl(selectedItem.data.imageUrl)}
                    className="w-full h-24 object-cover rounded border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </div>
              )}

              {onCalculateEvacuationRoute && (
                <button
                  onClick={() => {
                    const rName = selectedItem.data.locationName || selectedItem.data.reporterName || 'Citizen Report Incident';
                    const rCoords: [number, number] = [selectedItem.data.lat, selectedItem.data.lng];
                    setRouteOriginName(rName);
                    setRouteOriginCoords(rCoords);
                    onCalculateEvacuationRoute(rName, rCoords, selectedShelterId);
                  }}
                  className="w-full mt-2 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Route Evacuation From This Location</span>
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* Legend Footer Bar */}
      <div className="bg-[#050507] border-t border-white/10 px-6 h-9 flex flex-wrap items-center justify-between text-[10px] font-mono text-brand/60 z-20">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-none bg-neutral-400"></span>
            <span>HIGH_RISK_ZONE</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-none bg-neutral-600"></span>
            <span>FLOOD_INUNDATION</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-none bg-brand"></span>
            <span>RESCUE_UNITS</span>
          </div>
        </div>
        <div>
          <span className="text-brand/60">COORDINATES:</span> <span className="text-[#e0e0e6]">12.9784° N, 80.2185° E</span>
        </div>
      </div>

    </div>
  );
};
