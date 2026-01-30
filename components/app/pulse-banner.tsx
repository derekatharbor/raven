// components/app/pulse-banner.tsx
"use client"

import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface PulseBannerProps {
  expanded: boolean
  onToggle: () => void
  summary: string
}

export function PulseBanner({ expanded, onToggle, summary }: PulseBannerProps) {
  return (
    <div className={cn(
      "border-b border-border/50 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 transition-all duration-300",
      expanded ? "py-4" : "py-2"
    )}>
      <button 
        onClick={onToggle}
        className="w-full px-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Pulse icon */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center transition-all",
              expanded ? "mt-0" : "-mt-0.5"
            )}>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent font-medium">
                  The Pulse
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  • Morning Brief
                </span>
              </div>

              {/* Summary - only show when expanded */}
              {expanded && (
                <p className="mt-2 font-mono text-sm text-foreground/80 leading-relaxed">
                  {summary}
                </p>
              )}
            </div>
          </div>

          {/* Toggle icon */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-muted-foreground">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>
    </div>
  )
}
