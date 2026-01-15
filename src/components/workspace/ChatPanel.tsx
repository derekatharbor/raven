// src/components/workspace/ChatPanel.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, FileText } from 'lucide-react'

interface ContextBadge {
  id: string
  text: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  context?: ContextBadge
}

interface ChatPanelProps {
  onClose: () => void
  initialContext?: { text: string } | null
}

export default function ChatPanel({ onClose, initialContext }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [context, setContext] = useState<ContextBadge | null>(
    initialContext ? { id: '1', text: initialContext.text } : null
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

  const truncate = (text: string, max: number = 50) => 
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

    // Mock response
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
    <div className="h-full flex flex-col bg-[#F8F8F7] border-l border-[#E8E8E6] w-[380px] relative">
      {/* Input area at TOP */}
      <div className="p-3 border-b border-[#E8E8E6]">
        {/* Context badge */}
        {context && (
          <div className="mb-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-1.5 bg-[#5F6AD2]/10 border border-[#5F6AD2]/20 rounded-md text-sm text-[#5F6AD2] group">
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate max-w-[250px]">{truncate(context.text, 40)}</span>
              <button
                onClick={() => setContext(null)}
                className="p-0.5 rounded hover:bg-[#5F6AD2]/20 cursor-pointer opacity-60 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Text input */}
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your document, @ to reference..."
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-white border border-[#E8E8E6] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5F6AD2] focus:border-transparent placeholder-gray-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() && !context}
            className={`
              absolute bottom-2 right-2 p-1.5 rounded-md cursor-pointer transition-colors
              ${input.trim() || context
                ? 'bg-[#5F6AD2] text-white hover:bg-[#4F5AC2]' 
                : 'bg-gray-200 text-gray-400'
              }
            `}
          >
            <Send className="w-4 h-4" />
          </button>
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
                {/* Context badge on user messages */}
                {msg.role === 'user' && msg.context && (
                  <div className="mb-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#5F6AD2]/10 rounded text-xs text-[#5F6AD2]">
                      <FileText className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{truncate(msg.context.text, 30)}</span>
                    </div>
                  </div>
                )}
                
                <div className={msg.role === 'user' ? 'ml-8' : 'mr-8'}>
                  <div className={`
                    inline-block px-3 py-2 rounded-lg text-sm
                    ${msg.role === 'user' 
                      ? 'bg-[#5F6AD2] text-white' 
                      : 'bg-white border border-[#E8E8E6] text-gray-900'
                    }
                  `}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mr-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E8E8E6] rounded-lg">
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

      {/* Close button - subtle, top right */}
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 p-1.5 rounded hover:bg-black/5 cursor-pointer transition-colors"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}