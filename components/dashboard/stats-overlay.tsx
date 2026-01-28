// components/dashboard/stats-overlay.tsx
'use client';

import { AlertTriangle, Flame, Car, Clock } from 'lucide-react';
import type { Incident } from '@/app/dashboard/page';

interface StatsOverlayProps {
  incidents: Incident[];
}

export function StatsOverlay({ incidents }: StatsOverlayProps) {
  const total = incidents.length;
  const highPriority = incidents.filter(i => i.urgency_score >= 7).length;
  const last24h = incidents.filter(i => {
    const time = new Date(i.occurred_at).getTime();
    return Date.now() - time < 24 * 60 * 60 * 1000;
  }).length;

  // Most common category
  const categories = incidents.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      {/* Top stats bar */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 bg-stone-900 dark:bg-white rounded-full px-1 py-1 shadow-xl">
          <StatPill 
            value={total} 
            label="Total" 
          />
          <StatPill 
            value={`$${(total * 127).toLocaleString()}`} 
            label="Est. Damages" 
            highlighted
          />
          <StatPill 
            value="7d" 
            label="Period" 
          />
        </div>
      </div>

      {/* Bottom left location card */}
      <div className="absolute bottom-6 left-6 z-30">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-stone-200/50 dark:border-zinc-800/50 w-72">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display text-lg tracking-tight">Location</h3>
              <p className="font-mono text-xs text-stone-500 mt-1">
                McHenry County, IL 60014
              </p>
              <p className="font-mono text-[10px] text-stone-400 mt-0.5">
                Coverage: 15 municipalities
              </p>
            </div>
            <span className="text-orange-500">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatBox icon={<Clock className="w-4 h-4" />} label="Last 24h" value={last24h} />
            <StatBox icon={<AlertTriangle className="w-4 h-4" />} label="High Priority" value={highPriority} />
            <StatBox icon={<Flame className="w-4 h-4" />} label="Active" value={incidents.filter(i => i.review_status === 'unverified').length} />
          </div>
        </div>
      </div>

      {/* Bottom right summary card */}
      <div className="absolute bottom-6 right-6 z-30">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-stone-200/50 dark:border-zinc-800/50 w-64">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">This Week</p>
              <p className="font-display text-2xl tracking-tight">{total} Incidents</p>
            </div>
          </div>
          
          {topCategory && (
            <div className="pt-3 border-t border-stone-200/50 dark:border-zinc-800/50">
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">
                Most Common
              </p>
              <p className="font-mono text-sm text-stone-600 dark:text-stone-300 capitalize">
                {topCategory[0].replace('_', ' ')} ({topCategory[1]})
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatPill({ 
  value, 
  label, 
  highlighted = false 
}: { 
  value: string | number; 
  label: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`px-4 py-2 rounded-full ${highlighted ? 'bg-white dark:bg-stone-900' : ''}`}>
      <span className={`font-mono text-sm ${highlighted ? 'text-stone-900 dark:text-white' : 'text-white dark:text-stone-900'}`}>
        {value}
      </span>
      <span className={`font-mono text-[10px] ml-1.5 ${highlighted ? 'text-stone-500' : 'text-stone-400 dark:text-stone-500'}`}>
        {label}
      </span>
    </div>
  );
}

function StatBox({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center text-stone-400 mb-1">
        {icon}
      </div>
      <p className="font-display text-xl tracking-tight">{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wider text-stone-400">{label}</p>
    </div>
  );
}
