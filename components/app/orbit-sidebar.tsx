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
        isSelected && "ring-2 ring-white/30"
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
        collapsed ? "w-16" : "w-72"
      )}
    >
      {/* Header with logo/toggle */}
      <div className="p-4 border-b border-border/40">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {/* Logo and brand */}
          <div className="flex items-center gap-3">
            {collapsed ? (
              // Collapsed: Logo with hover-to-reveal expand icon
              <button
                onClick={handleToggle}
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
                className="relative w-8 h-8 flex items-center justify-center transition-all duration-200"
                title="Expand sidebar"
              >
                {logoHovered ? (
                  <PanelLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
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
              // Expanded: Logo + RAVEN text (not clickable)
              <>
                <Image 
                  src="/images/raven-logo.png" 
                  alt="Raven" 
                  width={28} 
                  height={28}
                  className="object-contain"
                />
                <span className="font-[family-name:var(--font-bebas)] text-xl tracking-wide text-foreground">
                  RAVEN
                </span>
              </>
            )}
          </div>
          
          {/* Collapse button - only when expanded, on right side */}
          {!collapsed && (
            <button
              onClick={handleToggle}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Main Navigation */}
      {!collapsed ? (
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === currentView
            return (
              <button
                key={item.id}
                onClick={() => !item.comingSoon && onViewChange(item.id)}
                disabled={item.comingSoon}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                  isActive 
                    ? "bg-accent/10 text-accent" 
                    : item.comingSoon
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.comingSoon && (
                  <span className="ml-auto font-mono text-[9px] uppercase bg-muted px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      ) : (
        <nav className="p-2 space-y-1">
          {navItems.filter(item => !item.comingSoon).map((item) => {
            const Icon = item.icon
            const isActive = item.id === currentView
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-center p-2.5 rounded-lg transition-colors",
                  isActive 
                    ? "bg-accent/10 text-accent" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </nav>
      )}
      
      {/* Orbit Locations Section */}
      {!collapsed && (
        <>
          <div className="px-3 pt-2">
            <button 
              onClick={() => setOrbitExpanded(!orbitExpanded)}
              className="w-full flex items-center justify-between py-2"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Your Orbit
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                orbitExpanded && "rotate-180"
              )} />
            </button>
          </div>
          
          {orbitExpanded && (
            <div 
              className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 scrollbar-light"
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
              
              {/* Add Location */}
              <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Add Location</span>
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-border/40 space-y-1">
          <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
            <Settings className="w-4 h-4" />
            <span className="text-xs">Settings</span>
          </button>
          <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
            <HelpCircle className="w-4 h-4" />
            <span className="text-xs">Help & Feedback</span>
          </button>
        </div>
      )}
    </div>
  )
}