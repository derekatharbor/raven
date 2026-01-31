// app/app/page.tsx
"use client"

import { useState } from "react"
import { BriefingView } from "@/components/app/briefing-view"
import { OrbitSidebar } from "@/components/app/orbit-sidebar"
import { MapPageView } from "@/components/app/map-page-view"
import { MOCK_INCIDENTS, type Incident } from "@/lib/mock-data"
import { ORBIT_LOCATIONS, getScoreColor } from "@/lib/raven-data"
import { Menu, X, Plus, Settings, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type ViewType = "brief" | "map"

// Mobile location card - matches desktop orbit style
function MobileLocationCard({ 
  location, 
  isSelected, 
  onClick,
  index,
  menuOpen
}: { 
  location: typeof ORBIT_LOCATIONS[0]
  isSelected: boolean
  onClick: () => void
  index: number
  menuOpen: boolean
}) {
  const scoreColor = getScoreColor(location.stabilityScore)
  
  const cardSchemes = {
    emerald: "from-emerald-800 via-emerald-900 to-slate-900",
    sky: "from-slate-700 via-slate-800 to-slate-900",
    amber: "from-amber-800 via-amber-900 to-slate-900",
    rose: "from-rose-800 via-rose-900 to-slate-900"
  }
  
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

  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl overflow-hidden transition-all duration-500",
        isSelected ? "ring-2 ring-white/30" : "",
        menuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
      )}
      style={{ transitionDelay: menuOpen ? `${150 + index * 75}ms` : "0ms" }}
    >
      <div className={`relative bg-gradient-to-br ${cardSchemes[scoreColor]} p-4`}>
        {/* Stars pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-3 right-8 w-1 h-1 bg-white/60 rounded-full" />
          <div className="absolute top-6 right-4 w-0.5 h-0.5 bg-white/40 rounded-full" />
          <div className="absolute bottom-8 right-12 w-0.5 h-0.5 bg-white/50 rounded-full" />
        </div>
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg">{location.name}</h3>
            <p className="text-white/60 text-xs mt-0.5">
              {timeString}
              {location.label && <span className="ml-2 text-white/40">• {location.label}</span>}
            </p>
            <p className="text-white/70 text-sm mt-3">{location.briefStatus}</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-light text-white">{location.stabilityScore}</span>
            <p className="text-white/40 text-[9px] uppercase tracking-wider mt-0.5">Stability</p>
            <div className={`flex items-center justify-end gap-1 ${trendColor} text-xs mt-1`}>
              <TrendIcon className="w-3 h-3" />
              <span>{location.trendPercent > 0 ? "+" : ""}{location.trendPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function AppPage() {
  const [currentView, setCurrentView] = useState<ViewType>("brief")
  const [selectedLocationId, setSelectedLocationId] = useState("crystal-lake")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="h-[100dvh] flex overflow-hidden">
      {/* Mobile full-screen menu - matches homepage style */}
      <div
        className={cn(
          "fixed inset-0 z-[100] lg:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-background" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />

        {/* Close button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 z-[110] w-12 h-12 flex items-center justify-center border border-border bg-card"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        {/* Menu content */}
        <div 
          className="relative z-[105] h-full flex flex-col pt-safe-top pb-safe-bottom"
          style={{ 
            paddingTop: 'calc(env(safe-area-inset-top) + 1rem)',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)'
          }}
        >
          {/* Brand */}
          <div className="px-6 mb-6 flex items-center gap-3">
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
          </div>

          {/* Section label */}
          <div 
            className={cn(
              "px-6 mb-4 transition-all duration-300",
              mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
            )}
            style={{ transitionDelay: mobileMenuOpen ? "100ms" : "0ms" }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
              Your Orbit
            </span>
          </div>

          {/* Location cards */}
          <div className="flex-1 overflow-y-auto px-6 space-y-3">
            {ORBIT_LOCATIONS.map((location, index) => (
              <MobileLocationCard
                key={location.id}
                location={location}
                isSelected={location.id === selectedLocationId}
                onClick={() => {
                  setSelectedLocationId(location.id)
                  setMobileMenuOpen(false)
                }}
                index={index}
                menuOpen={mobileMenuOpen}
              />
            ))}
            
            {/* Add location */}
            <button 
              className={cn(
                "w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border text-muted-foreground transition-all duration-500",
                mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
              )}
              style={{ transitionDelay: mobileMenuOpen ? `${150 + ORBIT_LOCATIONS.length * 75}ms` : "0ms" }}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Location</span>
            </button>
          </div>

          {/* Bottom actions */}
          <div 
            className={cn(
              "px-6 pt-4 border-t border-border transition-all duration-300",
              mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}
            style={{ transitionDelay: mobileMenuOpen ? "400ms" : "0ms" }}
          >
            <button className="flex items-center gap-2 text-muted-foreground">
              <Settings className="w-4 h-4" />
              <span className="font-mono text-xs">Manage Orbit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <OrbitSidebar 
          selectedLocationId={selectedLocationId}
          onLocationSelect={setSelectedLocationId}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header 
          className="flex-shrink-0 border-b border-border/40 px-4 lg:px-6 py-3 flex items-center justify-between gap-4 bg-background"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 0.75rem)' }}
        >
          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile brand - only on mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <Image 
              src="/images/raven-logo.png" 
              alt="Raven" 
              width={20} 
              height={20}
              className="object-contain"
            />
            <span className="font-[family-name:var(--font-bebas)] text-lg tracking-wide text-foreground">
              RAVEN
            </span>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setCurrentView("brief")}
              className={cn(
                "px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-200",
                currentView === "brief" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Brief
            </button>
            <button
              onClick={() => setCurrentView("map")}
              className={cn(
                "px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-200",
                currentView === "map" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Map
            </button>
          </div>
          
          <span className="font-mono text-[10px] text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </header>

        {/* Content with view transitions */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              currentView === "brief" 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-4 pointer-events-none"
            )}
          >
            <BriefingView 
              selectedLocationId={selectedLocationId}
              onNavigateToMap={() => setCurrentView("map")} 
            />
          </div>
          <div 
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out",
              currentView === "map" 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 translate-x-4 pointer-events-none"
            )}
          >
            <MapPageView 
              incidents={MOCK_INCIDENTS}
              onIncidentSelect={setSelectedIncident}
              selectedIncident={selectedIncident}
            />
          </div>
        </div>
      </div>
    </div>
  )
}