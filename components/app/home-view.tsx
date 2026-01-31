// components/app/home-view.tsx
"use client"

import { 
  CURRENT_LOCATION, 
  HOURLY_ACTIVITY, 
  WEEKLY_TREND, 
  CATEGORY_INDICES,
  PULSE_BRIEFING,
  PEAK_HOURS,
  ALERT_LEVEL,
  HEAT_ZONES,
  getScoreColor 
} from "@/lib/raven-data"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  Shield,
  Construction,
  Landmark,
  Clock,
  Map,
  ChevronRight,
  Info
} from "lucide-react"

// Score Hero - The big number like temperature
function ScoreHero() {
  const location = CURRENT_LOCATION
  const scoreColor = getScoreColor(location.stabilityScore)
  
  const trendIcon = location.trend === "improving" 
    ? <TrendingUp className="w-4 h-4" />
    : location.trend === "declining"
    ? <TrendingDown className="w-4 h-4" />
    : <Minus className="w-4 h-4" />
    
  const trendColor = location.trend === "improving" 
    ? "text-emerald-600"
    : location.trend === "declining"
    ? "text-rose-600"
    : "text-slate-500"

  return (
    <div className="text-center py-8 px-4">
      <h1 className="text-xl font-medium text-slate-700 mb-1">{location.name}</h1>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-8xl font-light text-slate-900 tracking-tight">
          {location.stabilityScore}
        </span>
      </div>
      <div className={`flex items-center justify-center gap-1.5 mt-2 ${trendColor}`}>
        {trendIcon}
        <span className="text-sm font-medium">
          {location.trend === "stable" ? "Stable" : `${location.trendPercent > 0 ? "+" : ""}${location.trendPercent}%`}
        </span>
        <span className="text-slate-400 text-sm">vs last week</span>
      </div>
      <p className="text-slate-500 text-sm mt-1">{location.briefStatus}</p>
    </div>
  )
}

