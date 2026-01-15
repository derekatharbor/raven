// src/components/workspace/DocumentPane.tsx

'use client'

import { useState } from 'react'
import { FileText, Plus, ChevronDown, MoreHorizontal, Trash2, Copy, AlertCircle, Search } from 'lucide-react'

interface Document {
  id: string
  name: string
  alerts: number
  updatedAt: string
}

interface DocumentPaneProps {
  workspaceName: string
  documents: Document[]
  activeDocumentId: string | null
  onDocumentSelect: (id: string) => void
  onDocumentCreate: () => void
  onDocumentDelete: (id: string) => void
}

export default function DocumentPane({ workspaceName, documents, activeDocumentId, onDocumentSelect, onDocumentCreate, onDocumentDelete }: DocumentPaneProps) {
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const [search, setSearch] = useState('')

  const filtered = documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
  const today = filtered.filter(d => d.updatedAt === 'today')
  const yesterday = filtered.filter(d => d.updatedAt === 'yesterday')
  const older = filtered.filter(d => !['today', 'yesterday'].includes(d.updatedAt))

  const DocItem = ({ doc }: { doc: Document }) => (
    <button
      onClick={() => onDocumentSelect(doc.id)}
      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ id: doc.id, x: e.clientX, y: e.clientY }) }}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group text-left transition-colors ${activeDocumentId === doc.id ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-black/5'}`}
    >
      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span className="text-[13px] text-gray-900 truncate flex-1">{doc.name}</span>
      {doc.alerts > 0 && <AlertCircle className="w-3.5 h-3.5 text-[#FD7941] flex-shrink-0" />}
      <button
        onClick={(e) => { e.stopPropagation(); setContextMenu({ id: doc.id, x: e.clientX, y: e.clientY }) }}
        className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 cursor-pointer"
      >
        <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
      </button>
    </button>
  )

  const DocGroup = ({ label, docs }: { label: string; docs: Document[] }) => {
    if (docs.length === 0) return null
    return (
      <div className="mb-3">
        <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">{label}</div>
        <div className="space-y-0.5">{docs.map(d => <DocItem key={d.id} doc={d} />)}</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#FBF9F7] border-r border-gray-200 w-[200px]" onClick={() => setContextMenu(null)}>
      {/* Header */}
      <div className="h-11 flex items-center justify-between px-3 border-b border-gray-200">
        <div className="flex items-center gap-1.5 min-w-0">
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-[13px] font-medium text-gray-900 truncate">{workspaceName}</span>
        </div>
        <button onClick={onDocumentCreate} className="p-1 rounded hover:bg-black/5 cursor-pointer" title="New document">
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-white border border-gray-200 rounded">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Filter..." 
            className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400" 
          />
        </div>
      </div>

      {/* Documents */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{search ? 'No matches' : 'No documents'}</p>
          </div>
        ) : (
          <>
            <DocGroup label="Today" docs={today} />
            <DocGroup label="Yesterday" docs={yesterday} />
            <DocGroup label="Older" docs={older} />
          </>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]" 
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => setContextMenu(null)} 
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />Duplicate
          </button>
          <button 
            onClick={() => { onDocumentDelete(contextMenu.id); setContextMenu(null) }} 
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[#FD7941] hover:bg-[#FD7941]/10 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />Delete
          </button>
        </div>
      )}
    </div>
  )
}