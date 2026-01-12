// Route: src/components/workspace/TrackingBadge.tsx

'use client'

import { Shield, Radar } from 'lucide-react'

type TrackingStatus = 'verified' | 'pending' | 'stale' | 'attention'
type TrackingType = 'verify' | 'signal' | 'both'

interface TrackingBadgeProps {
  status: TrackingStatus
  type: TrackingType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Hexagon SVG path for different sizes
const HEXAGON_PATHS = {
  sm: { width: 20, height: 22, path: 'M10 1 L18.5 5.5 L18.5 16.5 L10 21 L1.5 16.5 L1.5 5.5 Z' },
  md: { width: 28, height: 32, path: 'M14 2 L26 8 L26 24 L14 30 L2 24 L2 8 Z' },
  lg: { width: 36, height: 40, path: 'M18 2 L34 10 L34 30 L18 38 L2 30 L2 10 Z' },
}

export default function TrackingBadge({ 
  status, 
  type, 
  size = 'md',
  className = '' 
}: TrackingBadgeProps) {
  const hex = HEXAGON_PATHS[size]
  
  // Status determines the hexagon style
  const statusStyles = {
    verified: {
      fill: '#1a1a1a',
      stroke: '#1a1a1a',
      strokeDasharray: 'none',
      iconColor: '#ffffff',
    },
    pending: {
      fill: 'transparent',
      stroke: '#9ca3af',
      strokeDasharray: '4 2',
      iconColor: '#9ca3af',
    },
    stale: {
      fill: 'transparent',
      stroke: '#9ca3af',
      strokeDasharray: 'none',
      iconColor: '#9ca3af',
    },
    attention: {
      fill: '#fef2f2',
      stroke: '#ef4444',
      strokeDasharray: 'none',
      iconColor: '#ef4444',
    },
  }
  
  const style = statusStyles[status]
  
  // Icon sizes based on badge size
  const iconSize = {
    sm: 10,
    md: 14,
    lg: 18,
  }[size]
  
  // Calculate center position for icon
  const centerX = hex.width / 2
  const centerY = hex.height / 2
  
  // Render the appropriate icon(s) based on type
  const renderIcon = () => {
    const iconProps = {
      width: iconSize,
      height: iconSize,
      color: style.iconColor,
      strokeWidth: 2,
    }
    
    if (type === 'verify') {
      return (
        <Shield 
          {...iconProps} 
          style={{ 
            position: 'absolute', 
            left: centerX - iconSize / 2, 
            top: centerY - iconSize / 2 
          }} 
        />
      )
    }
    
    if (type === 'signal') {
      return (
        <Radar 
          {...iconProps} 
          style={{ 
            position: 'absolute', 
            left: centerX - iconSize / 2, 
            top: centerY - iconSize / 2 
          }} 
        />
      )
    }
    
    // Both - show combined icon or stacked
    if (type === 'both') {
      const smallerSize = iconSize * 0.7
      return (
        <>
          <Shield 
            width={smallerSize}
            height={smallerSize}
            color={style.iconColor}
            strokeWidth={2}
            style={{ 
              position: 'absolute', 
              left: centerX - smallerSize / 2 - 2, 
              top: centerY - smallerSize / 2 
            }} 
          />
          <Radar 
            width={smallerSize}
            height={smallerSize}
            color={style.iconColor}
            strokeWidth={2}
            style={{ 
              position: 'absolute', 
              left: centerX - smallerSize / 2 + 2, 
              top: centerY - smallerSize / 2 
            }} 
          />
        </>
      )
    }
    
    return null
  }
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: hex.width, height: hex.height }}
    >
      <svg 
        width={hex.width} 
        height={hex.height} 
        viewBox={`0 0 ${hex.width} ${hex.height}`}
        className="absolute inset-0"
      >
        <path
          d={hex.path}
          fill={style.fill}
          stroke={style.stroke}
          strokeWidth={1.5}
          strokeDasharray={style.strokeDasharray}
        />
      </svg>
      {renderIcon()}
    </div>
  )
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
