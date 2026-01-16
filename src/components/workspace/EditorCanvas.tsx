// src/components/workspace/EditorCanvas.tsx

'use client'

import { ReactNode } from 'react'

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
  return (
    <div 
      className={`
        flex-1 overflow-auto
        ${darkMode 
          ? 'bg-[#1E1E1E]' 
          : 'bg-[#F0EFED]'
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
            ${darkMode 
              ? 'bg-[#282828] shadow-2xl shadow-black/50' 
              : 'bg-white shadow-lg shadow-black/5'
            }
            rounded-sm
          `}
        >
          {/* Page content with proper margins */}
          <div 
            className={`
              px-16 py-12
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
 * Dark mode editor styles for TipTap
 * Apply these to your TipTap editor when darkMode is true
 */
export const darkModeEditorStyles = `
  .ProseMirror {
    color: #E5E5E5;
    caret-color: #60A5FA;
  }
  
  .ProseMirror h1,
  .ProseMirror h2,
  .ProseMirror h3 {
    color: #F5F5F5;
  }
  
  .ProseMirror p {
    color: #D4D4D4;
  }
  
  .ProseMirror a {
    color: #60A5FA;
  }
  
  .ProseMirror blockquote {
    border-left-color: #525252;
    color: #A3A3A3;
  }
  
  .ProseMirror code {
    background: #3F3F46;
    color: #FCD34D;
  }
  
  .ProseMirror pre {
    background: #18181B;
  }
  
  .ProseMirror ::selection {
    background: #3B82F6;
    color: white;
  }
  
  /* Claim highlights in dark mode */
  .ProseMirror .claim-verified {
    background: rgba(34, 197, 94, 0.2);
    border-bottom: 2px solid #22C55E;
  }
  
  .ProseMirror .claim-pending {
    background: rgba(163, 163, 163, 0.15);
    border-bottom: 2px dashed #737373;
  }
  
  .ProseMirror .claim-stale {
    background: rgba(251, 191, 36, 0.2);
    border-bottom: 2px solid #FBBF24;
  }
  
  .ProseMirror .claim-contradiction {
    background: rgba(239, 68, 68, 0.2);
    border-bottom: 2px solid #EF4444;
  }
`

/**
 * Light mode editor styles for TipTap (default)
 */
export const lightModeEditorStyles = `
  .ProseMirror {
    color: #1F2937;
    caret-color: #3B82F6;
  }
  
  .ProseMirror h1,
  .ProseMirror h2,
  .ProseMirror h3 {
    color: #111827;
  }
  
  .ProseMirror p {
    color: #374151;
  }
  
  .ProseMirror ::selection {
    background: #DBEAFE;
  }
  
  /* Claim highlights in light mode */
  .ProseMirror .claim-verified {
    background: rgba(34, 197, 94, 0.1);
    border-bottom: 2px solid #22C55E;
  }
  
  .ProseMirror .claim-pending {
    background: rgba(156, 163, 175, 0.1);
    border-bottom: 2px dashed #9CA3AF;
  }
  
  .ProseMirror .claim-stale {
    background: rgba(251, 191, 36, 0.15);
    border-bottom: 2px solid #FBBF24;
  }
  
  .ProseMirror .claim-contradiction {
    background: rgba(239, 68, 68, 0.1);
    border-bottom: 2px solid #EF4444;
  }
`
