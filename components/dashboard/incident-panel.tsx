// components/dashboard/incident-panel.tsx
'use client';

import { X, MapPin, Clock, Shield, Radio, Newspaper, CheckCircle, AlertCircle } from 'lucide-react';
import type { Incident } from '@/app/dashboard/page';

interface IncidentPanelProps {
  incident: Incident | null;
  open: boolean;
  onClose: () => void;
}

export function IncidentPanel({ incident, open, onClose }: IncidentPanelProps) {
  if (!incident) return null;

  const sourceIcons: Record<string, React.ReactNode> = {
    api: <Shield className="w-3.5 h-3.5" />,
    audio: <Radio className="w-3.5 h-3.5" />,
    html: <Newspaper className="w-3.5 h-3.5" />,
  };

  const sourceLabels: Record<string, string> = {
    api: 'Official',
    audio: 'Scanner',
    html: 'News',
  };

  const urgencyColor = incident.urgency_score >= 7 
    ? 'bg-red-500' 
    : incident.urgency_score >= 4 
      ? 'bg-orange-500' 
      : 'bg-blue-500';

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={`
          fixed top-0 right-0 bottom-0 w-full max-w-md z-50 
          bg-white dark:bg-zinc-900 
          shadow-2xl 
          transform transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-zinc-800 dark:to-zinc-900">
          {/* Urgency bar */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${urgencyColor}`} />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur flex items-center justify-center text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category badge */}
          <div className="absolute bottom-4 left-6">
            <span className="px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-full font-mono text-[10px] uppercase tracking-wider text-stone-600 dark:text-stone-300">
              {incident.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto" style={{ height: 'calc(100% - 12rem)' }}>
          {/* Title */}
          <h2 className="font-display text-3xl tracking-tight mb-2">
            {incident.incident_type.replace(/_/g, ' ').toUpperCase()}
          </h2>

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-6">
            {(incident.address || incident.city) && (
              <div className="flex items-center gap-1.5 text-stone-500">
                <MapPin className="w-4 h-4" />
                <span className="font-mono text-xs">
                  {incident.address || incident.city}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-stone-500">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-xs">
                {formatTime(incident.occurred_at)}
              </span>
            </div>
          </div>

          {/* Verification status */}
          <div className={`
            inline-flex items-center gap-2 px-3 py-2 rounded-lg mb-6
            ${incident.review_status === 'verified' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
            }
          `}>
            {incident.review_status === 'verified' 
              ? <CheckCircle className="w-4 h-4" />
              : <AlertCircle className="w-4 h-4" />
            }
            <span className="font-mono text-xs uppercase tracking-wider">
              {incident.review_status === 'verified' ? 'Verified' : 'Unverified'}
            </span>
            <span className="font-mono text-xs">
              · {Math.round(incident.confidence_score * 100)}% confidence
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-2">
              Description
            </h3>
            <p className="font-mono text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Sources */}
          <div className="mb-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-3">
              Sources ({incident.report_count} reports)
            </h3>
            <div className="flex flex-wrap gap-2">
              {incident.source_types.map((type) => (
                <div 
                  key={type}
                  className="flex items-center gap-2 px-3 py-2 bg-stone-100 dark:bg-zinc-800 rounded-lg"
                >
                  <span className="text-stone-500">{sourceIcons[type]}</span>
                  <span className="font-mono text-xs text-stone-600 dark:text-stone-300">
                    {sourceLabels[type] || type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Urgency" value={`${incident.urgency_score}/10`} />
            <StatCard label="Reports" value={incident.report_count.toString()} />
            <StatCard label="Sources" value={incident.source_types.length.toString()} />
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
      <p className="font-display text-2xl tracking-tight">{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-stone-400 mt-1">{label}</p>
    </div>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
