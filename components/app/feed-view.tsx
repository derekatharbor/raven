// components/app/feed-view.tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Shield, 
  Building2, 
  Construction, 
  MapPin,
  CheckCircle2,
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  MoreHorizontal,
  Sparkles,
  ChevronDown
} from "lucide-react"
import type { Incident } from "@/lib/mock-data"

interface FeedViewProps {
  incidents: Incident[]
  onIncidentSelect: (incident: Incident) => void
  selectedIncident: Incident | null
}

const tabs = [
  { id: "for-you", label: "For You" },
  { id: "safety", label: "Safety" },
  { id: "civic", label: "Civic" },
  { id: "infrastructure", label: "Infrastructure" },
]

const typeConfig = {
  crime: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
    icon: Shield,
    label: "Safety",
  },
  civic: {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    icon: Building2,
    label: "Civic",
  },
  infrastructure: {
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    icon: Construction,
    label: "Infrastructure",
  },
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHrs < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `${diffMins}m`
  }
  if (diffHrs < 24) {
    return `${diffHrs}h`
  }
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d`
}

export function FeedView({ incidents, onIncidentSelect, selectedIncident }: FeedViewProps) {
  const [activeTab, setActiveTab] = useState("for-you")

  const filteredIncidents = activeTab === "for-you" 
    ? incidents 
    : incidents.filter(i => {
        if (activeTab === "safety") return i.type === "crime"
        if (activeTab === "civic") return i.type === "civic"
        if (activeTab === "infrastructure") return i.type === "infrastructure"
        return true
      })

  return (
    <div className="w-[600px] border-x border-gray-200 flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        {/* Title bar with location */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">Pulse</span>
            <span className="text-gray-400">—</span>
            <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Crystal Lake, IL</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3.5 text-sm font-bold transition-colors relative hover:bg-gray-50",
                activeTab === tab.id ? "text-gray-900" : "text-gray-500"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* The Pulse - AI Summary */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">The Pulse</span>
                <span className="text-xs text-gray-500">• Updated 8:00 AM</span>
              </div>
              <p className="text-gray-700 mt-1 text-[15px] leading-relaxed">
                Crystal Lake is calm this morning. 2 minor incidents overnight, down from last week's average. 
                Note: Route 14 eastbound remains closed for utility work through Friday — use 176 as alternate.
              </p>
            </div>
          </div>
        </div>

        {/* Feed items as cards */}
        <div className="p-4 space-y-4">
          {filteredIncidents.map((incident) => (
            <IncidentCard 
              key={incident.id} 
              incident={incident}
              onSelect={() => onIncidentSelect(incident)}
              isSelected={selectedIncident?.id === incident.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function IncidentCard({ 
  incident, 
  onSelect, 
  isSelected 
}: { 
  incident: Incident
  onSelect: () => void
  isSelected: boolean
}) {
  const config = typeConfig[incident.type]
  const Icon = config.icon
  const [confirmed, setConfirmed] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <article 
      onClick={onSelect}
      className={cn(
        "bg-white border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected 
          ? "border-orange-300 shadow-md ring-1 ring-orange-200" 
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Type badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold",
            config.bgColor,
            config.color
          )}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </div>

          {/* Verified badge */}
          {incident.verified && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </div>
          )}

          {/* High priority */}
          {incident.urgency >= 7 && (
            <div className="px-2 py-1 rounded-md bg-red-100 text-red-600 text-xs font-semibold">
              High Priority
            </div>
          )}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation() }}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-[16px] leading-snug">
        {incident.title}
      </h3>

      {/* Summary */}
      <p className="text-gray-600 mt-2 text-[15px] leading-relaxed">
        {incident.summary}
      </p>

      {/* Location + Time row */}
      <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {incident.location}
        </span>
        <span>•</span>
        <span>{incident.municipality}</span>
        <span>•</span>
        <span>{formatTimeAgo(incident.timestamp)}</span>
      </div>

      {/* Source */}
      <div className="mt-2 text-xs text-gray-400">
        Source: {incident.source}
      </div>

      {/* Engagement row */}
      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
        {/* Confirm button */}
        <button 
          onClick={(e) => { 
            e.stopPropagation()
            setConfirmed(!confirmed)
          }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            confirmed 
              ? "bg-green-50 text-green-600" 
              : "text-gray-500 hover:bg-gray-50 hover:text-green-600"
          )}
        >
          <ThumbsUp className={cn("w-4 h-4", confirmed && "fill-current")} />
          <span>Confirm</span>
          <span className="text-gray-400">
            {incident.engagement.comments + (confirmed ? 1 : 0)}
          </span>
        </button>

        {/* Share button */}
        <button 
          onClick={(e) => { e.stopPropagation() }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        {/* Save button */}
        <button 
          onClick={(e) => { 
            e.stopPropagation()
            setSaved(!saved)
          }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ml-auto",
            saved 
              ? "bg-orange-50 text-orange-600" 
              : "text-gray-500 hover:bg-gray-50 hover:text-orange-600"
          )}
        >
          <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
          <span>Save</span>
        </button>
      </div>
    </article>
  )
}