// Path: src/components/ui/LoadingSpinner.tsx
// src/components/ui/LoadingSpinner.tsx
// Reusable loading spinner with optional message

'use client'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  light?: boolean
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false,
  light = true,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[2px]',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-[3px]',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div 
        className={`
          ${sizeClasses[size]}
          ${light ? 'border-zinc-300 border-t-zinc-600' : 'border-zinc-700 border-t-zinc-400'}
          rounded-full animate-spin
        `}
      />
      {message && (
        <span className={`text-sm ${light ? 'text-zinc-500' : 'text-zinc-400'}`}>
          {message}
        </span>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className={`h-screen flex items-center justify-center ${light ? 'bg-[#FBF9F7]' : 'bg-[#09090B]'}`}>
        {spinner}
      </div>
    )
  }

  return spinner
}

// Simple inline spinner (no message)
export function InlineSpinner({ 
  size = 'sm',
  light = true 
}: { 
  size?: 'sm' | 'md'
  light?: boolean 
}) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5 border-[1.5px]',
    md: 'w-4 h-4 border-2',
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        ${light ? 'border-zinc-300 border-t-zinc-600' : 'border-zinc-600 border-t-zinc-300'}
        rounded-full animate-spin
      `}
    />
  )
}
