// components/app/home-view.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Shield,
  Home,
  Building2,
  Baby,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin
} from "lucide-react"

// Mock data for pinned locations
const pinnedLocations = [
  { 
    id: "home", 
    name: "Home", 
    icon: Home, 
    status: "stable", 
    statusText: "Stable",
    detail: null 
  },
  { 
    id: "work", 
    name: "Work", 
    icon: Building2, 
    status: "minor", 
    statusText: "Minor Traffic Disruption Tomorrow",
    detail: "Route 14 construction continues" 
  },
  { 
    id: "daycare", 
    name: "Little Billy's Daycare", 
    icon: Baby, 
    status: "stable", 
    statusText: "Normal",
    detail: null 
  },
]

const briefingItems = [
  "Downtown protest permitted Saturday. Low escalation probability.",
  "Water main repair may impact pressure overnight near Oak St.",
  "Property crime drifting slightly upward within 1.2 miles of Work.",
  "No infrastructure instability detected.",
]

const statusConfig = {
  stable: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: CheckCircle2,
  },
  minor: {
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: AlertTriangle,
  },
  elevated: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: AlertTriangle,
  },
}

export function HomeView() {
  return (
    <div className="flex-1 border-x border-gray-200 h-screen overflow-y-auto bg-gray-50 scrollbar-hide">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        
        {/* Environmental Status - The Anchor */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Environment
                </span>
                <span className="text-3xl font-bold text-gray-900">
                  STABLE
                </span>
                <span className="text-2xl font-semibold text-green-600">
                  82<span className="text-lg text-gray-400">/100</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                No emerging risks detected across your pinned locations.
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Location Status Pills */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            {pinnedLocations.map((location) => {
              const config = statusConfig[location.status as keyof typeof statusConfig]
              const Icon = location.icon
              const StatusIcon = config.icon

              return (
                <button
                  key={location.id}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-900">{location.name}</span>
                    <span className="text-gray-400">—</span>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                      config.bgColor,
                      config.color
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      {location.statusText}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Intelligence Brief */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Today's Brief</h2>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated 8:00 AM
            </span>
          </div>

          <ul className="space-y-3">
            {briefingItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                <span className="text-[15px] text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Forecast Strip */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <button className="w-full flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900">7-Day Outlook</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                  Stable
                </span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium">
                  Watchful
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Minor uptick in traffic disruptions expected mid-week due to scheduled roadwork.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all text-left">
            <MapPin className="w-5 h-5 text-orange-500 mb-2" />
            <div className="font-medium text-gray-900 text-sm">Add Location</div>
            <div className="text-xs text-gray-500 mt-0.5">Pin a new place</div>
          </button>
          <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all text-left">
            <Shield className="w-5 h-5 text-orange-500 mb-2" />
            <div className="font-medium text-gray-900 text-sm">View Alerts</div>
            <div className="text-xs text-gray-500 mt-0.5">3 this week</div>
          </button>
          <button className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all text-left">
            <TrendingUp className="w-5 h-5 text-orange-500 mb-2" />
            <div className="font-medium text-gray-900 text-sm">Trend Report</div>
            <div className="text-xs text-gray-500 mt-0.5">Monthly summary</div>
          </button>
        </div>

      </div>
    </div>
  )
}
