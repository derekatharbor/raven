// components/app/briefing-view.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Shield,
  ChevronRight,
  ExternalLink,
  Zap,
  X,
  Loader2,
  Calendar,
  FileText,
  AlertCircle,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Eye
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
// PULL TO REFRESH HOOK
// ============================================
function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current
      if (diff > 0 && diff < 150) {
        setPullProgress(Math.min(diff / 100, 1))
      }
    }
  }, [isRefreshing])

  const handleTouchEnd = useCallback(async () => {
    if (pullProgress >= 1 && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
    setPullProgress(0)
  }, [pullProgress, isRefreshing, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { containerRef, isRefreshing, pullProgress }
}

// ============================================
// STABILITY SCORE HERO
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

function ScoreHero({ location, onRefresh }: { location: LocationData; onRefresh?: () => void }) {
  const [stabilityData, setStabilityData] = useState<StabilityData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStability = useCallback(async () => {
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
  }, [location.name])

  useEffect(() => {
    fetchStability()
  }, [fetchStability])

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

  const trendBg = trend === "improving"
    ? "bg-emerald-500/10"
    : trend === "declining"
    ? "bg-rose-500/10"
    : "bg-muted/50"

  // Generate narrative based on data
  const generateNarrative = () => {
    if (loading) return "Analyzing local conditions..."
    
    if (incidentCount === 0) {
      return "No significant incidents reported this week. Your area remains stable."
    }
    
    if (trend === 'improving') {
      return `Activity is down ${trendPercent}% from last week. ${location.name} is quieter than usual.`
    } else if (trend === 'declining') {
      return `Activity is up ${trendPercent}% from last week. We're tracking ${incidentCount} incidents.`
    } else {
      return `Normal activity levels this week with ${incidentCount} incidents tracked.`
    }
  }

  return (
    <header className="mb-6 md:mb-8">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-mono text-sm text-muted-foreground">
          {getGreeting()}
        </h1>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Score + Location */}
      <div className="flex items-start gap-4 mb-4">
        {/* Score Circle */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30"
          )}>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            ) : (
              <span className="font-mono text-2xl md:text-3xl font-bold text-emerald-600">
                {score}
              </span>
            )}
          </div>
          <div className={cn(
            "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-mono",
            trendBg, trendColor
          )}>
            <TrendIcon className="w-3 h-3 inline mr-0.5" />
            {trendPercent}%
          </div>
        </div>

        {/* Location + Narrative */}
        <div className="flex-1 min-w-0">
          <h2 className="font-bebas text-2xl md:text-3xl text-foreground tracking-wide">
            {location.name}
          </h2>
          <p className="font-mono text-sm text-muted-foreground mt-1">
            {generateNarrative()}
          </p>
        </div>
      </div>
    </header>
  )
}

// ============================================
// INTEL CARD - Reusable wrapper
// ============================================
function IntelCard({ 
  children, 
  className,
  onClick
}: { 
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <article 
      className={cn(
        "relative bg-card border border-border/50 rounded-xl p-4 md:p-5",
        "transition-all duration-200",
        onClick && "cursor-pointer hover:border-border hover:shadow-sm",
        className
      )}
      onClick={onClick}
    >
      {children}
    </article>
  )
}

// ============================================
// RAVEN ANALYSIS - AI Insight Card
// ============================================
function RavenAnalysisCard() {
  const [analysis, setAnalysis] = useState<{
    headline: string
    insight: string
    detail: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch('/api/incidents?days=7&limit=50')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        const counts = data.categoryCounts || {}
        const total = Object.values(counts).reduce((a: number, b: any) => a + (b || 0), 0)
        
        // Generate insight based on data
        if (total === 0) {
          setAnalysis({
            headline: "All Clear",
            insight: "No significant activity this week",
            detail: "Your area has been quiet. We'll alert you if patterns emerge."
          })
        } else {
          // Find dominant category
          const sorted = Object.entries(counts).sort(([,a]: any, [,b]: any) => b - a)
          const [topCategory, topCount] = sorted[0] || ['other', 0]
          
          const categoryLabels: Record<string, string> = {
            'violent_crime': 'safety incidents',
            'property_crime': 'property-related incidents',
            'traffic': 'traffic incidents',
            'fire': 'fire/rescue calls',
            'civic': 'civic updates',
            'police': 'police activity'
          }
          
          const label = categoryLabels[topCategory] || 'incidents'
          
          setAnalysis({
            headline: `${total} incidents this week`,
            insight: `${topCount} ${label} lead activity`,
            detail: `We're tracking patterns across McHenry County. Tap for the full feed.`
          })
        }
      } catch (err) {
        setAnalysis({
          headline: "Monitoring Active",
          insight: "Gathering local intelligence",
          detail: "Check back soon for insights."
        })
      } finally {
        setLoading(false)
      }
    }
    fetchAnalysis()
  }, [])

  return (
    <IntelCard className="bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-accent/10">
          <Zap className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
            Raven Analysis
          </span>
          {loading ? (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="font-mono text-sm text-muted-foreground">Analyzing...</span>
            </div>
          ) : (
            <>
              <h3 className="font-bebas text-xl md:text-2xl text-foreground mt-1 tracking-wide">
                {analysis?.headline}
              </h3>
              <p className="font-mono text-sm text-foreground/80 mt-1">
                {analysis?.insight}
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-2">
                {analysis?.detail}
              </p>
            </>
          )}
        </div>
      </div>
    </IntelCard>
  )
}

