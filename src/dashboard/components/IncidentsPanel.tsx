import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, User, Phone, MapPin, Sparkles, PlusCircle } from 'lucide-react';
import { CitizenReport, AgencyRole } from '../../shared/types';

interface IncidentsPanelProps {
  reports: CitizenReport[];
  onOpenDispatchModal: (zoneId: string) => void;
  agencyRole?: AgencyRole;
}

export default function IncidentsPanel({ reports, onOpenDispatchModal, agencyRole = 'authority' }: IncidentsPanelProps) {
  const filteredReports = reports.filter(report => {
    if (agencyRole === 'fire_rescue') {
      return ['waterlogging', 'flooding', 'rescue', 'structural'].some(c => report.category.toLowerCase().includes(c));
    }
    if (agencyRole === 'police') {
      return ['traffic', 'evacuation', 'roadblock', 'security', 'waterlogging'].some(c => report.category.toLowerCase().includes(c));
    }
    if (agencyRole === 'health_hospitals') {
      return ['medical', 'casualty', 'injury', 'ambulance', 'health'].some(c => report.category.toLowerCase().includes(c) || report.description.toLowerCase().includes(c));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-[#0e0e14] p-5 border border-white/10 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
              Emergency Intel ({agencyRole.replace('_', ' ').toUpperCase()})
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Chennai Incident Feed
          </h2>
          <p className="text-xs text-neutral-400">
            Real-time feed of citizen reports, severity levels, and AI-validated incident locations.
          </p>
        </div>
        <div className="w-10 h-10 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          return (
            <div key={report.id} className="bg-[#0e0e14] border border-white/10 p-5 space-y-4 shadow-sm relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded ${
                    report.severity === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    report.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                    report.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm capitalize">{report.category.replace('_', ' ')}</h3>
                    <span className="text-[9px] text-neutral-500 font-mono">Incident ID: #{report.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className={`px-2 py-0.5 rounded border uppercase font-bold ${
                    report.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    report.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    report.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {report.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded border uppercase font-bold ${
                    report.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    report.status === 'verified' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    report.status === 'dispatched' ? 'bg-brand/10 text-brand border-brand/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                {report.description}
              </p>

              {/* AI Verification and Location Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#050507] p-3 border border-white/5 font-mono text-xs">
                <div className="space-y-1.5">
                  <span className="text-neutral-500 block text-[9px] uppercase">Incident Location</span>
                  <div className="text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
                    <span className="truncate">{report.locationName}</span>
                  </div>
                </div>
                <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-4">
                  <span className="text-neutral-500 block text-[9px] uppercase">AI Verification</span>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Sparkles className="w-4 h-4 text-brand flex-shrink-0" />
                    <span>Confidence Score: {report.aiValidationScore}% ({report.aiValidatedCategory})</span>
                  </div>
                </div>
              </div>

              {/* Dispatch Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[10px] font-mono text-neutral-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-neutral-400" /> {report.reporterName}
                  </span>
                  <span className="flex items-center gap-1 text-brand">
                    <Phone className="w-3.5 h-3.5" /> {report.phone}
                  </span>
                </div>

                {report.status === 'pending' && (
                  <button 
                    onClick={() => onOpenDispatchModal('zone-velachery-south')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-brand hover:bg-brand-deep text-black font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Dispatch Resources
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
