// components/app/orbit-sidebar.tsx
"use client"

import { useState } from "react"
import { 
  ORBIT_LOCATIONS, 
  type LocationData,
  getScoreColor,
  type ScoreColorType
} from "@/lib/raven-data"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Settings
} from "lucide-react"

// Pastel color schemes for location cards
const pastelSchemes: Record<ScoreColorType, { bg: string; accent: string; text: string }> = {
  emerald: { 
    bg: "from-emerald-100/80 to-emerald-50/60", 
    accent: "text-emerald-700",
    text: "text-emerald-900"
  },
  sky: { 
    bg: "from-sky-100/80 to-sky-50/60", 
    accent: "text-sky-700",
    text: "text-sky-900"
  },
  amber: { 
    bg: "from-amber-100/80 to-amber-50/60", 
    accent: "text-amber-700",
    text: "text-amber-900"
  },
  rose: { 
    bg: "from-rose-100/80 to-rose-50/60", 
    accent: "text-rose-700",
    text: "text-rose-900"
  }
}

function LocationCard({ 
  location, 
  isSelected, 
  onClick 
}: { 
  location: LocationData
  isSelected: boolean
  onClick: () => void
}) {
  const scoreColor = getScoreColor(location.stabilityScore)
  const scheme = pastelSchemes[scoreColor]
  
  const TrendIcon = location.trend === "improving" 
    ? TrendingUp 
    : location.trend === "declining"
    ? TrendingDown
    : Minus
    
  const trendColor = location.trend === "improving" 
    ? "text-emerald-600"
    : location.trend === "declining"
    ? "text-rose-600"
    : "text-slate-500"

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-xl overflow-hidden transition-all duration-200
        ${isSelected 
          ? "ring-2 ring-accent shadow-lg scale-[1.02]" 
          : "hover:scale-[1.01] hover:shadow-md"
        }
      `}
    >
      <div className={`relative bg-gradient-to-br ${scheme.bg} p-4`}>
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
        
        <div className="relative">
          {/* Location name and label */}
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold ${scheme.text}`}>{location.name}</h3>
            {location.label && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 bg-white/50 px-1.5 py-0.5 rounded">
                {location.label}
              </span>
            )}
          </div>
          
          {/* Score - prominent */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-4xl font-light ${scheme.text}`}>
              {location.stabilityScore}
            </span>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {location.trendPercent > 0 ? "+" : ""}{location.trendPercent}%
              </span>
            </div>
          </div>
          
          {/* Brief status */}
          <p className="text-xs text-slate-600 mt-2">{location.briefStatus}</p>
        </div>
      </div>
    </button>
  )
}

export function OrbitSidebar({ 
  selectedLocationId,
  onLocationSelect,
  collapsed,
  onToggle
}: { 
  selectedLocationId: string
  onLocationSelect: (id: string) => void
  collapsed: boolean
  onToggle: () => void
}) {
  const [logoHovered, setLogoHovered] = useState(false)

  return (
    <div 
      className={`
        bg-background border-r border-border/40 flex flex-col h-full transition-all duration-300 ease-in-out
        ${collapsed ? "w-16" : "w-72"}
      `}
    >
      {/* Header with logo/toggle */}
      <div className="p-4 border-b border-border/40 flex items-center justify-center">
        <button
          onClick={onToggle}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          className="relative w-8 h-8 flex items-center justify-center transition-all duration-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {logoHovered ? (
            collapsed ? (
              <PanelLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            )
          ) : (
            // Text logo fallback - drop your logo at /public/images/raven-logo.png
            <span className="font-mono text-sm uppercase tracking-wider text-accent font-semibold">
              R
            </span>
          )}
        </button>
      </div>
      
      {/* Location cards - only show when expanded */}
      {!collapsed && (
        <>
          <div 
            className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-light"
            data-lenis-prevent
          >
            {ORBIT_LOCATIONS.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                isSelected={location.id === selectedLocationId}
                onClick={() => onLocationSelect(location.id)}
              />
            ))}
            
            {/* Add Location */}
            <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Location</span>
            </button>
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-border/40">
            <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
              <span className="text-xs">Manage Orbit</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}