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

// Shield path (for verification)
const SHIELD_PATHS = {
  sm: { width: 16, height: 18, path: 'M8 1 L15 4 L15 10 C15 14 8 17 8 17 C8 17 1 14 1 10 L1 4 Z' },
  md: { width: 22, height: 26, path: 'M11 1 L21 5 L21 14 C21 20 11 25 11 25 C11 25 1 20 1 14 L1 5 Z' },
  lg: { width: 28, height: 32, path: 'M14 1 L27 6 L27 18 C27 26 14 31 14 31 C14 31 1 26 1 18 L1 6 Z' },
}

// Circle sizes
const CIRCLE_SIZES = {
  sm: 16,
  md: 22,
  lg: 28,
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
        return { fill: '#22c55e', stroke: '#22c55e', strokeDasharray: 'none' } // Green
      case 'contradiction':
        return { fill: '#ef4444', stroke: '#ef4444', strokeDasharray: 'none' } // Red
      case 'stale':
        return { fill: '#f59e0b', stroke: '#f59e0b', strokeDasharray: 'none' } // Amber
      case 'deviation':
        return { fill: 'transparent', stroke: '#ef4444', strokeDasharray: 'none' } // Red ring
      case 'pending':
      default:
        return { fill: 'transparent', stroke: '#9ca3af', strokeDasharray: '3 2' } // Dashed grey
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
  
  // Render both (shield + circle side by side)
  if (type === 'both') {
    const shield = SHIELD_PATHS[size]
    const circleSize = CIRCLE_SIZES[size]
    const radius = (circleSize - 3) / 2
    
    return (
      <div className={`inline-flex items-center ${className}`}>
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
        <svg 
          width={circleSize} 
          height={circleSize} 
          viewBox={`0 0 ${circleSize} ${circleSize}`}
          style={{ marginLeft: -4 }}
        >
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