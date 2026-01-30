// app/app/page.tsx
"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app/app-header"
import { PulseBanner } from "@/components/app/pulse-banner"
import { FeedView } from "@/components/app/feed-view"
import { MapView } from "@/components/app/map-view"
import { BottomNav } from "@/components/app/bottom-nav"
import { IncidentDetail } from "@/components/app/incident-detail"

// Mock data - will connect to API later
const MOCK_INCIDENTS = [
  {
    id: "1",
    type: "crime",
    title: "Vehicle Break-ins Reported",
    summary: "3 vehicles broken into overnight in the Main St parking lot. Police investigating.",
    location: "Main St & Oak Ave",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    urgency: 8,
    coordinates: { lat: 42.2411, lng: -88.3162 },
    source: "Crystal Lake PD",
    verified: true,
  },
  {
    id: "2", 
    type: "civic",
    title: "Rezoning Hearing Scheduled",
    summary: "Public hearing on proposed B-2 rezoning for 450 Virginia St. Comment period open until Feb 15.",
    location: "450 Virginia St",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    urgency: 4,
    coordinates: { lat: 42.2431, lng: -88.3201 },
    source: "Planning Commission",
    verified: true,
  },
  {
    id: "3",
    type: "infrastructure",
    title: "Road Closure: Route 14",
    summary: "Eastbound lanes closed for utility work. Expect delays through Friday.",
    location: "Route 14 at Pingree Rd",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    urgency: 5,
    coordinates: { lat: 42.2251, lng: -88.3102 },
    source: "IDOT",
    verified: true,
  },
  {
    id: "4",
    type: "crime",
    title: "Package Theft Pattern",
    summary: "Multiple package thefts reported on Dole Ave this week. Deliveries between 2-5pm targeted.",
    location: "Dole Ave",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    urgency: 6,
    coordinates: { lat: 42.2381, lng: -88.3142 },
    source: "Community Reports",
    verified: false,
  },
  {
    id: "5",
    type: "civic",
    title: "New Liquor License Application",
    summary: "Application filed for new restaurant at former hardware store location. Board vote Feb 20.",
    location: "123 Williams St",
    municipality: "Crystal Lake",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    urgency: 2,
    coordinates: { lat: 42.2421, lng: -88.3122 },
    source: "City Clerk",
    verified: true,
  },
]

export type Incident = typeof MOCK_INCIDENTS[0]

export default function AppPage() {
  const [view, setView] = useState<"feed" | "map">("feed")
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [pulseExpanded, setPulseExpanded] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleIncidentSelect = (incident: Incident) => {
    setSelectedIncident(incident)
  }

  const handleIncidentClose = () => {
    setSelectedIncident(null)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <AppHeader 
        onMenuOpen={() => setMenuOpen(true)} 
        location="Crystal Lake, IL"
      />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Pulse Banner */}
        <PulseBanner 
          expanded={pulseExpanded}
          onToggle={() => setPulseExpanded(!pulseExpanded)}
          summary="Your area is calm this morning. 2 incidents overnight, down from last week's average."
        />

        {/* View Toggle */}
        <div className="px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex gap-2">
            <button
              onClick={() => setView("feed")}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                view === "feed"
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setView("map")}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
                view === "map"
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              Map
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === "feed" ? (
            <FeedView 
              incidents={MOCK_INCIDENTS}
              onIncidentSelect={handleIncidentSelect}
            />
          ) : (
            <MapView 
              incidents={MOCK_INCIDENTS}
              onIncidentSelect={handleIncidentSelect}
              selectedIncident={selectedIncident}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Incident Detail Sheet */}
      {selectedIncident && (
        <IncidentDetail 
          incident={selectedIncident}
          onClose={handleIncidentClose}
        />
      )}
    </div>
  )
}
