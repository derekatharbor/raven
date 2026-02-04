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
  Info
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

interface EmergingPattern {
  type: 'safety_cluster' | 'trend_spike' | 'stability_drop'
  title: string
  description: string
  severity: 'high' | 'medium'
  incidents: Incident[]
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
// CATEGORY TOGGLE HOOK (localStorage + 48hr reset)
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
// INCIDENT DETAIL MODAL
// ============================================
function IncidentModal({ 
  incident, 
  onClose 
}: { 
  incident: Incident | null
  onClose: () => void 
}) {
  if (!incident) return null

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div 
        className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Incident Detail
          </span>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-bebas text-xl text-foreground tracking-wide mb-2">
            {incident.title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>{incident.municipality || 'McHenry County'}</span>
            <span>•</span>
            <span>{formatTimeAgo(incident.occurred_at || incident.created_at)}</span>
          </div>
          
          {incident.description && (
            <p className="font-mono text-sm text-foreground/80 mb-4">
              {incident.description}
            </p>
          )}
          
          <div className="pt-4 border-t border-border">
            <p className="font-mono text-xs text-muted-foreground">
              Source: {incident.raw_data?.source || 'Lake McHenry Scanner'}
            </p>
            {incident.raw_data?.url && (
              <a 
                href={incident.raw_data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 font-mono text-xs text-accent hover:underline"
              >
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
// SCORE METHODOLOGY MODAL
// ============================================
function ScoreModal({ score, onClose }: { score: number; onClose: () => void }) {
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div 
        className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            How We Calculate This
          </span>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="text-center mb-6">
            <span className="text-5xl font-light bg-gradient-to-br from-accent via-orange-500 to-amber-500 bg-clip-text text-transparent">
              {score}
            </span>
            <p className="font-mono text-sm text-muted-foreground mt-2">Stability Index</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <p className="font-mono text-sm font-medium text-foreground">Safety (40%)</p>
                <p className="font-mono text-xs text-muted-foreground">
                  911 dispatch volume, crime reports, and emergency calls compared to historical averages.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Construction className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="font-mono text-sm font-medium text-foreground">Infrastructure (30%)</p>
                <p className="font-mono text-xs text-muted-foreground">
                  311 reports, traffic incidents, and utility disruptions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <Landmark className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p className="font-mono text-sm font-medium text-foreground">Civic (30%)</p>
                <p className="font-mono text-xs text-muted-foreground">
                  Government activity, permits filed, and community events.
                </p>
              </div>
            </div>
          </div>
          
          <p className="font-mono text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
            Score updates hourly. Higher is better. 80+ indicates stable conditions.
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ============================================
// STABILITY GAUGE (Credit Score Style)
// ============================================
function StabilityGauge({ 
  score, 
  trend,
  trendPercent,
  loading,
  onClick
}: { 
  score: number
  trend: 'improving' | 'stable' | 'declining'
  trendPercent: number
  loading: boolean
  onClick: () => void
}) {
  // Score ranges: 0-40 Poor, 40-60 Fair, 60-80 Good, 80-100 Excellent
  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Stable'
    if (s >= 60) return 'Good'
    if (s >= 40) return 'Fair'
    return 'Elevated'
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500'
    if (s >= 60) return 'text-lime-500'
    if (s >= 40) return 'text-amber-500'
    return 'text-rose-500'
  }

  // Calculate gauge position (0-100 maps to arc)
  const normalizedScore = Math.min(100, Math.max(0, score))
  const rotation = -90 + (normalizedScore / 100) * 180 // -90 to 90 degrees

  return (
    <button 
      onClick={onClick}
      className="relative w-full flex flex-col items-center group"
    >
      {/* Gauge Arc */}
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background arc segments */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Arc background gradient segments */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#84cc16" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          
          {/* Gauge track */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            className="opacity-30"
          />
          
          {/* Active portion */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(normalizedScore / 100) * 251.2} 251.2`}
          />
        </svg>

        {/* Score display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mb-2" />
          ) : (
            <>
              {trend !== 'stable' && (
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-mono mb-1",
                  trend === 'improving' ? "text-emerald-500" : "text-rose-500"
                )}>
                  {trend === 'improving' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trendPercent}%
                </div>
              )}
              <span className="text-4xl font-light bg-gradient-to-br from-accent via-orange-500 to-amber-500 bg-clip-text text-transparent">
                {score}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Score label */}
      <div className="flex items-center gap-2 mt-2">
        <span className={cn("font-mono text-sm font-medium", getScoreColor(score))}>
          {loading ? '...' : getScoreLabel(score)}
        </span>
        <Info className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Range labels */}
      <div className="flex justify-between w-48 mt-1 px-2">
        <span className="font-mono text-[10px] text-muted-foreground">0</span>
        <span className="font-mono text-[10px] text-muted-foreground">100</span>
      </div>
    </button>
  )
}

// ============================================
// STABILITY HERO (Redesigned)
// ============================================
function StabilityHero({ location }: { location: LocationData }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/stability-score?municipality=${encodeURIComponent(location.name)}`)
        if (res.ok) {
          setData(await res.json())
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [location.name])

  const score = data?.overall ?? location.stabilityScore
  const trend = data?.categories?.safety?.trend ?? 'stable'
  const trendPercent = data?.categories?.safety?.trendPercent ?? 0
  const incidentCount = data?.categories?.safety?.incidents ?? 0

  // Generate narrative based on delta
  let narrative = "Analyzing local conditions..."
  if (!loading) {
    if (incidentCount === 0) {
      narrative = "No significant activity this week. Your area is quiet."
    } else if (trend === 'declining') {
      narrative = `Activity up ${trendPercent}% from last week with ${incidentCount} incidents tracked.`
    } else if (trend === 'improving') {
      narrative = `Activity down ${trendPercent}% — ${location.name} is quieter than usual.`
    } else {
      narrative = `Normal activity levels with ${incidentCount} incidents this week.`
    }
  }

  return (
    <header className="mb-6">
      <p className="font-mono text-sm text-muted-foreground mb-1 text-center">{getGreeting()}</p>
      <h1 className="font-bebas text-3xl md:text-4xl text-foreground tracking-wide text-center mb-4">
        {location.name}
      </h1>
      
      {/* Gauge */}
      <StabilityGauge 
        score={score}
        trend={trend}
        trendPercent={trendPercent}
        loading={loading}
        onClick={() => setShowModal(true)}
      />

      {/* Narrative */}
      <p className="font-mono text-sm text-muted-foreground mt-4 text-center max-w-md mx-auto">
        {narrative}
      </p>

      {/* Score Modal */}
      {showModal && (
        <ScoreModal score={score} onClose={() => setShowModal(false)} />
      )}
    </header>
  )
}

// ============================================
// STATUS BAR (Condensed Neighborhood Health)
// ============================================
function StatusBar({ incidents }: { incidents: Incident[] }) {
  const [pattern, setPattern] = useState<EmergingPattern | null>(null)

  useEffect(() => {
    const now = new Date()
    const last72h = incidents.filter(i => {
      const t = new Date(i.occurred_at || i.created_at)
      return (now.getTime() - t.getTime()) < 72 * 3600000
    })

    // Safety cluster detection
    const safetyIncidents = last72h.filter(i => 
      ['violent_crime', 'property_crime', 'police'].includes(i.category)
    )
    
    const byMunicipality: Record<string, Record<string, Incident[]>> = {}
    safetyIncidents.forEach(i => {
      const area = i.municipality || 'McHenry County'
      const type = i.category
      if (!byMunicipality[area]) byMunicipality[area] = {}
      if (!byMunicipality[area][type]) byMunicipality[area][type] = []
      byMunicipality[area][type].push(i)
    })

    for (const [area, types] of Object.entries(byMunicipality)) {
      for (const [type, typeIncidents] of Object.entries(types)) {
        if (typeIncidents.length >= 3) {
          const labels: Record<string, string> = {
            'property_crime': 'property incidents',
            'violent_crime': 'safety alerts',
            'police': 'police activity reports'
          }
          setPattern({
            type: 'safety_cluster',
            title: `${typeIncidents.length} ${labels[type] || 'incidents'} in ${area}`,
            description: `Cluster detected over 72 hours.`,
            severity: type === 'violent_crime' ? 'high' : 'medium',
            incidents: typeIncidents
          })
          return
        }
      }
    }

    setPattern(null)
  }, [incidents])

  // No pattern = Slim status bar
  if (!pattern) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span className="font-mono text-xs text-emerald-600">
          No emerging patterns • Normal activity
        </span>
      </div>
    )
  }

  // Pattern detected = Alert card
  return (
    <div className={cn(
      "rounded-xl p-4",
      pattern.severity === 'high' 
        ? "bg-rose-500/10 border border-rose-500/30"
        : "bg-amber-500/10 border border-amber-500/30"
    )}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn(
          "w-5 h-5 flex-shrink-0",
          pattern.severity === 'high' ? "text-rose-500" : "text-amber-500"
        )} />
        <div className="flex-1">
          <span className={cn(
            "font-mono text-[10px] uppercase tracking-widest",
            pattern.severity === 'high' ? "text-rose-500" : "text-amber-500"
          )}>
            Emerging Pattern
          </span>
          <h3 className="font-mono text-sm font-medium text-foreground mt-1">
            {pattern.title}
          </h3>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {pattern.description}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// CATEGORY TRENDS (Fixed Grouping + Clickable)
// ============================================
function CategoryTrends({ 
  incidents,
  onSelectIncident
}: { 
  incidents: Incident[]
  onSelectIncident: (incident: Incident) => void
}) {
  const { category, setCategory, mounted } = useCategoryToggle()

  // Group incidents by their ACTUAL category type
  const safetyIncidents = incidents.filter(i => getIncidentCategory(i.category) === 'safety')
  const civicIncidents = incidents.filter(i => getIncidentCategory(i.category) === 'civic')
  const infraIncidents = incidents.filter(i => getIncidentCategory(i.category) === 'infrastructure')

  // Calculate hourly distribution for safety
  const hourCounts = new Array(24).fill(0)
  safetyIncidents.forEach(i => {
    const hour = new Date(i.occurred_at || i.created_at).getHours()
    hourCounts[hour]++
  })
  
  const maxCount = Math.max(...hourCounts, 1)
  
  // Find peak window
  let peakStart = 0, peakSum = 0
  for (let i = 0; i < 24; i++) {
    const windowSum = hourCounts[i] + hourCounts[(i+1)%24] + hourCounts[(i+2)%24]
    if (windowSum > peakSum) {
      peakSum = windowSum
      peakStart = i
    }
  }

  const formatHour = (h: number) => {
    if (h === 0) return '12 AM'
    if (h === 12) return '12 PM'
    return h > 12 ? `${h - 12} PM` : `${h} AM`
  }

  // Get counts for badges
  const counts = {
    safety: safetyIncidents.length,
    civic: civicIncidents.length,
    infrastructure: infraIncidents.length
  }

  if (!mounted) return null

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      {/* Category Toggle */}
      <div className="flex border-b border-border/50">
        {(['safety', 'civic', 'infrastructure'] as const).map((cat) => {
          const icons = { safety: Shield, civic: Landmark, infrastructure: Construction }
          const Icon = icons[cat]
          const isActive = category === cat
          const count = counts[cat]
          
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-2 font-mono text-xs uppercase tracking-wider transition-colors relative",
                isActive 
                  ? "bg-accent/10 text-accent border-b-2 border-accent -mb-[1px]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{cat}</span>
              {count > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-accent/20" : "bg-muted"
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        {category === 'safety' && (
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Activity by Time of Day
            </h4>
            
            {peakSum === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">
                No safety incidents this week.
              </p>
            ) : (
              <>
                {/* Heatmap */}
                <div className="flex gap-0.5 mb-2">
                  {hourCounts.map((count, hour) => (
                    <div
                      key={hour}
                      className="flex-1 h-8 rounded-sm"
                      style={{
                        backgroundColor: count === 0 
                          ? 'hsl(var(--muted) / 0.3)' 
                          : `hsl(var(--accent) / ${0.15 + (count / maxCount) * 0.85})`
                      }}
                      title={`${formatHour(hour)}: ${count}`}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-4">
                  <span>12 AM</span>
                  <span>12 PM</span>
                  <span>11 PM</span>
                </div>

                <p className="font-mono text-sm text-foreground">
                  <Clock className="w-4 h-4 inline mr-2 text-accent" />
                  Peak: <span className="font-medium">{formatHour(peakStart)} – {formatHour((peakStart + 3) % 24)}</span>
                </p>
              </>
            )}
          </div>
        )}

        {category === 'civic' && (
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Decision Days
            </h4>
            
            {civicIncidents.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">
                No civic events tracked this week.
              </p>
            ) : (
              <div className="space-y-2">
                {civicIncidents.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectIncident(item)}
                    className="w-full flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <Calendar className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
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
                ))}
              </div>
            )}
          </div>
        )}

        {category === 'infrastructure' && (
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Infrastructure Updates
            </h4>
            
            {infraIncidents.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">
                No infrastructure updates this week.
              </p>
            ) : (
              <div className="space-y-2">
                {infraIncidents.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectIncident(item)}
                    className="w-full flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <Construction className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// NEED TO KNOW (Clickable Grouped Incidents)
// ============================================
function NeedToKnow({ 
  incidents, 
  onViewFeed,
  onSelectIncident
}: { 
  incidents: Incident[]
  onViewFeed: () => void
  onSelectIncident: (incident: Incident) => void
}) {
  // Today's incidents only
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayIncidents = incidents.filter(i => {
    const d = new Date(i.occurred_at || i.created_at)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  })

  // Group by category + municipality (similarity)
  const groups: Record<string, { incidents: Incident[]; category: string; municipality: string }> = {}

  todayIncidents.forEach(incident => {
    const key = `${incident.category}-${incident.municipality || 'county'}`
    
    if (!groups[key]) {
      groups[key] = {
        incidents: [],
        category: incident.category,
        municipality: incident.municipality || 'McHenry County'
      }
    }
    
    groups[key].incidents.push(incident)
  })

  const sorted = Object.entries(groups)
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => b.incidents.length - a.incidents.length)
    .slice(0, 5)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'traffic': return Car
      case 'violent_crime':
      case 'property_crime':
      case 'police': return Shield
      case 'fire': return Flame
      case 'civic':
      case 'government': return Landmark
      default: return AlertCircle
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'violent_crime':
      case 'property_crime':
      case 'police': return 'text-rose-500'
      case 'fire': return 'text-orange-500'
      case 'traffic': return 'text-sky-500'
      case 'civic':
      case 'government': return 'text-violet-500'
      default: return 'text-muted-foreground'
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'traffic': 'Traffic Incident',
      'violent_crime': 'Safety Alert',
      'property_crime': 'Property Incident',
      'police': 'Police Activity',
      'fire': 'Fire/Rescue',
      'civic': 'Civic Update',
      'government': 'Government Update',
      'infrastructure': 'Infrastructure'
    }
    return labels[category] || 'Incident'
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            Need to Know
          </span>
        </div>
        <button 
          onClick={onViewFeed}
          className="font-mono text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          View all →
        </button>
      </div>

      <div className="divide-y divide-border/30">
        {sorted.length === 0 ? (
          <div className="p-4 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              No significant activity today.
            </p>
          </div>
        ) : (
          sorted.map((group) => {
            const Icon = getCategoryIcon(group.category)
            const color = getCategoryColor(group.category)
            const label = getCategoryLabel(group.category)
            const latest = group.incidents[0]
            
            const title = group.incidents.length === 1 
              ? latest.title 
              : `${group.incidents.length} ${label}${group.incidents.length > 1 ? 's' : ''} in ${group.municipality}`
            
            return (
              <button
                key={group.key}
                onClick={() => onSelectIncident(latest)}
                className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors group"
              >
                <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", color)} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                    {title}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Source: {latest.raw_data?.source || 'Lake McHenry Scanner'} • {formatTimeAgo(latest.occurred_at || latest.created_at)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ============================================
// DATA HEALTH (Petition Focused)
// ============================================
function DataHealth() {
  const sources = [
    { name: 'Lake McHenry Scanner', status: 'live' },
    { name: 'County Government', status: 'live' },
  ]
  
  const unavailable = [
    { name: 'CAD/Dispatch', description: 'Real-time 911 data' },
  ]
  
  const petitionCount = 247

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      {/* Live sources - compact */}
      <div className="px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-4">
          {sources.map((source) => (
            <div key={source.name} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs text-foreground">{source.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Petition CTA - Primary Focus */}
      <div className="p-4 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/10 flex-shrink-0">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-mono text-sm font-medium text-foreground">
              Unlock live CAD data
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              {petitionCount} McHenry County residents are requesting real-time 911 dispatch access.
            </p>
            <button className="mt-3 w-full py-2.5 px-4 bg-accent hover:bg-accent/90 text-accent-foreground font-mono text-sm rounded-lg transition-colors">
              Add your name →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAP PREVIEW
// ============================================
function MapPreview({ incidents, onNavigateToMap }: { incidents: Incident[]; onNavigateToMap: () => void }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)

  const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    'crystal lake': { lat: 42.2411, lng: -88.3162 },
    'mchenry': { lat: 42.3334, lng: -88.2667 },
    'woodstock': { lat: 42.3147, lng: -88.4487 },
    'cary': { lat: 42.2120, lng: -88.2378 },
    'algonquin': { lat: 42.1656, lng: -88.2945 },
    'lake in the hills': { lat: 42.1817, lng: -88.3306 },
    'huntley': { lat: 42.1681, lng: -88.4281 },
    'grayslake': { lat: 42.3447, lng: -88.0417 },
  }

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

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || incidents.length === 0) return

    const L = require('leaflet')
    const map = mapInstanceRef.current

    map.eachLayer((layer: any) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    incidents.forEach((incident) => {
      const cityKey = incident.municipality?.toLowerCase()
      const coords = cityKey && CITY_COORDS[cityKey]
      
      if (coords) {
        const lat = coords.lat + (Math.random() - 0.5) * 0.02
        const lng = coords.lng + (Math.random() - 0.5) * 0.02
        
        L.circleMarker([lat, lng], {
          radius: 4,
          fillColor: '#f97316',
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map)
      }
    })
  }, [mapReady, incidents])

  return (
    <button 
      onClick={onNavigateToMap}
      className="w-full h-full bg-card border border-border/50 rounded-xl overflow-hidden hover:border-accent/50 transition-colors text-left"
    >
      <div className="relative h-full min-h-[140px]">
        <div ref={mapRef} className="absolute inset-0 z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-3 z-20 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {incidents.length} incidents this week
          </span>
          <span className="font-mono text-xs text-accent flex items-center gap-1">
            Open Map <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </button>
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
  
  const selectedLocation = ORBIT_LOCATIONS.find(l => l.id === selectedLocationId) || CURRENT_LOCATION

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/incidents?days=7&limit=100')
      if (res.ok) {
        const data = await res.json()
        setIncidents(data.items || [])
      }
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  const handleRefresh = useCallback(async () => {
    setLastRefresh(new Date())
    await fetchIncidents()
  }, [fetchIncidents])

  const { containerRef, isRefreshing, pullProgress } = usePullToRefresh(handleRefresh)

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto h-full scrollbar-hide" 
      data-lenis-prevent
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
        {/* 1. Stability Hero with Gauge */}
        <StabilityHero key={`hero-${lastRefresh.getTime()}`} location={selectedLocation} />
        
        <div className="space-y-4 md:space-y-6">
          {/* Status Bar (Condensed Neighborhood Health) */}
          <StatusBar key={`status-${lastRefresh.getTime()}`} incidents={incidents} />

          {/* 2. Category Trends */}
          <CategoryTrends 
            key={`trends-${lastRefresh.getTime()}`} 
            incidents={incidents}
            onSelectIncident={setSelectedIncident}
          />

          {/* 3. Need to Know (Grouped) */}
          <NeedToKnow 
            key={`needtoknow-${lastRefresh.getTime()}`} 
            incidents={incidents} 
            onViewFeed={() => {}}
            onSelectIncident={setSelectedIncident}
          />

          {/* 4. Map + Data Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <MapPreview 
                key={`map-${lastRefresh.getTime()}`} 
                incidents={incidents} 
                onNavigateToMap={onNavigateToMap} 
              />
            </div>
            <DataHealth />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 pt-4 border-t border-border/40">
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

      {/* Incident Detail Modal */}
      <IncidentModal 
        incident={selectedIncident} 
        onClose={() => setSelectedIncident(null)} 
      />
    </div>
  )
}