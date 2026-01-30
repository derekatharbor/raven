// components/app/feed-view.tsx
"use client"

import { cn } from "@/lib/utils"
import { Shield, Building2, Construction, Clock, CheckCircle2 } from "lucide-react"
import type { Incident } from "@/app/app/page"

interface FeedViewProps {
  incidents: Incident[]
  onIncidentSelect: (incident: Incident) => void
}

const typeConfig = {
  crime: {
    color: "bg-red-500",
    icon: Shield,
    label: "Safety",
  },
  civic: {
    color: "bg-blue-500",
    icon: Building2,
    label: "Civic",
  },
  infrastructure: {
    color: "bg-zinc-500",
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
    return `${diffMins}m ago`
  }
  if (diffHrs < 24) {
    return `${diffHrs}h ago`
  }
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}

export function FeedView({ incidents, onIncidentSelect }: FeedViewProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="divide-y divide-border/50">
        {incidents.map((incident) => {
          const config = typeConfig[incident.type as keyof typeof typeConfig]
          const Icon = config.icon

          return (
            <button
              key={incident.id}
              onClick={() => onIncidentSelect(incident)}
              className="w-full text-left px-4 py-4 hover:bg-muted/30 active:bg-muted/50 transition-colors"
            >
              <div className="flex gap-3">
                {/* Type indicator dot */}
                <div className="flex-shrink-0 pt-1.5">
                  <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="font-medium text-foreground text-[15px] leading-snug">
                    {incident.title}
                  </h3>

                  {/* Summary */}
                  <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {incident.summary}
                  </p>

                  {/* Meta row */}
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    {/* Location + Time */}
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {incident.municipality}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground/50">•</span>
                    <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(incident.timestamp)}
                    </span>

                    {/* Verified badge */}
                    {incident.verified && (
                      <>
                        <span className="font-mono text-[10px] text-muted-foreground/50">•</span>
                        <span className="font-mono text-[10px] text-accent flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Urgency indicator (high only) */}
                {incident.urgency >= 7 && (
                  <div className="flex-shrink-0">
                    <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded">
                      <span className="font-mono text-[10px] text-red-500 font-medium">
                        HIGH
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom padding for nav */}
      <div className="h-24" />
    </div>
  )
}
