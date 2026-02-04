// components/app/briefing-view.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  FileText
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

interface GroupedIncident {
  key: string
  title: string
  count: number
  category: string
  source: string
  incidents: Incident[]
  timestamp: string
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
    
    // Reset to safety if >48 hours since last visit
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
// SECTION 1: STABILITY INDEX + NARRATIVE
// ============================================
function StabilityHero({ location }: { location: LocationData }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      <p className="font-mono text-sm text-muted-foreground mb-2">{getGreeting()}</p>
      
      <div className="flex items-start gap-4">
        {/* Score */}
        <div className="flex-shrink-0">
          {loading ? (
            <div className="w-20 h-20 rounded-xl bg-muted/50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent/20 to-orange-500/10 border border-accent/30 flex items-center justify-center">
                <span className="text-4xl font-light tracking-tight bg-gradient-to-br from-accent via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {score}
                </span>
              </div>
              {trend !== 'stable' && (
                <div className={cn(
                  "absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-0.5",
                  trend === 'improving' ? "bg-emerald-500/20 text-emerald-600" : "bg-rose-500/20 text-rose-600"
                )}>
                  {trend === 'improving' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trendPercent}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location + Narrative */}
        <div className="flex-1 min-w-0">
          <h1 className="font-bebas text-3xl md:text-4xl text-foreground tracking-wide">
            {location.name}
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-1 leading-relaxed">
            {narrative}
          </p>
        </div>
      </div>
    </header>
  )
}

// ============================================
// SECTION 1B: EMERGING PATTERN (Exclusive Alert)
// Thresholds:
// - Safety: 3+ similar in 72hrs in same area
// - Civic/Infra: >25% week-over-week change
// - Stability drop: >10 points in 24hrs
// ============================================
function EmergingPatternCard({ incidents }: { incidents: Incident[] }) {
  const [pattern, setPattern] = useState<EmergingPattern | null>(null)

  useEffect(() => {
    const now = new Date()
    const last72h = incidents.filter(i => {
      const t = new Date(i.occurred_at || i.created_at)
      return (now.getTime() - t.getTime()) < 72 * 3600000
    })

    // Safety cluster detection: 3+ similar in same municipality
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

    // Check for clusters
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
            description: `Cluster detected over 72 hours. Most recent: "${typeIncidents[0].title.slice(0, 60)}..."`,
            severity: type === 'violent_crime' ? 'high' : 'medium',
            incidents: typeIncidents
          })
          return
        }
      }
    }

    setPattern(null)
  }, [incidents])

  // No pattern = Neighborhood Health card
  if (!pattern) {
    return (
      <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600">
              Neighborhood Health
            </span>
            <h3 className="font-bebas text-xl text-foreground mt-1 tracking-wide">
              No emerging patterns detected
            </h3>
            <p className="font-mono text-sm text-muted-foreground mt-1">
              Activity levels are normal. We'll alert you if anything changes.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "border rounded-xl p-4 md:p-5",
      pattern.severity === 'high' 
        ? "bg-gradient-to-br from-rose-500/10 to-transparent border-rose-500/30"
        : "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg flex-shrink-0",
          pattern.severity === 'high' ? "bg-rose-500/20" : "bg-amber-500/20"
        )}>
          <AlertTriangle className={cn(
            "w-5 h-5",
            pattern.severity === 'high' ? "text-rose-600" : "text-amber-600"
          )} />
        </div>
        <div className="flex-1">
          <span className={cn(
            "font-mono text-[10px] uppercase tracking-widest",
            pattern.severity === 'high' ? "text-rose-600" : "text-amber-600"
          )}>
            Emerging Pattern
          </span>
          <h3 className="font-bebas text-xl text-foreground mt-1 tracking-wide">
            {pattern.title}
          </h3>
          <p className="font-mono text-sm text-muted-foreground mt-1">
            {pattern.description}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION 2: CATEGORY TRENDS (Toggle + Persistence)
