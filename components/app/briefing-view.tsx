// components/app/briefing-view.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { CURRENT_LOCATION, ORBIT_LOCATIONS } from "@/lib/raven-data"
import { 
  TrendingUp, TrendingDown, Shield, Landmark, Construction, ChevronRight,
  Loader2, Flame, Car, AlertCircle, RefreshCw, Users, X, ExternalLink, Home, MapPin
} from "lucide-react"

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

// Helpers
const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening" }
const formatTimeAgo = (ts: string) => {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000), hrs = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
const getIncidentCategory = (c: string): 'safety' | 'civic' | 'infrastructure' => {
  if (['violent_crime', 'property_crime', 'police', 'fire', 'medical'].includes(c)) return 'safety'
  if (['civic', 'government', 'services', 'court', 'elections'].includes(c)) return 'civic'
  return 'infrastructure'
}

// Pull to refresh
function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const onStart = (e: TouchEvent) => { if (container.scrollTop === 0) startY.current = e.touches[0].clientY }
    const onMove = (e: TouchEvent) => {
      if (container.scrollTop === 0 && !isRefreshing) {
        const diff = e.touches[0].clientY - startY.current
        if (diff > 0 && diff < 150) setPullProgress(Math.min(diff / 100, 1))
      }
    }
    const onEnd = async () => {
      if (pullProgress >= 1 && !isRefreshing) { setIsRefreshing(true); await onRefresh(); setIsRefreshing(false) }
      setPullProgress(0)
    }
    container.addEventListener('touchstart', onStart, { passive: true })
    container.addEventListener('touchmove', onMove, { passive: true })
    container.addEventListener('touchend', onEnd)
    return () => { container.removeEventListener('touchstart', onStart); container.removeEventListener('touchmove', onMove); container.removeEventListener('touchend', onEnd) }
  }, [pullProgress, isRefreshing, onRefresh])

  return { containerRef, isRefreshing, pullProgress }
}

// Category toggle with localStorage
function useCategoryToggle() {
  const [category, setCategory] = useState<'safety' | 'civic' | 'infrastructure'>('safety')
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const stored = localStorage.getItem('raven_trend_category')
    if (stored && ['safety', 'civic', 'infrastructure'].includes(stored)) setCategory(stored as any)
    setMounted(true)
  }, [])
  const update = (c: 'safety' | 'civic' | 'infrastructure') => { setCategory(c); localStorage.setItem('raven_trend_category', c) }
  return { category, setCategory: update, mounted }
}