// Pulse Briefing Card - Like severe weather alert
function PulseBriefingCard() {
  const pulse = PULSE_BRIEFING
  
  const severityStyles = {
    info: "bg-sky-50 border-sky-200",
    advisory: "bg-amber-50 border-amber-200", 
    warning: "bg-rose-50 border-rose-200"
  }
  
  const severityIcon = {
    info: <Info className="w-5 h-5 text-sky-600" />,
    advisory: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-rose-600" />
  }

  return (
    <div className={`rounded-2xl border p-4 ${severityStyles[pulse.severity]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{severityIcon[pulse.severity]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{pulse.title}</h3>
          </div>
          <p className="text-sm text-slate-600 mt-1">{pulse.summary}</p>
          <p className="text-xs text-slate-400 mt-2">{pulse.source}</p>
        </div>
      </div>
    </div>
  )
}

// Hourly Timeline - Like hourly weather strip
function HourlyTimeline() {
  const hours = HOURLY_ACTIVITY
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "elevated": return "bg-rose-500"
      case "moderate": return "bg-amber-400"
      default: return "bg-emerald-400"
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500 mb-3">
        Activity has been low through the evening. Peak expected overnight 11PM-2AM.
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {hours.map((hour, i) => (
          <div key={i} className="flex flex-col items-center min-w-[44px]">
            <span className="text-xs text-slate-500 mb-2">{hour.hour}</span>
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-100">
              <div className={`w-3 h-3 rounded-full ${getSeverityColor(hour.severity)}`} />
            </div>
            <span className="text-xs font-medium text-slate-700 mt-2">{hour.incidents}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 7-Day Trend Card - Like 10-day forecast
function WeeklyTrendCard() {
  const trend = WEEKLY_TREND
  const maxIncidents = Math.max(...trend.map(d => d.incidents))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">7-Day Trend</h3>
      </div>
      <div className="space-y-3">
        {trend.map((day, i) => (
          <div key={i} className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 w-12">{day.day}</span>
            <div className="flex-1 flex items-center gap-3">
              <span className="text-sm text-slate-400 w-8">{day.low}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full relative">
                <div 
                  className="absolute h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full"
                  style={{ 
                    left: `${((day.low - 60) / 30) * 100}%`,
                    width: `${((day.high - day.low) / 30) * 100}%`
                  }}
                />
                <div 
                  className="absolute w-2 h-2 bg-slate-700 rounded-full -top-0.5"
                  style={{ left: `${((day.score - 60) / 30) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-700 w-8">{day.high}</span>
            </div>
            <div className="flex items-center gap-1 w-16 justify-end">
              <span className="text-xs text-slate-400">{day.incidents}</span>
              <div 
                className="h-4 bg-slate-200 rounded"
                style={{ width: `${(day.incidents / maxIncidents) * 32}px` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Category Index Card - Like Air Quality
function CategoryIndexCard({ category }: { category: typeof CATEGORY_INDICES[0] }) {
  const icons = {
    Safety: <Shield className="w-4 h-4" />,
    Infrastructure: <Construction className="w-4 h-4" />,
    Civic: <Landmark className="w-4 h-4" />
  }
  
  const colors = {
    rose: "text-rose-600 bg-rose-50",
    amber: "text-amber-600 bg-amber-50",
    sky: "text-sky-600 bg-sky-50",
    emerald: "text-emerald-600 bg-emerald-50"
  }
  
  const scoreColor = category.score >= 75 ? "emerald" : category.score >= 60 ? "sky" : category.score >= 45 ? "amber" : "rose"
  
  const TrendIcon = category.trend === "up" ? TrendingUp : category.trend === "down" ? TrendingDown : Minus
  const trendColor = category.trend === "up" ? "text-emerald-600" : category.trend === "down" ? "text-rose-600" : "text-slate-400"

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={`p-1.5 rounded-lg ${colors[category.color as keyof typeof colors]}`}>
          {icons[category.name as keyof typeof icons]}
        </span>
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{category.name}</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-slate-900">{category.score}</span>
        <span className={`text-sm ${colors[scoreColor as keyof typeof colors].split(" ")[0]} font-medium`}>
          {category.score >= 75 ? "Good" : category.score >= 60 ? "Fair" : category.score >= 45 ? "Poor" : "Critical"}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full rounded-full ${
            scoreColor === "emerald" ? "bg-emerald-500" :
            scoreColor === "sky" ? "bg-sky-500" :
            scoreColor === "amber" ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ width: `${category.score}%` }}
        />
      </div>
      <p className="text-sm text-slate-600 mt-3">{category.description}</p>
      <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
        <TrendIcon className="w-3 h-3" />
        <span className="text-xs font-medium">
          {category.trendPercent > 0 ? "+" : ""}{category.trendPercent}% vs last week
        </span>
      </div>
    </div>
  )
}

// Map Preview Card - Small heat map
function MapPreviewCard({ onNavigateToMap }: { onNavigateToMap: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Activity Map</h3>
        </div>
        <button 
          onClick={onNavigateToMap}
          className="text-sky-600 text-sm font-medium flex items-center gap-1 hover:text-sky-700"
        >
          Open <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Map placeholder - will be replaced with actual heat map */}
      <div className="relative h-48 bg-slate-100">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Simplified heat map visualization */}
          <svg viewBox="0 0 200 120" className="w-full h-full opacity-80">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              </pattern>
              <radialGradient id="heat1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="heat2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="heat3" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="200" height="120" fill="url(#grid)"/>
            {/* Heat zones */}
            <circle cx="100" cy="50" r="35" fill="url(#heat1)"/>
            <circle cx="60" cy="80" r="25" fill="url(#heat2)"/>
            <circle cx="150" cy="70" r="20" fill="url(#heat3)"/>
            {/* Location marker */}
            <circle cx="100" cy="60" r="4" fill="#0f172a"/>
            <circle cx="100" cy="60" r="8" fill="none" stroke="#0f172a" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-slate-600">
          3 active zones
        </div>
      </div>
    </div>
  )
}

// Peak Hours Card - Like sunrise/sunset
function PeakHoursCard() {
  const peaks = PEAK_HOURS

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Peak Hours</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase">Evening Rush</p>
          <p className="text-lg font-semibold text-slate-900">{peaks.evening.start}–{peaks.evening.end}</p>
          <p className="text-xs text-amber-600">Elevated</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase">Overnight</p>
          <p className="text-lg font-semibold text-slate-900">{peaks.overnight.start}–{peaks.overnight.end}</p>
          <p className="text-xs text-rose-600">Elevated</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase">Quietest</p>
          <p className="text-lg font-semibold text-slate-900">{peaks.quietest.start}–{peaks.quietest.end}</p>
          <p className="text-xs text-emerald-600">Low</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase">Morning</p>
          <p className="text-lg font-semibold text-slate-900">{peaks.morning.start}–{peaks.morning.end}</p>
          <p className="text-xs text-amber-600">Moderate</p>
        </div>
      </div>
    </div>
  )
}

// Alert Level Card - Like UV Index
function AlertLevelCard() {
  const alert = ALERT_LEVEL
  
  const levelColors = {
    low: "bg-emerald-500",
    moderate: "bg-amber-500",
    elevated: "bg-orange-500",
    high: "bg-rose-500"
  }
  
  const levelIndex = { low: 1, moderate: 2, elevated: 3, high: 4 }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Alert Level</h3>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-slate-900">{levelIndex[alert.level]}</span>
        <span className="text-lg font-medium text-slate-600">{alert.label}</span>
      </div>
      <div className="flex gap-1 mt-3">
        {["low", "moderate", "elevated", "high"].map((level, i) => (
          <div 
            key={level}
            className={`h-1.5 flex-1 rounded-full ${
              i < levelIndex[alert.level] ? levelColors[level as keyof typeof levelColors] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-slate-600 mt-3">{alert.description}</p>
      {alert.factors.length > 0 && (
        <ul className="mt-2 space-y-1">
          {alert.factors.map((factor, i) => (
            <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              {factor}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Main Home View Component
export function HomeView({ onNavigateToMap }: { onNavigateToMap: () => void }) {
  return (
    <div 
      className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white scrollbar-light"
      data-lenis-prevent
    >
      <div className="max-w-xl mx-auto px-4 pb-12">
        {/* Hero Score */}
        <ScoreHero />
        
        {/* Pulse Briefing (if active) */}
        <div className="mb-4">
          <PulseBriefingCard />
        </div>
        
        {/* Hourly Timeline */}
        <div className="mb-4">
          <HourlyTimeline />
        </div>
        
        {/* Two-column grid for smaller cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <PeakHoursCard />
          <AlertLevelCard />
        </div>
        
        {/* 7-Day Trend */}
        <div className="mb-4">
          <WeeklyTrendCard />
        </div>
        
        {/* Category Indices */}
        <div className="space-y-4 mb-4">
          {CATEGORY_INDICES.map((cat) => (
            <CategoryIndexCard key={cat.name} category={cat} />
          ))}
        </div>
        
        {/* Map Preview */}
        <div className="mb-4">
          <MapPreviewCard onNavigateToMap={onNavigateToMap} />
        </div>
      </div>
    </div>
  )
}