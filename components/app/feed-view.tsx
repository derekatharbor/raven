// components/app/feed-view.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Shield,
  Flame,
  Car,
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
  Check
} from "lucide-react"

// ============================================
// TYPES
// ============================================
interface FeedIncident {
  id: string
  type: 'crime' | 'civic' | 'infrastructure' | 'safety'
  category: string
  title: string
  summary: string
  location: string | null
  municipality: string
  timestamp: string
  source: string
  sourceUrl?: string
  // Engagement (mocked for now)
  likes: number
  comments: number
  isLiked: boolean
  isBookmarked: boolean
}

type TabType = 'all' | 'safety' | 'infrastructure' | 'civic'

// ============================================
// FEED CARD
// ============================================
function FeedCard({ 
  incident, 
  onLike, 
  onBookmark,
  onClick 
}: { 
  incident: FeedIncident
  onLike: () => void
  onBookmark: () => void
  onClick: () => void
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'crime': return Shield
      case 'safety': return Flame
      case 'infrastructure': return Car
      default: return AlertCircle
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'crime': return { color: 'text-rose-600', bg: 'bg-rose-500/10', label: 'Public Safety' }
      case 'safety': return { color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Safety' }
      case 'infrastructure': return { color: 'text-sky-600', bg: 'bg-sky-500/10', label: 'Infrastructure' }
      default: return { color: 'text-slate-600', bg: 'bg-slate-500/10', label: 'Civic' }
    }
  }

  const Icon = getIcon(incident.type)
  const styles = getTypeStyles(incident.type)
  const timeAgo = formatTimeAgo(incident.timestamp)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      try {
        await navigator.share({
          title: incident.title,
          text: incident.summary || incident.title,
          url: incident.sourceUrl || window.location.href
        })
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(incident.sourceUrl || window.location.href)
    }
  }

  return (
    <article 
      className="bg-background border border-border/60 p-5 hover:border-border transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Header: Category + Source */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded", styles.bg)}>
            <Icon className={cn("w-3.5 h-3.5", styles.color)} />
          </div>
          <span className={cn("font-mono text-[10px] uppercase tracking-wider font-medium", styles.color)}>
            {styles.label}
          </span>
          <span className="text-border">•</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatSourceName(incident.source)}
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {timeAgo}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground text-base leading-snug mb-2">
        {incident.title}
      </h3>

      {/* Summary */}
      {incident.summary && (
        <p className="text-foreground/70 text-sm leading-relaxed mb-3 line-clamp-3">
          {incident.summary.replace(/\[\.\.\.\]$/, '...').replace(/\[…\]$/, '...')}
        </p>
      )}

      {/* Location */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-xs text-muted-foreground">
          {incident.municipality}
        </span>
        {incident.location && incident.location.toLowerCase() !== incident.municipality.toLowerCase() && (
          <>
            <span className="text-border">•</span>
            <span className="font-mono text-xs text-muted-foreground">
              {incident.location}
            </span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-3 border-t border-border/40">
        <button
          onClick={(e) => { e.stopPropagation(); onLike(); }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors",
            incident.isLiked 
              ? "text-rose-500 bg-rose-500/10" 
              : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5"
          )}
        >
          <Heart className={cn("w-4 h-4", incident.isLiked && "fill-current")} />
          {incident.likes > 0 && (
            <span className="font-mono text-xs">{incident.likes}</span>
          )}
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {incident.comments > 0 && (
            <span className="font-mono text-xs">{incident.comments}</span>
          )}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors",
            incident.isBookmarked 
              ? "text-accent bg-accent/10" 
              : "text-muted-foreground hover:text-accent hover:bg-accent/5"
          )}
        >
          <Bookmark className={cn("w-4 h-4", incident.isBookmarked && "fill-current")} />
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-auto"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  )
}

