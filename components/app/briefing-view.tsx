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

const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening" }
const formatTimeAgo = (ts: string) => {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000), hrs = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
const getIncidentCategory = (c: string): 'safety' | 'civic' | 'infrastructure' => {
  if (['violent_crime', 'property_crime', 'police', 'fire', 'medical'].includes(c)) return 'safety'
  if (['civic', 'government', 'services', 'court', 'elections'].includes(c)) return 'civic'
  return 'infrastructure'
}

// Score Detail Panel
function ScoreDetailPanel({ score, isOpen, onClose }: { score: number; isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'details' | 'timeline' | 'updates'>('details')
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-gradient-to-b from-orange-500 to-amber-600 shadow-2xl"
        style={{ animation: 'slideIn 0.25s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4">
            <span className="font-mono text-xs text-white/70">Stability Index</span>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="px-4 pb-4">
            <p className="text-5xl font-light text-white">{score}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full"><div className="h-full bg-white/80 rounded-full" style={{ width: `${score}%` }} /></div>
              <span className="font-mono text-[10px] text-white/50">/ 100</span>
            </div>
          </div>

          <div className="flex border-y border-white/10">
            {(['details', 'timeline', 'updates'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={cn("flex-1 py-2.5 font-mono text-[10px] uppercase", tab === t ? "text-white bg-white/10" : "text-white/50")}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'details' && (
              <div className="space-y-3">
                {[
                  { icon: Shield, name: 'Safety', weight: '40%', pct: 85, desc: '911, crime reports' },
                  { icon: Construction, name: 'Infrastructure', weight: '30%', pct: 78, desc: '311, traffic' },
                  { icon: Landmark, name: 'Civic', weight: '30%', pct: 92, desc: 'Government, permits' },
                ].map(item => (
                  <div key={item.name} className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2"><item.icon className="w-4 h-4 text-white/70" /><span className="font-mono text-sm text-white">{item.name}</span></div>
                      <span className="font-mono text-xs text-white/50">{item.weight}</span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full"><div className="h-full bg-white/60 rounded-full" style={{ width: `${item.pct}%` }} /></div>
                    <p className="font-mono text-[10px] text-white/40 mt-1.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === 'timeline' && (
              <div>
                <div className="flex gap-1 mb-1">{['M','T','W','T','F','S','S'].map((d,i) => <div key={i} className="w-8 text-center font-mono text-[10px] text-white/40">{d}</div>)}</div>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const s = i < 30 ? 70 + Math.floor(Math.random() * 25) : null
                    return <div key={i} className="w-8 h-8 rounded" style={{ backgroundColor: s ? `rgba(255,255,255,${0.1 + (s - 70) / 30 * 0.4})` : 'rgba(255,255,255,0.05)' }} />
                  })}
                </div>
              </div>
            )}
            {tab === 'updates' && (
              <div className="space-y-2">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-emerald-300 mb-1"><TrendingUp className="w-3 h-3" /><span className="font-mono text-xs">+3 pts</span></div>
                  <p className="font-mono text-sm text-white">Safety incidents down</p>
                  <p className="font-mono text-[10px] text-white/40 mt-1">2 days ago</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-rose-300 mb-1"><TrendingDown className="w-3 h-3" /><span className="font-mono text-xs">-2 pts</span></div>
                  <p className="font-mono text-sm text-white">Infrastructure reports up</p>
                  <p className="font-mono text-[10px] text-white/40 mt-1">5 days ago</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-white/10"><p className="font-mono text-[10px] text-white/40 text-center">Updates hourly</p></div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Score Card
function ScoreCard({ score, loading, onClick }: { score: number; loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative h-72 rounded-xl overflow-hidden bg-gradient-to-br from-accent via-orange-500 to-amber-600 p-4 text-left hover:shadow-lg transition-shadow group">
      <div className="absolute inset-0 opacity-15">
        <svg className="w-full h-full" viewBox="0 0 200 150" preserveAspectRatio="xMaxYMid slice">
          {[...Array(6)].map((_, i) => <circle key={i} cx="200" cy="75" r={20 + i * 20} fill="none" stroke="white" strokeWidth="1" />)}
        </svg>
      </div>
      <div className="relative flex items-center justify-between">
        <div className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono text-white">Raven</div>
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"><Home className="w-3.5 h-3.5 text-white" /></div>
      </div>
      <div className="relative mt-16">
        {loading ? <Loader2 className="w-10 h-10 animate-spin text-white/60" /> : <p className="text-8xl font-light text-white">{score}</p>}
      </div>
      <p className="relative font-mono text-base text-white/80 mt-4">Stability Index</p>
      <ChevronRight className="absolute bottom-3 right-3 w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
    </button>
  )
}

// 30-Day Heatmap - SIMPLE VERSION
function ThirtyDayHeatmap({ incidents }: { incidents: Incident[] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Create flat array of 35 days
  const cells = []
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    
    const count = incidents.filter(inc => {
      const incDate = new Date(inc.occurred_at || inc.created_at)
      return incDate.toDateString() === d.toDateString()
    }).length
    
    cells.push({ count, isToday: i === 0 })
  }
  
  const maxCount = Math.max(...cells.map(c => c.count), 1)

  return (
    <div className="h-72 bg-card border border-border/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Activity</span>
        <span className="font-mono text-[10px] text-muted-foreground">35 Days</span>
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-light text-foreground">{incidents.length}</span>
        <span className="font-mono text-xs text-muted-foreground">incidents</span>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="h-4 flex items-center justify-center">
            <span className="font-mono text-[9px] text-muted-foreground">{d}</span>
          </div>
        ))}
      </div>
      
      {/* Grid - 5 rows of 7 */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, i) => {
          const intensity = cell.count / maxCount
          // Use inline styles so Tailwind doesn't purge
          const bgColor = cell.count === 0 
            ? 'rgba(128,128,128,0.15)' 
            : `rgba(249, 115, 22, ${0.3 + intensity * 0.6})`
          
          return (
            <div
              key={i}
              className={cn(
                "h-9 rounded flex items-center justify-center",
                cell.isToday && "ring-2 ring-orange-500 ring-offset-1 ring-offset-background"
              )}
              style={{ backgroundColor: bgColor }}
            >
              {cell.count > 0 && (
                <span className="font-mono text-[8px] text-white font-medium">{cell.count}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Orbit Map
function OrbitLocationsCard({ onNavigateToMap }: { onNavigateToMap: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
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
      
      const coords: Record<string, [number, number]> = { 'crystal lake': [42.24, -88.32], 'mchenry': [42.33, -88.27], 'woodstock': [42.31, -88.45], 'cary': [42.21, -88.24], 'algonquin': [42.17, -88.29] }
      locations.forEach(loc => { const c = coords[loc.name.toLowerCase()]; if (c) L.circleMarker(c, { radius: 8, fillColor: '#f97316', color: '#fff', weight: 2, fillOpacity: 0.9 }).addTo(map) })
      
      mapInstance.current = map
    }
    init()
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null } }
  }, [locations])

  return (
    <button onClick={onNavigateToMap} className="h-40 bg-card border border-border/50 rounded-xl overflow-hidden hover:border-accent/50 transition-colors text-left flex flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Your Orbit</span>
        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
      </div>
    </button>
  )
}

// Data Health
function DataHealth() {
  return (
    <div className="h-40 bg-card border border-border/50 rounded-xl p-4 flex flex-col">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Data Sources</span>
      
      <div className="flex flex-col gap-2 mb-auto">
        {['Lake McHenry Scanner', 'County Government'].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-xs text-foreground">{s}</span>
            <span className="font-mono text-[9px] text-emerald-600 ml-auto">Live</span>
          </div>
        ))}
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <span className="font-mono text-xs text-muted-foreground">CAD/Dispatch</span>
          <span className="font-mono text-[9px] text-muted-foreground ml-auto">Unavailable</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 pt-3 border-t border-border/50">
        <Users className="w-4 h-4 text-accent flex-shrink-0" />
        <span className="font-mono text-[10px] text-muted-foreground flex-1">247 requesting CAD access</span>
        <button className="px-3 py-1.5 bg-accent text-white font-mono text-[10px] rounded-lg hover:bg-accent/90 transition-colors">Join</button>
      </div>
    </div>
  )
}

// Category Trends
function CategoryTrends({ incidents, onSelect }: { incidents: Incident[]; onSelect: (i: Incident) => void }) {
  const [category, setCategory] = useState<'safety' | 'civic' | 'infrastructure'>('safety')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    const stored = localStorage.getItem('raven_trend_category')
    if (stored && ['safety', 'civic', 'infrastructure'].includes(stored)) setCategory(stored as any)
    setMounted(true)
  }, [])

  const safety = incidents.filter(i => getIncidentCategory(i.category) === 'safety')
  const civic = incidents.filter(i => getIncidentCategory(i.category) === 'civic')
  const infra = incidents.filter(i => getIncidentCategory(i.category) === 'infrastructure')
  const counts = { safety: safety.length, civic: civic.length, infrastructure: infra.length }
  const current = category === 'safety' ? safety : category === 'civic' ? civic : infra

  const setAndStore = (c: 'safety' | 'civic' | 'infrastructure') => { setCategory(c); localStorage.setItem('raven_trend_category', c) }

  if (!mounted) return null

  const icons: Record<string, any> = { traffic: Car, fire: Flame, violent_crime: Shield, property_crime: Shield, police: Shield, civic: Landmark, government: Landmark }
  const colors: Record<string, string> = { violent_crime: 'text-rose-500', property_crime: 'text-rose-500', police: 'text-rose-500', fire: 'text-orange-500', traffic: 'text-sky-500', civic: 'text-violet-500', government: 'text-violet-500' }

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      <div className="flex border-b border-border/50">
        {(['safety', 'civic', 'infrastructure'] as const).map(cat => {
          const Icon = { safety: Shield, civic: Landmark, infrastructure: Construction }[cat]
          return (
            <button key={cat} onClick={() => setAndStore(cat)} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors", category === cat ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted/30")}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cat}</span>
              {counts[cat] > 0 && <span className={cn("px-1.5 rounded text-[9px]", category === cat ? "bg-accent/20" : "bg-muted")}>{counts[cat]}</span>}
            </button>
          )
        })}
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        {current.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground text-center py-4">No {category} updates this week</p>
        ) : (
          <div className="space-y-1">
            {current.slice(0, 5).map(item => {
              const Icon = icons[item.category] || AlertCircle
              const color = colors[item.category] || 'text-amber-500'
              return (
                <button key={item.id} onClick={() => onSelect(item)} className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 text-left group">
                  <Icon className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-foreground line-clamp-1 group-hover:text-accent transition-colors">{item.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{item.municipality} • {formatTimeAgo(item.occurred_at || item.created_at)}</p>
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
      <div className="relative bg-card border border-border rounded-t-xl sm:rounded-xl w-full sm:max-w-md max-h-[70vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-border px-4 py-2.5 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Detail</span>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-4">
          <h3 className="font-mono text-sm font-medium text-foreground mb-2">{incident.title}</h3>
          <p className="font-mono text-xs text-muted-foreground mb-3">{incident.municipality || 'McHenry County'} • {formatTimeAgo(incident.occurred_at || incident.created_at)}</p>
          {incident.description && <p className="font-mono text-xs text-foreground/80 mb-4">{incident.description}</p>}
          <div className="pt-3 border-t border-border">
            <p className="font-mono text-[10px] text-muted-foreground">Source: {incident.raw_data?.source || 'Lake McHenry Scanner'}</p>
            {incident.raw_data?.url && <a href={incident.raw_data.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 font-mono text-[10px] text-accent hover:underline">View original <ExternalLink className="w-3 h-3" /></a>}
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

  const handleRefresh = async () => { setLastRefresh(new Date()); await Promise.all([fetchIncidents(), fetchScore()]) }

  return (
    <div className="absolute inset-0 overflow-y-auto scrollbar-hide">
      <div className="p-5 md:p-6 min-h-full">
        {/* Header */}
        <div className="mb-5">
          <p className="font-mono text-xs text-muted-foreground">{getGreeting()}</p>
          <h1 className="font-bebas text-3xl text-foreground">{location.name}</h1>
        </div>

        {/* Row 1: Score + Heatmap */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <ScoreCard score={score} loading={loading} onClick={() => setShowScore(true)} />
          <ThirtyDayHeatmap incidents={incidents} />
        </div>

        {/* Row 2: Orbit + Data */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <OrbitLocationsCard onNavigateToMap={onNavigateToMap} />
          <DataHealth />
        </div>

        {/* Row 3: Trends */}
        <CategoryTrends incidents={incidents} onSelect={setSelectedIncident} />

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
          <span className="font-mono text-[9px] text-muted-foreground">Updated {lastRefresh.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          <button onClick={handleRefresh} className="font-mono text-[9px] text-muted-foreground hover:text-accent flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        
        {/* Bottom spacing for safe area */}
        <div className="h-20" />
      </div>

      <ScoreDetailPanel score={score} isOpen={showScore} onClose={() => setShowScore(false)} />
      <IncidentModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
    </div>
  )
}