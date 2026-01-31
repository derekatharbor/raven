// app/app/page.tsx
"use client"

import { useState } from "react"
import { BriefingView } from "@/components/app/briefing-view"
import { OrbitSidebar } from "@/components/app/orbit-sidebar"
import { MapPageView } from "@/components/app/map-page-view"
import { MOCK_INCIDENTS, type Incident } from "@/lib/mock-data"

type ViewType = "brief" | "map"

export default function AppPage() {
  const [currentView, setCurrentView] = useState<ViewType>("brief")
  const [selectedLocationId, setSelectedLocationId] = useState("crystal-lake")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Orbit Sidebar */}
      <OrbitSidebar 
        selectedLocationId={selectedLocationId}
        onLocationSelect={setSelectedLocationId}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex-shrink-0 border-b border-border/40 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("brief")}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors rounded ${
                  currentView === "brief" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Brief
              </button>
              <button
                onClick={() => setCurrentView("map")}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors rounded ${
                  currentView === "map" 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Map
              </button>
            </div>
          </div>
          
          <span className="font-mono text-[10px] text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </header>

        {/* Content */}
        {currentView === "brief" ? (
          <BriefingView 
            selectedLocationId={selectedLocationId}
            onNavigateToMap={() => setCurrentView("map")} 
          />
        ) : (
          <MapPageView 
            incidents={MOCK_INCIDENTS}
            onIncidentSelect={setSelectedIncident}
            selectedIncident={selectedIncident}
          />
        )}
      </div>
    </div>
  )
}