// ============================================
// THIS WEEK - Curated highlights (not a dump)
// ============================================
interface WeekHighlight {
  id: string
  title: string
  summary: string
  category: string
  municipality: string
  timestamp: string
  url?: string
}

function ThisWeekCard({ onViewAll }: { onViewAll: () => void }) {
  const [highlights, setHighlights] = useState<WeekHighlight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHighlights() {
      try {
        const res = await fetch('/api/incidents?days=7&limit=30')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        // Curate: prioritize by severity and variety
        const items = data.items || []
        const seen = new Set<string>()
        const curated: WeekHighlight[] = []
        
        // Sort by severity/importance
        const severityOrder: Record<string, number> = {
          'critical': 0, 'high': 1, 'medium': 2, 'low': 3
        }
        
        const sorted = [...items].sort((a: any, b: any) => {
          return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3)
        })
        
        // Pick diverse highlights (different categories)
        for (const item of sorted) {
          if (curated.length >= 5) break
          
          // Skip if we already have 2 from this category
          const categoryCount = curated.filter(h => h.category === item.category).length
          if (categoryCount >= 2) continue
          
          // Skip near-duplicates
          const titleKey = item.title.toLowerCase().slice(0, 30)
          if (seen.has(titleKey)) continue
          seen.add(titleKey)
          
          curated.push({
            id: item.id,
            title: item.title,
            summary: item.description?.slice(0, 100) || '',
            category: item.category,
            municipality: item.municipality || 'McHenry County',
            timestamp: item.occurred_at || item.created_at,
            url: item.raw_data?.url
          })
        }
        
        setHighlights(curated)
      } catch (err) {
        console.error('Failed to fetch highlights:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHighlights()
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'violent_crime':
      case 'property_crime':
      case 'police':
        return 'bg-rose-500'
      case 'fire':
      case 'medical':
        return 'bg-amber-500'
      case 'traffic':
      case 'infrastructure':
        return 'bg-sky-500'
      default:
        return 'bg-slate-400'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  return (
    <IntelCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-foreground/60" />
          <span className="font-mono text-xs uppercase tracking-widest text-foreground/60 font-medium">
            This Week
          </span>
        </div>
        <button 
          onClick={onViewAll}
          className="font-mono text-xs text-accent hover:underline"
        >
          View all →
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : highlights.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-mono text-sm text-muted-foreground">No activity this week</p>
        </div>
      ) : (
        <div className="space-y-3">
          {highlights.map((item, i) => (
            <div 
              key={item.id}
              className={cn(
                "group",
                i > 0 && "pt-3 border-t border-border/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0", getCategoryColor(item.category))} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-mono text-sm font-medium text-foreground line-clamp-2">
                      {item.title}
                    </h4>
                    <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {item.municipality}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </IntelCard>
  )
}

// ============================================
// ON YOUR RADAR - Forward-looking
// ============================================
function OnYourRadarCard() {
  const [items, setItems] = useState<Array<{
    id: string
    title: string
    type: 'permit' | 'meeting' | 'planned' | 'civic'
    date: string
    detail: string
  }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        // For now, pull civic/government items as "upcoming"
        // In future: permits, meeting agendas, planned road work
        const res = await fetch('/api/incidents?days=14&limit=20')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        const civicItems = (data.items || [])
          .filter((item: any) => ['civic', 'government', 'services', 'development'].includes(item.category))
          .slice(0, 4)
          .map((item: any) => ({
            id: item.id,
            title: item.title.length > 60 ? item.title.slice(0, 60) + '...' : item.title,
            type: item.category === 'development' ? 'permit' as const : 'civic' as const,
            date: new Date(item.occurred_at || item.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            detail: item.municipality || 'McHenry County'
          }))
        
        setItems(civicItems)
      } catch (err) {
        console.error('Failed to fetch upcoming:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUpcoming()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'permit': return FileText
      case 'meeting': return Calendar
      default: return AlertCircle
    }
  }

  return (
    <IntelCard>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-foreground/60" />
        <span className="font-mono text-xs uppercase tracking-widest text-foreground/60 font-medium">
          On Your Radar
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-6">
          <p className="font-mono text-sm text-muted-foreground">Nothing upcoming</p>
          <p className="font-mono text-xs text-muted-foreground/60 mt-1">
            We'll show permits, meetings, and planned work here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const Icon = getIcon(item.type)
            return (
              <div 
                key={item.id}
                className={cn(
                  "flex items-start gap-3",
                  i > 0 && "pt-3 border-t border-border/30"
                )}
              >
                <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-mono text-sm font-medium text-foreground line-clamp-2">
                      {item.title}
                    </h4>
                    <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {item.date}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {item.detail}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </IntelCard>
  )
}

// ============================================
// MAP PREVIEW CARD
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
    'grayslake': { lat: 42.3447, lng: -88.0417 },
    'round lake': { lat: 42.3533, lng: -88.0931 },
    'fox lake': { lat: 42.3967, lng: -88.1834 },
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
        const res = await fetch('/api/incidents?days=7&limit=30')
        if (res.ok) {
          const data = await res.json()
          setIncidents(data.items || [])
        }
      } catch (err) {
        console.error('Failed to fetch incidents for map:', err)
      }
    }
    fetchIncidents()
  }, [])

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      }).setView([42.2830, -88.3500], 10)

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

    const L = require('leaflet')
    const map = mapInstanceRef.current

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    // Add incident markers
    incidents.forEach((incident: any) => {
      const cityKey = incident.municipality?.toLowerCase()
      const coords = cityKey && CITY_COORDS[cityKey]
      
      if (coords) {
        // Add small random offset to prevent stacking
        const lat = coords.lat + (Math.random() - 0.5) * 0.02
        const lng = coords.lng + (Math.random() - 0.5) * 0.02
        
        L.circleMarker([lat, lng], {
          radius: 4,
          fillColor: getCategoryColor(incident.category),
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map)
      }
    })
  }, [mapReady, incidents])

  return (
    <IntelCard onClick={onNavigateToMap} className="overflow-hidden p-0">
      <div className="relative h-48 md:h-56">
        <div ref={mapRef} className="absolute inset-0 z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-muted-foreground">
                {incidents.length} incidents this week
              </span>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <span className="font-mono text-xs">Open Map</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </IntelCard>
  )
}

