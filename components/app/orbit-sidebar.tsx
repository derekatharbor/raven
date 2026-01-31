// components/app/orbit-sidebar.tsx
"use client"

import { useState } from "react"
import { 
  ORBIT_LOCATIONS, 
  type LocationData,
  getScoreColor 
} from "@/lib/raven-data"
import { 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  MapPin,
  Home,
  Briefcase,
  Heart,
  ChevronRight,
  Settings
} from "lucide-react"

const labelIcons = {
  Home: Home,
  Work: Briefcase,
  "Mom's Place": Heart,
  default: MapPin
}

function LocationCard({ 
  location, 
  isSelected, 
  onClick 
}: { 
  location: LocationData
  isSelected: boolean
  onClick: () => void 
}) {
  const Icon = labelIcons[location.label as keyof typeof labelIcons] || labelIcons.default
  
  const trendIcon = location.trend === "improving" 
    ? <TrendingUp className="w-3 h-3" />
    : location.trend === "declining"
    ? <TrendingDown className="w-3 h-3" />
    : <Minus className="w-3 h-3" />
    
  const trendColor = location.trend === "improving" 
    ? "text-emerald-400"
    : location.trend === "declining"
    ? "text-rose-400"
    : "text-slate-400"

  // Background gradient based on score
  const scoreColor = getScoreColor(location.stabilityScore)
  const bgGradient = {
    emerald: "from-emerald-900/90 to-emerald-950/90",
    sky: "from-slate-800/90 to-slate-900/90",
    amber: "from-amber-900/90 to-amber-950/90",
    rose: "from-rose-900/90 to-rose-950/90"
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl overflow-hidden transition-all duration-200
        ${isSelected 
          ? "ring-2 ring-white/30 scale-[1.02]" 
          : "hover:scale-[1.01] hover:ring-1 hover:ring-white/20"
        }
      `}
    >
      {/* Card with dark overlay - simulating city image background */}
      <div className={`relative bg-gradient-to-br ${bgGradient[scoreColor]} p-4`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id={`grid-${location.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill={`url(#grid-${location.id})`}/>
          </svg>
        </div>
        
        <div className="relative">
          {/* Top row: Name and Score */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{location.name}</h3>
              <div className="flex items-center gap-1.5 text-white/60 text-xs mt-0.5">
                <Icon className="w-3 h-3" />
                <span>{location.label}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-light text-white">{location.stabilityScore}</span>
            </div>
          </div>
          
          {/* Bottom row: Status and Trend */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-white/70">{location.briefStatus}</p>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              {trendIcon}
              <span className="text-xs">
                {location.trend === "stable" 
                  ? "Stable" 
                  : `${location.trendPercent > 0 ? "+" : ""}${location.trendPercent}%`
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

export function OrbitSidebar({ 
  selectedLocationId,
  onLocationSelect 
}: { 
  selectedLocationId: string
  onLocationSelect: (id: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredLocations = ORBIT_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.label?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-80 bg-slate-950 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search locations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
      </div>
      
      {/* Location List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide" data-lenis-prevent>
        {filteredLocations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            isSelected={location.id === selectedLocationId}
            onClick={() => onLocationSelect(location.id)}
          />
        ))}
        
        {/* Add Location Button */}
        <button className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Location</span>
        </button>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-900 transition-colors text-slate-400 hover:text-white">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Manage Locations</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
