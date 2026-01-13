// Route: src/components/workspace/TrackingBadge.tsx

'use client'

type TrackingStatus = 'verified' | 'pending' | 'stale' | 'contradiction' | 'deviation'
type TrackingType = 'verify' | 'signal' | 'both'

interface TrackingBadgeProps {
  status: TrackingStatus
  type: TrackingType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Color palette (pastels, not Skittles)
const COLORS = {
  grey: '#9C9DA1',
  yellow: '#F3C94D',   // Stale
  orange: '#FD7941',   // Contradiction / Deviation
  purple: '#5F6AD2',   // Verified
}

// Shield path (for verification)
const SHIELD_PATHS = {
  sm: { width: 16, height: 18, path: 'M8 1 L15 4 L15 10 C15 14 8 17 8 17 C8 17 1 14 1 10 L1 4 Z' },
  md: { width: 22, height: 26, path: 'M11 1 L21 5 L21 14 C21 20 11 25 11 25 C11 25 1 20 1 14 L1 5 Z' },
  lg: { width: 28, height: 32, path: 'M14 1 L27 6 L27 18 C27 26 14 31 14 31 C14 31 1 26 1 18 L1 6 Z' },
}

// Circle sizes
const CIRCLE_SIZES = {
  sm: 14,
  md: 20,
  lg: 26,
}

export default function TrackingBadge({ 
  status, 
  type, 
  size = 'md',
  className = '' 
}: TrackingBadgeProps) {
  
  // Determine colors based on status
  const getColors = () => {
    switch (status) {
      case 'verified':
        return { fill: COLORS.purple, stroke: COLORS.purple, strokeDasharray: 'none' }
      case 'contradiction':
        return { fill: COLORS.orange, stroke: COLORS.orange, strokeDasharray: 'none' }
      case 'stale':
        return { fill: COLORS.yellow, stroke: COLORS.yellow, strokeDasharray: 'none' }
      case 'deviation':
        return { fill: 'transparent', stroke: COLORS.orange, strokeDasharray: 'none' }
      case 'pending':
      default:
        return { fill: 'transparent', stroke: COLORS.grey, strokeDasharray: '3 2' }
    }
  }
  
  const colors = getColors()
  
  // Render shield for verify type
  if (type === 'verify') {
    const shield = SHIELD_PATHS[size]
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <svg 
          width={shield.width} 
          height={shield.height} 
          viewBox={`0 0 ${shield.width} ${shield.height}`}
        >
          <path
            d={shield.path}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={1.5}
            strokeDasharray={colors.strokeDasharray}
          />
        </svg>
      </div>
    )
  }
  
  // Render circle for signal type
  if (type === 'signal') {
    const circleSize = CIRCLE_SIZES[size]
    const radius = (circleSize - 3) / 2
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <svg width={circleSize} height={circleSize} viewBox={`0 0 ${circleSize} ${circleSize}`}>
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={1.5}
            strokeDasharray={colors.strokeDasharray}
          />
        </svg>
      </div>
    )
  }
  
  // Render both - shield with circle badge overlay
  if (type === 'both') {
    const shield = SHIELD_PATHS[size]
    const circleSize = size === 'sm' ? 8 : size === 'md' ? 10 : 12
    
    return (
      <div className={`inline-flex items-center justify-center relative ${className}`}>
        <svg 
          width={shield.width} 
          height={shield.height} 
          viewBox={`0 0 ${shield.width} ${shield.height}`}
        >
          <path
            d={shield.path}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth={1.5}
            strokeDasharray={colors.strokeDasharray}
          />
        </svg>
        {/* Small circle badge in bottom-right */}
        <svg 
          width={circleSize} 
          height={circleSize} 
          viewBox={`0 0 ${circleSize} ${circleSize}`}
          className="absolute"
          style={{ 
            bottom: size === 'sm' ? -2 : 0, 
            right: size === 'sm' ? -3 : -4,
          }}
        >
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={(circleSize - 2) / 2}
            fill={colors.fill}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        </svg>
      </div>
    )
  }
  
  return null
}

// Compact inline version for use in text/cards
export function TrackingBadgeInline({ 
  status, 
  type 
}: { 
  status: TrackingStatus
  type: TrackingType 
}) {
  return <TrackingBadge status={status} type={type} size="sm" />
}