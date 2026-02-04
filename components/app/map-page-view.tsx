// components/app/map-page-view.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Search, 
  Shield,
  Construction,
  Clock,
  X,
  MapPin,
  ChevronRight,
  ChevronUp,
  Flame,
  AlertCircle,
  Loader2,
  ExternalLink,
  Share2
} from "lucide-react"

// City centroid coordinates for McHenry County
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
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
  'lakewood': { lat: 42.2295, lng: -88.3556 },
  'spring grove': { lat: 42.4439, lng: -88.2362 },
  'wonder lake': { lat: 42.3842, lng: -88.3487 },
  'ringwood': { lat: 42.3967, lng: -88.3098 },
  'union': { lat: 42.2331, lng: -88.5445 },
  'hebron': { lat: 42.4717, lng: -88.4323 },
  'richmond': { lat: 42.4759, lng: -88.3059 },
  'bull valley': { lat: 42.3209, lng: -88.3534 },
  'round lake': { lat: 42.3534, lng: -88.0931 },
  'grayslake': { lat: 42.3445, lng: -88.0417 },
}

// Add small random offset so pins don't stack exactly
function getCoordinatesForCity(cityName: string | null): { lat: number; lng: number } | null {
  if (!cityName) return null
  const coords = CITY_COORDINATES[cityName.toLowerCase()]
  if (!coords) return null
  return {
    lat: coords.lat + (Math.random() - 0.5) * 0.01,
    lng: coords.lng + (Math.random() - 0.5) * 0.01,
  }
}

interface RealIncident {
  id: string
  category: string
  severity: string
  title: string
  description: string | null
  location_text: string | null
  latitude: number | null
  longitude: number | null
  municipality: string | null
  occurred_at: string | null
  created_at: string
  raw_data: {
    url?: string
    source?: string
    incident_type?: string
  } | null
}

interface MappedIncident {
  id: string
  type: 'crime' | 'civic' | 'infrastructure' | 'safety'
  category: string
  title: string
  summary: string
  location: string
  municipality: string
  timestamp: string
  coordinates: { lat: number; lng: number }
  sourceUrl?: string
  verified: boolean
  urgency: number
}

const typeConfig = {
  crime: {
    color: "#be123c",
    bgColor: "bg-rose-500/10",
    textColor: "text-rose-600",
    icon: Shield,
    label: "Public Safety",
  },
  safety: {
    color: "#d97706",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    icon: Flame,
    label: "Safety",
  },
  infrastructure: {
    color: "#0284c7",
    bgColor: "bg-sky-500/10",
    textColor: "text-sky-600",
    icon: Construction,
    label: "Infrastructure",
  },
  civic: {
    color: "#64748b",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-600",
    icon: AlertCircle,
    label: "Civic",
  },
}

const filterOptions = [
  { id: "crime", label: "Safety", icon: Shield },
  { id: "infrastructure", label: "Infrastructure", icon: Construction },
  { id: "civic", label: "Civic", icon: AlertCircle },
]

