import React from 'react';
import {
  Activity,
  CloudRain,
  Radio,
  Satellite,
  BarChart3,
  Layers,
  Database,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { IoTSensorNode, ZoneRisk } from '../../shared/types';

interface AnalyticsHubProps {
  sensors: IoTSensorNode[];
  zones: ZoneRisk[];
}

export const AnalyticsHub: React.FC<AnalyticsHubProps> = ({ sensors, zones }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-[#e0e0e6] font-sans">
      
      {/* Title Header */}
      <div className="bg-[#040806] p-6 rounded-none border border-[#10b98125] shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-[0.2em] bg-[#10b981]/15 text-emerald-100 border border-[#10b981]/30 flex items-center gap-1.5 w-fit mb-2">
            <Activity className="w-3.5 h-3.5 text-emerald-100" />
            Data Fusion & Telemetry Hub
          </span>
          <h2 className="text-2xl font-bold text-emerald-100 tracking-tight font-sans">
            Multi-Source Telemetry Integration Hub
          </h2>
          <p className="text-sm text-[#aaa]">
            Fusing OpenWeatherMap radar, Tomorrow.io high-tide predictions, NASA FIRMS / Sentinel SAR imagery, Mapbox traffic vectors, and IoT telemetry into unified intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#040806] px-4 py-2 rounded border border-[#10b98125] text-right font-mono">
            <span className="text-[10px] text-[#888] uppercase font-bold block">Avg Response Speedup</span>
            <span className="text-lg font-bold text-emerald-400">42% Faster</span>
          </div>
        </div>
      </div>

      {/* Data Fusion Feed Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#040806] p-4 rounded-none border border-[#10b98125] space-y-2">
          <div className="flex items-center justify-between">
            <CloudRain className="w-4 h-4 text-emerald-100" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h4 className="font-bold text-emerald-100 text-xs uppercase tracking-wider font-sans">Weather Radar Feed</h4>
          <p className="text-xs text-[#aaa]">OpenWeatherMap / IMD Radar</p>
          <div className="text-[11px] font-mono text-emerald-100 font-bold">85 mm/hr Convective Cell</div>
        </div>

        <div className="bg-[#040806] p-4 rounded-none border border-[#10b98125] space-y-2">
          <div className="flex items-center justify-between">
            <Satellite className="w-4 h-4 text-blue-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h4 className="font-bold text-emerald-100 text-xs uppercase tracking-wider font-sans">Satellite SAR Observation</h4>
          <p className="text-xs text-[#aaa]">Sentinel-1 & NASA FIRMS</p>
          <div className="text-[11px] font-mono text-blue-400 font-bold">3.2 km² Inundation Surface</div>
        </div>

        <div className="bg-[#040806] p-4 rounded-none border border-[#10b98125] space-y-2">
          <div className="flex items-center justify-between">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h4 className="font-bold text-emerald-100 text-xs uppercase tracking-wider font-sans">IoT Hydrodynamic Sensors</h4>
          <p className="text-xs text-[#aaa]">5 Ultrasonic Sluice Gauges</p>
          <div className="text-[11px] font-mono text-emerald-400 font-bold">100% Telemetry Online</div>
        </div>

        <div className="bg-[#040806] p-4 rounded-none border border-[#10b98125] space-y-2">
          <div className="flex items-center justify-between">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h4 className="font-bold text-emerald-100 text-xs uppercase tracking-wider font-sans">Traffic & Corridors</h4>
          <p className="text-xs text-[#aaa]">Google / Mapbox Vector Feed</p>
          <div className="text-[11px] font-mono text-amber-400 font-bold">Guindy Subway Closed</div>
        </div>
      </div>

      {/* IoT Sensors Telemetry Live Gauge Breakdown */}
      <div className="bg-[#040806] rounded-none border border-[#10b98125] p-5 shadow-none space-y-4">
        <h3 className="font-bold text-emerald-100 text-sm uppercase tracking-wider flex items-center gap-2 font-sans">
          <Radio className="w-4 h-4 text-emerald-100" />
          IoT Hydrodynamic Sensor Telemetry (Velachery & Adyar)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="bg-[#040806] p-4 rounded border border-[#10b98115] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#888] uppercase">{sensor.id}</span>
                  <h4 className="font-bold text-emerald-100 text-sm mt-0.5 font-sans">{sensor.name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  sensor.status === 'critical' ? 'bg-[#10b981]/20 text-emerald-100 border border-[#10b981]/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {sensor.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#aaa] font-sans">Live Stage:</span>
                <span className="text-xl font-bold text-emerald-100 font-mono">
                  {sensor.currentValue} {sensor.unit}
                </span>
              </div>

              {/* Threshold Bar */}
              <div className="space-y-1 font-mono">
                <div className="flex justify-between text-[10px] text-[#888]">
                  <span>Warn: {sensor.thresholdWarning} {sensor.unit}</span>
                  <span>Crit: {sensor.thresholdCritical} {sensor.unit}</span>
                </div>
                <div className="w-full bg-[#040806] h-2 rounded overflow-hidden">
                  <div
                    className={`h-full ${sensor.currentValue >= sensor.thresholdCritical ? 'bg-[#10b981]' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, (sensor.currentValue / (sensor.thresholdCritical * 1.2)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-[#888] pt-1 border-t border-[#10b98115] font-mono">
                <span>Bat: {sensor.batteryPct}%</span>
                <span>Sig: {sensor.signalPct}%</span>
                <span>Upd: {sensor.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