// ============================================
// MAIN BRIEFING VIEW
// ============================================
export function BriefingView({ 
  selectedLocationId,
  onNavigateToMap,
  onNavigateToFeed
}: { 
  selectedLocationId: string
  onNavigateToMap: () => void
  onNavigateToFeed?: () => void
}) {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const selectedLocation = ORBIT_LOCATIONS.find(l => l.id === selectedLocationId) || CURRENT_LOCATION

  const handleRefresh = useCallback(async () => {
    // Trigger re-fetch by updating key
    setLastRefresh(new Date())
    // Small delay to show refresh happened
    await new Promise(resolve => setTimeout(resolve, 500))
  }, [])

  const { containerRef, isRefreshing, pullProgress } = usePullToRefresh(handleRefresh)

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto h-full" 
      data-lenis-prevent
    >
      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          "flex items-center justify-center py-4 transition-all duration-200",
          pullProgress > 0 || isRefreshing ? "opacity-100" : "opacity-0 h-0 py-0"
        )}
      >
        <RefreshCw className={cn(
          "w-5 h-5 text-muted-foreground transition-transform",
          isRefreshing && "animate-spin",
          pullProgress >= 1 && !isRefreshing && "text-accent"
        )} />
      </div>

      <div 
        className="p-4 md:p-8 lg:p-12"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
      >
        {/* Score and narrative */}
        <ScoreHero 
          key={lastRefresh.getTime()} 
          location={selectedLocation} 
          onRefresh={handleRefresh}
        />

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Raven Analysis - Full width */}
          <div className="lg:col-span-2">
            <RavenAnalysisCard key={`analysis-${lastRefresh.getTime()}`} />
          </div>

          {/* This Week - Curated highlights */}
          <ThisWeekCard 
            key={`week-${lastRefresh.getTime()}`}
            onViewAll={onNavigateToFeed || (() => {})} 
          />

          {/* On Your Radar - Forward-looking */}
          <OnYourRadarCard key={`radar-${lastRefresh.getTime()}`} />

          {/* Map Preview - Full width */}
          <div className="lg:col-span-2">
            <MapPreviewCard 
              key={`map-${lastRefresh.getTime()}`}
              onNavigateToMap={onNavigateToMap} 
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">
              Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              Pull down to refresh
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}