// components/app/home-view.tsx
"use client"

import { cn } from "@/lib/utils"
import { 
  Home,
  Building2,
  Baby,
  ChevronRight,
  TrendingUp,
  Clock,
  MapPin,
  Plus
} from "lucide-react"

// Mock data for pinned locations
const pinnedLocations = [
  { 
    id: "home", 
    name: "Home", 
    icon: Home, 
    score: 92,
    status: "Stable",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&auto=format",
  },
  { 
    id: "work", 
    name: "Work", 
    icon: Building2, 
    score: 78,
    status: "Minor Disruption",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format",
  },
  { 
    id: "daycare", 
    name: "Daycare", 
    icon: Baby, 
    score: 95,
    status: "Normal",
    image: "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=400&h=300&fit=crop&auto=format",
  },
]

const briefingItems = [
  "Downtown protest permitted Saturday. Low escalation probability.",
  "Water main repair may impact pressure overnight near Oak St.",
  "Property crime drifting slightly upward within 1.2 miles of Work.",
  "No infrastructure instability detected.",
]

export function HomeView() {
  const stabilityScore = 87
  const stabilityLevel = "HIGH"

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-white scrollbar-hide">
      <div className="max-w-6xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Good morning</h1>
          <p className="text-sm text-gray-500 mt-1">Crystal Lake, IL — Thursday, January 30</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Left Column - Brief */}
          <div className="space-y-6">
            {/* Today's Brief */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Today's Brief</h2>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  8:00 AM
                </span>
              </div>
              <ul className="space-y-3">
                {briefingItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                    <span className="text-[15px] text-gray-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 7-Day Outlook */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">7-Day Outlook</h2>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                  Stable
                </span>
                <TrendingUp className="w-4 h-4 text-gray-300" />
                <span className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                  Stable
                </span>
                <TrendingUp className="w-4 h-4 text-gray-300" />
                <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium">
                  Watchful
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Minor traffic disruptions expected mid-week.
              </p>
            </div>
          </div>

          {/* Right Column - Hero Image with Glass Card */}
          <div className="relative rounded-xl overflow-hidden min-h-[400px]">
            {/* Background Image */}
            <img 
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop&auto=format"
              alt="Crystal Lake area"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            
            {/* Glass Morphism Card */}
            <div className="absolute bottom-6 left-6 right-6">
              <div 
                className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Stability
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-gray-900">{stabilityLevel}</span>
                      <span className="text-2xl font-semibold text-green-600">{stabilityScore}<span className="text-base text-gray-400">/100</span></span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      No emerging disruptions across your pinned locations.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Locations */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Your Locations</h2>
            <button className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pinnedLocations.map((location) => {
              const Icon = location.icon
              const isStable = location.score >= 80
              
              return (
                <button
                  key={location.id}
                  className="relative rounded-xl overflow-hidden h-48 group"
                >
                  {/* Background Image */}
                  <img 
                    src={location.image}
                    alt={location.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Glass Card Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="backdrop-blur-md bg-white/60 border border-white/40 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-700" />
                          <span className="font-medium text-gray-900">{location.name}</span>
                        </div>
                        <div className={cn(
                          "text-sm font-semibold",
                          isStable ? "text-green-700" : "text-amber-700"
                        )}>
                          {location.score}
                        </div>
                      </div>
                      <div className={cn(
                        "text-xs mt-1",
                        isStable ? "text-green-600" : "text-amber-600"
                      )}>
                        {location.status}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Quick Actions - Minimal */}
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            View Full Report
          </button>
          <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            Manage Alerts
          </button>
        </div>

      </div>
    </div>
  )
}