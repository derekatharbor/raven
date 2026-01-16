// src/components/workspace/EditorCanvas.tsx

'use client'

import { ReactNode, useEffect } from 'react'
import { Plus } from 'lucide-react'

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
  onInsertPageBreak?: () => void
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
  onInsertPageBreak,
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
      <div className="min-h-full flex flex-col items-center py-8 px-6">
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

        {/* Add page button - subtle + below the document */}
        {onInsertPageBreak && (
          <button
            onClick={onInsertPageBreak}
            className={`
              group mt-4 mb-8 w-full ${PAGE_WIDTHS[pageWidth]} flex items-center justify-center
              transition-all duration-200 cursor-pointer
            `}
            title="Add page (⌘+Enter)"
          >
            {/* Dashed line with + in center */}
            <div className="flex-1 flex items-center">
              <div className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div 
                className={`
                  mx-4 w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-200
                  ${darkMode 
                    ? 'text-gray-600 group-hover:text-gray-400 group-hover:bg-white/5 border border-gray-700 group-hover:border-gray-600' 
                    : 'text-gray-300 group-hover:text-gray-500 group-hover:bg-white border border-gray-200 group-hover:border-gray-300 group-hover:shadow-sm'
                  }
                `}
              >
                <Plus className="w-4 h-4" />
              </div>
              <div className={`flex-1 h-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          </button>
        )}
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
  
  /* Page break - dark mode */
  .ProseMirror .page-break {
    position: relative;
    height: 48px;
    margin: 32px -64px;
    border: none;
    pointer-events: none;
    user-select: none;
  }
  
  .ProseMirror .page-break::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: repeating-linear-gradient(
      90deg,
      #4b5563 0px,
      #4b5563 4px,
      transparent 4px,
      transparent 8px
    );
  }
  
  .ProseMirror .page-break::after {
    content: 'Page Break';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 2px 12px;
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    background: #232323;
    border-radius: 4px;
  }
  
  .ProseMirror .page-break.ProseMirror-selectednode {
    pointer-events: auto;
  }
  
  .ProseMirror .page-break.ProseMirror-selectednode::before {
    background: repeating-linear-gradient(
      90deg,
      #3b82f6 0px,
      #3b82f6 4px,
      transparent 4px,
      transparent 8px
    );
  }
  
  .ProseMirror .page-break.ProseMirror-selectednode::after {
    color: #60a5fa;
    background: #1e3a5f;
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
  
  /* Page break - light mode */
  .ProseMirror .page-break {
    position: relative;
    height: 48px;
    margin: 32px -64px;
    border: none;
    pointer-events: none;
    user-select: none;
  }
  
  .ProseMirror .page-break::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: repeating-linear-gradient(
      90deg,
      #d1d5db 0px,
      #d1d5db 4px,
      transparent 4px,
      transparent 8px
    );
  }
  
  .ProseMirror .page-break::after {
    content: 'Page Break';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 2px 12px;
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #9ca3af;
    background: white;
    border-radius: 4px;
  }
  
  .ProseMirror .page-break.ProseMirror-selectednode {
    pointer-events: auto;
  }
  
  .ProseMirror .page-break.ProseMirror-selectednode::before {
    background: repeating-linear-gradient(
      90deg,
      #3b82f6 0px,
      #3b82f6 4px,
      transparent 4px,
      transparent 8px
    );
  }
  
  .ProseMirror .page-break.ProseMirror-selectednode::after {
    color: #3b82f6;
    background: #eff6ff;
  }
`

// Export styles for use elsewhere if needed
export { darkModeStyles, lightModeStyles }