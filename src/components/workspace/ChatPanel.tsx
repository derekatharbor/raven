// src/components/workspace/ChatPanel.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Globe, FileText } from 'lucide-react'

interface ContextBadge {
  id: string
  text: string
  type: 'selection' | 'claim' | 'document'
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  contexts?: ContextBadge[]
}

interface ChatPanelProps {
  onClose: () => void
  initialContext?: { text: string; type: 'selection' | 'claim' | 'document' } | null
}

export default function ChatPanel({ onClose, initialContext }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [contexts, setContexts] = useState<ContextBadge[]>(
    initialContext 
      ? [{ id: '1', text: initialContext.text, type: initialContext.type }] 
      : []
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

  const removeContext = (id: string) => {
    setContexts(prev => prev.filter(c => c.id !== id))
  }

  const truncateText = (text: string, maxLength: number = 40) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleSubmit = async () => {
    if (!input.trim() && contexts.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      contexts: contexts.length > 0 ? [...contexts] : undefined,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setContexts([])
    setIsLoading(true)

    // TODO: Wire up to actual AI
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'ll help you verify that. Let me search for relevant sources...',
      }
      setMessages(prev => [...prev, assistantMessage])
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
    <div className="h-full flex flex-col bg-white border-l border-gray-200 w-[350px]">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900">Ask Raven</span>
        <button 
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Globe className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Ask about your document</p>
            <p className="text-xs text-gray-400">@ to reference claims</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' && msg.contexts && msg.contexts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {msg.contexts.map(ctx => (
                      <div 
                        key={ctx.id}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                      >
                        <FileText className="w-3 h-3 text-gray-500" />
                        <span className="truncate max-w-[200px]">{truncateText(ctx.text)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={`${msg.role === 'user' ? 'ml-8' : 'mr-8'}`}>
                  <div className={`
                    inline-block px-3 py-2 rounded-lg text-sm max-w-full
                    ${msg.role === 'user' 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-900'
                    }
                  `}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mr-8">
                <div className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg">
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

      {/* Input */}
      <div className="border-t border-gray-100 p-3">
        {contexts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {contexts.map(ctx => (
              <div 
                key={ctx.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 group"
              >
                <FileText className="w-3 h-3 text-gray-500" />
                <span className="truncate max-w-[150px]">{truncateText(ctx.text, 30)}</span>
                <button
                  onClick={() => removeContext(ctx.id)}
                  className="p-0.5 rounded hover:bg-gray-200 cursor-pointer opacity-50 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your document, @ to reference..."
            rows={1}
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() && contexts.length === 0}
            className={`
              p-2 rounded-lg cursor-pointer transition-colors flex-shrink-0
              ${input.trim() || contexts.length > 0
                ? 'bg-gray-900 text-white hover:bg-gray-800' 
                : 'bg-gray-200 text-gray-400'
              }
            `}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
