// components/app/briefing-view.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { 
  CURRENT_LOCATION, 
  ORBIT_LOCATIONS,
  type LocationData
} from "@/lib/raven-data"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Construction,
  Landmark,
  Clock,
  Shield,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Zap,
  Map,
  X,
  Loader2,
  Flame,
  Car,
  AlertCircle,
  Share2,
  Copy,
  Check
} from "lucide-react"

// ============================================
// GET TIME-BASED GREETING
// ============================================
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

// ============================================
// SCORE HERO - Prominent, not hidden
// ============================================
interface StabilityData {
  overall: number
  confidence: 'high' | 'medium' | 'low'
  categories: {
    safety: {
      score: number
      trend: 'improving' | 'stable' | 'declining'
      trendPercent: number
      incidents: number
      dataAvailable: boolean
    }
    infrastructure: { score: number; dataAvailable: boolean }
    civic: { score: number; dataAvailable: boolean }
  }
  metadata: {
    sourcesActive: number
    sourcesTotal: number
  }
}

function ScoreHero({ location }: { location: LocationData }) {
  const [stabilityData, setStabilityData] = useState<StabilityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStability() {
      try {
        const res = await fetch(`/api/stability-score?municipality=${encodeURIComponent(location.name)}`)
        if (res.ok) {
          const data = await res.json()
          setStabilityData(data)
        }
      } catch (err) {
        console.error('Failed to fetch stability score:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStability()
  }, [location.name])

  // Use real data if available, fallback to location data
  const score = stabilityData?.overall ?? location.stabilityScore
  const trend = stabilityData?.categories.safety.trend ?? location.trend
  const trendPercent = stabilityData?.categories.safety.trendPercent ?? location.trendPercent
  const confidence = stabilityData?.confidence ?? 'low'
  const incidentCount = stabilityData?.categories.safety.incidents ?? 0

  const TrendIcon = trend === "improving" 
    ? TrendingUp 
    : trend === "declining"
    ? TrendingDown
    : Minus
    
  const trendColor = trend === "improving" 
    ? "text-emerald-600"
    : trend === "declining"
    ? "text-rose-600"
    : "text-muted-foreground"

  const greeting = getGreeting()
  const userName = "Derek"

  // Generate narrative from real data
  const narrative = generateNarrative(location.name, trend, incidentCount, stabilityData)

  return (
    <div className="mb-6 md:mb-8">
      {/* Greeting */}
      <h1 className="font-[family-name:var(--font-bebas)] text-2xl md:text-4xl tracking-tight text-foreground mb-1">
        {greeting}, {userName}
      </h1>
      
      {/* Location and date */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          Raven Brief
        </span>
        <span className="text-border">—</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {location.name}
        </span>
        <span className="text-border hidden sm:inline">—</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Score and narrative - stacked on mobile, side by side on desktop */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
        {/* Score - prominent with gradient */}
        <div className="flex-shrink-0 flex md:block items-center gap-4">
          <div className="flex items-baseline gap-1">
            {loading ? (
              <span className="text-5xl md:text-7xl font-light tracking-tight text-muted-foreground/30">
                --
              </span>
            ) : (
              <span className="text-5xl md:text-7xl font-light tracking-tight bg-gradient-to-br from-accent via-orange-500 to-amber-500 bg-clip-text text-transparent">
                {score}
              </span>
            )}
          </div>
          <div className="md:mt-1">
            {!loading && (
              <div className={`flex items-center gap-1.5 ${trendColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="font-mono text-xs">
                  {trendPercent > 0 ? "+" : ""}{trendPercent}% vs last week
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1 md:mt-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Stability Index
              </p>
              {!loading && confidence !== 'high' && (
                <span className={cn(
                  "font-mono text-[9px] uppercase px-1.5 py-0.5 rounded",
                  confidence === 'medium' 
                    ? "bg-amber-500/10 text-amber-600" 
                    : "bg-slate-500/10 text-slate-500"
                )}>
                  {confidence === 'medium' ? 'Partial Data' : 'Limited Data'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div className="flex-1">
          <p className="font-mono text-sm md:text-base text-foreground/80 leading-relaxed">
            {narrative}
          </p>
          {!loading && stabilityData && (
            <p className="font-mono text-[10px] text-muted-foreground mt-2">
              Based on {incidentCount} incidents this week • {stabilityData.metadata.sourcesActive} of {stabilityData.metadata.sourcesTotal} data sources active
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Generate a simple narrative from the data
function generateNarrative(
  locationName: string, 
  trend: string, 
  incidentCount: number,
  data: StabilityData | null
): string {
  const trendWord = trend === 'improving' ? 'improving' : trend === 'declining' ? 'elevated' : 'typical'
  
  if (!data || incidentCount === 0) {
    return `Activity in ${locationName} appears ${trendWord} this week. Limited incident data available — check back as more sources come online.`
  }
  
  const safetyScore = data.categories.safety.score
  let safetyDesc = 'moderate'
  if (safetyScore >= 90) safetyDesc = 'very low'
  else if (safetyScore >= 75) safetyDesc = 'low'
  else if (safetyScore < 50) safetyDesc = 'elevated'
  
  return `Activity in ${locationName} is ${trendWord} this week with ${incidentCount} reported incidents. Safety concerns are ${safetyDesc}. Infrastructure and civic data sources coming soon.`
}

// ============================================
// CARD WRAPPER - Reusable hover effect
// ============================================
function IntelCard({ 
  children, 
  variant = "default",
  onClick
}: { 
  children: React.ReactNode
  variant?: "default" | "primary" | "quiet"
  onClick?: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const baseStyles = `relative border transition-all duration-300 overflow-hidden ${onClick ? "cursor-pointer" : ""}`
  
  const variantStyles = {
    default: `border-border/40 ${isHovered ? "border-accent/50" : ""}`,
    primary: "border-accent/30",
    quiet: `border-border/30 bg-muted/30 ${isHovered ? "border-emerald-500/50" : ""}`
  }

  return (
    <article
      className={`${baseStyles} ${variantStyles[variant]} p-5 md:p-6`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Top accent for primary variant */}
      {variant === "primary" && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />
      )}

      {/* Hover background */}
      <div 
        className={`absolute inset-0 bg-accent/5 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} 
      />

      {/* Corner decoration on hover */}
      <div className={`absolute top-0 right-0 w-10 h-10 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute top-0 right-0 w-full h-[2px] bg-accent" />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-accent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Click indicator */}
      <ChevronRight className={`absolute bottom-4 right-4 w-4 h-4 transition-all duration-300 ${isHovered ? "text-accent translate-x-0 opacity-100" : "text-transparent -translate-x-2 opacity-0"}`} />
    </article>
  )
}

// ============================================
// RAVEN ANALYSIS - Primary Card
// ============================================
function RavenAnalysisCard({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <IntelCard variant="primary" onClick={onOpenModal}>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-accent/10">
          <Zap className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent font-semibold">
              Emerging Pattern
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Raven Analysis
            </span>
          </div>

          <h3 className="font-[family-name:var(--font-bebas)] text-2xl md:text-4xl tracking-tight text-foreground mb-3">
            Vehicle Break-ins — Downtown Corridor
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <div className="flex items-center gap-1.5 text-rose-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono text-xs font-medium">↑ 23% over 3 weeks</span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">11pm – 3am window</span>
            <span className="font-mono text-xs text-muted-foreground">Main St area</span>
          </div>

          <p className="font-mono text-sm text-foreground/70 leading-relaxed">
            <span className="text-foreground font-medium">What this means for you:</span> Avoid leaving valuables visible in vehicles parked overnight near downtown. Police have increased patrols.
          </p>
        </div>
      </div>
    </IntelCard>
  )
}

// ============================================
// ACTIVE CONDITIONS
// ============================================
function ActiveConditionsCard({ onOpenModal }: { onOpenModal: () => void }) {
  const conditions = [
    {
      icon: Construction,
      title: "Route 14 Eastbound Closure",
      detail: "Water main repair • Expect 15-20 min delays",
      timeline: "Through Friday",
      severity: "moderate"
    },
    {
      icon: AlertTriangle,
      title: "Street Light Outage — Walkup Ave",
      detail: "ComEd dispatched",
      timeline: "Est. tomorrow",
      severity: "low"
    }
  ]

  return (
    <IntelCard onClick={onOpenModal}>
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold">
          Active Conditions
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {conditions.length} disruption{conditions.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {conditions.map((condition, i) => (
          <div key={i} className={`flex items-start gap-3 ${i > 0 ? "pt-4 border-t border-border/30" : ""}`}>
            <condition.icon className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-mono text-sm font-semibold text-foreground">{condition.title}</h4>
                <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{condition.timeline}</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">{condition.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </IntelCard>
  )
}

// ============================================
// CIVIC SIGNALS
// ============================================
function CivicSignalsCard({ onOpenModal }: { onOpenModal: () => void }) {
  const signals = [
    {
      title: "Commercial Rezoning Approved",
      impact: "Virginia St corridor may see retail expansion",
      date: "Feb 15"
    },
    {
      title: "Mixed-Use Development Filed",
      impact: "150 units + retail proposed downtown",
      date: "Hearing Mar 5"
    }
  ]

  return (
    <IntelCard onClick={onOpenModal}>
      <div className="flex items-center gap-3 mb-4">
        <Landmark className="w-4 h-4 text-sky-500" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-sky-600 font-semibold">
          Civic Signals
        </span>
      </div>

      <div className="space-y-4">
        {signals.map((signal, i) => (
          <div key={i} className={i > 0 ? "pt-4 border-t border-border/30" : ""}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-mono text-sm font-semibold text-foreground">{signal.title}</h4>
              <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">{signal.date}</span>
            </div>
            <p className="font-mono text-xs text-foreground/60">{signal.impact}</p>
          </div>
        ))}
      </div>
    </IntelCard>
  )
}

// ============================================
// WHAT'S QUIET
// ============================================
function WhatsQuietCard({ onOpenModal }: { onOpenModal: () => void }) {
  const quietItems = [
    "Violent crime at historic lows",
    "Residential areas stable",
    "School zones clear this week"
  ]

  return (
    <IntelCard variant="quiet" onClick={onOpenModal}>
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600 font-semibold">
          What's Quiet
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {quietItems.map((item, i) => (
          <span 
            key={i} 
            className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground/70 bg-emerald-500/10 px-2.5 py-1.5 rounded"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {item}
          </span>
        ))}
      </div>
    </IntelCard>
  )
}

// ============================================
// TEMPORAL PATTERNS
// ============================================
function TemporalPatternsCard({ onOpenModal }: { onOpenModal: () => void }) {
  const windows = [
    { label: "Higher Activity", time: "11PM – 2AM", color: "text-rose-600", note: "Property incidents cluster here" },
    { label: "Rush Impact", time: "5PM – 7PM", color: "text-amber-600", note: "Route 14 delays" },
    { label: "Quietest", time: "3AM – 7AM", color: "text-emerald-600", note: "Consistently low" }
  ]

  return (
    <IntelCard onClick={onOpenModal}>
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          When Things Happen
        </span>
      </div>

      {/* Stack on mobile, row on desktop */}
      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
        {windows.map((window, i) => (
          <div key={i} className="flex sm:flex-col items-center sm:items-center justify-between sm:justify-start sm:text-center py-2 sm:py-0 border-b sm:border-b-0 border-border/30 last:border-b-0">
            <div className="sm:mb-1">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{window.label}</p>
            </div>
            <p className={`font-mono text-base sm:text-lg font-medium ${window.color}`}>{window.time}</p>
          </div>
        ))}
      </div>
    </IntelCard>
  )
}

// ============================================
// MAP PREVIEW CARD (Real Leaflet mini-map)
// ============================================
function MapPreviewCard({ onNavigateToMap }: { onNavigateToMap: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [incidents, setIncidents] = useState<any[]>([])
  const [mapReady, setMapReady] = useState(false)

  // City coordinates for McHenry County
  const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    'crystal lake': { lat: 42.2411, lng: -88.3162 },
    'mchenry': { lat: 42.3334, lng: -88.2667 },
    'woodstock': { lat: 42.3147, lng: -88.4487 },
    'cary': { lat: 42.2120, lng: -88.2378 },
    'algonquin': { lat: 42.1656, lng: -88.2945 },
    'lake in the hills': { lat: 42.1817, lng: -88.3306 },
    'huntley': { lat: 42.1681, lng: -88.4281 },
    'harvard': { lat: 42.4225, lng: -88.6145 },
    'marengo': { lat: 42.2495, lng: -88.6081 },
    'fox river grove': { lat: 42.2009, lng: -88.2145 },
    'island lake': { lat: 42.2767, lng: -88.1920 },
    'johnsburg': { lat: 42.3800, lng: -88.2412 },
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'violent_crime':
      case 'property_crime':
      case 'police':
        return '#be123c'
      case 'fire':
      case 'medical':
        return '#d97706'
      case 'traffic':
        return '#0284c7'
      default:
        return '#64748b'
    }
  }

  // Fetch incidents
  useEffect(() => {
    async function fetchIncidents() {
      try {
        const res = await fetch('/api/incidents?days=7&limit=50')
        if (res.ok) {
          const data = await res.json()
          setIncidents(data.items || [])
        }
      } catch (err) {
        console.error('Failed to fetch incidents for mini-map:', err)
      }
    }
    fetchIncidents()
  }, [])

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      // @ts-ignore
      const L = await import('leaflet')

      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (!mapRef.current) return

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      }).setView([42.28, -88.32], 10)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
      setMapReady(true)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Add markers when map and incidents are ready
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || incidents.length === 0) return

    const addMarkers = async () => {
      // @ts-ignore
      const L = await import('leaflet')
      const map = mapInstanceRef.current

      incidents.forEach((incident) => {
        let coords = incident.latitude && incident.longitude
          ? { lat: incident.latitude, lng: incident.longitude }
          : incident.municipality 
            ? CITY_COORDS[incident.municipality.toLowerCase()]
            : null

        if (!coords) return

        // Add small offset so pins don't stack
        coords = {
          lat: coords.lat + (Math.random() - 0.5) * 0.015,
          lng: coords.lng + (Math.random() - 0.5) * 0.015,
        }

        const color = getCategoryColor(incident.category)

        const icon = L.divIcon({
          className: 'mini-map-marker',
          html: `<div style="
            width: 8px;
            height: 8px;
            background: ${color};
            border: 1px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          "></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        })

        L.marker([coords.lat, coords.lng], { icon, interactive: false }).addTo(map)
      })
    }

    addMarkers()
  }, [mapReady, incidents])

  // Count by category
  const categoryCounts = incidents.reduce((acc, inc) => {
    const cat = inc.category
    if (['violent_crime', 'property_crime', 'police'].includes(cat)) {
      acc.safety = (acc.safety || 0) + 1
    } else if (['fire', 'medical', 'missing'].includes(cat)) {
      acc.emergency = (acc.emergency || 0) + 1
    } else if (cat === 'traffic') {
      acc.traffic = (acc.traffic || 0) + 1
    } else {
      acc.other = (acc.other || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const activeCategories = Object.keys(categoryCounts).length

  return (
    <IntelCard onClick={onNavigateToMap}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Map className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Activity Map
          </span>
        </div>
        <span className="font-mono text-[10px] text-accent flex items-center gap-1">
          Open full map <ExternalLink className="w-3 h-3" />
        </span>
      </div>

      {/* Real mini map */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2/1] min-h-[200px] bg-muted/30 rounded overflow-hidden">
        <div ref={mapRef} className="absolute inset-0" />
        
        {/* Overlay stats */}
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
          {activeCategories} active categories • {incidents.length} incidents this week
        </div>

        {/* Click overlay */}
        <div className="absolute inset-0 cursor-pointer" />
      </div>
    </IntelCard>
  )
}

// ============================================
// SOURCES CARD
// ============================================
function SourcesCard({ onOpenModal }: { onOpenModal: () => void }) {
  const sources = [
    { name: "Lake McHenry Scanner", status: "live", lastUpdate: "Hourly" },
    { name: "Northwest Herald", status: "live", lastUpdate: "2 hrs" },
    { name: "McHenry County Gov", status: "live", lastUpdate: "6 hrs" },
    { name: "IDOT Traffic", status: "coming", lastUpdate: "Soon" },
  ]

  return (
    <IntelCard onClick={onOpenModal}>
      <div className="flex items-center gap-3 mb-4">
        <ExternalLink className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Data Sources
        </span>
      </div>

      <div className="space-y-2">
        {sources.map((source, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                source.status === "live" ? "bg-emerald-500" : 
                source.status === "coming" ? "bg-slate-400" : "bg-amber-500"
              )} />
              <span className={cn(
                "font-mono text-sm",
                source.status === "coming" ? "text-muted-foreground" : "text-foreground"
              )}>{source.name}</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{source.lastUpdate}</span>
          </div>
        ))}
      </div>
    </IntelCard>
  )
}

// ============================================
// DETAIL MODAL (Bottom sheet on mobile)
// ============================================
function DetailModal({ 
  isOpen, 
  onClose, 
  title 
}: { 
  isOpen: boolean
  onClose: () => void
  title: string
}) {
  return (
    <>
      {/* Backdrop - higher z-index to cover sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-[200] bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Modal - centered on desktop, bottom sheet on mobile */}
      <div 
        className={cn(
          "fixed z-[201] transition-all duration-300 ease-out",
          // Mobile: bottom sheet
          "inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2",
          // Desktop: centered
          "sm:-translate-x-1/2 sm:-translate-y-1/2",
          isOpen 
            ? "translate-y-0 opacity-100 sm:scale-100" 
            : "translate-y-full opacity-0 sm:translate-y-0 sm:scale-95 pointer-events-none"
        )}
        style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="bg-background border border-border sm:rounded-none rounded-t-2xl max-h-[80vh] sm:max-h-[70vh] w-full sm:w-[90vw] sm:max-w-2xl overflow-hidden flex flex-col">
          {/* Handle - mobile only */}
          <div className="sm:hidden flex justify-center py-3">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-[family-name:var(--font-bebas)] text-xl sm:text-2xl">{title}</h2>
            <button 
              onClick={onClose} 
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <p className="font-mono text-sm text-muted-foreground">
              Full details and source information would appear here. This modal will contain 
              the complete incident report, source links, and any additional context available.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================
// INCIDENT TYPES
// ============================================
interface DisplayIncident {
  id: string
  type: 'crime' | 'civic' | 'infrastructure' | 'safety'
  title: string
  summary: string
  location: string | null
  municipality: string
  timestamp: string
  urgency: number
  source: string
  sourceUrl?: string
}

// ============================================
// INCIDENT DETAIL MODAL
// ============================================
function IncidentDetailModal({
  incident,
  isOpen,
  onClose
}: {
  incident: DisplayIncident | null
  isOpen: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  
  // Must be before any early returns (React hooks rules)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!incident || !mounted) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'crime': return Shield
      case 'safety': return Flame
      case 'infrastructure': return Car
      default: return AlertCircle
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'crime': return 'text-rose-500 bg-rose-500/10'
      case 'safety': return 'text-amber-500 bg-amber-500/10'
      case 'infrastructure': return 'text-sky-500 bg-sky-500/10'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'crime': return 'Public Safety'
      case 'safety': return 'Safety'
      case 'infrastructure': return 'Infrastructure'
      default: return 'Civic'
    }
  }

  const Icon = getIcon(incident.type)
  const iconColor = getIconColor(incident.type)
  const typeLabel = getTypeLabel(incident.type)
  
  const formattedDate = new Date(incident.timestamp).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  
  const formattedTime = new Date(incident.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const handleCopyLink = async () => {
    const url = incident.sourceUrl || window.location.href
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: incident.title,
          text: incident.summary || incident.title,
          url: incident.sourceUrl || window.location.href
        })
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  // Format source name nicely
  const formatSourceName = (source: string) => {
    // Convert snake_case to Title Case
    return source
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return createPortal(
    <>
      {/* Backdrop - high z-index with blur */}
      <div 
        className={cn(
          "fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Modal - bottom sheet on mobile, centered on desktop */}
      <div 
        className={cn(
          "fixed z-[9999] transition-all duration-300 ease-out",
          "inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:top-1/2",
          "sm:-translate-x-1/2 sm:-translate-y-1/2",
          isOpen 
            ? "translate-y-0 opacity-100 sm:scale-100" 
            : "translate-y-full opacity-0 sm:translate-y-0 sm:scale-95 pointer-events-none"
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="bg-background border border-border sm:rounded-lg rounded-t-2xl max-h-[85vh] sm:max-h-[70vh] w-full sm:w-[90vw] sm:max-w-lg overflow-hidden flex flex-col">
          {/* Handle - mobile only */}
          <div className="sm:hidden flex justify-center py-3">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>
          
          {/* Header */}
          <div className="flex items-start justify-between px-5 pb-4 sm:pt-5">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn("p-2 rounded-lg flex-shrink-0", iconColor)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {typeLabel}
                </span>
                <h2 className="font-semibold text-foreground text-lg leading-tight mt-1">
                  {incident.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content - hide scrollbar */}
          <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Meta info - only show location if different from municipality */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-4">
              <span>{incident.municipality}</span>
              {incident.location && incident.location.toLowerCase() !== incident.municipality.toLowerCase() && (
                <>
                  <span className="text-border">•</span>
                  <span>{incident.location}</span>
                </>
              )}
              <span className="text-border">•</span>
              <span>{formattedDate}</span>
              <span className="text-border">•</span>
              <span>{formattedTime}</span>
            </div>
            
            {/* Summary */}
            {incident.summary && (
              <div className="mb-6">
                <p className="text-foreground/80 leading-relaxed">
                  {incident.summary.replace(/\[\.\.\.\]$/, '...').replace(/\[…\]$/, '...')}
                </p>
                {(incident.summary.includes('[...]') || incident.summary.includes('[…]') || incident.summary.endsWith('...')) && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    This is a preview. View source for the full article.
                  </p>
                )}
              </div>
            )}
            
            {/* Source attribution - formatted nicely */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <span>Source:</span>
              <span className="font-medium text-foreground">{formatSourceName(incident.source)}</span>
            </div>
            
            {/* Actions - no text wrap */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="font-mono text-sm text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 flex-shrink-0" />
                    <span className="font-mono text-sm">Share</span>
                  </>
                )}
              </button>
              
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted/30 rounded-lg opacity-50 cursor-not-allowed whitespace-nowrap"
              >
                <Zap className="w-4 h-4 flex-shrink-0" />
                <span className="font-mono text-sm">View in Feed</span>
                <span className="font-mono text-[9px] uppercase bg-muted px-1.5 py-0.5 rounded flex-shrink-0">Soon</span>
              </button>
              
              {incident.sourceUrl && (
                <a
                  href={incident.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-border hover:bg-muted/50 rounded-lg transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="font-mono text-sm">View Source</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

// ============================================
// RECENT INCIDENTS (LIVE DATA)
// ============================================

function RecentIncidentsCard({ 
  onOpenModal,
  municipality 
}: { 
  onOpenModal: () => void
  municipality?: string
}) {
  const [incidents, setIncidents] = useState<DisplayIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<DisplayIncident | null>(null)

  useEffect(() => {
    async function fetchIncidents() {
      try {
        // Don't filter by municipality - show all McHenry County incidents
        const params = new URLSearchParams({ days: '7', limit: '10' })
        
        const res = await fetch(`/api/incidents?${params}`)
        if (!res.ok) throw new Error('Failed to fetch')
        
        const data = await res.json()
        
        // Transform to display format
        const transformed: DisplayIncident[] = data.items.map((item: any) => ({
          id: item.id,
          type: mapCategory(item.category),
          title: item.title,
          summary: item.description || '',
          location: item.location_text,
          municipality: item.municipality || 'McHenry County',
          timestamp: item.occurred_at || item.created_at || new Date().toISOString(),
          urgency: mapSeverity(item.severity),
          source: item.raw_data?.source || 'Lake McHenry Scanner',
          sourceUrl: item.raw_data?.url,
        }))
        
        setIncidents(transformed)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    
    fetchIncidents()
  }, [municipality])

  const getIcon = (type: string) => {
    switch (type) {
      case 'crime': return Shield
      case 'safety': return Flame
      case 'infrastructure': return Car
      default: return AlertCircle
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'crime': return 'text-rose-500'
      case 'safety': return 'text-amber-500'
      case 'infrastructure': return 'text-sky-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <>
      <IntelCard>
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent font-semibold">
            Recent Activity
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] text-emerald-600">Live</span>
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="font-mono text-xs text-muted-foreground">{error}</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-mono text-xs text-muted-foreground">No recent incidents</p>
          </div>
        ) : (
          <div className="space-y-1">
            {incidents.slice(0, 4).map((incident, i) => {
              const Icon = getIcon(incident.type)
              const iconColor = getIconColor(incident.type)
              const timeAgo = formatTimeAgo(incident.timestamp)
              
              return (
                <button 
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={cn(
                    "flex items-start gap-3 p-2 -mx-2 rounded-lg transition-colors w-full text-left",
                    "hover:bg-muted/50 cursor-pointer",
                    i > 0 && "mt-2 pt-3 border-t border-border/30"
                  )}
                >
                  <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", iconColor)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-mono text-sm font-medium text-foreground line-clamp-2 text-left">
                        {incident.title}
                      </h4>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {incident.municipality}
                      </span>
                      <span className="text-border">•</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
        
        {incidents.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/30">
            <span className="font-mono text-[10px] text-muted-foreground">
              {incidents.length} incidents this week
            </span>
          </div>
        )}
      </IntelCard>

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={selectedIncident !== null}
        onClose={() => setSelectedIncident(null)}
      />
    </>
  )
}

// Helper functions for RecentIncidentsCard
function mapCategory(category: string): 'crime' | 'safety' | 'infrastructure' | 'civic' {
  switch (category) {
    // Crime/Safety
    case 'violent_crime':
    case 'property_crime':
    case 'police':
    case 'court':
    case 'shots_fired':
    case 'robbery':
    case 'assault':
    case 'burglary':
    case 'theft':
    case 'vehicle_breakin':
    case 'drugs':
      return 'crime'
    // Emergency/Safety  
    case 'fire':
    case 'missing':
    case 'medical':
    case 'weather':
      return 'safety'
    // Infrastructure
    case 'traffic':
    case 'infrastructure':
    case 'development':
      return 'infrastructure'
    // Civic/Government
    case 'civic':
    case 'government':
    case 'services':
    case 'events':
    case 'other':
    default:
      return 'civic'
  }
}

function mapSeverity(severity: string | null): number {
  switch (severity) {
    case 'critical': return 9
    case 'high': return 7
    case 'medium': return 5
    default: return 3
  }
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ============================================
// MAIN BRIEFING VIEW
// ============================================
export function BriefingView({ 
  selectedLocationId,
  onNavigateToMap 
}: { 
  selectedLocationId: string
  onNavigateToMap: () => void 
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")

  const selectedLocation = ORBIT_LOCATIONS.find(l => l.id === selectedLocationId) || CURRENT_LOCATION

  const openModal = (title: string) => {
    setModalTitle(title)
    setModalOpen(true)
  }

  return (
    <div className="flex-1 overflow-y-auto h-full" data-lenis-prevent>
      <div 
        className="p-4 md:p-8 lg:p-12"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
      >
        {/* Score and narrative */}
        <ScoreHero location={selectedLocation} />

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
          {/* Primary analysis - Emerging Pattern */}
          <div className="lg:col-span-2">
            <RavenAnalysisCard onOpenModal={() => openModal("Vehicle Break-ins Pattern")} />
          </div>

          {/* Recent Activity - LIVE DATA - full width */}
          <div className="lg:col-span-2">
            <RecentIncidentsCard 
              onOpenModal={() => openModal("Recent Activity")} 
              municipality={selectedLocation.name}
            />
          </div>

          {/* Two column layout */}
          <ActiveConditionsCard onOpenModal={() => openModal("Active Conditions")} />
          <CivicSignalsCard onOpenModal={() => openModal("Civic Signals")} />
          
          {/* What's quiet and temporal */}
          <WhatsQuietCard onOpenModal={() => openModal("What's Quiet")} />
          <TemporalPatternsCard onOpenModal={() => openModal("Temporal Patterns")} />

          {/* Map preview and Sources - 50/50 on desktop, stacked on mobile */}
          <MapPreviewCard onNavigateToMap={onNavigateToMap} />
          <SourcesCard onOpenModal={() => openModal("Data Sources")} />
        </div>

        {/* Footer */}
        <footer className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            Last updated 5 minutes ago
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            Tap any card for details and sources
          </span>
        </footer>
      </div>

      {/* Modal */}
      <DetailModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle}
      />
    </div>
  )
}