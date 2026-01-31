// lib/raven-data.ts
// Weather-style data structures for Raven

export interface LocationData {
  id: string
  name: string
  label?: string // "Home", "Work", "Mom's Place"
  imageUrl?: string
  coordinates: { lat: number; lng: number }
  stabilityScore: number // 0-100
  trend: "improving" | "stable" | "declining"
  trendPercent: number // +5 or -3 etc
  briefStatus: string // "Quiet week" / "Elevated activity"
}

export interface HourlyActivity {
  hour: string // "12AM", "1AM", etc
  incidents: number
  severity: "low" | "moderate" | "elevated"
}

export interface DailyTrend {
  day: string // "Mon", "Tue", etc
  date: string
  score: number
  incidents: number
  high: number
  low: number
}

export interface CategoryIndex {
  name: string
  score: number
  trend: "up" | "down" | "stable"
  trendPercent: number
  description: string
  color: string
}

export interface PulseBriefing {
  severity: "info" | "advisory" | "warning"
  title: string
  summary: string
  source: string
  timestamp: string
}

export interface HeatZone {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  intensity: number // 0-1
  category: "crime" | "infrastructure" | "civic"
}

// Current location data (Crystal Lake)
export const CURRENT_LOCATION: LocationData = {
  id: "crystal-lake",
  name: "Crystal Lake",
  label: "Home",
  coordinates: { lat: 42.2411, lng: -88.3162 },
  stabilityScore: 72,
  trend: "stable",
  trendPercent: 2,
  briefStatus: "Typical activity this week"
}

// Orbit - saved locations
export const ORBIT_LOCATIONS: LocationData[] = [
  {
    id: "crystal-lake",
    name: "Crystal Lake",
    label: "Home",
    imageUrl: "/images/crystal-lake.jpg",
    coordinates: { lat: 42.2411, lng: -88.3162 },
    stabilityScore: 72,
    trend: "stable",
    trendPercent: 2,
    briefStatus: "Typical activity this week"
  },
  {
    id: "chicago-loop",
    name: "Chicago Loop",
    label: "Work",
    imageUrl: "/images/chicago-loop.jpg",
    coordinates: { lat: 41.8819, lng: -87.6278 },
    stabilityScore: 58,
    trend: "declining",
    trendPercent: -8,
    briefStatus: "Property crime elevated"
  },
  {
    id: "mchenry",
    name: "McHenry",
    label: "Mom's Place",
    imageUrl: "/images/mchenry.jpg",
    coordinates: { lat: 42.3334, lng: -88.2667 },
    stabilityScore: 81,
    trend: "improving",
    trendPercent: 5,
    briefStatus: "Quiet week"
  },
]

// 24-hour activity timeline
export const HOURLY_ACTIVITY: HourlyActivity[] = [
  { hour: "Now", incidents: 2, severity: "low" },
  { hour: "11PM", incidents: 3, severity: "low" },
  { hour: "10PM", incidents: 4, severity: "moderate" },
  { hour: "9PM", incidents: 5, severity: "moderate" },
  { hour: "8PM", incidents: 3, severity: "low" },
  { hour: "7PM", incidents: 2, severity: "low" },
  { hour: "6PM", incidents: 4, severity: "moderate" },
  { hour: "5PM", incidents: 6, severity: "elevated" },
  { hour: "4PM", incidents: 5, severity: "moderate" },
  { hour: "3PM", incidents: 4, severity: "moderate" },
  { hour: "2PM", incidents: 3, severity: "low" },
  { hour: "1PM", incidents: 2, severity: "low" },
]

// 7-day trend (historical)
export const WEEKLY_TREND: DailyTrend[] = [
  { day: "Today", date: "Jan 30", score: 72, incidents: 14, high: 78, low: 68 },
  { day: "Wed", date: "Jan 29", score: 74, incidents: 12, high: 79, low: 70 },
  { day: "Tue", date: "Jan 28", score: 71, incidents: 16, high: 76, low: 67 },
  { day: "Mon", date: "Jan 27", score: 69, incidents: 18, high: 74, low: 65 },
  { day: "Sun", date: "Jan 26", score: 75, incidents: 9, high: 80, low: 71 },
  { day: "Sat", date: "Jan 25", score: 73, incidents: 11, high: 78, low: 69 },
  { day: "Fri", date: "Jan 24", score: 70, incidents: 15, high: 75, low: 66 },
]

// Category indices
export const CATEGORY_INDICES: CategoryIndex[] = [
  {
    name: "Safety",
    score: 68,
    trend: "stable",
    trendPercent: -2,
    description: "Property crime slightly elevated near downtown. Violent crime remains low.",
    color: "rose"
  },
  {
    name: "Infrastructure",
    score: 74,
    trend: "down",
    trendPercent: -5,
    description: "Water main repairs ongoing on Route 14. 311 requests up 12% this week.",
    color: "amber"
  },
  {
    name: "Civic",
    score: 82,
    trend: "stable",
    trendPercent: 1,
    description: "Rezoning hearing scheduled Feb 15. No significant policy changes pending.",
    color: "sky"
  }
]

// Pulse briefing (like severe weather alert)
export const PULSE_BRIEFING: PulseBriefing = {
  severity: "advisory",
  title: "Vehicle Break-ins Pattern Identified",
  summary: "Property crime in the downtown area is up 23% this week, concentrated around Main St parking lots between 11pm-3am. This follows a 3-week pattern. Crystal Lake PD has increased overnight patrols.",
  source: "Raven Analysis",
  timestamp: new Date().toISOString()
}

// Peak activity hours
export const PEAK_HOURS = {
  morning: { start: "7AM", end: "9AM", level: "moderate" as const },
  evening: { start: "5PM", end: "7PM", level: "elevated" as const },
  overnight: { start: "11PM", end: "2AM", level: "elevated" as const },
  quietest: { start: "3AM", end: "6AM", level: "low" as const }
}

// Alert level
export const ALERT_LEVEL = {
  level: "moderate" as const, // low | moderate | elevated | high
  label: "Moderate",
  description: "Heightened awareness recommended",
  factors: ["Property crime pattern active", "Construction delays expected"]
}

// Heat zones for map preview
export const HEAT_ZONES: HeatZone[] = [
  { id: "1", name: "Downtown", coordinates: { lat: 42.2418, lng: -88.3168 }, intensity: 0.8, category: "crime" },
  { id: "2", name: "Route 14 Corridor", coordinates: { lat: 42.2251, lng: -88.3102 }, intensity: 0.6, category: "infrastructure" },
  { id: "3", name: "Lake Shore", coordinates: { lat: 42.2371, lng: -88.3232 }, intensity: 0.4, category: "crime" },
]

// Comparative stats
export const COMPARATIVE_STATS = {
  vsLastWeek: {
    label: "vs Last Week",
    change: -3,
    direction: "better" as const
  },
  vsLastMonth: {
    label: "vs Last Month", 
    change: 5,
    direction: "worse" as const
  },
  vsCountyAverage: {
    label: "vs County Avg",
    change: 8,
    direction: "better" as const
  }
}

// Helper to get score color
export type ScoreColorType = "emerald" | "sky" | "amber" | "rose"
export function getScoreColor(score: number): ScoreColorType {
  if (score >= 80) return "emerald"
  if (score >= 65) return "sky"
  if (score >= 50) return "amber"
  return "rose"
}

// Helper to get trend icon direction
export function getTrendDirection(trend: "improving" | "stable" | "declining" | "up" | "down"): "up" | "down" | "flat" {
  if (trend === "improving" || trend === "up") return "up"
  if (trend === "declining" || trend === "down") return "down"
  return "flat"
}
