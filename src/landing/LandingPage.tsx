import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Menu, 
  X, 
  Layers, 
  Radio, 
  Bell, 
  ShieldAlert, 
  MapPin, 
  Users, 
  Sliders, 
  Mail, 
  CheckCircle,
  Eye,
  QrCode,
  MessageCircle,
  ChevronRight,
  TrendingUp,
  Globe,
  Plus
} from 'lucide-react';

interface LandingPageProps {
  onLaunchDashboard: () => void;
}

interface MapPinData {
  id: string;
  name: string;
  type: 'critical' | 'advisory' | 'info';
  left: string;
  top: string;
  details: string;
  sentAgo: string;
  audience: string;
}

const MAP_PINS: MapPinData[] = [
  {
    id: 'pin-1',
    name: 'Velachery Vijaya Nagar — Flood Watch',
    type: 'critical',
    left: '22%',
    top: '36%',
    details: 'Water depth 2.8ft near bus stand. Velachery Lake sluice overflow active.',
    sentAgo: '38s ago',
    audience: '42,000 at-risk population'
  },
  {
    id: 'pin-2',
    name: 'Guindy Railway Subway — Submerged',
    type: 'critical',
    left: '58%',
    top: '24%',
    details: 'Subway water depth 1.9m. 2 stalled vehicles. GST road detour in effect.',
    sentAgo: '5m ago',
    audience: '18,500 commuters'
  },
  {
    id: 'pin-3',
    name: 'Kotturpuram Riverbank — River Stage Warning',
    type: 'advisory',
    left: '76%',
    top: '44%',
    details: 'Adyar River discharge 1,450 m³/s. Estuarine backwater overlap detected.',
    sentAgo: '12m ago',
    audience: '24,600 residents'
  },
  {
    id: 'pin-4',
    name: 'Taramani 100ft Canal — Dewatering Operational',
    type: 'info',
    left: '41%',
    top: '60%',
    details: '500HP high-capacity dewatering pump #1 deployed & discharging 120L/s.',
    sentAgo: '14m ago',
    audience: '10,000 residents'
  },
  {
    id: 'pin-5',
    name: 'NDRF Motorboat Fleet A — Rescue Active',
    type: 'critical',
    left: '16%',
    top: '68%',
    details: '4 motorboat units deployed to Vijaya Nagar. 480 citizens evacuated.',
    sentAgo: '22m ago',
    audience: 'Sector 4 rescue'
  },
  {
    id: 'pin-6',
    name: 'Velachery Relief Camp — Open',
    type: 'info',
    left: '64%',
    top: '72%',
    details: 'Capacity 1,200 beds. 480 occupied. Medical unit & food supply active.',
    sentAgo: '31m ago',
    audience: 'Relief camp #1'
  }
];

