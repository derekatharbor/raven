// src/components/workspace/EditorCanvas.tsx

'use client'

import { ReactNode, useEffect } from 'react'

/**
 * EditorCanvas
 * 
 * Wraps the TipTap editor to create a "page floating on canvas" effect.
 * Similar to Word, Google Docs, Notion — the document has boundaries
 * and floats on a subtle background.
 * 
 * Supports both light and dark modes.
 */

interface EditorCanvasProps {
  children: ReactNode
  darkMode?: boolean
  pageWidth?: 'narrow' | 'medium' | 'wide' | 'full'
  className?: string
}

const PAGE_WIDTHS = {
  narrow: 'max-w-2xl',      // 672px - tight, focused
  medium: 'max-w-3xl',      // 768px - default
  wide: 'max-w-4xl',        // 896px - reports
  full: 'max-w-none',       // no limit
}

export default function EditorCanvas({ 
  children, 
  darkMode = false,
  pageWidth = 'medium',
  className = '',
}: EditorCanvasProps) {
  // Inject dark mode styles into document head
  useEffect(() => {
    const styleId = 'raven-editor-theme'
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
    
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }
    
    styleEl.textContent = darkMode ? darkModeStyles : lightModeStyles
    
    return () => {
      // Don't remove on unmount - let it persist
    }
  }, [darkMode])

  return (
    <div 
      className={`
        flex-1 overflow-auto transition-colors duration-200
        ${darkMode 
          ? 'bg-[#1a1a1a]' 
          : 'bg-[#EEECEA]'
        }
        ${className}
      `}
    >
      {/* Centering container with padding */}
      <div className="min-h-full flex justify-center py-8 px-6">
        {/* The "page" */}
        <div 
          className={`
            w-full ${PAGE_WIDTHS[pageWidth]}
            transition-colors duration-200
            ${darkMode 
              ? 'bg-[#232323] shadow-2xl shadow-black/60 border border-[#333]' 
              : 'bg-white shadow-lg shadow-black/8'
            }
            rounded
          `}
        >
          {/* Page content with proper margins */}
          <div 
            className={`
              px-16 py-12 min-h-[600px]
              transition-colors duration-200
              ${darkMode ? 'text-gray-100' : 'text-gray-900'}
            `}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Dark mode editor styles for TipTap/ProseMirror
 */
const darkModeStyles = `
  /* Dark mode - canvas and page */
  .ProseMirror {
    color: #E5E5E5 !important;
    caret-color: #60A5FA;
    outline: none;
  }
  
  .ProseMirror h1 {
    color: #F5F5F5 !important;
  }
  
  .ProseMirror h2,
  .ProseMirror h3,
  .ProseMirror h4 {
    color: #E5E5E5 !important;
  }
  
  .ProseMirror p {
    color: #D4D4D4 !important;
  }
  
  .ProseMirror a {
    color: #60A5FA !important;
  }
  
  .ProseMirror blockquote {
    border-left-color: #525252 !important;
    color: #A3A3A3 !important;
  }
  
  .ProseMirror code {
    background: #3F3F46 !important;
    color: #FCD34D !important;
  }
  
  .ProseMirror pre {
    background: #18181B !important;
  }
  
  .ProseMirror ::selection {
    background: #3B82F6 !important;
    color: white !important;
  }
  
  .ProseMirror hr {
    border-color: #404040 !important;
  }
  
  .ProseMirror ul li::marker,
  .ProseMirror ol li::marker {
    color: #737373 !important;
  }
  
  /* Placeholder text */
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #525252 !important;
  }
  
  /* Claim highlights in dark mode */
  .ProseMirror .claim-verified {
    background: rgba(34, 197, 94, 0.2) !important;
    border-bottom: 2px solid #22C55E !important;
  }
  
  .ProseMirror .claim-pending {
    background: rgba(163, 163, 163, 0.15) !important;
    border-bottom: 2px dashed #737373 !important;
  }
  
  .ProseMirror .claim-stale {
    background: rgba(251, 191, 36, 0.2) !important;
    border-bottom: 2px solid #FBBF24 !important;
  }
  
  .ProseMirror .claim-contradiction {
    background: rgba(239, 68, 68, 0.2) !important;
    border-bottom: 2px solid #EF4444 !important;
  }
`

/**
 * Light mode editor styles for TipTap (default)
 */
const lightModeStyles = `
  /* Light mode - canvas and page */
  .ProseMirror {
    color: #1F2937 !important;
    caret-color: #3B82F6;
    outline: none;
  }
  
  .ProseMirror h1 {
    color: #111827 !important;
  }
  
  .ProseMirror h2,
  .ProseMirror h3,
  .ProseMirror h4 {
    color: #1F2937 !important;
  }
  
  .ProseMirror p {
    color: #374151 !important;
  }
  
  .ProseMirror ::selection {
    background: #DBEAFE !important;
  }
  
  /* Claim highlights in light mode */
  .ProseMirror .claim-verified {
    background: rgba(34, 197, 94, 0.1) !important;
    border-bottom: 2px solid #22C55E !important;
  }
  
  .ProseMirror .claim-pending {
    background: rgba(156, 163, 175, 0.1) !important;
    border-bottom: 2px dashed #9CA3AF !important;
  }
  
  .ProseMirror .claim-stale {
    background: rgba(251, 191, 36, 0.15) !important;
    border-bottom: 2px solid #FBBF24 !important;
  }
  
  .ProseMirror .claim-contradiction {
    background: rgba(239, 68, 68, 0.1) !important;
    border-bottom: 2px solid #EF4444 !important;
  }
`

// Export styles for use elsewhere if needed
export { darkModeStyles, lightModeStyles }