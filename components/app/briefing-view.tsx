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
  AlertTriangle,
  Shield,
  Landmark,
  Construction,
  CheckCircle2,
  ChevronRight,
  Zap,
  Loader2,
  Flame,
  Car,
  AlertCircle,
  RefreshCw,
  Clock,
  Calendar,
  Users,
  FileText,
  X,
  ExternalLink,
  Home,
  MapPin
} from "lucide-react"

// ============================================
// TYPES
// ============================================
interface Incident {
  id: string
  category: string
  severity: string
  title: string
  description: string
  municipality: string
  occurred_at: string
  created_at: string
  raw_data?: { url?: string; source?: string }
}

// ============================================
// HELPERS
// ============================================
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
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

function getIncidentCategory(category: string): 'safety' | 'civic' | 'infrastructure' {
  if (['violent_crime', 'property_crime', 'police', 'fire', 'medical'].includes(category)) {
    return 'safety'
  }
  if (['civic', 'government', 'services', 'court', 'elections'].includes(category)) {
    return 'civic'
  }
  return 'infrastructure'
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
// CATEGORY TOGGLE HOOK
// ============================================
function useCategoryToggle() {
  const [category, setCategory] = useState<'safety' | 'civic' | 'infrastructure'>('safety')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('raven_trend_category')
    const lastVisit = localStorage.getItem('raven_last_visit')
    
    if (lastVisit) {
      const hoursSince = (Date.now() - parseInt(lastVisit)) / 3600000
      if (hoursSince > 48) {
        setCategory('safety')
      } else if (stored && ['safety', 'civic', 'infrastructure'].includes(stored)) {
        setCategory(stored as 'safety' | 'civic' | 'infrastructure')
      }
    }
    
    localStorage.setItem('raven_last_visit', Date.now().toString())
    setMounted(true)
  }, [])

  const updateCategory = (newCategory: 'safety' | 'civic' | 'infrastructure') => {
    setCategory(newCategory)
    localStorage.setItem('raven_trend_category', newCategory)
  }

  return { category, setCategory: updateCategory, mounted }
}