export default function LandingPage({ onLaunchDashboard }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPin, setHoveredPin] = useState<MapPinData>(MAP_PINS[0]);
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-[#050507] text-[#e0e0e6] font-sans selection:bg-brand selection:text-white overflow-x-hidden">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 -z-10 dot-grid-light opacity-30" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand/10 blur-[120px] -z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-[#2e8b57]/8 blur-[100px] -z-10" aria-hidden="true" />

      {/* STICKY HEADER */}
      <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 transition-all duration-300 sm:top-5">
        <div className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-2 py-2 pl-6 backdrop-blur-xl transition-all duration-300">
          
          {/* Logo */}
          <a href="#" className="group flex items-center gap-2 select-none">
            <div className="w-6 h-6 bg-brand rounded-sm rotate-45 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-3 h-3 border-2 border-[#050507] rotate-45"></div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-sans uppercase">
              RESPON<span className="text-brand">SYNC</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#features" className="relative rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[#e0e0e6]/70 transition-colors hover:text-white">
              Features
            </a>
            <a href="#whoweserve" className="relative rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[#e0e0e6]/70 transition-colors hover:text-white">
              Who we serve
            </a>
            <a href="#demo" className="relative rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-[#e0e0e6]/70 transition-colors hover:text-white">
              Try for free
            </a>
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-2">
            {/* The Switcher Link to the Digital Twin Dashboard */}
            <button 
              onClick={onLaunchDashboard}
              className="rounded-full border border-[#ff4e00]/40 bg-[#ff4e00]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#ff4e00] transition-all hover:bg-[#ff4e00]/20 cursor-pointer hidden sm:inline-block"
            >
              Command OS
            </button>
            <a 
              href="#demo"
              className="group inline-flex items-center gap-1.5 rounded-full bg-brand py-1.5 pl-4 pr-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-deep"
            >
              Book a demo
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </a>

            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      <div className={`fixed inset-x-0 top-20 z-40 mx-4 origin-top rounded-3xl border border-white/10 bg-[#0e0e14]/95 p-4 backdrop-blur-xl transition-all duration-300 md:hidden ${
        mobileMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
      }`}>
        <nav className="flex flex-col gap-1">
          <a onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/5" href="#features">
            Features <ArrowUpRight className="h-4 w-4 text-[#888]" />
          </a>
          <a onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/5" href="#whoweserve">
            Who we serve <ArrowUpRight className="h-4 w-4 text-[#888]" />
          </a>
          <a onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/5" href="#demo">
            Try for free <ArrowUpRight className="h-4 w-4 text-[#888]" />
          </a>
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              onLaunchDashboard();
            }}
            className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#ff4e00] hover:bg-white/5 text-left cursor-pointer"
          >
            Launch Command OS <ArrowUpRight className="h-4 w-4" />
          </button>
        </nav>
      </div>

      <div className="h-20 sm:h-24" aria-hidden="true" />

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8">
            
            {/* Left Copy */}
            <div className="flex flex-col items-start text-left">
              
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur select-none">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-signal-critical opacity-60 animate-ping-soft"></span>
                  <span className="relative inline-block h-full w-full rounded-full bg-signal-critical"></span>
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-[#e0e0e6]/70">
                  AI Digital Twin · Predictive Response
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-white">
                Predictive disaster <br />
                <span className="font-display italic font-normal text-brand">intelligence</span> for command teams.
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-xl text-base sm:text-lg text-[#888] leading-relaxed">
                ResponSync combines real-time weather radar, Open-Meteo flood discharge telemetry, Sentinel-1 SAR satellite feeds, and citizen SOS calls into an explainable 3-Agent AI decision engine for South Chennai disaster command.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button 
                  onClick={onLaunchDashboard}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#ff4e00] py-3.5 pl-6 pr-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#ff6a2b] cursor-pointer"
                >
                  Launch Command OS
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-black/10 transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="h-4 w-4 text-black" />
                  </span>
                </button>
                <a 
                  href="#demo" 
                  className="inline-flex items-center rounded-full border border-white/15 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-white/40"
                >
                  Book a demo
                </a>
              </div>

              {/* Highlights Bullet List */}
              <ul className="mt-12 grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-[#e0e0e6]/80 sm:grid-cols-2">
                <li className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/10 text-brand">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                  100% anonymous public access
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/10 text-brand">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                  Embeds in any website or social
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/10 text-brand">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                  GIS plugin — no GIS team needed
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/10 text-brand">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                  Unlimited mobile push alerts
                </li>
              </ul>

            </div>

            {/* Right Map Simulator Interface */}
            <div className="relative">
              
              {/* Browser Mockup */}
              <div className="relative w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#0e0e14] shadow-2xl">
                
                {/* Browser bar */}
                <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/40"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/40"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/40"></span>
                  </div>
                  <div className="mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                    responsync.ai / command / chennai-corridor
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-signal-critical animate-pulse"></span>
                    <span className="mono text-[9px] uppercase tracking-[0.18em] text-white/60">live</span>
                  </div>
                </div>

                {/* Map Graphics Canvas */}
                <div className="relative h-[340px] sm:h-[420px] overflow-hidden bg-[#0d0d12]">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-0 dot-grid opacity-30"></div>
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                  }}></div>

                  {/* SVG Landmass Boundaries and evacuation corridors */}
                  <svg viewBox="0 0 600 700" className="absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="land-gradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1e1e24" stopOpacity="0.4"></stop>
                        <stop offset="100%" stopColor="#0d0d12" stopOpacity="0.1"></stop>
                      </linearGradient>
                      <pattern id="diagonal-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="8" stroke="#d25f38" strokeOpacity="0.15" strokeWidth="2.5"></line>
                      </pattern>
                    </defs>
                    {/* Simulated river basin */}
                    <path d="M 80 280 C 180 320, 280 290, 360 350 S 520 370, 580 420" fill="none" stroke="#2563eb" strokeOpacity="0.25" strokeWidth="6" strokeLinecap="round"></path>
                    {/* Secondary canal */}
                    <path d="M 70 510 C 150 460, 240 470, 320 430 S 460 410, 540 360" fill="none" stroke="#3b82f6" strokeOpacity="0.15" strokeWidth="2.5" strokeDasharray="3 6" strokeLinecap="round"></path>
                    {/* Risk zones */}
                    <path d="M 40 220 C 90 180, 160 170, 220 200 S 360 230, 460 180 S 580 220, 590 320 S 540 480, 460 510 S 290 580, 230 560 S 80 540, 50 460 Z" fill="url(#land-gradient)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"></path>
                    <path d="M 110 320 C 180 300, 240 320, 280 360 S 320 460, 240 470 S 130 440, 110 380 Z" fill="url(#diagonal-hatch)" stroke="#d25f38" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3 3"></path>
                  </svg>

                  {/* Interactive Map Pins */}
                  {MAP_PINS.map((pin) => {
                    const isHovered = hoveredPin.id === pin.id;
                    const pinColor = pin.type === 'critical' ? '#ef4444' : pin.type === 'advisory' ? '#f59e0b' : '#3b82f6';
                    return (
                      <span 
                        key={pin.id} 
                        className="absolute cursor-pointer select-none group/pin z-20" 
                        style={{ left: pin.left, top: pin.top, transform: 'translate(-50%, -50%)' }}
                        onMouseEnter={() => setHoveredPin(pin)}
                      >
                        <span 
                          className="absolute inset-0 -m-2 rounded-full animate-ping-soft opacity-30 transition-transform duration-300 group-hover/pin:scale-125"
                          style={{ background: pinColor }}
                        ></span>
                        <span 
                          className={`relative block h-3.5 w-3.5 rounded-full ring-2 transition-all duration-300 ${
                            isHovered ? 'scale-125 ring-white' : 'ring-white/40'
                          }`}
                          style={{ 
                            background: pinColor,
                            boxShadow: `0 0 12px ${pinColor}`
                          }}
                        ></span>
                      </span>
                    );
                  })}

                  {/* Dynamic Sidebar / Details Box */}
                  <div className="absolute left-4 bottom-4 right-4 sm:right-auto sm:max-w-[280px] z-30 transition-all duration-300">
                    <div className="rounded-2xl border border-white/10 bg-[#0e0e14]/95 p-4 backdrop-blur-xl shadow-lg">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inset-0 rounded-full animate-ping-soft" style={{ background: hoveredPin.type === 'critical' ? '#ef4444' : hoveredPin.type === 'advisory' ? '#f59e0b' : '#3b82f6' }}></span>
                            <span className="relative inline-block h-full w-full rounded-full" style={{ background: hoveredPin.type === 'critical' ? '#ef4444' : hoveredPin.type === 'advisory' ? '#f59e0b' : '#3b82f6' }}></span>
                          </span>
                          <span className="mono text-[9px] uppercase tracking-[0.2em]" style={{ color: hoveredPin.type === 'critical' ? '#ef4444' : hoveredPin.type === 'advisory' ? '#f59e0b' : '#3b82f6' }}>
                            {hoveredPin.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#666] font-mono select-none">{hoveredPin.sentAgo}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold tracking-tight text-white leading-tight">
                        {hoveredPin.name}
                      </p>
                      <p className="mt-1 text-xs text-[#888] leading-normal font-sans">
                        {hoveredPin.details}
                      </p>
                      <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#555]">
                        <span className="text-[#888] flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#ff4e00]" />
                          {hoveredPin.audience}
                        </span>
                        <span>Active view</span>
                      </div>
                    </div>
                  </div>

                  {/* Map Legend Overlay */}
                  <div className="absolute right-4 top-4 hidden flex-col gap-1.5 rounded-xl border border-white/5 bg-[#0e0e14]/80 px-3 py-2 backdrop-blur-md sm:flex z-30 select-none">
                    <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider text-[#888]">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal-critical"></span>
                      Critical
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider text-[#888]">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal-advisory"></span>
                      Advisory
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-wider text-[#888]">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal-info"></span>
                      Info
                    </div>
                  </div>

                </div>
              </div>

              {/* Floating Performance Overlay */}
              <div className="absolute -bottom-6 -right-6 hidden max-w-[210px] rounded-2xl border border-white/10 bg-[#0e0e14] p-4 shadow-xl select-none md:block hover:translate-y-[-2px] transition-transform z-30">
                <div className="flex items-center justify-between gap-4">
                  <span className="mono text-[9px] uppercase tracking-[0.18em] text-[#666]">Engagement</span>
                  <span className="mono text-[9px] text-[#10b981] font-bold">▲ 12.4%</span>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tighter text-white font-sans">
                  94<span className="text-sm font-medium text-[#666] ml-0.5">%</span>
                </p>
                <p className="mt-0.5 text-[11px] text-[#888] leading-tight font-sans">
                  residents reached · 30 days
                </p>
                <div className="mt-3.5 flex h-7 items-end gap-0.5 select-none">
                  <span className="block w-full rounded-t-sm bg-brand/50 hover:bg-brand" style={{ height: '42%' }}></span>
                  <span className="block w-full rounded-t-sm bg-brand/50 hover:bg-brand" style={{ height: '51%' }}></span>
                  <span className="block w-full rounded-t-sm bg-brand/50 hover:bg-brand" style={{ height: '38%' }}></span>
                  <span className="block w-full rounded-t-sm bg-brand/50 hover:bg-brand" style={{ height: '62%' }}></span>
                  <span className="block w-full rounded-t-sm bg-brand/50 hover:bg-brand" style={{ height: '54%' }}></span>
                  <span className="block w-full rounded-t-sm bg-brand/50 hover:bg-brand" style={{ height: '71%' }}></span>
                  <span className="block w-full rounded-t-sm bg-brand/50 hover:bg-brand" style={{ height: '64%' }}></span>
                  <span className="block w-full rounded-t-sm bg-brand/50 hover:bg-brand" style={{ height: '78%' }}></span>
                  <span className="block w-full rounded-t-sm bg-brand/50 hover:bg-brand" style={{ height: '94%' }}></span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* LOOPING SCROLLING MARQUEE */}
        <section className="relative overflow-hidden border-y border-white/5 bg-ink py-4 text-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050507] to-transparent"></div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050507] to-transparent"></div>
          
          <div className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 md:block">
            <span className="mono inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#e0e0e6]/70">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-critical animate-pulse"></span>
              Live Feed
            </span>
          </div>

          {/* Marquee Track */}
          <div className="relative flex w-max animate-marquee items-center select-none pl-6 md:pl-40">
            {/* Group 1 */}
            <span className="mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-signal-critical shadow-[0_0_8px_#ef4444]"></span>
              <span className="mono text-[10px] text-[#666] tracking-wider font-bold">FLD-2015</span>
              <span className="font-semibold text-white">Chembarambakkam Discharge</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="text-[#aaa] text-xs font-sans">Adyar Basin 1,450 m³/s · 4 critical zones</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="mono text-[10px] text-[#666]">2m ago</span>
            </span>

            <span className="mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-signal-critical shadow-[0_0_8px_#ef4444]"></span>
              <span className="mono text-[10px] text-[#666] tracking-wider font-bold">INC-0012</span>
              <span className="font-semibold text-white">Guindy Subway Submerged</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="text-[#aaa] text-xs font-sans">1.9m depth · GST Road traffic detour</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="mono text-[10px] text-[#666]">5m ago</span>
            </span>

            <span className="mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></span>
              <span className="mono text-[10px] text-[#666] tracking-wider font-bold">EMG-0108</span>
              <span className="font-semibold text-[#10b981]">NDRF Boat Dispatch</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="text-[#aaa] text-xs font-sans">Velachery Vijaya Nagar · 480 rescued</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="mono text-[10px] text-[#666]">12m ago</span>
            </span>

            <span className="mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-signal-info shadow-[0_0_8px_#3b82f6]"></span>
              <span className="mono text-[10px] text-[#666] tracking-wider font-bold">SAT-SAR1</span>
              <span className="font-semibold text-white">Sentinel-1 Radar Ingest</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="text-[#aaa] text-xs font-sans">Copernicus SAR backscatter flood polygon updated</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="mono text-[10px] text-[#666]">18m ago</span>
            </span>

            <span className="mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-signal-advisory shadow-[0_0_8px_#f59e0b]"></span>
              <span className="mono text-[10px] text-[#666] tracking-wider font-bold">PMP-0500</span>
              <span className="font-semibold text-white">500HP Dewatering Active</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="text-[#aaa] text-xs font-sans">Taramani 100ft Canal · 120L/s flow</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="mono text-[10px] text-[#666]">24m ago</span>
            </span>

            {/* Group 2 (Duplicate for loop continuity) */}
            <span className="mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-signal-critical shadow-[0_0_8px_#ef4444]"></span>
              <span className="mono text-[10px] text-[#666] tracking-wider font-bold">FLD-2015</span>
              <span className="font-semibold text-white">Chembarambakkam Discharge</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="text-[#aaa] text-xs font-sans">Adyar Basin 1,450 m³/s · 4 critical risk zones</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="mono text-[10px] text-[#666]">2m ago</span>
            </span>

            <span className="mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-signal-critical shadow-[0_0_8px_#ef4444]"></span>
              <span className="mono text-[10px] text-[#666] tracking-wider font-bold">INC-0012</span>
              <span className="font-semibold text-white">Guindy Subway Submerged</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="text-[#aaa] text-xs font-sans">1.9m depth · GST Road traffic detour</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="mono text-[10px] text-[#666]">5m ago</span>
            </span>

            <span className="mx-6 inline-flex items-center gap-3 whitespace-nowrap text-sm">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></span>
              <span className="mono text-[10px] text-[#666] tracking-wider font-bold">EMG-0108</span>
              <span className="font-semibold text-[#10b981]">NDRF Boat Dispatch</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="text-[#aaa] text-xs font-sans">Velachery Vijaya Nagar · 480 rescued</span>
              <span className="text-[#444] font-bold">·</span>
              <span className="mono text-[10px] text-[#666]">12m ago</span>
            </span>
          </div>
        </section>

        {/* CORE METRICS GRID */}
        <section className="mx-auto max-w-7xl px-4 pb-8 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#ff4e00] font-bold">
              AI Assisted Common Alerting Protocol (CAP) Compliant Alerts
            </p>
            <h2 className="mt-3 max-w-4xl text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Create AI-assisted alerts with instant translation, severity classification, and geofencing aligned with international best-practice early warning systems.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/5 bg-white/5 lg:grid-cols-4 select-none">
            <div className="bg-[#0e0e14] p-7 sm:p-8 hover:bg-[#151520] transition-colors group">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#666] font-bold">01</p>
              <p className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans group-hover:text-brand transition-colors">
                12,500+
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#ccc]">
                residents reached per alert
              </p>
              <p className="mt-1 text-[11px] text-[#666] leading-normal font-sans">
                median across active deployments
              </p>
            </div>

            <div className="bg-[#0e0e14] p-7 sm:p-8 hover:bg-[#151520] transition-colors group">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#666] font-bold">02</p>
              <p className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans group-hover:text-brand transition-colors">
                30s
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#ccc]">
                Incident to Public Alert
              </p>
              <p className="mt-1 text-[11px] text-[#666] leading-normal font-sans">
                median publishing latency
              </p>
            </div>

            <div className="bg-[#0e0e14] p-7 sm:p-8 hover:bg-[#151520] transition-colors group">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#666] font-bold">03</p>
              <p className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans group-hover:text-brand transition-colors">
                0%
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#ccc]">
                public signup required
              </p>
              <p className="mt-1 text-[11px] text-[#666] leading-normal font-sans">
                anonymous by design, no tracking
              </p>
            </div>

            <div className="bg-[#0e0e14] p-7 sm:p-8 hover:bg-[#151520] transition-colors group">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#666] font-bold">04</p>
              <p className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans group-hover:text-brand transition-colors">
                94%
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#ccc]">
                Engagement Rate
              </p>
              <p className="mt-1 text-[11px] text-[#666] leading-normal font-sans">
                browser + push notification channel
              </p>
            </div>
          </div>
        </section>

        {/* 3-STEP FLOW PROCESS */}
        <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_2fr] lg:items-end">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#ff4e00] font-bold">
                Get started in 10 minutes
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                From setup to your <br />
                <span className="font-display italic font-normal text-brand">live public alert map</span> <br />
                in three steps.
              </h2>
            </div>
            <div>
              <p className="text-[#888] text-base max-w-xl leading-relaxed">
                We configure the platform to match your operational structure, ensuring the community sees a live map relevant to their location—on any device, with no app install, account sign up, or learning curve.
              </p>
            </div>
          </div>

          {/* Interactive Steps Grid */}
          <div className="relative mt-16 grid gap-6 md:grid-cols-3">
            
            {/* Step 1 */}
            <article 
              className={`group relative h-full rounded-3xl border p-7 transition-all duration-300 cursor-pointer ${
                activeStep === 0 ? 'bg-[#151520] border-brand shadow-lg' : 'bg-[#0e0e14] border-white/5 hover:border-white/20'
              }`}
              onClick={() => setActiveStep(0)}
            >
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-brand font-bold">Step 01</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-[#888] group-hover:bg-brand group-hover:text-white transition-colors">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">We set up your map</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Your map is configured for your jurisdiction with custom branding and direct links to your website—reinforcing trust and recognition with your audience.
              </p>
              <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a24]">
                <div className="absolute inset-0 dot-grid opacity-25" />
                <div className="absolute inset-4 flex flex-col justify-between rounded-lg bg-[#0d0d12] border border-white/5 p-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="mono text-[9px] uppercase tracking-wider text-brand font-bold">Jurisdiction configuration</span>
                    <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
                  </div>
                  <div className="flex flex-col gap-1.5 my-2">
                    <div className="h-2 w-2/3 rounded-full bg-white/10" />
                    <div className="h-2 w-full rounded-full bg-white/5" />
                    <div className="h-2 w-5/6 rounded-full bg-white/5" />
                  </div>
                  <div className="text-[9px] font-mono text-[#555] uppercase tracking-wider text-right">ACTIVE_GEOFENCE</div>
                </div>
              </div>
            </article>

            {/* Step 2 */}
            <article 
              className={`group relative h-full rounded-3xl border p-7 transition-all duration-300 cursor-pointer ${
                activeStep === 1 ? 'bg-[#151520] border-brand shadow-lg' : 'bg-[#0e0e14] border-white/5 hover:border-white/20'
              }`}
              onClick={() => setActiveStep(1)}
            >
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-brand font-bold">Step 02</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-[#888] group-hover:bg-brand group-hover:text-white transition-colors">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">Create First-to-Know groups</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Define the audiences that matter—City Wards, Towns, Municipalities, any group that should be the "First to Know"—then send the same alert to all or some, instantly.
              </p>
              <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a24]">
                <div className="absolute inset-0 dot-grid opacity-25" />
                <div className="absolute inset-4 flex flex-col justify-between rounded-lg bg-[#0d0d12] border border-white/5 p-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="mono text-[9px] uppercase tracking-wider text-[#ccc]">Audience Clusters</span>
                    <span className="text-[9px] font-mono text-[#666]">n=12</span>
                  </div>
                  <div className="space-y-1.5 my-2">
                    <div className="flex items-center justify-between p-1 bg-white/5 rounded border border-white/5">
                      <span className="text-[10px] font-mono font-bold text-white">Sector A (North)</span>
                      <span className="text-[9px] text-[#10b981] font-mono">6.4k reached</span>
                    </div>
                    <div className="flex items-center justify-between p-1 bg-white/2 rounded">
                      <span className="text-[10px] font-mono text-[#888]">Sector B (Central)</span>
                      <span className="text-[9px] text-[#666] font-mono">4.1k reached</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Step 3 */}
            <article 
              className={`group relative h-full rounded-3xl border p-7 transition-all duration-300 cursor-pointer ${
                activeStep === 2 ? 'bg-[#151520] border-brand shadow-lg' : 'bg-[#0e0e14] border-white/5 hover:border-white/20'
              }`}
              onClick={() => setActiveStep(2)}
            >
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-brand font-bold">Step 03</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/5 text-[#888] group-hover:bg-brand group-hover:text-white transition-colors">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">Post alerts Everywhere</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Publish a pin, a polygon, or a layer. The map updates everywhere it's embedded—your website, your socials, public QR posters—at once.
              </p>
              <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl border border-white/5 bg-[#1a1a24]">
                <div className="absolute inset-0 dot-grid opacity-25" />
                <div className="absolute inset-4 flex flex-col justify-between rounded-lg bg-[#0d0d12] border border-white/5 p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand animate-pulse"></span>
                    <span className="mono text-[9px] uppercase tracking-wider text-white">Broadcast trigger active</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 mt-4">
                    <div className="flex flex-col border border-white/5 p-1 bg-white/2 rounded w-1/3 items-center">
                      <Globe className="w-3 h-3 text-[#3b82f6] mb-1" />
                      <span className="text-[8px] font-mono uppercase text-[#666]">WEBSITE</span>
                    </div>
                    <div className="flex flex-col border border-white/5 p-1 bg-white/2 rounded w-1/3 items-center">
                      <QrCode className="w-3 h-3 text-[#ff4e00] mb-1" />
                      <span className="text-[8px] font-mono uppercase text-[#666]">POSTER</span>
                    </div>
                    <div className="flex flex-col border border-white/5 p-1 bg-white/2 rounded w-1/3 items-center">
                      <Bell className="w-3 h-3 text-[#10b981] mb-1" />
                      <span className="text-[8px] font-mono uppercase text-[#666]">PUSH PING</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

          </div>
        </section>

        {/* FEATURES MATRIX BENTO GRID */}
        <section id="features" className="relative bg-[#0a0a0f] py-24 text-white">
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_2fr] lg:items-end">
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.2em] text-brand font-bold">The platform</p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  Everything you need to <span className="font-display italic font-normal text-brand">Warn</span> and Inform.
                </h2>
              </div>
              <div>
                <p className="text-[#888] text-base max-w-lg leading-relaxed">
                  Multi-hazard alerting tools augment SMS and existing systems, closing communication gaps with one unified GIS platform.
                </p>
              </div>
            </div>

            {/* Bento Grid */}
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6 lg:grid-rows-[auto_auto]">
              
              {/* Feature 1: Alert map */}
              <div className="lg:col-span-3 lg:row-span-2 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:bg-white/[0.04]">
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-brand">
                      <Layers className="h-5 w-5" />
                    </span>
                    <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#666] font-bold">alert · incident · map</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">Alert &amp; Incident Map</h3>
                  <p className="mt-2 text-sm text-[#888] leading-relaxed max-w-md">
                    A configurable GIS canvas authorized teams use to publish location-pinned warnings and incidents—embeddable in any website with a simple code snippet.
                  </p>
                </div>
                
                {/* Visual Card Graphic */}
                <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0f] p-4">
                  <div className="absolute inset-0 dot-grid opacity-30"></div>
                  <div className="h-full border border-dashed border-white/5 rounded-lg flex flex-col p-3 justify-between">
                    <div className="flex justify-between items-center text-[9px] font-mono text-[#888]">
                      <span>MAP_PREVIEW_LAYER</span>
                      <span className="text-[#10b981]">OK</span>
                    </div>
                    {/* Mock map outline */}
                    <div className="w-full h-12 border border-white/5 rounded my-auto bg-white/2 relative flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand animate-bounce" />
                    </div>
                    <div className="flex gap-2 justify-start select-none">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-white/5 text-[#aaa]">BASE_VECTOR</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-white/5 text-[#aaa]">GEOFENCE_ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Geofence alerts */}
              <div className="lg:col-span-3 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:bg-white/[0.04]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-brand">
                      <Radio className="h-5 w-5" />
                    </span>
                    <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#666] font-bold">geofence · alerts</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-tight text-white">Geofence Alerts</h3>
                  <p className="mt-2 text-xs text-[#888] leading-relaxed">
                    Trigger localized alerts the moment someone enters or approaches a defined zone—relevant to where the user actually is, not where they live.
                  </p>
                </div>
                <ul className="mt-6 grid gap-2 border-t border-white/5 pt-4 text-xs text-[#666] font-mono">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand"></span> Draw zones at any scale, from a building to a region
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand"></span> Proximity-aware delivery to nearby mobile devices
                  </li>
                </ul>
              </div>

              {/* Feature 3: First to Know groups */}
              <div className="lg:col-span-2 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:bg-white/[0.04]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-brand">
                      <Bell className="h-5 w-5" />
                    </span>
                    <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#666] font-bold">first · to · know</span>
                  </div>
                  <h3 className="mt-6 text-lg font-bold tracking-tight text-white">First to Know Groups</h3>
                  <p className="mt-2 text-xs text-[#888] leading-relaxed">
                    Create First to Know groups for neighborhoods, school districts, workplaces, and local hubs. Joined anonymously with one tap.
                  </p>
                </div>
                <div className="mt-6 border-t border-white/5 pt-4 text-[10px] font-mono text-[#888] flex justify-between items-center">
                  <span>NO ACCOUNT NEEDED</span>
                  <span className="text-brand font-bold">PII FREE</span>
                </div>
              </div>

              {/* Feature 4: Event layers */}
              <div className="lg:col-span-2 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:bg-white/[0.04]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-brand">
                      <Sliders className="h-5 w-5" />
                    </span>
                    <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#666] font-bold">event · layers</span>
                  </div>
                  <h3 className="mt-6 text-lg font-bold tracking-tight text-white">Event Layers</h3>
                  <p className="mt-2 text-xs text-[#888] leading-relaxed">
                    Custom GIS overlays that track an unfolding event—flood lines, road closures, wildfire fronts—updated by your team in real time.
                  </p>
                </div>
                <div className="mt-6 border-t border-white/5 pt-4 text-[10px] font-mono text-[#888] flex justify-between items-center">
                  <span>REAL-TIME MAP UPDATES</span>
                  <span className="text-[#10b981] font-bold">LIVE SYNC</span>
                </div>
              </div>

              {/* Feature 5: Geo Surveys */}
              <div className="lg:col-span-2 group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 transition-all duration-300 hover:bg-white/[0.04]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-brand">
                      <QrCode className="h-5 w-5" />
                    </span>
                    <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#666] font-bold">geo · surveys</span>
                  </div>
                  <h3 className="mt-6 text-lg font-bold tracking-tight text-white">Geo Surveys</h3>
                  <p className="mt-2 text-xs text-[#888] leading-relaxed">
                    Anonymous, location-tagged polls that turn community feedback into heat maps of sentiment, resource requirements, and damage reports.
                  </p>
                </div>
                <div className="mt-6 border-t border-white/5 pt-4 text-[10px] font-mono text-[#888] flex justify-between items-center">
                  <span>ANONYMOUS PINNING</span>
                  <span className="text-[#3b82f6] font-bold">HEATMAPS</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* WHO WE SERVE SECTION */}
        <section id="whoweserve" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-[#ff4e00] font-bold">Who we serve</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Built for the agencies people <span className="font-display italic font-normal text-brand">turn to first.</span>
              </h2>
            </div>
            <div>
              <p className="text-[#888] text-base leading-relaxed max-w-xl">
                Public safety teams across government, civic, and utility services run UgoRound as their first-to-know channel—because your community shouldn't need an app, an account, or understand English to stay safe.
              </p>
            </div>
          </div>

          {/* Sectors Grid */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            
            {/* Governments */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0e0e14] p-6 lg:col-span-7 hover:border-brand/40 transition-colors group select-none">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#ff4e00] font-bold">Sector · 01</span>
                <span className="rounded-full bg-white/5 p-2 group-hover:bg-brand group-hover:text-black transition-colors text-[#888]">
                  <Globe className="w-4 h-4" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">Governments</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Equip state and national disaster management agencies with a secure geofenced warnings fabric—operable from central command rooms or deployed at localized levels.
              </p>
            </div>

            {/* Cities & Towns */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0e0e14] p-6 lg:col-span-5 hover:border-brand/40 transition-colors group select-none">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#ff4e00] font-bold">Sector · 02</span>
                <span className="rounded-full bg-white/5 p-2 group-hover:bg-brand group-hover:text-black transition-colors text-[#888]">
                  <MapPin className="w-4 h-4" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">Cities &amp; Towns</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Provide local city warnings with dynamic translations and feedback pins. Embed our live map directly on municipal website homepages.
              </p>
            </div>

            {/* Law Enforcement */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0e0e14] p-6 lg:col-span-4 hover:border-brand/40 transition-colors group select-none">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#ff4e00] font-bold">Sector · 03</span>
                <span className="rounded-full bg-white/5 p-2 group-hover:bg-brand group-hover:text-black transition-colors text-[#888]">
                  <ShieldAlert className="w-4 h-4" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">Law Enforcement</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Instantly map suspect reports, missing person alerts, or active safety incidents, allowing anonymous public tip-back channels.
              </p>
            </div>

            {/* Emergency Management */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0e0e14] p-6 lg:col-span-4 hover:border-brand/40 transition-colors group select-none">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#ff4e00] font-bold">Sector · 04</span>
                <span className="rounded-full bg-white/5 p-2 group-hover:bg-brand group-hover:text-black transition-colors text-[#888]">
                  <Sliders className="w-4 h-4" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">Emergency Management</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Maintain peacetime citizen connections alongside SMS and sirens with geofenced alerts and post-event disaster recovery maps.
              </p>
            </div>

            {/* Utilities */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0e0e14] p-6 lg:col-span-4 hover:border-brand/40 transition-colors group select-none">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="mono text-[9px] uppercase tracking-[0.2em] text-[#ff4e00] font-bold">Sector · 05</span>
                <span className="rounded-full bg-white/5 p-2 group-hover:bg-brand group-hover:text-black transition-colors text-[#888]">
                  <Sliders className="w-4 h-4" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-white">Utilities &amp; Power</h3>
              <p className="mt-2 text-xs text-[#888] leading-relaxed">
                Communicate electrical grid outages, water main breaks, or gas leaks with clear polygon boundaries and dynamic restoration timelines.
              </p>
            </div>

          </div>
        </section>

        {/* CTA BOTTOM BANNER */}
        <section id="demo" className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#0a0a0f] px-6 py-16 text-white sm:px-12 sm:py-20">
              <div aria-hidden="true" className="absolute inset-0 dot-grid-on-ink opacity-40"></div>
              
              <div className="relative grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div className="text-left">
                  <p className="mono text-[10px] uppercase tracking-[0.2em] text-brand font-bold">Standby</p>
                  <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-white">
                    Be the trusted channel people <span className="font-display italic font-normal text-brand">go to first.</span>
                  </h2>
                  <p className="mt-6 text-[#888] text-sm sm:text-base max-w-lg">
                    Set up your localized safety map in under ten minutes. Book a 30-minute demonstration with our GIS public safety architects.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button 
                      onClick={onLaunchDashboard}
                      className="group inline-flex items-center gap-2 rounded-full bg-brand py-3.5 pl-6 pr-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-brand-deep cursor-pointer"
                    >
                      Launch Command OS
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition-transform group-hover:translate-x-0.5">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </button>
                    <a 
                      href="mailto:info@ugoround.com" 
                      className="inline-flex items-center rounded-full border border-white/15 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#ccc] transition-colors hover:text-white"
                    >
                      Book A Call
                    </a>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
                  <p className="mono text-[10px] uppercase tracking-[0.2em] text-brand font-bold">What you'll see in the demo</p>
                  <ul className="mt-5 space-y-4 text-xs font-sans text-[#aaa]">
                    <li className="flex items-start gap-3">
                      <span className="mono text-[10px] text-brand font-bold">01</span>
                      A jurisdiction mapped with real geographic geometry and boundaries.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mono text-[10px] text-brand font-bold">02</span>
                      AI-assisted common alerting alerts generated and translated in seconds.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mono text-[10px] text-brand font-bold">03</span>
                      A live geofenced alert broadcast pushed to a test mobile audience.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mono text-[10px] text-brand font-bold">04</span>
                      An incident report validated, geolocated, and escalated under one command canvas.
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* SITEMAP FOOTER */}
      <footer className="relative mt-32 overflow-hidden border-t border-white/5 bg-[#0a0a0f] py-16 text-[#888]">
        <div aria-hidden="true" className="absolute inset-0 dot-grid-on-ink opacity-25"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="flex flex-col items-start text-left">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-brand font-bold">Get the platform</p>
              <h3 className="mt-4 text-2xl font-bold tracking-tight text-white leading-tight">
                Ensure your community is the <span className="font-display italic font-normal text-brand">first to know.</span>
              </h3>
              
              <div className="mt-7 flex flex-wrap gap-2.5">
                <button
                  onClick={onLaunchDashboard} 
                  className="group inline-flex items-center gap-1.5 rounded-full bg-brand py-2.5 pl-5 pr-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-deep cursor-pointer"
                >
                  Command OS
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </button>
              </div>

              <a 
                href="mailto:info@ugoround.com" 
                className="mt-8 inline-flex items-center gap-2 text-xs font-mono text-[#aaa] hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-brand" />
                info@ugoround.com
              </a>
            </div>

            <div className="text-left">
              <h4 className="mono text-[10px] uppercase tracking-[0.2em] text-white font-bold">Sitemap</h4>
              <ul className="mt-5 space-y-3 text-xs">
                <li><a className="hover:text-white transition-colors" href="#">Home</a></li>
                <li><a className="hover:text-white transition-colors" href="#features">Features</a></li>
                <li><a className="hover:text-white transition-colors" href="#whoweserve">Who we serve</a></li>
                <li><a className="hover:text-white transition-colors" href="#demo">Request demo</a></li>
              </ul>
            </div>

            <div className="text-left">
              <h4 className="mono text-[10px] uppercase tracking-[0.2em] text-white font-bold">Product</h4>
              <ul className="mt-5 space-y-3 text-xs">
                <li><a className="hover:text-white transition-colors" href="#">Partnerships</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Disaster Dashboard</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Partner Programme</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Command OS API</a></li>
              </ul>
            </div>

            <div className="text-left">
              <h4 className="mono text-[10px] uppercase tracking-[0.2em] text-white font-bold">Legal</h4>
              <ul className="mt-5 space-y-3 text-xs">
                <li><a className="hover:text-white transition-colors" href="#">Terms &amp; Conditions</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Data Processing (GDPR)</a></li>
              </ul>
            </div>
          </div>

          {/* Large Watermark */}
          <div className="mt-20 select-none">
            <p aria-hidden="true" className="bg-gradient-to-b from-white/10 to-transparent bg-clip-text text-[13vw] font-bold leading-none tracking-tighter text-transparent uppercase text-left">
              ugoround<span className="font-display italic text-brand text-[15vw] lowercase font-normal leading-[0]">.</span>
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/5 py-8 text-[11px] text-[#555] sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} UgoRound. All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="mono inline-flex items-center gap-1.5 uppercase tracking-[0.18em] text-[#aaa]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                ALL SYSTEMS OPERATIONAL
              </span>
              <a className="hover:text-white transition-colors" href="#">Terms</a>
              <a className="hover:text-white transition-colors" href="#">Privacy</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