function mapCategory(category: string): 'crime' | 'safety' | 'infrastructure' | 'civic' {
  switch (category) {
    // Safety/Crime
    case 'violent_crime':
    case 'property_crime':
    case 'police':
    case 'court':
      return 'crime'
    // Emergency/Safety
    case 'fire':
    case 'medical':
    case 'missing':
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

function getSeverityUrgency(severity: string): number {
  switch (severity) {
    case 'critical': return 9
    case 'high': return 7
    case 'medium': return 5
    default: return 3
  }
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHrs < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `${diffMins}m ago`
  }
  if (diffHrs < 24) {
    return `${diffHrs}h ago`
  }
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}

export function MapPageView({ isVisible = true }: { isVisible?: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>(["crime", "safety", "infrastructure", "civic"])
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [incidents, setIncidents] = useState<MappedIncident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<MappedIncident | null>(null)
  const [popupIncident, setPopupIncident] = useState<MappedIncident | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real incidents
  useEffect(() => {
    async function fetchIncidents() {
      try {
        const res = await fetch('/api/incidents?days=14&limit=100')
        if (!res.ok) throw new Error('Failed to fetch')
        
        const data = await res.json()
        
        const mapped: MappedIncident[] = data.items
          .map((item: RealIncident) => {
            // Use actual coordinates if available, otherwise use city centroid
            let coords = item.latitude && item.longitude 
              ? { lat: item.latitude, lng: item.longitude }
              : getCoordinatesForCity(item.municipality)
            
            if (!coords) return null
            
            return {
              id: item.id,
              type: mapCategory(item.category),
              category: item.category,
              title: item.title,
              summary: item.description || '',
              location: item.location_text || item.municipality || 'Unknown',
              municipality: item.municipality || 'McHenry County',
              timestamp: item.occurred_at || item.created_at,
              coordinates: coords,
              sourceUrl: item.raw_data?.url,
              verified: false,
              urgency: getSeverityUrgency(item.severity),
            }
          })
          .filter(Boolean) as MappedIncident[]
        
        setIncidents(mapped)
      } catch (err) {
        console.error('Failed to fetch incidents:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchIncidents()
  }, [])

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    )
  }

  const filteredIncidents = incidents.filter(i => activeFilters.includes(i.type))

  // Load Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadMap = async () => {
      // @ts-ignore
      const L = await import("leaflet")
      
      // Load CSS if not already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
        // Wait for CSS to load
        await new Promise(resolve => {
          link.onload = resolve
          setTimeout(resolve, 500) // Fallback timeout
        })
      }

      if (!mapRef.current || mapInstanceRef.current) return
      
      // Wait for container to have dimensions
      const container = mapRef.current
      if (container.clientWidth === 0 || container.clientHeight === 0) {
        // Retry after a delay
        setTimeout(() => loadMap(), 200)
        return
      }

      const map = L.map(container, {
        zoomControl: false,
      }).setView([42.2411, -88.3162], 11)

      const tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map)
      
      // Force redraw when tiles load
      tileLayer.on('load', () => {
        map.invalidateSize()
      })

      L.control.zoom({ position: "bottomright" }).addTo(map)

      // Close popup when map moves
      map.on('movestart', () => {
        setPopupIncident(null)
      })

      mapInstanceRef.current = map
      setMapLoaded(true)
      
      // Force invalidate after a short delay
      setTimeout(() => map.invalidateSize(), 100)
    }

    loadMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Invalidate map size when container becomes visible or resizes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !mapRef.current) return
    
    const map = mapInstanceRef.current
    const container = mapRef.current
    
    // Invalidate size immediately and after a short delay (for tab switches)
    const invalidate = () => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        map.invalidateSize()
      }
    }
    
    invalidate()
    const timer1 = setTimeout(invalidate, 100)
    const timer2 = setTimeout(invalidate, 300)
    const timer3 = setTimeout(invalidate, 500)
    
    // Also watch for resize
    const resizeObserver = new ResizeObserver(() => {
      invalidate()
    })
    resizeObserver.observe(container)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      resizeObserver.disconnect()
    }
  }, [mapLoaded])

  // Invalidate map size when visibility changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !isVisible) return
    
    const map = mapInstanceRef.current
    // Delay to let DOM update
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 50)
    
    return () => clearTimeout(timer)
  }, [mapLoaded, isVisible])

  // Add markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    const loadMarkers = async () => {
      // @ts-ignore
      const L = await import("leaflet")
      const map = mapInstanceRef.current

      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Add custom tooltip styles if not already added
      if (!document.getElementById('map-tooltip-styles')) {
        const style = document.createElement('style')
        style.id = 'map-tooltip-styles'
        style.textContent = `
          .incident-tooltip {
            background: white !important;
            border: 1px solid #e5e5e5 !important;
            border-radius: 8px !important;
            padding: 0 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
            width: 260px !important;
            white-space: normal !important;
          }
          .incident-tooltip .leaflet-tooltip-content {
            margin: 0 !important;
          }
          .leaflet-tooltip-left.incident-tooltip::before,
          .leaflet-tooltip-right.incident-tooltip::before,
          .leaflet-tooltip-top.incident-tooltip::before,
          .leaflet-tooltip-bottom.incident-tooltip::before {
            border: none !important;
          }
        `
        document.head.appendChild(style)
      }

      filteredIncidents.forEach((incident) => {
        const config = typeConfig[incident.type]
        const isSelected = selectedIncident?.id === incident.id
        const timeAgo = formatTimeAgo(incident.timestamp)

        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: ${isSelected ? "28px" : "20px"};
              height: ${isSelected ? "28px" : "20px"};
              background: ${config.color};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              transition: all 0.2s ease;
              cursor: pointer;
              ${isSelected ? "transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.25);" : ""}
            ">
            </div>
          `,
          iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
          iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10],
        })

        // Tooltip HTML content
        const tooltipContent = `
          <div style="padding: 12px; background: white; border-radius: 8px;">
            <div style="
              display: inline-block;
              padding: 4px 8px;
              background: ${config.color}20;
              color: ${config.color};
              font-family: ui-monospace, monospace;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 8px;
              border-radius: 4px;
              font-weight: 500;
            ">
              ${config.label}
            </div>
            <div style="
              font-weight: 600;
              font-size: 13px;
              line-height: 1.4;
              color: #1a1a1a;
              margin-bottom: 8px;
              word-wrap: break-word;
              overflow-wrap: break-word;
            ">
              ${incident.title.length > 55 ? incident.title.slice(0, 55) + '...' : incident.title}
            </div>
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              font-family: ui-monospace, monospace;
              font-size: 10px;
              color: #737373;
            ">
              <span>${incident.municipality}</span>
              <span style="opacity: 0.5;">•</span>
              <span>${timeAgo}</span>
            </div>
          </div>
        `

        const marker = L.marker([incident.coordinates.lat, incident.coordinates.lng], { icon })
          .addTo(map)
          .bindTooltip(tooltipContent, {
            className: 'incident-tooltip',
            direction: 'top',
            offset: [0, -12],
            opacity: 1,
          })
          .on("click", (e: any) => {
            // Stop propagation to prevent map from moving
            L.DomEvent.stopPropagation(e)
            
            // Get screen position of marker
            const point = map.latLngToContainerPoint(e.latlng)
            setPopupPosition({ x: point.x, y: point.y })
            setPopupIncident(incident)
            setSelectedIncident(incident)
            
            if (window.innerWidth < 1024) {
              setMobileSheetOpen(true)
              setPopupIncident(null) // Don't show popup on mobile
            }
          })

        markersRef.current.push(marker)
      })
    }

    loadMarkers()
  }, [mapLoaded, filteredIncidents, selectedIncident])

  // Pan to selected - only when selected from sidebar, not from marker click
  // Disabled to prevent jolting when clicking markers
  // useEffect(() => {
  //   if (!mapLoaded || !mapInstanceRef.current || !selectedIncident) return
  //   
  //   mapInstanceRef.current.panTo([
  //     selectedIncident.coordinates.lat,
  //     selectedIncident.coordinates.lng
  //   ], { animate: true })
  // }, [mapLoaded, selectedIncident])

  return (
    <div className="h-full flex flex-col lg:flex-row relative">
      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
          {/* Search */}
          <div className="relative flex-shrink-0 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search location..."
              defaultValue="McHenry County, IL"
              className="w-full md:w-64 bg-background/95 backdrop-blur-sm border border-border shadow-sm py-2.5 pl-10 pr-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 -mb-2 md:mb-0">
            {filterOptions.map((filter) => {
              const isActive = activeFilters.includes(filter.id)
              const Icon = filter.icon
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wider border transition-all whitespace-nowrap flex-shrink-0",
                    isActive
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background/95 backdrop-blur-sm text-muted-foreground border-border hover:border-foreground/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Map */}
        <div ref={mapRef} className="absolute inset-0" />

        {/* Loading */}
        {(!mapLoaded || loading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Legend */}
        <div className="hidden lg:block absolute bottom-4 left-4 z-[1000] bg-background/95 backdrop-blur-sm border border-border p-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Legend</p>
          <div className="space-y-1.5">
            {Object.entries(typeConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: config.color }}
                />
                <span className="font-mono text-xs text-foreground/70">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Floating button */}
        <button
          onClick={() => setMobileSheetOpen(true)}
          className="lg:hidden absolute bottom-4 left-4 right-4 z-[1000] bg-background border border-border shadow-lg p-4 flex items-center justify-between rounded-xl"
          style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-accent">Activity Feed</p>
            <p className="font-mono text-sm text-foreground">{filteredIncidents.length} incidents</p>
          </div>
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Popup Card - appears on pin click */}
        {popupIncident && popupPosition && (
          <MapPopupCard
            incident={popupIncident}
            position={popupPosition}
            onClose={() => setPopupIncident(null)}
            onViewSource={() => {
              if (popupIncident.sourceUrl) {
                window.open(popupIncident.sourceUrl, '_blank')
              }
            }}
          />
        )}
      </div>

      {/* Desktop: Incident Panel */}
      <div className="hidden lg:flex w-[380px] border-l border-border bg-background flex-col h-full">
        <div className="flex-shrink-0 px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Activity Feed</span>
          </div>
          <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-tight text-foreground">
            McHenry County
          </h2>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            {filteredIncidents.length} incidents in view
          </p>
        </div>

        <div 
          className="flex-1 overflow-y-auto scrollbar-hide"
          data-lenis-prevent
        >
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredIncidents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 font-mono text-sm">
                No incidents match filters
              </p>
            ) : (
              filteredIncidents.map((incident) => (
                <IncidentCard 
                  key={incident.id}
                  incident={incident}
                  isSelected={selectedIncident?.id === incident.id}
                  onSelect={() => setSelectedIncident(incident)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Bottom Sheet */}
      <div 
        className={cn(
          "lg:hidden fixed inset-0 z-[1001] transition-opacity duration-300",
          mobileSheetOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileSheetOpen(false)}
        />
        
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl max-h-[70vh] flex flex-col transition-transform duration-300 ease-out",
            mobileSheetOpen ? "translate-y-0" : "translate-y-full"
          )}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>
          
          <div className="flex-shrink-0 px-4 pb-3 border-b border-border flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Activity Feed</p>
              <p className="font-mono text-sm text-foreground">{filteredIncidents.length} incidents</p>
            </div>
            <button 
              onClick={() => setMobileSheetOpen(false)}
              className="p-2 text-muted-foreground hover:text-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredIncidents.map((incident) => (
              <IncidentCard 
                key={incident.id}
                incident={incident}
                isSelected={selectedIncident?.id === incident.id}
                onSelect={() => setSelectedIncident(incident)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function IncidentCard({
  incident,
  isSelected,
  onSelect,
}: {
  incident: MappedIncident
  isSelected: boolean
  onSelect: () => void
}) {
  const config = typeConfig[incident.type]
  const Icon = config.icon
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLButtonElement>(null)

  // Scroll into view when selected
  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isSelected])

  return (
    <button
      ref={cardRef}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-full text-left border p-4 transition-all relative overflow-hidden",
        isSelected 
          ? "border-accent/50 bg-accent/5" 
          : "border-border hover:border-accent/30"
      )}
    >
      <div 
        className={cn(
          "absolute inset-0 bg-accent/5 transition-opacity",
          isHovered && !isSelected ? "opacity-100" : "opacity-0"
        )}
      />

      <div className={cn(
        "absolute top-0 right-0 w-8 h-8 transition-opacity",
        isHovered || isSelected ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute top-0 right-0 w-full h-[2px] bg-accent" />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-accent" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase tracking-wider",
            config.bgColor,
            config.textColor
          )}>
            <Icon className="w-3 h-3" />
            {config.label}
          </div>
          {incident.urgency >= 7 && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-rose-600 bg-rose-500/10 px-2 py-1">
              Priority
            </span>
          )}
        </div>

        <h3 className="font-semibold text-foreground leading-snug">
          {incident.title}
        </h3>

        {incident.summary && (
          <p className="font-mono text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {incident.summary.replace(/\[\.\.\.\]$/, '...').replace(/\[…\]$/, '...')}
          </p>
        )}

        <div className="flex items-center gap-2 mt-3 font-mono text-[10px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{incident.municipality}</span>
          <span className="text-border">•</span>
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(incident.timestamp)}</span>
        </div>
      </div>

      <ChevronRight className={cn(
        "absolute bottom-4 right-4 w-4 h-4 transition-all",
        isHovered || isSelected ? "text-accent translate-x-0 opacity-100" : "text-transparent -translate-x-2 opacity-0"
      )} />
    </button>
  )
}

// Popup card that appears when clicking a map pin
function MapPopupCard({
  incident,
  position,
  onClose,
  onViewSource,
}: {
  incident: MappedIncident
  position: { x: number; y: number }
  onClose: () => void
  onViewSource: () => void
}) {
  const config = typeConfig[incident.type]
  const Icon = config.icon
  const cardRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    // Delay adding listener to avoid immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Calculate position - try to keep card in view
  const cardWidth = 320
  const cardHeight = 280
  let left = position.x - cardWidth / 2
  let top = position.y - cardHeight - 20 // Above the pin
  
  // Adjust if too far left/right
  if (left < 16) left = 16
  if (left + cardWidth > window.innerWidth - 400) { // Account for sidebar
    left = window.innerWidth - 400 - cardWidth - 16
  }
  
  // If would go above viewport, show below pin instead
  if (top < 80) {
    top = position.y + 30
  }

  return (
    <div
      ref={cardRef}
      className="absolute z-[1001] w-80 bg-background border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{ left, top }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start justify-between gap-3">
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase tracking-wider rounded",
            config.bgColor,
            config.textColor
          )}>
            <Icon className="w-3 h-3" />
            {config.label}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <h3 className="font-semibold text-foreground leading-snug mt-3">
          {incident.title}
        </h3>
        
        <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{incident.municipality}</span>
          <span className="text-border">•</span>
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(incident.timestamp)}</span>
        </div>
      </div>
      
      {/* Body */}
      {incident.summary && (
        <div className="p-4 border-b border-border/50">
          <p className="font-mono text-xs text-muted-foreground leading-relaxed">
            {incident.summary.replace(/\[\.\.\.\]$/, '...').replace(/\[…\]$/, '...')}
          </p>
        </div>
      )}
      
      {/* Actions */}
      <div className="p-3 flex items-center gap-2">
        {incident.sourceUrl && (
          <button
            onClick={onViewSource}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent/10 text-accent font-mono text-xs rounded-lg hover:bg-accent/20 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Source
          </button>
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(incident.sourceUrl || window.location.href)
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 border border-border text-muted-foreground font-mono text-xs rounded-lg hover:text-foreground hover:border-accent/50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
      </div>
    </div>
  )
}