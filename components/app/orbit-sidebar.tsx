// components/app/orbit-sidebar.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
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
  Settings,
  Compass,
  Newspaper,
  MapPin,
  Bell,
  Clock,
  ChevronDown,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// Navigation items
const navItems = [
  { id: "brief", label: "Daily Brief", icon: Compass },
  { id: "feed", label: "Intel Feed", icon: Newspaper },
  { id: "map", label: "Activity Map", icon: MapPin },
  { id: "alerts", label: "Alerts", icon: Bell, comingSoon: true },
  { id: "history", label: "History", icon: Clock, comingSoon: true },
]

// Color schemes for location cards - darker, more depth like Weather app
const cardSchemes: Record<ScoreColorType, { bg: string; overlay: string }> = {
  emerald: { 
    bg: "from-emerald-800 via-emerald-900 to-slate-900", 
    overlay: "bg-emerald-500/10"
  },
  sky: { 
    bg: "from-slate-700 via-slate-800 to-slate-900", 
    overlay: "bg-sky-500/10"
  },
  amber: { 
    bg: "from-amber-800 via-amber-900 to-slate-900", 
    overlay: "bg-amber-500/10"
  },
  rose: { 
    bg: "from-rose-800 via-rose-900 to-slate-900", 
    overlay: "bg-rose-500/10"
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
  const scheme = cardSchemes[scoreColor]
  
  const TrendIcon = location.trend === "improving" 
    ? TrendingUp 
    : location.trend === "declining"
    ? TrendingDown
    : Minus
    
  const trendColor = location.trend === "improving" 
    ? "text-emerald-400"
    : location.trend === "declining"
    ? "text-rose-400"
    : "text-slate-400"

  // Get current time for the location
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl overflow-hidden transition-all duration-300
        ${isSelected 
          ? "ring-2 ring-white/30 shadow-xl" 
          : "hover:shadow-lg hover:shadow-black/20"
        }
      `}
    >
      <div className={`relative bg-gradient-to-br ${scheme.bg} p-4 min-h-[120px]`}>
        {/* Subtle noise/texture overlay */}
        <div className={`absolute inset-0 ${scheme.overlay}`} />
        
        {/* Stars/dots pattern for depth */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-3 right-8 w-1 h-1 bg-white/60 rounded-full" />
          <div className="absolute top-6 right-4 w-0.5 h-0.5 bg-white/40 rounded-full" />
          <div className="absolute bottom-8 right-12 w-0.5 h-0.5 bg-white/50 rounded-full" />
          <div className="absolute top-10 right-16 w-0.5 h-0.5 bg-white/30 rounded-full" />
        </div>
        
        <div className="relative">
          {/* Top row: Name and Score */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white text-lg">{location.name}</h3>
              <p className="text-white/60 text-xs mt-0.5">
                {timeString}
                {location.label && (
                  <span className="ml-2 text-white/40">• {location.label}</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-light text-white">
                {location.stabilityScore}
              </span>
              <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">
                Stability
              </p>
            </div>
          </div>
          
          {/* Bottom row: Status and Trend */}
          <div className="flex items-end justify-between mt-6">
            <p className="text-white/70 text-sm">{location.briefStatus}</p>
            <div className="text-right">
              <div className={`flex items-center gap-1 ${trendColor} text-xs`}>
                <TrendIcon className="w-3 h-3" />
                <span>{location.trendPercent > 0 ? "+" : ""}{location.trendPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

// Compact location card for collapsed-ish display
function CompactLocationCard({ 
  location, 
  isSelected, 
  onClick 
}: { 
  location: LocationData
  isSelected: boolean
  onClick: () => void
}) {
  const scoreColor = getScoreColor(location.stabilityScore)
  const scheme = cardSchemes[scoreColor]

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl overflow-hidden transition-all",
        isSelected 
          ? "ring-2 ring-white/30" 
          : "hover:ring-2 hover:ring-accent/50"
      )}
    >
      <div className={`relative bg-gradient-to-br ${scheme.bg} p-3`}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-2 right-6 w-0.5 h-0.5 bg-white/60 rounded-full" />
          <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-white/40 rounded-full" />
        </div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm truncate">{location.name}</h3>
              {location.label && (
                <span className="text-white/40 text-xs">• {location.label}</span>
              )}
            </div>
            <p className="text-white/60 text-xs mt-0.5 truncate">{location.briefStatus}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <span className="text-2xl font-light text-white">{location.stabilityScore}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function OrbitSidebar({ 
  selectedLocationId,
  onLocationSelect,
  collapsed,
  onToggle,
  currentView,
  onViewChange
}: { 
  selectedLocationId: string
  onLocationSelect: (id: string) => void
  collapsed: boolean
  onToggle: () => void
  currentView: string
  onViewChange: (view: string) => void
}) {
  const [logoHovered, setLogoHovered] = useState(false)
  const [orbitExpanded, setOrbitExpanded] = useState(true)

  const handleToggle = () => {
    setLogoHovered(false)
    onToggle()
  }

  return (
    <div 
      className={cn(
        "bg-background border-r border-border/40 flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0",
        collapsed ? "w-[72px]" : "w-80"
      )}
    >
      {/* Header with logo/toggle */}
      <div className="p-4 border-b border-border/40">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {/* Logo and brand */}
          <div className="flex items-center gap-3">
            {collapsed ? (
              <button
                onClick={handleToggle}
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
                className="relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
                title="Expand sidebar"
              >
                {logoHovered ? (
                  <PanelLeft className="w-5 h-5 text-accent transition-colors" />
                ) : (
                  <Image 
                    src="/images/raven-logo.png" 
                    alt="Raven" 
                    width={28} 
                    height={28}
                    className="object-contain"
                  />
                )}
              </button>
            ) : (
              <>
                <Image 
                  src="/images/raven-logo.png" 
                  alt="Raven" 
                  width={32} 
                  height={32}
                  className="object-contain"
                />
                <span className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-foreground">
                  RAVEN
                </span>
              </>
            )}
          </div>
          
          {!collapsed && (
            <button
              onClick={handleToggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-accent transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Collapsed: Icon-only nav */}
      {collapsed && (
        <nav className="p-3 space-y-2">
          {navItems.filter(item => !item.comingSoon).map((item) => {
            const Icon = item.icon
            const isActive = item.id === currentView
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-center p-3 rounded-lg transition-colors",
                  isActive 
                    ? "text-accent" 
                    : "text-muted-foreground hover:text-accent"
                )}
                title={item.label}
              >
                <Icon className="w-6 h-6" />
              </button>
            )
          })}
        </nav>
      )}
      
      {/* Expanded: Full menu matching mobile aesthetic */}
      {!collapsed && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Your Orbit - First, prominent */}
          <div className="px-5 pt-5">
            <button 
              onClick={() => setOrbitExpanded(!orbitExpanded)}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                Your Orbit
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground group-hover:text-accent transition-all",
                orbitExpanded && "rotate-180"
              )} />
            </button>
          </div>
          
          {orbitExpanded && (
            <div 
              className="px-5 pb-5 space-y-2 overflow-y-auto scrollbar-light"
              data-lenis-prevent
            >
              {ORBIT_LOCATIONS.map((location) => (
                <CompactLocationCard
                  key={location.id}
                  location={location}
                  isSelected={location.id === selectedLocationId}
                  onClick={() => onLocationSelect(location.id)}
                />
              ))}
              
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Location</span>
              </button>
            </div>
          )}
          
          {/* Main Navigation - Big Bebas font like mobile */}
          <nav className="flex-1 px-5 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === currentView
              return (
                <button
                  key={item.id}
                  onClick={() => !item.comingSoon && onViewChange(item.id)}
                  disabled={item.comingSoon}
                  className={cn(
                    "group flex items-center gap-4 w-full text-left py-3 transition-all",
                    item.comingSoon 
                      ? "opacity-50 cursor-not-allowed" 
                      : "cursor-pointer"
                  )}
                >
                  <Icon className={cn(
                    "w-6 h-6 transition-colors",
                    isActive 
                      ? "text-accent" 
                      : "text-muted-foreground group-hover:text-accent"
                  )} />
                  <span
                    className={cn(
                      "font-[family-name:var(--font-bebas)] text-3xl tracking-tight transition-colors",
                      isActive 
                        ? "text-accent" 
                        : "text-foreground group-hover:text-accent"
                    )}
                  >
                    {item.label.toUpperCase()}
                  </span>
                  {item.comingSoon && (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
          
          {/* Footer - Settings & Help */}
          <div className="mt-auto px-5 py-4 border-t border-border/40 space-y-1">
            <button className="group flex items-center gap-3 w-full py-2.5 text-muted-foreground transition-all">
              <Settings className="w-5 h-5 group-hover:text-accent transition-colors" />
              <span className="font-mono text-sm group-hover:text-accent transition-colors">Settings</span>
            </button>
            <button className="group flex items-center gap-3 w-full py-2.5 text-muted-foreground transition-all">
              <HelpCircle className="w-5 h-5 group-hover:text-accent transition-colors" />
              <span className="font-mono text-sm group-hover:text-accent transition-colors">Help & Feedback</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}