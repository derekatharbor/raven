// components/app/map-view.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { Incident } from "@/app/app/page"

interface MapViewProps {
  incidents: Incident[]
  onIncidentSelect: (incident: Incident) => void
  selectedIncident: Incident | null
}

const typeColors = {
  crime: "#ef4444",      // red-500
  civic: "#3b82f6",      // blue-500
  infrastructure: "#71717a", // zinc-500
}

export function MapView({ incidents, onIncidentSelect, selectedIncident }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  // Load Leaflet
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadMap = async () => {
      // @ts-ignore
      const L = await import("leaflet")
      
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      if (!mapRef.current || mapInstanceRef.current) return

      // Initialize map centered on Crystal Lake
      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([42.2411, -88.3162], 13)

      // Add tile layer - using a cleaner style
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add zoom control to bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map)

      mapInstanceRef.current = map
      setMapLoaded(true)
    }

    loadMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Add markers when map loads or incidents change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    const loadMarkers = async () => {
      // @ts-ignore
      const L = await import("leaflet")
      const map = mapInstanceRef.current

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Add new markers
      incidents.forEach((incident) => {
        const color = typeColors[incident.type as keyof typeof typeColors]
        const isSelected = selectedIncident?.id === incident.id

        // Create custom icon
        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: ${isSelected ? "20px" : "14px"};
              height: ${isSelected ? "20px" : "14px"};
              background: ${color};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transition: all 0.2s ease;
              ${isSelected ? "transform: scale(1.2);" : ""}
            "></div>
          `,
          iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14],
          iconAnchor: [isSelected ? 10 : 7, isSelected ? 10 : 7],
        })

        const marker = L.marker([incident.coordinates.lat, incident.coordinates.lng], { icon })
          .addTo(map)
          .on("click", () => onIncidentSelect(incident))

        markersRef.current.push(marker)
      })
    }

    loadMarkers()
  }, [mapLoaded, incidents, selectedIncident, onIncidentSelect])

  // Pan to selected incident
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedIncident) return
    
    mapInstanceRef.current.panTo([
      selectedIncident.coordinates.lat,
      selectedIncident.coordinates.lng
    ], { animate: true })
  }, [mapLoaded, selectedIncident])

  return (
    <div className="h-full relative">
      <div ref={mapRef} className="absolute inset-0" />
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-[400] bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="font-mono text-[10px] text-muted-foreground">Safety</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="font-mono text-[10px] text-muted-foreground">Civic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-500" />
            <span className="font-mono text-[10px] text-muted-foreground">Infrastructure</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="font-mono text-sm text-muted-foreground">Loading map...</span>
        </div>
      )}
    </div>
  )
}
