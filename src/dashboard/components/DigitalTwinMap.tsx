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
  ChevronDown,
  ChevronUp,
  Minus,
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
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const measureGroupRef = useRef<L.LayerGroup | null>(null);

  // Map Basemap Tile Style
  const [mapTileStyle, setMapTileStyle] = useState<'dark' | 'voyager' | 'satellite' | 'streets'>('dark');

  // Map Measurement Mode State
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

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
  const [isRouteEngineMinimized, setIsRouteEngineMinimized] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Inspector Panel State
  const [selectedItem, setSelectedItem] = useState<{
    type: 'zone' | 'sensor' | 'resource' | 'shelter' | 'report' | 'hospital';
    data: any;
  } | null>(null);

  // Redirect and open direct optimized navigation in Google Maps using current GPS location & destination
  const handleOpenGoogleMaps = () => {
    if (!evacuationRoute || !evacuationRoute.waypoints || evacuationRoute.waypoints.length === 0) {
      const targetShelter = shelters.find(s => s.id === selectedShelterId);
      const destCoords = targetShelter?.location?.coordinates || [12.9830, 80.2182];
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destCoords[0]},${destCoords[1]}&travelmode=driving`, '_blank', 'noopener,noreferrer');
      return;
    }

    const destCoords = evacuationRoute.waypoints[evacuationRoute.waypoints.length - 1];
    const destStr = `${destCoords[0]},${destCoords[1]}`;

    const launchMaps = (originStr?: string) => {
      let url = `https://www.google.com/maps/dir/?api=1&destination=${destStr}&travelmode=driving`;
      if (originStr) {
        url += `&origin=${originStr}`;
      } else {
        const origCoords = evacuationRoute.waypoints[0];
        url += `&origin=${origCoords[0]},${origCoords[1]}`;
      }
      // Direct optimized route - intentionally omitting intermediate waypoints so Google Maps computes the optimal live traffic route
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => launchMaps(`${pos.coords.latitude},${pos.coords.longitude}`),
        () => launchMaps(),
        { timeout: 3500 }
      );
    } else {
      launchMaps();
    }
  };

  // Get tile URL for current style
  const getTileUrl = (style: 'dark' | 'voyager' | 'satellite' | 'streets') => {
    switch (style) {
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'streets':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'voyager':
      default:
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
  };

  // Recenter Map Camera
  const handleRecenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([12.988, 80.230], 13, { duration: 1.2 });
    }
  };

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

      // Add Basemap Tile Layer
      const tileLayer = L.tileLayer(getTileUrl(mapTileStyle), {
        attribution: '&copy; OpenStreetMap &copy; CARTO &copy; Esri',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const layerGroup = L.layerGroup().addTo(map);
      const measureGroup = L.layerGroup().addTo(map);
      
      mapInstanceRef.current = map;
      layersGroupRef.current = layerGroup;
      measureGroupRef.current = measureGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Tiles when style changes
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(getTileUrl(mapTileStyle));
    }
  }, [mapTileStyle]);

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

  // Map measurement click listener
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleMeasureClick = (e: L.LeafletMouseEvent) => {
      if (isMeasuring) {
        setMeasurePoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    };

    map.on('click', handleMeasureClick);
    return () => {
      map.off('click', handleMeasureClick);
    };
  }, [isMeasuring]);

  // Render Measurement Overlay
  useEffect(() => {
    if (!measureGroupRef.current) return;
    const measureGroup = measureGroupRef.current;
    measureGroup.clearLayers();

    if (measurePoints.length > 0) {
      measurePoints.forEach((pt, idx) => {
        const marker = L.circleMarker(pt, {
          radius: 5,
          color: '#fbbf24',
          fillColor: '#fbbf24',
          fillOpacity: 0.9
        }).bindTooltip(`P${idx + 1}`, { permanent: true, direction: 'top' });
        measureGroup.addLayer(marker);
      });

      if (measurePoints.length > 1) {
        const polyline = L.polyline(measurePoints, {
          color: '#fbbf24',
          weight: 3,
          dashArray: '5, 5'
        });
        measureGroup.addLayer(polyline);

        let totalDistMeters = 0;
        for (let i = 0; i < measurePoints.length - 1; i++) {
          const p1 = L.latLng(measurePoints[i][0], measurePoints[i][1]);
          const p2 = L.latLng(measurePoints[i + 1][0], measurePoints[i + 1][1]);
          totalDistMeters += p1.distanceTo(p2);
        }

        const km = (totalDistMeters / 1000).toFixed(2);
        const lastPt = measurePoints[measurePoints.length - 1];
        const distMarker = L.marker(lastPt, {
          icon: L.divIcon({
            html: `<div style="background: #0d0d12; color: #fbbf24; border: 1px solid #fbbf24; padding: 2px 6px; font-size: 10px; font-family: monospace; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">📏 ${km} km</div>`,
            className: 'dist-label',
            iconAnchor: [-10, 0]
          })
        });
        measureGroup.addLayer(distMarker);
      }
    }
  }, [measurePoints]);

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

    // 7. Render Evacuation Route & Waypoints (Lane-Wise Road Corridor)
    if (showRoute && evacuationRoute && Array.isArray(evacuationRoute.waypoints) && evacuationRoute.waypoints.length > 0) {
      const validWaypoints = evacuationRoute.waypoints
        .map((wp: any) => [Number(wp[0]), Number(wp[1])])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng)) as [number, number][];

      if (validWaypoints.length > 0) {
        // LAYER A: Outer Safety Clearance Buffer (Glow Corridor)
        const bufferCorridor = L.polyline(validWaypoints, {
          color: '#059669',
          weight: 16,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // LAYER B: Road Asphalt Casing
        const roadCasing = L.polyline(validWaypoints, {
          color: '#022c22',
          weight: 8,
          opacity: 0.85,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // LAYER C: Active Safe Vehicle Transit Lane (Neon Green)
        const activeLane = L.polyline(validWaypoints, {
          color: '#34d399',
          weight: 4,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // LAYER D: Center Lane Divider Markings (White Dashed Line)
        const laneDivider = L.polyline(validWaypoints, {
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          dashArray: '6, 10',
          lineCap: 'butt'
        });

        const routeTooltipHtml = `
          <div style="font-family: monospace; font-size: 11px; padding: 4px;">
            <strong style="color: #34d399;">🛣️ SAFE EMERGENCY CORRIDOR</strong><br/>
            Active Lane: <strong>Lane 1 (Elevated Passable Road)</strong><br/>
            Safety Index: <strong>${evacuationRoute.safetyScorePct}% SAFE</strong><br/>
            Distance: ${evacuationRoute.distanceKm} km • Est. Time: ${evacuationRoute.estimatedTimeMinutes} mins
          </div>
        `;

        bufferCorridor.bindTooltip(routeTooltipHtml, { sticky: true });
        roadCasing.bindTooltip(routeTooltipHtml, { sticky: true });
        activeLane.bindTooltip(routeTooltipHtml, { sticky: true });

        layerGroup.addLayer(bufferCorridor);
        layerGroup.addLayer(roadCasing);
        layerGroup.addLayer(activeLane);
        layerGroup.addLayer(laneDivider);

        // Render Lane Guidance Decision Badge along mid-route
        if (validWaypoints.length >= 2) {
          const midIdx = Math.floor(validWaypoints.length / 2);
          const badgeCoords = validWaypoints[midIdx];

          if (badgeCoords) {
            const laneBadgeIcon = L.divIcon({
              html: `<div style="background: #022c22; color: #34d399; border: 1px solid #34d399; padding: 2px 6px; font-size: 9px; font-family: monospace; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.6); border-radius: 2px;">🛣️ LANE 1: Clear Corridor</div>`,
              className: 'lane-badge-mid',
              iconAnchor: [-10, 0]
            });
            layerGroup.addLayer(L.marker(badgeCoords, { icon: laneBadgeIcon }));
          }
        }

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
        
        {/* Layer Toggles & Map Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#050507] p-1.5 rounded-none border border-white/10 shadow-none backdrop-blur-md pointer-events-auto">
          
          {/* Basemap Style Switcher */}
          <div className="flex items-center gap-1 pr-2 border-r border-white/10">
            <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-brand/60 px-1">Map Style:</span>
            <button
              onClick={() => setMapTileStyle('dark')}
              className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition-all ${
                mapTileStyle === 'dark' ? 'bg-brand text-black font-extrabold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setMapTileStyle('satellite')}
              className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition-all ${
                mapTileStyle === 'satellite' ? 'bg-brand text-black font-extrabold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapTileStyle('streets')}
              className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition-all ${
                mapTileStyle === 'streets' ? 'bg-brand text-black font-extrabold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setMapTileStyle('voyager')}
              className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition-all ${
                mapTileStyle === 'voyager' ? 'bg-brand text-black font-extrabold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Voyager
            </button>
          </div>

          {/* Quick Camera & Measurement Controls */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
            <button
              onClick={handleRecenterMap}
              className="px-2 py-1 bg-[#0d0d12] hover:bg-brand/20 text-brand border border-brand/30 text-[10px] font-mono font-bold flex items-center gap-1 transition-all"
              title="Recenter Map View to City Core"
            >
              <Crosshair className="w-3 h-3" />
              <span>Center</span>
            </button>

            <button
              onClick={() => {
                setIsMeasuring(!isMeasuring);
                if (isMeasuring) setMeasurePoints([]);
              }}
              className={`px-2 py-1 text-[10px] font-mono font-bold flex items-center gap-1 border transition-all ${
                isMeasuring 
                  ? 'bg-amber-500 text-black border-amber-400 animate-pulse' 
                  : 'bg-[#0d0d12] text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Click map points to measure real distance"
            >
              <span>📏 {isMeasuring ? 'Click Map...' : 'Ruler'}</span>
            </button>

            {measurePoints.length > 0 && (
              <button
                onClick={() => setMeasurePoints([])}
                className="px-1.5 py-1 bg-red-950/60 text-red-400 border border-red-500/40 text-[9px] font-mono font-bold hover:bg-red-900/60"
                title="Clear Ruler Pins"
              >
                Clear ({measurePoints.length})
              </button>
            )}
          </div>

          <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-brand/60 px-1 flex items-center gap-1">
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
      <div className={`absolute bottom-6 left-3 z-30 bg-[#08080c]/95 border border-emerald-500/30 rounded-lg shadow-2xl backdrop-blur-md text-xs text-[#e0e0e6] font-mono transition-all duration-200 max-h-[75vh] overflow-y-auto ${
        isRouteEngineMinimized ? 'w-auto p-2 min-w-[260px]' : 'w-80 md:w-96 p-3.5 space-y-3'
      }`}>
        <div className={`flex items-center justify-between ${isRouteEngineMinimized ? '' : 'border-b border-white/10 pb-2'}`}>
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setIsRouteEngineMinimized(!isRouteEngineMinimized)}
          >
            <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-sm tracking-tight text-white font-sans">
              Passenger Safe Route Engine
            </span>
            {evacuationRoute && isRouteEngineMinimized && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded font-mono ml-1">
                {evacuationRoute.safetyScorePct}% Safe
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {!isRouteEngineMinimized && (
              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-bold hidden sm:inline-block">
                Live Avoidance
              </span>
            )}
            <button
              onClick={() => setIsRouteEngineMinimized(!isRouteEngineMinimized)}
              className="p-1 text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer flex items-center gap-1"
              title={isRouteEngineMinimized ? "Expand Route Engine" : "Minimize Route Engine"}
            >
              <span className="text-[10px] uppercase font-bold text-neutral-400 hover:text-white">
                {isRouteEngineMinimized ? 'Expand' : 'Minimize'}
              </span>
              {isRouteEngineMinimized ? <ChevronDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isRouteEngineMinimized && (
          <>
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
                    <span className="text-[9px] text-emerald-400 uppercase font-bold block font-mono">KM CORRIDOR DESTINATION:</span>
                    <span className="font-sans font-bold text-white">{evacuationRoute.destinationShelterName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-emerald-400 block leading-tight font-mono">
                      {evacuationRoute.safetyScorePct}%
                    </span>
                    <span className="text-[9px] text-neutral-400 uppercase font-mono">Safety Index</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-[#09090d] p-1.5 rounded border border-white/5 font-mono">
                  <div className="flex justify-between text-neutral-300">
                    <span>Distance:</span>
                    <strong className="text-white">{evacuationRoute.distanceKm} km</strong>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Est Time:</span>
                    <strong className="text-white">{evacuationRoute.estimatedTimeMinutes} mins</strong>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Active Lane:</span>
                    <strong className="text-emerald-400">Lane 1 (Elevated)</strong>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Clearance:</span>
                    <strong className="text-emerald-400">Clear Road</strong>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-300 bg-red-950/30 border border-red-500/30 p-1.5 rounded">
                  <strong className="text-red-400 uppercase font-mono">Hazards Avoided:</strong>{' '}
                  {evacuationRoute.hazardsAvoided.join(' • ')}
                </div>

                <button
                  onClick={handleOpenGoogleMaps}
                  className="w-full mt-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                  title="Open turn-by-turn direction in Google Maps using your live GPS position"
                >
                  <Navigation className="w-4 h-4 fill-black" />
                  <span>Open Navigation in Google Maps ↗</span>
                </button>

                <button
                  onClick={() => setShowStepsDrawer(!showStepsDrawer)}
                  className="w-full text-left text-[10px] font-mono text-emerald-400 hover:underline flex items-center justify-between cursor-pointer pt-1"
                >
                  <span>🛣️ Navigation Steps ({evacuationRoute.turnByTurnInstructions.length})</span>
                  <span>{showStepsDrawer ? '▲ Hide' : '▼ Expand'}</span>
                </button>

                {showStepsDrawer && (
                  <ol className="list-decimal list-inside text-[10px] text-neutral-300 space-y-1 bg-[#09090d] p-2 rounded max-h-36 overflow-y-auto border border-white/5 font-mono">
                    {evacuationRoute.turnByTurnInstructions.map((step, idx) => (
                      <li key={idx} className="pb-1 border-b border-white/5 last:border-0">{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </>
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
      <div className="bg-[#050507] border-t border-white/10 px-4 md:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-neutral-400 z-20">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>
            <span className="text-white font-semibold">HIGH_RISK_ZONE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
            <span className="text-white font-semibold">FLOOD_INUNDATION</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand"></span>
            <span className="text-white font-semibold">RESCUE_UNITS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
            <span className="text-white font-semibold">IOT_SENSORS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
            <span className="text-white font-semibold">SHELTERS</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 uppercase tracking-widest">CENTER:</span>
          <span className="text-brand font-bold">12.9784° N, 80.2185° E (Velachery)</span>
        </div>
      </div>

    </div>
  );
};
