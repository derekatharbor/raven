"use client"

import { cn } from "@/lib/utils"

interface BitmapChevronProps {
  className?: string
  direction?: "right" | "left" | "up" | "down"
}

export function BitmapChevron({ className, direction = "right" }: BitmapChevronProps) {
  const rotation = {
    right: "rotate-0",
    down: "rotate-90",
    left: "rotate-180",
    up: "-rotate-90",
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("w-6 h-6", rotation[direction], className)}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Pixelated chevron made of squares */}
      <rect x="8" y="6" width="2" height="2" fill="currentColor" />
      <rect x="10" y="8" width="2" height="2" fill="currentColor" />
      <rect x="12" y="10" width="2" height="2" fill="currentColor" />
      <rect x="10" y="12" width="2" height="2" fill="currentColor" />
      <rect x="8" y="14" width="2" height="2" fill="currentColor" />
    </svg>
  )
}
