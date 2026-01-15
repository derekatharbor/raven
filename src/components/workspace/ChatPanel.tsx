// src/components/workspace/ChatPanel.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, FileText } from 'lucide-react'

interface ContextBadge {
  id: string
  text: string
  lineRange?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  context?: ContextBadge
}

interface ChatPanelProps {
  onClose: () => void
  initialContext?: { text: string; lineRange?: string } | null
}

export default function ChatPanel({ onClose, initialContext }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [context, setContext] = useState<ContextBadge | null>(
    initialContext ? { id: '1', text: initialContext.text, lineRange: initialContext.lineRange } : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const truncate = (text: string, max: number = 35) => 
    text.length <= max ? text : text.substring(0, max) + '...'

  const handleSubmit = () => {
    if (!input.trim() && !context) return

    const msg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      context: context || undefined,
    }

    setMessages(prev => [...prev, msg])
    setInput('')
    setContext(null)
    setIsLoading(true)

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'ll search for sources to verify that claim. One moment...',
      }])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#FBF9F7] border-l border-gray-200 w-[380px] relative">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-2 right-2 p-1.5 rounded hover:bg-black/5 cursor-pointer z-10">
        <X className="w-4 h-4 text-gray-400" />
      </button>

      {/* Input container at TOP - badge + textarea together */}
      <div className="p-3 border-b border-gray-200">
        <div className="bg-white border-2 border-[#5F6AD2] rounded-lg overflow-hidden">
          {/* Context badge INSIDE the input container */}
          {context && (
            <div className="px-3 pt-3 pb-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-1.5 bg-[#5F6AD2]/10 border border-[#5F6AD2]/30 rounded-md text-sm text-[#5F6AD2]">
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate max-w-[240px]">
                  {truncate(context.text)}
                  {context.lineRange && <span className="opacity-70"> ({context.lineRange})</span>}
                </span>
                <button onClick={() => setContext(null)} className="p-0.5 rounded hover:bg-[#5F6AD2]/20 cursor-pointer ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className="relative px-3 pb-3 pt-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your document, @ to reference..."
              rows={3}
              className="w-full text-sm bg-transparent resize-none focus:outline-none placeholder-gray-400"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() && !context}
              className={`absolute bottom-3 right-3 p-2 rounded-lg cursor-pointer transition-colors ${input.trim() || context ? 'bg-[#5F6AD2] text-white hover:bg-[#4F5AC2]' : 'bg-gray-200 text-gray-400'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Ask a question about your selection
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' && msg.context && (
                  <div className="mb-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#5F6AD2]/10 rounded text-xs text-[#5F6AD2]">
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">
                        {truncate(msg.context.text, 25)}
                        {msg.context.lineRange && <span className="opacity-70"> ({msg.context.lineRange})</span>}
                      </span>
                    </div>
                  </div>
                )}
                <div className={msg.role === 'user' ? 'ml-8' : 'mr-8'}>
                  <div className={`inline-block px-3 py-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-[#5F6AD2] text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mr-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}