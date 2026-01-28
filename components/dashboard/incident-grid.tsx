// components/dashboard/incident-grid.tsx
'use client';

import { Shield, Radio, Newspaper } from 'lucide-react';
import type { Incident } from '@/app/dashboard/page';

interface IncidentGridProps {
  incidents: Incident[];
  onSelect: (incident: Incident) => void;
}

export function IncidentGrid({ incidents, onSelect }: IncidentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {incidents.map((incident) => (
        <IncidentCard 
          key={incident.id} 
          incident={incident} 
          onClick={() => onSelect(incident)}
        />
      ))}
    </div>
  );
}

function IncidentCard({ 
  incident, 
  onClick 
}: { 
  incident: Incident;
  onClick: () => void;
}) {
  const urgencyColor = incident.urgency_score >= 7 
    ? 'bg-red-500' 
    : incident.urgency_score >= 4 
      ? 'bg-orange-500' 
      : 'bg-blue-500';

  const sourceIcons: Record<string, React.ReactNode> = {
    api: <Shield className="w-3 h-3" />,
    audio: <Radio className="w-3 h-3" />,
    html: <Newspaper className="w-3 h-3" />,
  };

  const sourceLabels: Record<string, string> = {
    api: 'Official',
    audio: 'Scanner',
    html: 'News',
  };

  return (
    <article 
      onClick={onClick}
      className="group relative bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 cursor-pointer hover:-translate-y-1 transition-all duration-300 hover:shadow-xl hover:shadow-stone-200/50 dark:hover:shadow-black/20"
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${urgencyColor}`} />
      
      {/* Image area */}
      <div className="aspect-[16/10] bg-gradient-to-br from-stone-50 to-stone-100 dark:from-zinc-800 dark:to-zinc-900 relative overflow-hidden">
        {/* Placeholder pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded font-mono text-[9px] uppercase tracking-wider text-stone-600 dark:text-stone-300">
            {incident.category.replace('_', ' ')}
          </span>
        </div>

        {/* Time badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded font-mono text-[9px] text-stone-500">
            {formatTimeAgo(incident.occurred_at)}
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Title */}
        <h3 className="font-display text-xl tracking-tight mb-2 group-hover:text-orange-500 transition-colors">
          {incident.incident_type.replace(/_/g, ' ').toUpperCase()}
        </h3>

        {/* Location */}
        {(incident.address || incident.city) && (
          <p className="font-mono text-xs text-stone-500 dark:text-stone-400 mb-3">
            {incident.address}{incident.address && incident.city ? ' · ' : ''}{incident.city}
          </p>
        )}

        {/* Description */}
        <p className="font-mono text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-4">
          {incident.description}
        </p>

        {/* Source badges */}
        <div className="flex items-center gap-2 pt-3 border-t border-stone-100 dark:border-zinc-800">
          {incident.source_types.map((type) => (
            <span 
              key={type}
              className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-1 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-stone-400 rounded"
            >
              {sourceIcons[type]}
              {sourceLabels[type] || type}
            </span>
          ))}
          
          {incident.report_count > 1 && (
            <span className="ml-auto font-mono text-[10px] text-stone-400">
              {incident.report_count} reports
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