// ============================================
// SIDEBAR WIDGET
// ============================================
function SidebarWidget({ 
  title, 
  children 
}: { 
  title: string
  children: React.ReactNode 
}) {
  return (
    <div className="border border-border/60 bg-background p-4">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}

// ============================================
// THIS WEEK HIGHLIGHTS
// ============================================
function ThisWeekHighlights({ incidents }: { incidents: FeedIncident[] }) {
  // Get top 3 by engagement
  const highlights = [...incidents]
    .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
    .slice(0, 3)

  if (highlights.length === 0) return null

  return (
    <SidebarWidget title="This Week">
      <div className="space-y-4">
        {highlights.map((incident, i) => (
          <div key={incident.id} className={cn(i > 0 && "pt-4 border-t border-border/40")}>
            <h4 className="font-medium text-sm text-foreground leading-snug mb-1 line-clamp-2">
              {incident.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{incident.municipality}</span>
              <span className="text-border">•</span>
              <span>{incident.likes + incident.comments} interactions</span>
            </div>
          </div>
        ))}
      </div>
    </SidebarWidget>
  )
}

// ============================================
// CATEGORY BREAKDOWN
// ============================================
function CategoryBreakdown({ incidents }: { incidents: FeedIncident[] }) {
  const counts = {
    safety: incidents.filter(i => i.type === 'crime' || i.type === 'safety').length,
    infrastructure: incidents.filter(i => i.type === 'infrastructure').length,
    civic: incidents.filter(i => i.type === 'civic').length,
  }

  const total = incidents.length

  return (
    <SidebarWidget title="This Week's Activity">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-foreground">Safety</span>
          </div>
          <span className="font-mono text-sm text-muted-foreground">{counts.safety}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-sky-500" />
            <span className="text-sm text-foreground">Infrastructure</span>
          </div>
          <span className="font-mono text-sm text-muted-foreground">{counts.infrastructure}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-foreground">Civic</span>
          </div>
          <span className="font-mono text-sm text-muted-foreground">{counts.civic}</span>
        </div>
        <div className="pt-3 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total</span>
            <span className="font-mono text-sm font-medium text-foreground">{total}</span>
          </div>
        </div>
      </div>
    </SidebarWidget>
  )
}

// ============================================
// INCIDENT DETAIL MODAL
// ============================================
function FeedIncidentModal({
  incident,
  isOpen,
  onClose
}: {
  incident: FeedIncident | null
  isOpen: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Must check mounted first before any other logic
  if (!mounted) return null
  if (!incident) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'crime': return Shield
      case 'safety': return Flame
      case 'infrastructure': return Car
      default: return AlertCircle
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'crime': return { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Public Safety' }
      case 'safety': return { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Safety' }
      case 'infrastructure': return { color: 'text-sky-500', bg: 'bg-sky-500/10', label: 'Infrastructure' }
      default: return { color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Civic' }
    }
  }

  const Icon = getIcon(incident.type)
  const styles = getTypeStyles(incident.type)

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
    await navigator.clipboard.writeText(incident.sourceUrl || window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return createPortal(
    <>
      <div 
        className={cn(
          "fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
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
          <div className="sm:hidden flex justify-center py-3">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>
          
          <div className="flex items-start justify-between px-5 pb-4 sm:pt-5">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={cn("p-2 rounded-lg flex-shrink-0", styles.bg)}>
                <Icon className={cn("w-5 h-5", styles.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {styles.label}
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
          
          <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
            
            {incident.summary && (
              <div className="mb-6">
                <p className="text-foreground/80 leading-relaxed">
                  {incident.summary.replace(/\[\.\.\.\]$/, '...').replace(/\[…\]$/, '...')}
                </p>
                {(incident.summary.includes('[...]') || incident.summary.endsWith('...')) && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    This is a preview. View source for the full article.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <span>Source:</span>
              <span className="font-medium text-foreground">{formatSourceName(incident.source)}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopyLink}
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
// HELPERS
// ============================================
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

function formatSourceName(source: string): string {
  return source
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

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

// ============================================
// MAIN FEED VIEW
// ============================================
export function FeedView() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [incidents, setIncidents] = useState<FeedIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<FeedIncident | null>(null)

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const res = await fetch('/api/incidents?days=7&limit=50')
        if (!res.ok) throw new Error('Failed to fetch')
        
        const data = await res.json()
        
        const transformed: FeedIncident[] = data.items.map((item: any) => ({
          id: item.id,
          type: mapCategory(item.category),
          category: item.category,
          title: item.title,
          summary: item.description || '',
          location: item.location_text,
          municipality: item.municipality || 'McHenry County',
          timestamp: item.occurred_at || item.created_at,
          source: item.raw_data?.source || 'lake_mchenry_scanner',
          sourceUrl: item.raw_data?.url,
          // Mock engagement for now
          likes: Math.floor(Math.random() * 20),
          comments: Math.floor(Math.random() * 8),
          isLiked: false,
          isBookmarked: false,
        }))
        
        setIncidents(transformed)
      } catch (err) {
        console.error('Failed to fetch feed:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchIncidents()
  }, [])

  const handleLike = (id: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id 
        ? { ...inc, isLiked: !inc.isLiked, likes: inc.isLiked ? inc.likes - 1 : inc.likes + 1 }
        : inc
    ))
  }

  const handleBookmark = (id: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id 
        ? { ...inc, isBookmarked: !inc.isBookmarked }
        : inc
    ))
  }

  // Filter by tab
  const filteredIncidents = incidents.filter(inc => {
    if (activeTab === 'all') return true
    if (activeTab === 'safety') return inc.type === 'crime' || inc.type === 'safety'
    if (activeTab === 'infrastructure') return inc.type === 'infrastructure'
    if (activeTab === 'civic') return inc.type === 'civic'
    return true
  })

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'safety', label: 'Safety' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'civic', label: 'Civic' },
  ]

  return (
    <div className="h-full flex">
      {/* Main Feed */}
      <div className="flex-1 flex flex-col min-w-0 lg:border-r lg:border-border/40">
        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-border/40 px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3 font-mono text-sm transition-colors relative whitespace-nowrap",
                  activeTab === tab.id 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Content */}
        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="font-mono text-sm text-muted-foreground">
                No incidents in this category
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filteredIncidents.map(incident => (
                <div key={incident.id} className="p-4">
                  <FeedCard
                    incident={incident}
                    onLike={() => handleLike(incident.id)}
                    onBookmark={() => handleBookmark(incident.id)}
                    onClick={() => setSelectedIncident(incident)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Desktop only */}
      <div className="hidden lg:block w-80 flex-shrink-0 overflow-y-auto p-4 space-y-4" data-lenis-prevent>
        <CategoryBreakdown incidents={incidents} />
        <ThisWeekHighlights incidents={incidents} />
        
        {/* Data Sources */}
        <SidebarWidget title="Data Sources">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-sm text-foreground">Lake McHenry Scanner</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-600">Live</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-sm text-muted-foreground">IDOT Traffic</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">Soon</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-sm text-muted-foreground">County Permits</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">Soon</span>
            </div>
          </div>
        </SidebarWidget>
      </div>

      {/* Modal */}
      <FeedIncidentModal
        incident={selectedIncident}
        isOpen={selectedIncident !== null}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  )
}