// ============================================
// SCORE DETAIL PANEL (Side Panel / Modal)
// ============================================
function ScoreDetailPanel({ 
  score, 
  isOpen, 
  onClose 
}: { 
  score: number
  isOpen: boolean
  onClose: () => void 
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'updates'>('details')

  if (!isOpen) return null

  // Generate timeline data
  const timelineData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date,
      score: Math.floor(75 + Math.random() * 20),
      incidents: Math.floor(Math.random() * 5)
    }
  })

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      
      <div 
        className={cn(
          "relative w-full sm:w-[420px] h-full",
          "bg-gradient-to-br from-accent via-orange-500 to-amber-600",
          "overflow-hidden"
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Wireframe pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 800">
            {Array.from({ length: 20 }, (_, i) => (
              <circle
                key={i}
                cx="400"
                cy="400"
                r={50 + i * 40}
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono text-sm text-white/80">McHenry County</span>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Score Display */}
          <div className="px-6 py-8">
            <p className="text-8xl font-light text-white tracking-tight">{score}</p>
            <p className="font-mono text-sm text-white/60 mt-2">Current Stability Index</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20 px-4">
            {(['details', 'timeline', 'updates'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-3 font-mono text-sm capitalize transition-colors",
                  activeTab === tab 
                    ? "text-white border-b-2 border-white" 
                    : "text-white/50 hover:text-white/80"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-white" />
                    <span className="font-mono text-sm text-white font-medium">Safety (40%)</span>
                  </div>
                  <p className="font-mono text-xs text-white/70">
                    911 dispatch volume, crime reports, and emergency calls.
                  </p>
                  <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Construction className="w-5 h-5 text-white" />
                    <span className="font-mono text-sm text-white font-medium">Infrastructure (30%)</span>
                  </div>
                  <p className="font-mono text-xs text-white/70">
                    311 reports, traffic incidents, and utility disruptions.
                  </p>
                  <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Landmark className="w-5 h-5 text-white" />
                    <span className="font-mono text-sm text-white font-medium">Civic (30%)</span>
                  </div>
                  <p className="font-mono text-xs text-white/70">
                    Government activity, permits filed, and community events.
                  </p>
                  <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div>
                <p className="font-mono text-xs text-white/60 mb-4">30-Day History</p>
                <div className="grid grid-cols-7 gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-center font-mono text-[10px] text-white/40">{day}</div>
                  ))}
                  {timelineData.map((day, i) => {
                    const opacity = (day.score - 70) / 30
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `rgba(255, 255, 255, ${0.1 + opacity * 0.4})` }}
                        title={`${day.date.toLocaleDateString()}: ${day.score}`}
                      >
                        {day.incidents > 2 && (
                          <span className="font-mono text-[10px] text-white/80">{day.incidents}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="font-mono text-[10px] text-white/40 mt-4 text-center">
                  Brighter = Higher stability
                </p>
              </div>
            )}

            {activeTab === 'updates' && (
              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-300" />
                    <span className="font-mono text-xs text-emerald-300">+3 pts</span>
                  </div>
                  <p className="font-mono text-sm text-white">Safety incidents down 12%</p>
                  <p className="font-mono text-[10px] text-white/50 mt-1">2 days ago</p>
                </div>

                <div className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-rose-300" />
                    <span className="font-mono text-xs text-rose-300">-2 pts</span>
                  </div>
                  <p className="font-mono text-sm text-white">Infrastructure reports up</p>
                  <p className="font-mono text-[10px] text-white/50 mt-1">5 days ago</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/20">
            <p className="font-mono text-[10px] text-white/40 text-center">
              Score updates hourly • Higher is better
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ============================================
// SCORE CARD (VeloFi Blue Card Style → Orange)
// ============================================
function ScoreCard({ 
  score, 
  loading, 
  onClick 
}: { 
  score: number
  loading: boolean
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full h-full min-h-[280px] rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-accent via-orange-500 to-amber-600",
        "p-5 text-left",
        "hover:shadow-xl hover:shadow-accent/25 transition-all duration-300",
        "group"
      )}
    >
      {/* Wireframe pattern background - concentric circles fading */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 300 300" preserveAspectRatio="xMaxYMid slice">
          {Array.from({ length: 15 }, (_, i) => (
            <circle
              key={i}
              cx="300"
              cy="150"
              r={30 + i * 25}
              fill="none"
              stroke="white"
              strokeWidth="1"
              style={{ opacity: 1 - i * 0.06 }}
            />
          ))}
        </svg>
      </div>

      {/* Header - Raven pill + Home icon */}
      <div className="relative flex items-center justify-between">
        <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
          <span className="font-mono text-xs text-white font-medium tracking-wide">Raven</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Home className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Large Score Number */}
      <div className="relative mt-auto pt-16">
        {loading ? (
          <Loader2 className="w-12 h-12 animate-spin text-white/60" />
        ) : (
          <p className="text-8xl font-light text-white tracking-tight leading-none">
            {score}
          </p>
        )}
      </div>

      {/* Label */}
      <p className="relative font-bebas text-2xl text-white/90 mt-6 tracking-wide">
        Stability Index
      </p>

      {/* Hover indicator */}
      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-6 h-6 text-white/60" />
      </div>
    </button>
  )
}

// ============================================
// 30-DAY HEATMAP (Transaction Days Style)
// ============================================
function ThirtyDayHeatmap({ incidents }: { incidents: Incident[] }) {
  const now = new Date()
  
  // Generate 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    date.setHours(0, 0, 0, 0)
    
    const count = incidents.filter(inc => {
      const incDate = new Date(inc.occurred_at || inc.created_at)
      incDate.setHours(0, 0, 0, 0)
      return incDate.getTime() === date.getTime()
    }).length
    
    return { date, count, dayOfWeek: date.getDay() }
  })

  const maxCount = Math.max(...days.map(d => d.count), 1)

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-mono text-sm text-foreground">Activity History</h3>
        <span className="font-mono text-[10px] text-muted-foreground">30 Days</span>
      </div>

      {/* Total count */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-light text-foreground">{incidents.length}</span>
        <span className="font-mono text-xs text-muted-foreground">incidents</span>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center font-mono text-[10px] text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding for first week alignment */}
        {Array.from({ length: days[0]?.dayOfWeek === 0 ? 6 : days[0]?.dayOfWeek - 1 }, (_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        
        {days.map((day, i) => {
          const intensity = day.count / maxCount
          const isToday = day.date.toDateString() === now.toDateString()
          
          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center",
                isToday && "ring-2 ring-accent ring-offset-1 ring-offset-background"
              )}
              style={{
                backgroundColor: day.count === 0 
                  ? 'hsl(var(--muted) / 0.3)'
                  : `hsl(var(--accent) / ${0.15 + intensity * 0.7})`
              }}
              title={`${day.date.toLocaleDateString()}: ${day.count}`}
            >
              {day.count > 0 && (
                <span className={cn(
                  "font-mono text-[10px]",
                  intensity > 0.4 ? "text-white" : "text-accent"
                )}>
                  {day.count}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="font-mono text-[10px] text-muted-foreground mt-3 text-center">
        Darker = More activity
      </p>
    </div>
  )
}

// ============================================
// ORBIT LOCATIONS MAP (Friends Card Style)
// ============================================
function OrbitLocationsCard({ onNavigateToMap }: { onNavigateToMap: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)

  const locations = ORBIT_LOCATIONS.slice(0, 5)

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      }).setView([42.2830, -88.3500], 9)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        opacity: 0.5
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

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    const L = require('leaflet')
    const map = mapInstanceRef.current

    const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
      'crystal lake': { lat: 42.2411, lng: -88.3162 },
      'mchenry': { lat: 42.3334, lng: -88.2667 },
      'woodstock': { lat: 42.3147, lng: -88.4487 },
      'cary': { lat: 42.2120, lng: -88.2378 },
      'algonquin': { lat: 42.1656, lng: -88.2945 },
    }

    locations.forEach((loc) => {
      const coords = CITY_COORDS[loc.name.toLowerCase()]
      if (coords) {
        const marker = L.circleMarker([coords.lat, coords.lng], {
          radius: 20,
          fillColor: '#f97316',
          color: '#fff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map)

        marker.bindTooltip(loc.stabilityScore.toString(), {
          permanent: true,
          direction: 'center',
          className: 'orbit-marker-label'
        })
      }
    })

    if (!document.querySelector('#orbit-marker-styles')) {
      const style = document.createElement('style')
      style.id = 'orbit-marker-styles'
      style.textContent = `
        .orbit-marker-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: white !important;
          font-family: var(--font-geist-mono) !important;
          font-size: 11px !important;
          font-weight: 600 !important;
        }
        .orbit-marker-label::before { display: none !important; }
      `
      document.head.appendChild(style)
    }
  }, [mapReady, locations])

  return (
    <button
      onClick={onNavigateToMap}
      className="w-full bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-accent/50 transition-colors text-left group"
    >
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="font-mono text-sm text-foreground">Your Locations</h3>
        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="relative h-32">
        <div ref={mapRef} className="absolute inset-0 z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10 pointer-events-none" />
      </div>

      <div className="p-4 pt-2 flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {locations.length} locations
        </span>
        <span className="font-mono text-xs text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Open Map <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </button>
  )
}

// ============================================
// CATEGORY TRENDS
// ============================================
function CategoryTrends({ 
  incidents,
  onSelectIncident
}: { 
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
}) {
  const { category, setCategory, mounted } = useCategoryToggle()

  const safetyIncidents = incidents.filter(i => getIncidentCategory(i.category) === 'safety')
  const civicIncidents = incidents.filter(i => getIncidentCategory(i.category) === 'civic')
  const infraIncidents = incidents.filter(i => getIncidentCategory(i.category) === 'infrastructure')

  const counts = { safety: safetyIncidents.length, civic: civicIncidents.length, infrastructure: infraIncidents.length }

  if (!mounted) return null

  const currentIncidents = category === 'safety' ? safetyIncidents 
    : category === 'civic' ? civicIncidents : infraIncidents

  const getCategoryIcon = (cat: string) => {
    switch (cat) { case 'safety': return Shield; case 'civic': return Landmark; default: return Construction }
  }

  const getItemIcon = (c: string) => {
    switch (c) {
      case 'traffic': return Car; case 'fire': return Flame;
      case 'violent_crime': case 'property_crime': case 'police': return Shield;
      case 'civic': case 'government': return Landmark; default: return AlertCircle
    }
  }

  const getItemColor = (c: string) => {
    switch (c) {
      case 'violent_crime': case 'property_crime': case 'police': return 'text-rose-500';
      case 'fire': return 'text-orange-500'; case 'traffic': return 'text-sky-500';
      case 'civic': case 'government': return 'text-violet-500'; default: return 'text-amber-500'
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="flex border-b border-border/50">
        {(['safety', 'civic', 'infrastructure'] as const).map((cat) => {
          const Icon = getCategoryIcon(cat)
          const isActive = category === cat
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-2 font-mono text-xs uppercase tracking-wider transition-colors relative",
                isActive ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{cat}</span>
              {counts[cat] > 0 && (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", isActive ? "bg-accent/20" : "bg-muted")}>
                  {counts[cat]}
                </span>
              )}
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
            </button>
          )
        })}
      </div>

      <div className="p-4 max-h-64 overflow-y-auto scrollbar-hide">
        {currentIncidents.length === 0 ? (
          <p className="font-mono text-sm text-muted-foreground text-center py-4">No {category} updates this week.</p>
        ) : (
          <div className="space-y-2">
            {currentIncidents.slice(0, 6).map((item) => {
              const Icon = getItemIcon(item.category)
              const color = getItemColor(item.category)
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectIncident(item)}
                  className="w-full flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                >
                  <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                      {item.title}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      {item.municipality} • {formatTimeAgo(item.occurred_at || item.created_at)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// DATA HEALTH
// ============================================
function DataHealth() {
  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs text-foreground">Scanner</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs text-foreground">County Gov</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/10 flex-shrink-0">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-mono text-sm font-medium text-foreground">Unlock live CAD data</p>
            <p className="font-mono text-xs text-muted-foreground mt-1">247 residents requesting real-time 911 access.</p>
            <button className="mt-3 py-2 px-4 bg-accent hover:bg-accent/90 text-accent-foreground font-mono text-xs rounded-lg transition-colors">
              Add your name →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// INCIDENT MODAL
// ============================================
function IncidentModal({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  if (!incident) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div 
        className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Incident Detail</span>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-bebas text-xl text-foreground tracking-wide mb-2">{incident.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>{incident.municipality || 'McHenry County'}</span>
            <span>•</span>
            <span>{formatTimeAgo(incident.occurred_at || incident.created_at)}</span>
          </div>
          {incident.description && (
            <p className="font-mono text-sm text-foreground/80 mb-4">{incident.description}</p>
          )}
          <div className="pt-4 border-t border-border">
            <p className="font-mono text-xs text-muted-foreground">
              Source: {incident.raw_data?.source || 'Lake McHenry Scanner'}
            </p>
            {incident.raw_data?.url && (
              <a href={incident.raw_data.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 font-mono text-xs text-accent hover:underline">
                View original <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
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
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [showScorePanel, setShowScorePanel] = useState(false)
  const [stabilityScore, setStabilityScore] = useState(82)
  
  const selectedLocation = ORBIT_LOCATIONS.find(l => l.id === selectedLocationId) || CURRENT_LOCATION

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/incidents?days=30&limit=200')
      if (res.ok) {
        const data = await res.json()
        setIncidents(data.items || [])
      }
    } catch (err) { console.error('Failed to fetch:', err) }
    finally { setLoading(false) }
  }, [])

  const fetchScore = useCallback(async () => {
    try {
      const res = await fetch(`/api/stability-score?municipality=${encodeURIComponent(selectedLocation.name)}`)
      if (res.ok) {
        const data = await res.json()
        setStabilityScore(data.overall || 82)
      }
    } catch (err) { console.error('Failed to fetch score:', err) }
  }, [selectedLocation.name])

  useEffect(() => {
    fetchIncidents()
    fetchScore()
  }, [fetchIncidents, fetchScore])

  const handleRefresh = useCallback(async () => {
    setLastRefresh(new Date())
    await Promise.all([fetchIncidents(), fetchScore()])
  }, [fetchIncidents, fetchScore])

  const { containerRef, isRefreshing, pullProgress } = usePullToRefresh(handleRefresh)

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto h-full scrollbar-hide" data-lenis-prevent>
      {/* Pull to refresh */}
      <div className={cn(
        "flex items-center justify-center py-4 transition-all duration-200",
        pullProgress > 0 || isRefreshing ? "opacity-100" : "opacity-0 h-0 py-0"
      )}>
        <RefreshCw className={cn("w-5 h-5 text-muted-foreground", isRefreshing && "animate-spin", pullProgress >= 1 && !isRefreshing && "text-accent")} />
      </div>

      <div className="p-4 md:p-6 lg:p-8" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}>
        {/* Header */}
        <div className="mb-6">
          <p className="font-mono text-sm text-muted-foreground">{getGreeting()}</p>
          <h1 className="font-bebas text-3xl text-foreground tracking-wide">{selectedLocation.name}</h1>
        </div>

        {/* Top Row: Score Card + 30-Day Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ScoreCard score={stabilityScore} loading={loading} onClick={() => setShowScorePanel(true)} />
          <ThirtyDayHeatmap incidents={incidents} />
        </div>

        {/* Middle Row: Orbit Locations + Data Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <OrbitLocationsCard onNavigateToMap={onNavigateToMap} />
          <DataHealth />
        </div>

        {/* Category Trends */}
        <CategoryTrends incidents={incidents} onSelectIncident={setSelectedIncident} />

        {/* Footer */}
        <footer className="mt-6 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">
              Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">Pull to refresh</span>
          </div>
        </footer>
      </div>

      {/* Panels */}
      <ScoreDetailPanel score={stabilityScore} isOpen={showScorePanel} onClose={() => setShowScorePanel(false)} />
      <IncidentModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
    </div>
  )
}