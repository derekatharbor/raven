// components/app/app-header.tsx
"use client"

import { Menu, ChevronDown, Bell } from "lucide-react"

interface AppHeaderProps {
  onMenuOpen: () => void
  location: string
}

export function AppHeader({ onMenuOpen, location }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background">
      {/* Left - Menu */}
      <button 
        onClick={onMenuOpen}
        className="w-10 h-10 flex items-center justify-center hover:bg-muted/50 transition-colors -ml-2"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Center - Logo + Location */}
      <div className="flex flex-col items-center">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent font-medium">
          Ranger
        </span>
        <button className="flex items-center gap-1 mt-0.5 group">
          <span className="font-mono text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
            {location}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>

      {/* Right - Notifications */}
      <button 
        className="w-10 h-10 flex items-center justify-center hover:bg-muted/50 transition-colors -mr-2 relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {/* Notification dot */}
        <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
      </button>
    </header>
  )
}
