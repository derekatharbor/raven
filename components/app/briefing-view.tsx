// components/app/briefing-view.tsx
"use client"

import { useState, useEffect } from "react"
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
  AlertCircle
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
function ScoreHero({ location }: { location: LocationData }) {
  const TrendIcon = location.trend === "improving" 
    ? TrendingUp 
    : location.trend === "declining"
    ? TrendingDown
    : Minus
    
  const trendColor = location.trend === "improving" 
    ? "text-emerald-600"
    : location.trend === "declining"
    ? "text-rose-600"
    : "text-muted-foreground"

  const greeting = getGreeting()
  // TODO: Replace with actual user name from auth
  const userName = "Derek"

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
            <span className="text-5xl md:text-7xl font-light tracking-tight bg-gradient-to-br from-accent via-orange-500 to-amber-500 bg-clip-text text-transparent">
              {location.stabilityScore}
            </span>
          </div>
          <div className="md:mt-1">
            <div className={`flex items-center gap-1.5 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="font-mono text-xs">
                {location.trendPercent > 0 ? "+" : ""}{location.trendPercent}% vs last week
              </span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1 md:mt-2">
              Stability Index
            </p>
          </div>
        </div>

        {/* Narrative */}
        <div className="flex-1">
          <p className="font-mono text-sm md:text-base text-foreground/80 leading-relaxed">
            Activity in {location.name} remains <span className="text-foreground font-medium">{location.trend}</span> this week. 
            Property incidents are concentrated overnight in the downtown corridor — a pattern now in its third week. 
            Infrastructure disruptions on Route 14 continue through Friday. No significant civic changes pending.
          </p>
        </div>
      </div>
    </div>
  )
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
// MAP PREVIEW CARD
// ============================================
function MapPreviewCard({ onNavigateToMap }: { onNavigateToMap: () => void }) {
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

      {/* Mini map visualization - taller for mobile */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2/1] min-h-[200px] bg-muted/30 rounded overflow-hidden">
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border"/>
            </pattern>
            <radialGradient id="hotspot1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(244, 63, 94)" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="rgb(244, 63, 94)" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="hotspot2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="hotspot3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="400" height="200" fill="url(#mapGrid)"/>
          {/* Activity hotspots */}
          <circle cx="200" cy="80" r="60" fill="url(#hotspot1)"/>
          <circle cx="100" cy="140" r="40" fill="url(#hotspot2)"/>
          <circle cx="320" cy="100" r="35" fill="url(#hotspot3)"/>
          {/* Roads */}
          <path d="M 0 100 L 400 100" stroke="currentColor" strokeWidth="2" className="text-border" opacity="0.5"/>
          <path d="M 200 0 L 200 200" stroke="currentColor" strokeWidth="2" className="text-border" opacity="0.5"/>
          {/* Location markers */}
          <circle cx="200" cy="80" r="5" className="fill-rose-500"/>
          <circle cx="200" cy="80" r="10" fill="none" className="stroke-rose-500" strokeWidth="1.5" opacity="0.5"/>
          <circle cx="100" cy="140" r="4" className="fill-amber-500"/>
          <circle cx="320" cy="100" r="4" className="fill-sky-500"/>
        </svg>
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
          3 active zones • 12 incidents this week
        </div>
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
    { name: "IDOT Traffic", status: "coming", lastUpdate: "Soon" },
    { name: "County Permits", status: "coming", lastUpdate: "Soon" },
    { name: "City Council", status: "coming", lastUpdate: "Soon" },
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
// RECENT INCIDENTS (LIVE DATA)
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

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const params = new URLSearchParams({ days: '7', limit: '5' })
        if (municipality) {
          params.set('municipality', municipality)
        }
        
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
          timestamp: item.occurred_at || item.created_at,
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
              <a 
                key={incident.id}
                href={incident.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-start gap-3 p-2 -mx-2 rounded-lg transition-colors",
                  "hover:bg-muted/50 cursor-pointer",
                  i > 0 && "mt-2 pt-3 border-t border-border/30"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", iconColor)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-mono text-sm font-medium text-foreground line-clamp-2">
                      {incident.title}
                    </h4>
                    <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100" />
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
              </a>
            )
          })}
        </div>
      )}
      
      {incidents.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/30">
          <span className="font-mono text-[10px] text-muted-foreground">
            {incidents.length} incidents this week from Lake McHenry Scanner
          </span>
        </div>
      )}
    </IntelCard>
  )
}

// Helper functions for RecentIncidentsCard
function mapCategory(category: string): 'crime' | 'safety' | 'infrastructure' | 'civic' {
  switch (category) {
    case 'shots_fired':
    case 'robbery':
    case 'assault':
    case 'burglary':
    case 'theft':
    case 'vehicle_breakin':
    case 'drugs':
      return 'crime'
    case 'traffic':
      return 'infrastructure'
    case 'fire':
    case 'missing':
      return 'safety'
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