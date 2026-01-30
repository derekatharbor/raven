// components/app/incident-detail.tsx
"use client"

import { X, MapPin, Clock, Shield, Building2, Construction, CheckCircle2, ExternalLink, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Incident } from "@/app/app/page"

interface IncidentDetailProps {
  incident: Incident
  onClose: () => void
}

const typeConfig = {
  crime: {
    color: "bg-red-500",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/5",
    icon: Shield,
    label: "Safety",
  },
  civic: {
    color: "bg-blue-500",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/5",
    icon: Building2,
    label: "Civic",
  },
  infrastructure: {
    color: "bg-zinc-500",
    borderColor: "border-zinc-500/30",
    bgColor: "bg-zinc-500/5",
    icon: Construction,
    label: "Infrastructure",
  },
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHrs < 24) {
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    })
  }
  
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })
}

export function IncidentDetail({ incident, onClose }: IncidentDetailProps) {
  const config = typeConfig[incident.type as keyof typeof typeConfig]
  const Icon = config.icon

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-background rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pb-4">
            <div className="flex items-start gap-3">
              {/* Type badge */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                config.bgColor
              )}>
                <Icon className={cn("w-5 h-5", 
                  incident.type === "crime" ? "text-red-500" :
                  incident.type === "civic" ? "text-blue-500" :
                  "text-zinc-500"
                )} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-mono text-[10px] uppercase tracking-wider font-medium",
                    incident.type === "crime" ? "text-red-500" :
                    incident.type === "civic" ? "text-blue-500" :
                    "text-zinc-500"
                  )}>
                    {config.label}
                  </span>
                  {incident.verified && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-accent">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <h2 className="mt-1 text-lg font-semibold text-foreground leading-tight">
                  {incident.title}
                </h2>
              </div>
            </div>

            {/* Close button */}
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 transition-colors -mr-2 -mt-1"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-6">
            {/* Summary */}
            <p className="font-mono text-sm text-foreground/80 leading-relaxed">
              {incident.summary}
            </p>

            {/* Meta info */}
            <div className="mt-5 space-y-3">
              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="font-mono text-sm text-muted-foreground">
                  {incident.location}, {incident.municipality}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="font-mono text-sm text-muted-foreground">
                  {formatTime(incident.timestamp)}
                </span>
              </div>
            </div>

            {/* Source */}
            <div className="mt-5 p-4 rounded-xl bg-muted/30 border border-border/50">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Source
              </span>
              <p className="mt-1 font-mono text-sm text-foreground/80">
                {incident.source}
              </p>
            </div>

            {/* Urgency bar for high-urgency items */}
            {incident.urgency >= 7 && (
              <div className="mt-5 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-red-500 font-medium">
                    High Priority Alert
                  </span>
                  <span className="font-mono text-xs text-red-500">
                    Urgency: {incident.urgency}/10
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-foreground text-background rounded-xl font-mono text-sm font-medium hover:bg-foreground/90 transition-colors">
                <MapPin className="w-4 h-4" />
                View on Map
              </button>
              <button className="w-12 h-12 flex items-center justify-center border border-border/50 rounded-xl hover:bg-muted/50 transition-colors">
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
