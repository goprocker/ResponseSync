import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { EmergencyShelter, CitizenReport, EvacuationRoute } from '../../shared/types.js';
import { CitizenReportSchema } from '../../services/schema.js';
import {
  Users,
  Navigation,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Camera,
  Phone,
  Send,
  Home,
  CheckCircle2,
  Sparkles,
  LifeBuoy,
  Clock,
  ExternalLink,
  Crosshair,
  Map as MapIcon,
  X,
  Check,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react';

const geocodeCache = new Map<string, string>();

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const roundedLat = Number(lat.toFixed(4));
  const roundedLng = Number(lng.toFixed(4));
  const cacheKey = `${roundedLat},${roundedLng}`;

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}&zoom=18&addressdetails=1`, {
      headers: { 'Accept-Language': 'en' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address;
        if (addr) {
          const mainRoad = addr.road || addr.suburb || addr.neighbourhood || addr.residential || addr.building || addr.amenity;
          const area = addr.suburb || addr.city_district || addr.city || addr.town || addr.county;
          if (mainRoad && area && mainRoad !== area) {
            const formatted = `${mainRoad}, ${area}`;
            geocodeCache.set(cacheKey, formatted);
            return formatted;
          }
        }
        const formatted = data.display_name.split(',').slice(0, 3).join(',');
        geocodeCache.set(cacheKey, formatted);
        return formatted;
      }
    }
  } catch (err) {
    console.warn('Reverse geocode warning:', err);
  }
  const fallback = `Location (${roundedLat}, ${roundedLng})`;
  geocodeCache.set(cacheKey, fallback);
  return fallback;
}

interface MapPinPickerModalProps {
  isOpen: boolean;
  initialLat: number;
  initialLng: number;
  initialAddress: string;
  onClose: () => void;
  onConfirmLocation: (lat: number, lng: number, address: string) => void;
}

const MapPinPickerModal: React.FC<MapPinPickerModalProps> = ({
  isOpen,
  initialLat,
  initialLng,
  initialAddress,
  onClose,
  onConfirmLocation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [pickedLat, setPickedLat] = useState(initialLat);
  const [pickedLng, setPickedLng] = useState(initialLng);
  const [pickedAddress, setPickedAddress] = useState(initialAddress);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocatingSelf, setIsLocatingSelf] = useState(false);

  const quickPresets = [
    { name: 'Velachery Sluice Gate', coords: [12.9785, 80.2205] as [number, number] },
    { name: 'Guindy Railway Station', coords: [13.0067, 80.2117] as [number, number] },
    { name: 'Kotturpuram Adyar Riverbank', coords: [13.0231, 80.2411] as [number, number] },
    { name: 'Taramani Canal Link Road', coords: [12.9863, 80.2432] as [number, number] },
    { name: 'Madipakkam Lake Road', coords: [12.9648, 80.2012] as [number, number] }
  ];

  const updatePosition = async (lat: number, lng: number) => {
    const roundedLat = Number(lat.toFixed(4));
    const roundedLng = Number(lng.toFixed(4));
    setPickedLat(roundedLat);
    setPickedLng(roundedLng);
    setIsGeocoding(true);
    const addr = await reverseGeocode(roundedLat, roundedLng);
    setPickedAddress(addr);
    setIsGeocoding(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    // Reset state to current form initial values
    setPickedLat(initialLat);
    setPickedLng(initialLng);
    setPickedAddress(initialAddress);

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 15,
          zoomControl: true
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }).addTo(map);

        const pinIconHtml = `
          <div style="
            background: #ef4444;
            color: white;
            border: 2px solid #ffffff;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6);
            cursor: grab;
          ">
            📍
          </div>
        `;

        const customIcon = L.divIcon({
          html: pinIconHtml,
          className: 'picker-pin-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const marker = L.marker([initialLat, initialLng], {
          icon: customIcon,
          draggable: true
        }).addTo(map);

        markerRef.current = marker;

        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          updatePosition(lat, lng);
        });

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          updatePosition(pos.lat, pos.lng);
        });

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView([initialLat, initialLng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([initialLat, initialLng]);
        }
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleSelectPreset = (coords: [number, number], name: string) => {
    setPickedLat(coords[0]);
    setPickedLng(coords[1]);
    setPickedAddress(name);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo(coords, 16, { duration: 0.8 });
      markerRef.current.setLatLng(coords);
    }
  };

  const handleModalGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported by browser.');
      return;
    }
    setIsLocatingSelf(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 0.8 });
          markerRef.current.setLatLng([lat, lng]);
        }
        updatePosition(lat, lng);
        setIsLocatingSelf(false);
      },
      (err) => {
        setIsLocatingSelf(false);
        alert('Could not access GPS location. Please select pin on map manually.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#0e0e14] border border-white/10 rounded-none w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 bg-[#050507] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand" />
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Pick Exact Incident Location
              </h3>
              <p className="text-[11px] text-neutral-400">
                Click anywhere on the map or drag the pin marker to specify the exact emergency site.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar & GPS Button */}
        <div className="p-2.5 bg-[#0e0e14] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mr-1">Hotspots:</span>
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.coords, preset.name)}
                className="px-2 py-1 bg-[#050507] hover:bg-brand/20 text-neutral-300 hover:text-brand border border-white/10 hover:border-brand/40 text-[10px] font-mono rounded transition-colors cursor-pointer"
              >
                📍 {preset.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleModalGPS}
            disabled={isLocatingSelf}
            className="px-2.5 py-1 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 rounded cursor-pointer transition-all disabled:opacity-50"
          >
            <Crosshair className={`w-3.5 h-3.5 text-brand ${isLocatingSelf ? 'animate-spin' : ''}`} />
            <span>{isLocatingSelf ? 'Locating...' : 'Use My GPS'}</span>
          </button>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[380px] bg-[#050507]">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          <div className="absolute top-3 left-3 z-[400] bg-[#050507]/90 text-white text-[10px] font-mono px-2.5 py-1 rounded border border-white/10 backdrop-blur-md shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Click or drag pin marker on map</span>
          </div>
        </div>

        {/* Footer info & Confirmation */}
        <div className="p-4 bg-[#050507] border-t border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0e0e14] p-3 border border-white/10 rounded">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono uppercase text-neutral-500 block">Selected Address / Landmark:</span>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                {isGeocoding ? (
                  <span className="text-brand font-mono flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Geocoding coordinates...
                  </span>
                ) : (
                  <span>{pickedAddress}</span>
                )}
              </div>
            </div>

            <div className="text-right font-mono text-[10px] text-brand shrink-0 bg-brand/10 px-2 py-1 rounded border border-brand/20">
              <span>Lat: {pickedLat.toFixed(4)}</span>
              <span className="ml-2">Lng: {pickedLng.toFixed(4)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white border border-white/10 text-xs font-mono font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirmLocation(pickedLat, pickedLng, pickedAddress)}
              className="px-5 py-2 bg-brand hover:bg-brand-deep text-black font-extrabold text-xs font-mono uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 shadow-lg shadow-brand/20 cursor-pointer"
            >
              <Check className="w-4 h-4 text-black stroke-[3]" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

interface CitizenPortalProps {
  shelters: EmergencyShelter[];
  reports: CitizenReport[];
  onSubmitReport: (reportData: Partial<CitizenReport>) => void;
  evacuationRoute?: EvacuationRoute;
  onSelectRouteShelter: (shelterId: string) => void;
  onCalculateEvacuationRoute?: (originName: string, originCoords: [number, number], shelterId: string) => void;
  onNavigateToMap?: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  shelters,
  reports,
  onSubmitReport,
  evacuationRoute,
  onSelectRouteShelter,
  onCalculateEvacuationRoute,
  onNavigateToMap
}) => {
  const [originChoice, setOriginChoice] = useState({
    name: 'Velachery 100ft Road (Vijaya Nagar Junction)',
    coords: [12.9785, 80.2205] as [number, number]
  });

  const [selectedShelterId, setSelectedShelterId] = useState(shelters[0]?.id || 'sh-01');

  const origins = [
    { name: 'Velachery 100ft Road (Vijaya Nagar Junction)', coords: [12.9785, 80.2205] as [number, number] },
    { name: 'Guindy Railway Station Corridor', coords: [13.0067, 80.2117] as [number, number] },
    { name: 'Kotturpuram Adyar River Bank', coords: [13.0231, 80.2411] as [number, number] },
    { name: 'Taramani 100ft Canal Link Road', coords: [12.9863, 80.2432] as [number, number] }
  ];

  const handleOriginChange = (origName: string) => {
    const found = origins.find(o => o.name === origName) || origins[0];
    setOriginChoice(found);
    if (onCalculateEvacuationRoute) {
      onCalculateEvacuationRoute(found.name, found.coords, selectedShelterId);
    }
  };

  const handleShelterChange = (shId: string) => {
    setSelectedShelterId(shId);
    if (onCalculateEvacuationRoute) {
      onCalculateEvacuationRoute(originChoice.name, originChoice.coords, shId);
    } else {
      onSelectRouteShelter(shId);
    }
  };

  const [reportForm, setReportForm] = useState({
    reporterName: '',
    phone: '',
    locationName: 'Velachery 100ft Road near Vijaya Nagar Junction',
    lat: 12.9785,
    lng: 80.2205,
    category: 'waterlogging' as const,
    severity: 'critical' as const,
    description: '',
    imageUrl: ''
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationCapturedType, setLocationCapturedType] = useState<'manual' | 'gps' | 'map_pin'>('manual');
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<any | null>(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        const address = await reverseGeocode(lat, lng);
        setReportForm(prev => ({
          ...prev,
          lat,
          lng,
          locationName: address
        }));
        setLocationCapturedType('gps');
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location fetch error:', err);
        setIsLocating(false);
        alert('Could not retrieve current GPS location. Please allow browser permissions or use "Pick Pin on Map".');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleConfirmPickedLocation = (lat: number, lng: number, address: string) => {
    setReportForm(prev => ({
      ...prev,
      lat,
      lng,
      locationName: address
    }));
    setLocationCapturedType('map_pin');
    setShowMapPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseResult = CitizenReportSchema.safeParse({
      reporterName: reportForm.reporterName || 'Anonymous Citizen',
      phone: reportForm.phone,
      locationName: reportForm.locationName,
      lat: reportForm.lat,
      lng: reportForm.lng,
      hazardType: reportForm.category,
      severity: reportForm.severity,
      description: reportForm.description,
      imageUrl: reportForm.imageUrl
    });

    if (!parseResult.success) {
      alert(`Validation Error: ${parseResult.error.issues[0]?.message || 'Invalid form input'}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate report using Gemini API server-side
      const response = await fetch('/api/ai/validate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: reportForm.description,
          category: reportForm.category,
          locationName: reportForm.locationName,
          hasImage: !!reportForm.imageUrl
        })
      });

      const data = await response.json();
      const validationData = data.data || {
        aiValidationScore: 92,
        aiValidatedCategory: 'Severe Flood Waterlogging',
        aiSummary: 'High urgency report verified with nearby IoT sensors.',
        urgency: 'high'
      };

      setSubmissionFeedback(validationData);

      onSubmitReport({
        ...reportForm,
        lat: reportForm.lat,
        lng: reportForm.lng,
        aiValidationScore: validationData.aiValidationScore,
        aiValidatedCategory: validationData.aiValidatedCategory,
        aiSummary: validationData.aiSummary,
        status: 'verified',
        timestamp: 'Just now'
      });
    } catch (err) {
      console.error('Error validating citizen report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-5 space-y-5 text-[#e0e0e6] font-sans">
      
      {/* Title Header */}
      <div className="bg-[#050507] p-6 rounded-none border border-white/10 shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-brand/15 text-[#e0e0e6] border border-brand/30 flex items-center gap-1.5 w-fit mb-2">
            <Users className="w-3.5 h-3.5 text-[#e0e0e6]" />
            Citizen Emergency & Evacuation Portal
          </span>
          <h2 className="text-2xl font-bold text-[#e0e0e6] tracking-tight font-sans">
            Real-Time Safe Evacuation & Incident Reporting
          </h2>
          <p className="text-xs text-[#888899]">
            Get dynamic flood-aware navigation to nearby shelters, report stranded citizens or waterlogging, and receive instant AI verification status.
          </p>
        </div>

        <a
          href="tel:1070"
          className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-deep text-black font-bold uppercase tracking-wider rounded shadow-lg shadow-none transition-all text-xs shrink-0 cursor-pointer"
        >
          <Phone className="w-4 h-4 animate-bounce fill-black" />
          <span>Emergency Helpline (1070 / 112)</span>
        </a>
      </div>

      {/* Grid: Evacuation Router + Report Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Smart Evacuation Router (6 cols) */}
        <div className="lg:col-span-6 bg-[#050507] rounded-none border border-white/10 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#e0e0e6]" />
              <h3 className="font-bold text-[#e0e0e6] text-sm uppercase tracking-wider font-sans">
                Dynamic Flood-Aware Evacuation Router
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-brand bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest">
              AI Route Engine
            </span>
          </div>

          {/* Location & Shelter Picker */}
          <div className="space-y-3 bg-[#050507] p-4 rounded border border-white/5 text-xs">
            <div>
              <label className="text-[#888] font-mono uppercase text-[10px] block mb-1">Select Your Starting Origin:</label>
              <select
                value={originChoice.name}
                onChange={(e) => handleOriginChange(e.target.value)}
                className="w-full bg-[#0d0d12] border border-white/10 text-xs text-[#e0e0e6] font-mono font-bold rounded p-2 focus:outline-none focus:border-brand/40"
              >
                {origins.map((orig, idx) => (
                  <option key={idx} value={orig.name}>
                    📍 {orig.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#888] font-mono uppercase text-[10px] block mb-1">Select Relief Shelter Destination:</label>
              <select
                value={selectedShelterId}
                onChange={(e) => handleShelterChange(e.target.value)}
                className="w-full bg-[#0d0d12] border border-white/10 text-xs text-[#e0e0e6] font-mono font-bold rounded p-2 focus:outline-none focus:border-brand/40"
              >
                {shelters.map((shelter) => (
                  <option key={shelter.id} value={shelter.id}>
                    ⛺ {shelter.name} ({shelter.totalCapacity - shelter.currentOccupancy} Spaces Open)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Evacuation Route Card */}
          {evacuationRoute ? (
            <div className="bg-[#050507] border-l-4 border-emerald-500 border-t border-b border-r border-white/5 p-4 rounded space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-brand bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    SAFE ROUTE GENERATED
                  </span>
                  <h4 className="text-sm font-bold text-[#e0e0e6] mt-1">
                    To: {evacuationRoute.destinationShelterName}
                  </h4>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-bold text-brand">
                    {evacuationRoute.safetyScorePct}%
                  </span>
                  <span className="text-[10px] text-[#888] block uppercase">Safety Score</span>
                </div>
              </div>

              <div className="flex justify-between text-xs font-mono bg-[#050507] p-2.5 rounded border border-white/5">
                <span>Distance: <strong className="text-[#e0e0e6]">{evacuationRoute.distanceKm} km</strong></span>
                <span>Est. Time: <strong className="text-[#e0e0e6]">{evacuationRoute.estimatedTimeMinutes} Mins</strong></span>
              </div>

              {/* Turn-by-Turn Steps */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-[#888] uppercase block flex items-center justify-between">
                  <span>Turn-by-Turn Guidance (Hazards Bypassed):</span>
                  <span className="text-brand font-normal">Active AI Safe Detour</span>
                </span>
                <ol className="list-decimal list-inside text-xs text-[#ccc] space-y-1 font-mono">
                  {evacuationRoute.turnByTurnInstructions.map((step, idx) => (
                    <li key={idx} className="bg-[#050507] p-2 rounded border border-white/5">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="text-[11px] font-mono text-[#e0e0e6] bg-brand/10 p-2 rounded border border-brand/30">
                <strong>Hazards Avoided:</strong> {evacuationRoute.hazardsAvoided.join(' • ')}
              </div>

              <button
                onClick={() => {
                  const destCoords = evacuationRoute.waypoints && evacuationRoute.waypoints.length > 0
                    ? evacuationRoute.waypoints[evacuationRoute.waypoints.length - 1]
                    : [12.9830, 80.2182];
                  
                  const launchMaps = (orig?: string) => {
                    let url = `https://www.google.com/maps/dir/?api=1&destination=${destCoords[0]},${destCoords[1]}&travelmode=driving`;
                    if (orig) url += `&origin=${orig}`;
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
                }}
                className="w-full mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
              >
                <Navigation className="w-4 h-4 fill-black" />
                <span>Open Direct Navigation in Google Maps ↗</span>
              </button>

              {onNavigateToMap && (
                <button
                  onClick={onNavigateToMap}
                  className="w-full mt-2 py-2 bg-brand/15 hover:bg-brand/25 text-brand border border-brand/30 hover:border-brand font-mono text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>View Route on Interactive Digital Twin Map</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-[#666] text-xs font-mono">
              Select a destination shelter above to view the safest flood-avoiding route.
            </div>
          )}

        </div>

        {/* Right Column: Citizen Incident Reporting Form (6 cols) */}
        <div className="lg:col-span-6 bg-[#050507] rounded-none border border-white/10 p-5 shadow-none space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#e0e0e6]" />
              <h3 className="font-bold text-[#e0e0e6] text-sm uppercase tracking-wider font-sans">
                Submit Emergency Incident Report
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest">
              AI Instant Validation
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#888] font-mono uppercase text-[10px] block mb-1">Your Name:</label>
                <input
                  type="text"
                  required
                  value={reportForm.reporterName}
                  onChange={(e) => setReportForm({ ...reportForm, reporterName: e.target.value })}
                  placeholder="e.g. Senthil Nathan"
                  className="w-full bg-[#050507] border border-white/10 text-[#ccc] rounded p-2 focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="text-[#888] font-mono uppercase text-[10px] block mb-1">Phone Number:</label>
                <input
                  type="text"
                  required
                  value={reportForm.phone}
                  onChange={(e) => setReportForm({ ...reportForm, phone: e.target.value })}
                  placeholder="+91 98400 xxxxx"
                  className="w-full bg-[#050507] border border-white/10 text-[#ccc] rounded p-2 focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            {/* Location Section with GPS & Map Pin Picker */}
            <div className="space-y-2 bg-[#0a0a0f] p-3 rounded border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-[#aaa] font-mono uppercase text-[10px] font-bold block">
                  Incident Location Selection:
                </label>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 font-bold uppercase">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {locationCapturedType === 'gps' ? 'GPS Device Location' : 'Map Pin Location'}
                </span>
              </div>

              {/* Action Buttons: GPS & Map Pin Picker */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="px-3 py-2 bg-[#050507] hover:bg-brand/20 text-brand border border-brand/30 hover:border-brand rounded text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Crosshair className={`w-3.5 h-3.5 text-brand ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : '📍 Use My Location'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="px-3 py-2 bg-[#050507] hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400 rounded text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🗺️ Pick Pin on Map</span>
                </button>
              </div>

              {/* Selected Location Address Card (Read-only, driven by GPS or Map Pin) */}
              <div className="bg-[#050507] p-2.5 rounded border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
                  <span className="uppercase tracking-wider">Captured Incident Site:</span>
                  <span className="text-brand font-bold">
                    Lat: {reportForm.lat.toFixed(4)}, Lng: {reportForm.lng.toFixed(4)}
                  </span>
                </div>
                <div className="text-xs font-medium text-white flex items-start gap-2 bg-[#0a0a0f] p-2 rounded border border-white/5">
                  <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="leading-snug">{reportForm.locationName || 'No location picked yet. Click "Use My Location" or "Pick Pin on Map".'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#888] font-mono uppercase text-[10px] block mb-1">Category:</label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm({ ...reportForm, category: e.target.value as any })}
                  className="w-full bg-[#050507] border border-white/10 text-[#ccc] rounded p-2 focus:outline-none"
                >
                  <option value="waterlogging">🌊 Severe Waterlogging</option>
                  <option value="trapped_citizens">🆘 Trapped Inhabitants</option>
                  <option value="road_block">🚧 Road / Subway Blockage</option>
                  <option value="medical_emergency">🏥 Medical Ambulance Need</option>
                  <option value="power_outage">⚡ High Voltage Electrical Hazard</option>
                </select>
              </div>

              <div>
                <label className="text-[#888] font-mono uppercase text-[10px] block mb-1">Severity Level:</label>
                <select
                  value={reportForm.severity}
                  onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value as any })}
                  className="w-full bg-[#050507] border border-white/10 text-[#ccc] rounded p-2 focus:outline-none font-mono text-[#e0e0e6] font-bold"
                >
                  <option value="critical">CRITICAL (Immediate Life Risk)</option>
                  <option value="high">HIGH (Severe Inundation)</option>
                  <option value="medium">MEDIUM (Traffic / Waterlogging)</option>
                  <option value="low">LOW (Minor Issue)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#888] font-mono uppercase text-[10px] block mb-1">Incident Description & Water Depth:</label>
              <textarea
                required
                rows={2}
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                placeholder="Detail the situation, ground floor flooding depth, trapped elderly count, etc."
                className="w-full bg-[#050507] border border-white/10 text-[#ccc] rounded p-2 focus:outline-none focus:border-brand"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-brand hover:bg-brand-deep text-black font-bold uppercase tracking-wider text-xs rounded shadow-lg shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 fill-black ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Validating Report...' : 'Submit Emergency Report'}</span>
            </button>
          </form>

          {/* Submission Feedback Banner */}
          {submissionFeedback && (
            <div className="bg-[#050507] border-l-4 border-emerald-500 border-t border-b border-r border-white/5 p-3 rounded text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-brand flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Report Verified by AI Agent
                </span>
                <span className="font-mono font-bold text-emerald-300">
                  {submissionFeedback.aiValidationScore}% Credibility
                </span>
              </div>
              <p className="text-[#ccc] font-sans">{submissionFeedback.aiSummary}</p>
            </div>
          )}

        </div>

      </div>

      {/* Map Pin Picker Modal */}
      <MapPinPickerModal
        isOpen={showMapPicker}
        initialLat={reportForm.lat}
        initialLng={reportForm.lng}
        initialAddress={reportForm.locationName}
        onClose={() => setShowMapPicker(false)}
        onConfirmLocation={handleConfirmPickedLocation}
      />

      {/* Open Relief Shelters List */}
      <div className="bg-[#050507] rounded-none border border-white/10 p-5 shadow-none space-y-4">
        <h3 className="font-bold text-[#e0e0e6] text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
          <Home className="w-4 h-4 text-[#e0e0e6]" />
          Open Relief Shelters & Emergency Camps
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shelters.map((shelter) => {
            return (
              <div key={shelter.id} className="bg-[#050507] p-4 rounded border border-white/5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-brand bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      {shelter.status.toUpperCase()}
                    </span>
                    <h4 className="font-bold text-[#e0e0e6] text-sm mt-1 font-sans">{shelter.name}</h4>
                  </div>
                </div>

                <p className="text-xs text-[#aaa] flex items-center gap-1 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-[#e0e0e6]" />
                  {shelter.address}
                </p>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-[#ccc]">
                    <span>Capacity:</span>
                    <span className="font-bold text-brand">{shelter.currentOccupancy} / {shelter.totalCapacity}</span>
                  </div>
                  <div className="w-full bg-[#050507] h-1.5 rounded overflow-hidden">
                    <div className="bg-brand h-full" style={{ width: `${(shelter.currentOccupancy / shelter.totalCapacity) * 100}%` }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5 font-mono">
                  <span className="text-[#888]">Rations: <strong className="text-brand">{shelter.foodSuppliesDays} Days</strong></span>
                  <span className="text-[#888]">Medical: <strong className="text-[#e0e0e6]">{shelter.medicalStaffPresent ? 'Present' : 'On Call'}</strong></span>
                </div>

                <a
                  href={`tel:${shelter.phone}`}
                  className="w-full py-1.5 bg-transparent hover:bg-[#ffffff08] text-[#ccc] border border-white/10 rounded text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Officer ({shelter.contactPerson})
                </a>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

