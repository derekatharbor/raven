// components/app/bottom-nav.tsx
"use client"

import { Home, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function BottomNav() {
  const [active, setActive] = useState("home")

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <nav className="max-w-xs mx-auto pointer-events-auto">
        <div className="bg-foreground/95 backdrop-blur-xl rounded-full px-2 py-2 shadow-2xl flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-background/70 hover:text-background"
                )}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span className="font-mono text-xs font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