// ============================================
function CategoryTrends({ incidents }: { incidents: Incident[] }) {
  const { category, setCategory, mounted } = useCategoryToggle()

  // Calculate hourly distribution for safety
  const hourCounts = new Array(24).fill(0)
  incidents
    .filter(i => ['violent_crime', 'property_crime', 'police', 'traffic', 'fire'].includes(i.category))
    .forEach(i => {
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

  // Civic items
  const civicItems = incidents
    .filter(i => ['civic', 'government', 'services'].includes(i.category))
    .slice(0, 4)

  // Infrastructure items
  const infraItems = incidents
    .filter(i => ['traffic', 'infrastructure', 'development'].includes(i.category))
    .slice(0, 4)

  if (!mounted) return null

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      {/* Category Toggle */}
      <div className="flex border-b border-border/50">
        {(['safety', 'civic', 'infrastructure'] as const).map((cat) => {
          const icons = { safety: Shield, civic: Landmark, infrastructure: Construction }
          const Icon = icons[cat]
          const isActive = category === cat
          
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-2 font-mono text-xs uppercase tracking-wider transition-colors",
                isActive 
                  ? "bg-accent/10 text-accent border-b-2 border-accent -mb-[1px]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{cat}</span>
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
                Not enough data to show patterns yet.
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
            
            {civicItems.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">
                No upcoming civic events tracked.
              </p>
            ) : (
              <div className="space-y-3">
                {civicItems.map((item, i) => (
                  <div key={item.id} className={cn("flex items-start gap-3", i > 0 && "pt-3 border-t border-border/30")}>
                    <Calendar className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-foreground line-clamp-2">{item.title}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {item.municipality} • {formatTimeAgo(item.occurred_at || item.created_at)}
                      </p>
                    </div>
                  </div>
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
            
            {infraItems.length === 0 ? (
              <p className="font-mono text-sm text-muted-foreground">
                No infrastructure updates tracked.
              </p>
            ) : (
              <div className="space-y-3">
                {infraItems.map((item, i) => (
                  <div key={item.id} className={cn("flex items-start gap-3", i > 0 && "pt-3 border-t border-border/30")}>
                    <Construction className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-foreground line-clamp-2">{item.title}</p>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {item.municipality} • {formatTimeAgo(item.occurred_at || item.created_at)}
                      </p>
                    </div>
                  </div>
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
// SECTION 3: NEED TO KNOW (Grouped Incidents)
// Grouping: Similarity first, then Category
// Rule of 3: Nest related events
// ============================================
function NeedToKnow({ incidents, onViewFeed }: { incidents: Incident[]; onViewFeed: () => void }) {
  const [grouped, setGrouped] = useState<GroupedIncident[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    // Today's incidents only
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayIncidents = incidents.filter(i => {
      const d = new Date(i.occurred_at || i.created_at)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })

    // Group by category + municipality (similarity)
    const groups: Record<string, GroupedIncident> = {}

    todayIncidents.forEach(incident => {
      const key = `${incident.category}-${incident.municipality || 'county'}`
      
      if (!groups[key]) {
        groups[key] = {
          key,
          title: '',
          count: 0,
          category: incident.category,
          source: incident.raw_data?.source || 'Lake McHenry Scanner',
          incidents: [],
          timestamp: incident.occurred_at || incident.created_at
        }
      }
      
      groups[key].count++
      groups[key].incidents.push(incident)
      
      // Update timestamp to most recent
      if (new Date(incident.occurred_at || incident.created_at) > new Date(groups[key].timestamp)) {
        groups[key].timestamp = incident.occurred_at || incident.created_at
      }
    })

    // Generate titles
    Object.values(groups).forEach(g => {
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
      
      if (g.count === 1) {
        g.title = g.incidents[0].title
      } else {
        g.title = `${g.count} ${labels[g.category] || 'Incident'}${g.count > 1 ? 's' : ''} in ${g.incidents[0]?.municipality || 'McHenry County'}`
      }
    })

    const sorted = Object.values(groups)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    setGrouped(sorted)
  }, [incidents])

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
        {grouped.length === 0 ? (
          <div className="p-4 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              No significant activity today.
            </p>
          </div>
        ) : (
          grouped.map((group) => {
            const Icon = getCategoryIcon(group.category)
            const color = getCategoryColor(group.category)
            const isExpanded = expanded === group.key && group.count > 1
            
            return (
              <div key={group.key}>
                <button
                  onClick={() => group.count > 1 ? setExpanded(isExpanded ? null : group.key) : null}
                  className={cn(
                    "w-full px-4 py-3 flex items-start gap-3 text-left transition-colors",
                    group.count > 1 && "hover:bg-muted/30"
                  )}
                >
                  <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", color)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-foreground line-clamp-2">
                      {group.title}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Source: {group.source} • {formatTimeAgo(group.timestamp)}
                    </p>
                  </div>
                  {group.count > 1 && (
                    <ChevronRight className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 mt-0.5",
                      isExpanded && "rotate-90"
                    )} />
                  )}
                </button>
                
                {/* Expanded nested items (Rule of 3) */}
                {isExpanded && (
                  <div className="bg-muted/20 px-4 py-2 space-y-2">
                    {group.incidents.slice(0, 5).map((item) => (
                      <div key={item.id} className="pl-7 py-1">
                        <p className="font-mono text-xs text-foreground/80 line-clamp-1">
                          {item.title}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {formatTimeAgo(item.occurred_at || item.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ============================================
// SECTION 4: DATA HEALTH (County Capability)
// ============================================
function DataHealth() {
  const sources = [
    { name: 'Lake McHenry Scanner', status: 'live', type: 'Safety' },
    { name: 'County Government', status: 'live', type: 'Civic' },
    { name: 'CAD/Dispatch', status: 'unavailable', type: 'Real-time' },
  ]
  
  const petitionCount = 247 // Would be fetched from API

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
        Data Health
      </h4>
      
      <div className="space-y-2 mb-4">
        {sources.map((source) => (
          <div key={source.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                source.status === 'live' ? "bg-emerald-500" : "bg-slate-400"
              )} />
              <span className={cn(
                "font-mono text-xs",
                source.status === 'live' ? "text-foreground" : "text-muted-foreground"
              )}>
                {source.name}
              </span>
            </div>
            <span className={cn(
              "font-mono text-[10px]",
              source.status === 'live' ? "text-emerald-600" : "text-muted-foreground"
            )}>
              {source.status === 'live' ? 'Live' : 'Unavailable'}
            </span>
          </div>
        ))}
      </div>

      {/* Petition CTA */}
      <div className="pt-3 border-t border-border/30">
        <p className="font-mono text-xs text-muted-foreground mb-2">
          <Users className="w-3 h-3 inline mr-1" />
          {petitionCount} residents requesting live CAD access for McHenry County
        </p>
        <button className="w-full py-2 px-3 bg-accent/10 hover:bg-accent/20 text-accent font-mono text-xs rounded-lg transition-colors">
          Add your name →
        </button>
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
      <div className="relative h-full min-h-[160px]">
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
        {/* 1. High-Level Intelligence */}
        <StabilityHero key={`hero-${lastRefresh.getTime()}`} location={selectedLocation} />
        
        <div className="space-y-4 md:space-y-6">
          {/* Emerging Pattern OR Neighborhood Health */}
          <EmergingPatternCard key={`pattern-${lastRefresh.getTime()}`} incidents={incidents} />

          {/* 2. Category Trends */}
          <CategoryTrends key={`trends-${lastRefresh.getTime()}`} incidents={incidents} />

          {/* 3. Need to Know (Grouped) */}
          <NeedToKnow 
            key={`needtoknow-${lastRefresh.getTime()}`} 
            incidents={incidents} 
            onViewFeed={() => {}} 
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
    </div>
  )
}