// Score Detail Panel - Clean, animated
function ScoreDetailPanel({ score, isOpen, onClose }: { score: number; isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'details' | 'timeline' | 'updates'>('details')
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />
      <div 
        className="relative w-full max-w-sm h-full bg-gradient-to-b from-orange-500 to-amber-600 shadow-2xl transition-transform duration-300 ease-out"
        style={{ animation: 'slideIn 0.3s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <span className="font-mono text-xs text-white/70">Stability Index</span>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Score */}
          <div className="px-4 pb-4">
            <p className="text-5xl font-light text-white">{score}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/20 rounded-full"><div className="h-full bg-white/80 rounded-full" style={{ width: `${score}%` }} /></div>
              <span className="font-mono text-[10px] text-white/50">/ 100</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-y border-white/10">
            {(['details', 'timeline', 'updates'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={cn("flex-1 py-2 font-mono text-[10px] uppercase", tab === t ? "text-white bg-white/10" : "text-white/50")}>
                {t}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {tab === 'details' && (
              <div className="space-y-2">
                {[
                  { icon: Shield, name: 'Safety', weight: '40%', pct: 85, desc: '911, crime reports' },
                  { icon: Construction, name: 'Infrastructure', weight: '30%', pct: 78, desc: '311, traffic' },
                  { icon: Landmark, name: 'Civic', weight: '30%', pct: 92, desc: 'Government, permits' },
                ].map(item => (
                  <div key={item.name} className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><item.icon className="w-3.5 h-3.5 text-white/70" /><span className="font-mono text-xs text-white">{item.name}</span></div>
                      <span className="font-mono text-[10px] text-white/50">{item.weight}</span>
                    </div>
                    <div className="h-1 bg-white/20 rounded-full"><div className="h-full bg-white/60 rounded-full" style={{ width: `${item.pct}%` }} /></div>
                    <p className="font-mono text-[9px] text-white/40 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === 'timeline' && (
              <div>
                <div className="grid grid-cols-7 gap-1 mb-1">{['M','T','W','T','F','S','S'].map((d,i) => <div key={i} className="text-center font-mono text-[9px] text-white/40">{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const s = i < 30 ? 70 + Math.floor(Math.random() * 25) : null
                    return <div key={i} className="aspect-square rounded-sm" style={{ backgroundColor: s ? `rgba(255,255,255,${0.1 + (s - 70) / 30 * 0.4})` : 'rgba(255,255,255,0.05)' }} />
                  })}
                </div>
              </div>
            )}
            {tab === 'updates' && (
              <div className="space-y-2">
                <div className="bg-white/10 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-300 mb-0.5"><TrendingUp className="w-3 h-3" /><span className="font-mono text-[10px]">+3 pts</span></div>
                  <p className="font-mono text-xs text-white">Safety incidents down</p>
                  <p className="font-mono text-[9px] text-white/40 mt-0.5">2 days ago</p>
                </div>
                <div className="bg-white/10 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-rose-300 mb-0.5"><TrendingDown className="w-3 h-3" /><span className="font-mono text-[10px]">-2 pts</span></div>
                  <p className="font-mono text-xs text-white">Infrastructure reports up</p>
                  <p className="font-mono text-[9px] text-white/40 mt-0.5">5 days ago</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-white/10"><p className="font-mono text-[9px] text-white/40 text-center">Updates hourly</p></div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Score Card - COMPACT
function ScoreCard({ score, loading, onClick }: { score: number; loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-accent via-orange-500 to-amber-600 p-3 text-left hover:shadow-lg transition-shadow group">
      {/* Wireframe */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="xMaxYMid slice">
          {[...Array(6)].map((_, i) => <circle key={i} cx="200" cy="50" r={15 + i * 15} fill="none" stroke="white" strokeWidth="1" />)}
        </svg>
      </div>
      <div className="relative flex items-center justify-between">
        <div className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-mono text-white">Raven</div>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><Home className="w-3 h-3 text-white" /></div>
      </div>
      <div className="relative mt-3">
        {loading ? <Loader2 className="w-6 h-6 animate-spin text-white/60" /> : <p className="text-4xl font-light text-white">{score}</p>}
      </div>
      <p className="relative font-mono text-[10px] text-white/70 mt-1">Stability Index</p>
      <ChevronRight className="absolute bottom-2 right-2 w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
    </button>
  )
}

// 30-Day Heatmap - FIXED
function ThirtyDayHeatmap({ incidents }: { incidents: Incident[] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Generate exactly 35 cells (5 complete weeks)
  const cells: { date: Date; count: number; isToday: boolean }[] = []
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const count = incidents.filter(inc => {
      const incDate = new Date(inc.occurred_at || inc.created_at)
      incDate.setHours(0, 0, 0, 0)
      return incDate.getTime() === d.getTime()
    }).length
    cells.push({ date: d, count, isToday: i === 0 })
  }
  
  const maxCount = Math.max(...cells.map(c => c.count), 1)

  return (
    <div className="bg-card border border-border/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Activity</h3>
        <span className="font-mono text-[9px] text-muted-foreground">30 Days</span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-xl font-light text-foreground">{incidents.length}</span>
        <span className="font-mono text-[9px] text-muted-foreground">incidents</span>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-[3px] mb-[3px]">
        {['M','T','W','T','F','S','S'].map((d, i) => <div key={i} className="text-center font-mono text-[8px] text-muted-foreground">{d}</div>)}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 gap-[3px]">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-sm flex items-center justify-center",
              cell.isToday && "ring-1 ring-accent ring-offset-1 ring-offset-background"
            )}
            style={{ backgroundColor: cell.count === 0 ? 'hsl(var(--muted) / 0.4)' : `hsl(var(--accent) / ${0.2 + (cell.count / maxCount) * 0.7})` }}
            title={`${cell.date.toLocaleDateString()}: ${cell.count}`}
          >
            {cell.count > 0 && <span className="font-mono text-[8px] text-white">{cell.count}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// Orbit Map - COMPACT
function OrbitLocationsCard({ onNavigateToMap }: { onNavigateToMap: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const locations = ORBIT_LOCATIONS.slice(0, 5)

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstance.current) return
    const init = async () => {
      const L = (await import('leaflet')).default
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link)
      }
      if (!mapRef.current || mapInstance.current) return
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false }).setView([42.28, -88.35], 9)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { maxZoom: 19, opacity: 0.5 }).addTo(map)
      mapInstance.current = map; setReady(true)
    }
    init()
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null } }
  }, [])

  useEffect(() => {
    if (!ready || !mapInstance.current) return
    const L = require('leaflet')
    const coords: Record<string, [number, number]> = { 'crystal lake': [42.24, -88.32], 'mchenry': [42.33, -88.27], 'woodstock': [42.31, -88.45], 'cary': [42.21, -88.24], 'algonquin': [42.17, -88.29] }
    locations.forEach(loc => { const c = coords[loc.name.toLowerCase()]; if (c) L.circleMarker(c, { radius: 8, fillColor: '#f97316', color: '#fff', weight: 2, fillOpacity: 0.9 }).addTo(mapInstance.current) })
  }, [ready, locations])

  return (
    <button onClick={onNavigateToMap} className="w-full bg-card border border-border/50 rounded-lg overflow-hidden hover:border-accent/50 transition-colors text-left group">
      <div className="flex items-center justify-between p-2.5">
        <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Your Orbit</h3>
        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="relative h-20">
        <div ref={mapRef} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
      </div>
      <div className="p-2.5 pt-1 flex items-center justify-between">
        <span className="font-mono text-[9px] text-muted-foreground">{locations.length} locations</span>
        <span className="font-mono text-[9px] text-accent opacity-0 group-hover:opacity-100">View →</span>
      </div>
    </button>
  )
}

// Data Health - COMPACT
function DataHealth() {
  return (
    <div className="bg-card border border-border/50 rounded-lg p-2.5">
      <div className="flex items-center gap-3 mb-2">
        {['Scanner', 'County Gov'].map(s => (
          <div key={s} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-mono text-[9px] text-foreground">{s}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-3.5 h-3.5 text-accent" />
        <span className="font-mono text-[9px] text-muted-foreground flex-1">247 requesting CAD</span>
        <button className="px-2 py-1 bg-accent text-white font-mono text-[9px] rounded hover:bg-accent/90">Join</button>
      </div>
    </div>
  )
}

// Category Trends - COMPACT
function CategoryTrends({ incidents, onSelect }: { incidents: Incident[]; onSelect: (i: Incident) => void }) {
  const { category, setCategory, mounted } = useCategoryToggle()
  const safety = incidents.filter(i => getIncidentCategory(i.category) === 'safety')
  const civic = incidents.filter(i => getIncidentCategory(i.category) === 'civic')
  const infra = incidents.filter(i => getIncidentCategory(i.category) === 'infrastructure')
  const counts = { safety: safety.length, civic: civic.length, infrastructure: infra.length }
  const current = category === 'safety' ? safety : category === 'civic' ? civic : infra

  if (!mounted) return null

  const icons: Record<string, any> = { traffic: Car, fire: Flame, violent_crime: Shield, property_crime: Shield, police: Shield, civic: Landmark, government: Landmark }
  const colors: Record<string, string> = { violent_crime: 'text-rose-500', property_crime: 'text-rose-500', police: 'text-rose-500', fire: 'text-orange-500', traffic: 'text-sky-500', civic: 'text-violet-500', government: 'text-violet-500' }

  return (
    <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
      <div className="flex border-b border-border/50">
        {(['safety', 'civic', 'infrastructure'] as const).map(cat => {
          const Icon = { safety: Shield, civic: Landmark, infrastructure: Construction }[cat]
          return (
            <button key={cat} onClick={() => setCategory(cat)} className={cn("flex-1 flex items-center justify-center gap-1 py-2 font-mono text-[9px] uppercase", category === cat ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted/30")}>
              <Icon className="w-3 h-3" /><span className="hidden sm:inline">{cat}</span>
              {counts[cat] > 0 && <span className={cn("px-1 rounded text-[8px]", category === cat ? "bg-accent/20" : "bg-muted")}>{counts[cat]}</span>}
            </button>
          )
        })}
      </div>
      <div className="p-2.5 max-h-36 overflow-y-auto scrollbar-hide">
        {current.length === 0 ? (
          <p className="font-mono text-[10px] text-muted-foreground text-center py-2">No updates</p>
        ) : (
          <div className="space-y-1">
            {current.slice(0, 4).map(item => {
              const Icon = icons[item.category] || AlertCircle
              const color = colors[item.category] || 'text-amber-500'
              return (
                <button key={item.id} onClick={() => onSelect(item)} className="w-full flex items-start gap-2 p-1.5 rounded hover:bg-muted/50 text-left group">
                  <Icon className={cn("w-3 h-3 mt-0.5", color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] text-foreground line-clamp-1 group-hover:text-accent">{item.title}</p>
                    <p className="font-mono text-[8px] text-muted-foreground">{item.municipality} • {formatTimeAgo(item.occurred_at || item.created_at)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Incident Modal
function IncidentModal({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  if (!incident) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-t-lg sm:rounded-lg w-full sm:max-w-sm max-h-[60vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-border px-3 py-2 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase text-muted-foreground">Detail</span>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-3">
          <h3 className="font-mono text-sm text-foreground mb-1">{incident.title}</h3>
          <p className="font-mono text-[10px] text-muted-foreground mb-2">{incident.municipality || 'McHenry County'} • {formatTimeAgo(incident.occurred_at || incident.created_at)}</p>
          {incident.description && <p className="font-mono text-[10px] text-foreground/80 mb-2">{incident.description}</p>}
          <div className="pt-2 border-t border-border">
            <p className="font-mono text-[9px] text-muted-foreground">Source: {incident.raw_data?.source || 'Lake McHenry Scanner'}</p>
            {incident.raw_data?.url && <a href={incident.raw_data.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 font-mono text-[9px] text-accent hover:underline">View <ExternalLink className="w-3 h-3" /></a>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Main
export function BriefingView({ selectedLocationId, onNavigateToMap }: { selectedLocationId: string; onNavigateToMap: () => void }) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [showScore, setShowScore] = useState(false)
  const [score, setScore] = useState(82)
  const location = ORBIT_LOCATIONS.find(l => l.id === selectedLocationId) || CURRENT_LOCATION

  const fetchIncidents = useCallback(async () => {
    try { const res = await fetch('/api/incidents?days=30&limit=200'); if (res.ok) setIncidents((await res.json()).items || []) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }, [])

  const fetchScore = useCallback(async () => {
    try { const res = await fetch(`/api/stability-score?municipality=${encodeURIComponent(location.name)}`); if (res.ok) setScore((await res.json()).overall || 82) }
    catch (e) { console.error(e) }
  }, [location.name])

  useEffect(() => { fetchIncidents(); fetchScore() }, [fetchIncidents, fetchScore])

  const handleRefresh = useCallback(async () => { setLastRefresh(new Date()); await Promise.all([fetchIncidents(), fetchScore()]) }, [fetchIncidents, fetchScore])
  const { containerRef, isRefreshing, pullProgress } = usePullToRefresh(handleRefresh)

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto h-full scrollbar-hide">
      <div className={cn("flex items-center justify-center py-2 transition-all", pullProgress > 0 || isRefreshing ? "opacity-100" : "opacity-0 h-0 py-0")}>
        <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isRefreshing && "animate-spin")} />
      </div>

      <div className="p-3 md:p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
        <div className="mb-3">
          <p className="font-mono text-[10px] text-muted-foreground">{getGreeting()}</p>
          <h1 className="font-bebas text-xl text-foreground">{location.name}</h1>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <ScoreCard score={score} loading={loading} onClick={() => setShowScore(true)} />
          <ThirtyDayHeatmap incidents={incidents} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <OrbitLocationsCard onNavigateToMap={onNavigateToMap} />
          <DataHealth />
        </div>

        <CategoryTrends incidents={incidents} onSelect={setSelectedIncident} />

        <footer className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between">
          <span className="font-mono text-[8px] text-muted-foreground">Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          <span className="font-mono text-[8px] text-muted-foreground">Pull to refresh</span>
        </footer>
      </div>

      <ScoreDetailPanel score={score} isOpen={showScore} onClose={() => setShowScore(false)} />
      <IncidentModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
    </div>
  )
}