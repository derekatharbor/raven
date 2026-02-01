// lib/hooks/use-incidents.ts
"use client"

import { useState, useEffect } from 'react'
import type { RecentIncident } from '@/lib/raven-data'

interface IncidentFromAPI {
  id: string
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low' | null
  title: string
  description: string | null
  location_text: string | null
  latitude: number | null
  longitude: number | null
  municipality: string | null
  occurred_at: string | null
  verification_status: string
  created_at: string
  raw_data?: {
    url?: string
    incident_type?: string
    source?: string
  }
}

interface IncidentsResponse {
  items: IncidentFromAPI[]
  total: number
  categoryCounts: Record<string, number>
}

// Map API categories to display types
function mapCategoryToType(category: string): 'crime' | 'civic' | 'infrastructure' | 'safety' {
  switch (category) {
    case 'shots_fired':
    case 'robbery':
    case 'assault':
    case 'burglary':
    case 'theft':
    case 'vehicle_breakin':
    case 'drugs':
    case 'fraud':
      return 'crime'
    case 'traffic':
      return 'infrastructure'
    case 'fire':
    case 'missing':
      return 'safety'
    default:
      return 'civic'
  }
}

// Map severity to urgency number
function mapSeverityToUrgency(severity: string | null): number {
  switch (severity) {
    case 'critical': return 9
    case 'high': return 7
    case 'medium': return 5
    case 'low': return 3
    default: return 4
  }
}

// Default coordinates for Crystal Lake
const DEFAULT_COORDS = { lat: 42.2411, lng: -88.3162 }

export function useIncidents(options?: {
  municipality?: string
  days?: number
  limit?: number
}) {
  const [incidents, setIncidents] = useState<RecentIncident[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { municipality, days = 7, limit = 50 } = options || {}

  useEffect(() => {
    async function fetchIncidents() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          days: days.toString(),
          limit: limit.toString(),
        })
        
        if (municipality) {
          params.set('municipality', municipality)
        }

        const response = await fetch(`/api/incidents?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch incidents')
        }

        const data: IncidentsResponse = await response.json()

        // Transform to RecentIncident format
        const transformed: RecentIncident[] = data.items.map(item => ({
          id: item.id,
          type: mapCategoryToType(item.category),
          title: item.title,
          summary: item.description || '',
          location: item.location_text,
          municipality: item.municipality || 'McHenry County',
          timestamp: item.occurred_at || item.created_at,
          urgency: mapSeverityToUrgency(item.severity),
          coordinates: item.latitude && item.longitude 
            ? { lat: item.latitude, lng: item.longitude }
            : DEFAULT_COORDS,
          source: item.raw_data?.source || 'Lake McHenry Scanner',
          sourceUrl: item.raw_data?.url,
        }))

        setIncidents(transformed)
        setCategoryCounts(data.categoryCounts)
        setTotal(data.total || 0)
      } catch (err) {
        console.error('Failed to fetch incidents:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchIncidents()
  }, [municipality, days, limit])

  return { incidents, categoryCounts, total, loading, error }
}

// Summary stats derived from incidents
export function useIncidentStats(options?: { municipality?: string; days?: number }) {
  const { incidents, categoryCounts, total, loading, error } = useIncidents({
    ...options,
    limit: 100,
  })

  // Calculate stats
  const stats = {
    total,
    byCityCount: incidents.reduce((acc, inc) => {
      const city = inc.municipality
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byType: {
      crime: incidents.filter(i => i.type === 'crime').length,
      safety: incidents.filter(i => i.type === 'safety').length,
      infrastructure: incidents.filter(i => i.type === 'infrastructure').length,
      civic: incidents.filter(i => i.type === 'civic').length,
    },
    avgUrgency: incidents.length > 0
      ? incidents.reduce((sum, i) => sum + i.urgency, 0) / incidents.length
      : 0,
    highUrgencyCount: incidents.filter(i => i.urgency >= 7).length,
  }

  return { stats, categoryCounts, loading, error }
}
