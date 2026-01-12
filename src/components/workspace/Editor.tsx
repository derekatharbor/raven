// Route: src/components/workspace/Editor.tsx

'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  Quote, 
  Code,
  X,
  Crosshair,
} from 'lucide-react'
import { useState, useCallback, useRef } from 'react'

interface EditorProps {
  content?: string
  onTrackSelection?: (text: string, from: number, to: number) => void
  onClaimClick?: (claimId: string) => void
}

export default function Editor({ content, onTrackSelection, onClaimClick }: EditorProps) {
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null)
  const [hasSelection, setHasSelection] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your report...',
      }),
    ],
    content: content || `
      <h1>Q4 2024 Investment Memo</h1>
      <p>This document outlines our analysis of NVIDIA Corporation (NVDA) for the Q4 2024 investment committee review.</p>
      
      <h2>Executive Summary</h2>
      <p>NVIDIA continues to dominate the AI accelerator market with an estimated market share of 80%. The company's data center revenue reached $14.5B in Q3, representing 279% year-over-year growth.</p>
      
      <h2>Key Metrics</h2>
      <p>Current market capitalization stands at $1.2 trillion, with a forward P/E ratio of 45x. Gross margins have expanded to 74%, driven by strong demand for H100 GPUs.</p>
      
      <h2>Risk Factors</h2>
      <p>Primary concerns include increasing competition from AMD and Intel, potential supply chain disruptions from TSMC, and regulatory scrutiny in China which accounts for approximately 20% of revenue.</p>
      
      <h2>Recommendation</h2>
      <p>We maintain our OVERWEIGHT rating with a 12-month price target of $650, implying 25% upside from current levels.</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full px-12 py-8',
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, ' ')
      
      if (text.trim().length > 0) {
        // Get selection coordinates
        const { view } = editor
        const start = view.coordsAtPos(from)
        const end = view.coordsAtPos(to)
        
        // Position toolbar above selection, centered
        const left = (start.left + end.left) / 2
        const top = start.top - 50
        
        setSelectionPos({ top, left })
        setHasSelection(true)
      } else {
        setHasSelection(false)
      }
    },
    onBlur: () => {
      // Delay hiding to allow button clicks
      setTimeout(() => {
        if (!toolbarRef.current?.contains(document.activeElement)) {
          setHasSelection(false)
        }
      }, 150)
    },
  })

  const handleTrack = useCallback(() => {
    if (!editor) return
    
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')
    
    if (text.trim()) {
      onTrackSelection?.(text, from, to)
    }
  }, [editor, onTrackSelection])

  const handleSetLink = useCallback(() => {
    if (!editor || !linkUrl) return
    
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl })
      .run()
    
    setLinkUrl('')
    setIsLinkInputOpen(false)
  }, [editor, linkUrl])

  const handleRemoveLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Floating Toolbar - appears on text selection */}
      {hasSelection && selectionPos && (
        <div 
          ref={toolbarRef}
          className="fixed z-50 flex items-center gap-0.5 px-1 py-1 bg-gray-900 rounded-lg shadow-xl"
          style={{
            top: selectionPos.top,
            left: selectionPos.left,
            transform: 'translateX(-50%)',
          }}
        >
          {isLinkInputOpen ? (
            <div className="flex items-center gap-1 px-2">
              <input
                type="url"
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSetLink()}
                className="bg-transparent text-white text-sm outline-none w-48 placeholder-gray-400"
                autoFocus
              />
              <button 
                onClick={handleSetLink}
                className="p-1 text-gray-400 hover:text-white cursor-pointer"
              >
                <LinkIcon className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setIsLinkInputOpen(false)}
                className="p-1 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <>
              {/* Text style dropdown placeholder */}
              <button className="px-2 py-1.5 text-sm text-gray-300 hover:text-white cursor-pointer flex items-center gap-1">
                Aa
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="w-px h-5 bg-gray-700 mx-1" />
              
              {/* Bold */}
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('bold') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bold className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Italic */}
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('italic') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Italic className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Strikethrough */}
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('strike') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Strikethrough className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Underline */}
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('underline') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <UnderlineIcon className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Link */}
              <button
                onClick={() => {
                  if (editor.isActive('link')) {
                    handleRemoveLink()
                  } else {
                    setIsLinkInputOpen(true)
                  }
                }}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('link') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Quote */}
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('blockquote') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Quote className="w-4 h-4" strokeWidth={2} />
              </button>
              
              {/* Code */}
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  editor.isActive('code') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Code className="w-4 h-4" strokeWidth={2} />
              </button>
              
              <div className="w-px h-5 bg-gray-700 mx-1" />
              
              {/* Track - the key feature! */}
              <button
                onClick={handleTrack}
                className="p-1.5 rounded cursor-pointer transition-colors text-cyan-400 hover:text-cyan-300 hover:bg-gray-700"
                title="Track this selection"
              >
                <Crosshair className="w-4 h-4" strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}