// app/app/page.tsx
"use client"

import { useState } from "react"
import { HomeView } from "@/components/app/home-view"
import { OrbitSidebar } from "@/components/app/orbit-sidebar"
import { MapPageView } from "@/components/app/map-page-view"
import { MOCK_INCIDENTS, type Incident } from "@/lib/mock-data"

type ViewType = "home" | "map"

export default function AppPage() {
  const [currentView, setCurrentView] = useState<ViewType>("home")
  const [selectedLocationId, setSelectedLocationId] = useState("crystal-lake")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Orbit Sidebar - Location Picker (Dark, like Weather app) */}
      <OrbitSidebar 
        selectedLocationId={selectedLocationId}
        onLocationSelect={setSelectedLocationId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Simple header with view toggle */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("home")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === "home" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setCurrentView("map")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentView === "map" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Map
              </button>
            </div>
          </div>
          
          {/* Right side - future: notifications, settings */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Last updated 5 min ago</span>
          </div>
        </header>

        {/* Content */}
        {currentView === "home" && (
          <HomeView onNavigateToMap={() => setCurrentView("map")} />
        )}

        {currentView === "map" && (
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