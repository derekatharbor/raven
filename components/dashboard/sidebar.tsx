// components/dashboard/sidebar.tsx
'use client';

import { Map, List, Bell, TrendingUp, Shield } from 'lucide-react';
import type { TabType } from '@/app/dashboard/page';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const navItems: { id: TabType; icon: React.ElementType; label: string }[] = [
  { id: 'overview', icon: Map, label: 'Map' },
  { id: 'incidents', icon: List, label: 'Incidents' },
  { id: 'alerts', icon: Bell, label: 'Alerts' },
  { id: 'trends', icon: TrendingUp, label: 'Trends' },
];

export function DashboardSidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-20 z-50 flex flex-col items-center py-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-r border-stone-200/50 dark:border-zinc-800/50">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
                ${isActive 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                  : 'text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-600 dark:hover:text-stone-300'
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <span className="absolute left-full ml-3 px-2 py-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-mono uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-zinc-800 flex items-center justify-center">
          <span className="text-xs font-mono text-stone-500">?</span>
        </div>
      </div>
    </aside>
  );
}
