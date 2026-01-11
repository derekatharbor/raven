// Route: src/components/workspace/DocumentPanel.tsx

'use client'

import { useCallback } from 'react'
import { FileText, FileSpreadsheet, File, Upload } from 'lucide-react'
import type { UploadedDocument } from '@/app/(dashboard)/workspace/page'

interface DocumentPanelProps {
  documents: UploadedDocument[]
  activeDocumentId: string | null
  onDocumentSelect: (docId: string) => void
  onDocumentUpload: (files: File[]) => void
}

const FILE_TYPE_CONFIG: Record<UploadedDocument['type'], { color: string; bg: string; icon: typeof FileText }> = {
  pdf: { color: '#DC2626', bg: '#FEF2F2', icon: FileText },
  docx: { color: '#2563EB', bg: '#EFF6FF', icon: FileText },
  xlsx: { color: '#16A34A', bg: '#F0FDF4', icon: FileSpreadsheet },
  csv: { color: '#16A34A', bg: '#F0FDF4', icon: FileSpreadsheet },
  txt: { color: '#71717A', bg: '#F4F4F5', icon: File },
  md: { color: '#71717A', bg: '#F4F4F5', icon: File },
}

export default function DocumentPanel({
  documents,
  activeDocumentId,
  onDocumentSelect,
  onDocumentUpload,
}: DocumentPanelProps) {
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onDocumentUpload(files)
    }
  }, [onDocumentUpload])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onDocumentUpload(files)
    }
  }, [onDocumentUpload])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Documents
          </span>
          <label className="cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors">
            <Upload className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileInput}
              accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
            />
          </label>
        </div>
      </div>
      
      {/* Document List */}
      <div 
        className="flex-1 overflow-y-auto"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {documents.length === 0 ? (
          <div 
            className="h-full flex flex-col items-center justify-center p-4 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Drop files here</p>
            <p className="text-xs text-gray-400">or click to upload</p>
            <label className="mt-3 cursor-pointer">
              <span className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">
                Browse files
              </span>
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileInput}
                accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md"
              />
            </label>
          </div>
        ) : (
          <div className="py-1">
            {documents.map(doc => {
              const config = FILE_TYPE_CONFIG[doc.type]
              const Icon = config.icon
              const isActive = doc.id === activeDocumentId
              
              return (
                <button
                  key={doc.id}
                  onClick={() => onDocumentSelect(doc.id)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-left cursor-pointer
                    transition-colors
                    ${isActive 
                      ? 'bg-gray-100' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon 
                    className="w-4 h-4 flex-shrink-0" 
                    style={{ color: config.color }}
                    strokeWidth={1.5}
                  />
                  <span 
                    className={`
                      text-[13px] truncate flex-1
                      ${isActive ? 'text-gray-900 font-medium' : 'text-gray-700'}
                    `}
                  >
                    {doc.name}
                  </span>
                  <span 
                    className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{ 
                      color: config.color,
                      backgroundColor: config.bg,
                    }}
                  >
                    {doc.type}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
      
      {/* Drop zone overlay - shows when dragging */}
      {documents.length > 0 && (
        <div 
          className="absolute inset-0 bg-blue-50/80 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center opacity-0 pointer-events-none transition-opacity"
          id="drop-overlay"
        >
          <p className="text-sm text-blue-600 font-medium">Drop files to upload</p>
        </div>
      )}
    </div>
  )
}
