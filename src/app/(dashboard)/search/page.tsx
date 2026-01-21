// src/app/(dashboard)/search/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, ChevronDown, FileText, X, MoreHorizontal, GripVertical,
  Filter, Loader2, MessageSquare, ArrowUp, Copy, PanelRightOpen, AlignJustify, ExternalLink, Table2, List
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'

// Document type colors - MUTED enterprise palette
const docTypeColors: Record<string, { bg: string; text: string }> = {
  'Financials': { bg: '#EEF2F6', text: '#4B5C6B' },
  'Marketing Materials': { bg: '#FDF6E3', text: '#8B7355' },
  'Product': { bg: '#FAECEC', text: '#8B6B6B' },
  'Customer': { bg: '#E8F4EF', text: '#5B7B6B' },
  'Public Report': { bg: '#F3F0F7', text: '#6B5B7B' },
}

interface MatrixCell {
  value: string
  status: 'complete' | 'loading' | 'empty'
}

interface MatrixRow {
  id: string
  documentName: string
  documentType: string
  date: string
  cells: Record<string, MatrixCell>
}

interface MatrixColumn {
  id: string
  question: string
}

const MOCK_COLUMNS: MatrixColumn[] = [
  { id: 'col-1', question: 'Investment Risks' },
  { id: 'col-2', question: 'Market Considerations' },
]

const MOCK_MATRIX_DATA: MatrixRow[] = [
  {
    id: 'doc-1',
    documentName: 'FY2024 P&L',
    documentType: 'Financials',
    date: 'Jan 18, 2024',
    cells: {
      'col-1': { value: 'There have been increasing costs related to...', status: 'complete' },
      'col-2': { value: 'Not in document, click to view explanation', status: 'empty' },
    }
  },
  {
    id: 'doc-2',
    documentName: 'Project Alpha CIM',
    documentType: 'Marketing Materials',
    date: 'Apr 29, 2024',
    cells: {
      'col-1': { value: 'Risk factors that are not detailed in the CIM...', status: 'complete' },
      'col-2': { value: 'Despite the growing TAM described within th...', status: 'complete' },
    }
  },
  {
    id: 'doc-3',
    documentName: 'Product Overview Alpha',
    documentType: 'Product',
    date: 'Feb 26, 2024',
    cells: {
      'col-1': { value: 'Current product lacks detail regarding the mo...', status: 'complete' },
      'col-2': { value: 'Not in document, click to view explanation', status: 'empty' },
    }
  },
  {
    id: 'doc-4',
    documentName: 'Product Roadmap',
    documentType: 'Product',
    date: 'Feb 26, 2024',
    cells: {
      'col-1': { value: 'Several integrations listed within the roadmap...', status: 'complete' },
      'col-2': { value: 'Roadmap details particularities that align with...', status: 'complete' },
    }
  },
  {
    id: 'doc-5',
    documentName: 'Expert Calls Project Alpha',
    documentType: 'Customer',
    date: 'Mar 12, 2024',
    cells: {
      'col-1': { value: 'Experts hesitate on defensibility of the techno...', status: 'complete' },
      'col-2': { value: 'Experts differ in opinion regarding the growth...', status: 'complete' },
    }
  },
  {
    id: 'doc-6',
    documentName: 'Customer Reference Calls',
    documentType: 'Customer',
    date: 'Mar 18, 2024',
    cells: {
      'col-1': { value: 'Common negative feedback across customer...', status: 'complete' },
      'col-2': { value: 'Customers list several tailwinds including the...', status: 'complete' },
    }
  },
  {
    id: 'doc-7',
    documentName: 'Market Report',
    documentType: 'Public Report',
    date: 'Mar 30, 2024',
    cells: {
      'col-1': { value: 'Headwinds raised across this report include...', status: 'complete' },
      'col-2': { value: 'The TAM is estimated at approximately $72B...', status: 'complete' },
    }
  },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  stepsCompleted?: number
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'We are meeting the management team of Project Alpha tomorrow. Draft some key DD questions based on your assessment of these documents.'
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `Key Questions for Meeting with Project Alpha

1. What are the key drivers behind the recent changes in your cost structure?
2. How do you plan to address the challenge of supplier concentration risk?
3. What are the specific metrics you use to measure customer engagement and satisfaction?
4. Can you detail the steps being taken to ensure smooth leadership transitions?
5. What is your strategy for leveraging technology to stay ahead of market trends?`,
    stepsCompleted: 12
  }
]

const MOCK_USER_DOCS = [
  { id: 'doc-1', name: 'Q4 Investment Memo' },
  { id: 'doc-2', name: 'Semiconductor Analysis' },
  { id: 'doc-3', name: 'Due Diligence Notes' },
]

export default function SearchPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [columns, setColumns] = useState<MatrixColumn[]>(MOCK_COLUMNS)
  const [matrixData, setMatrixData] = useState<MatrixRow[]>(MOCK_MATRIX_DATA)
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [query, setQuery] = useState('')
  const [showEditorPane, setShowEditorPane] = useState(false)
  const [editorWidth, setEditorWidth] = useState(400)
  const [selectedDocForEditor, setSelectedDocForEditor] = useState(MOCK_USER_DOCS[0].id)
  const [editorContent, setEditorContent] = useState('')
  const [showAddColumnModal, setShowAddColumnModal] = useState(false)
  const [newColumnQuestion, setNewColumnQuestion] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = window.innerWidth - e.clientX
      setEditorWidth(Math.max(300, Math.min(600, newWidth)))
    }
    
    const handleMouseUp = () => setIsResizing(false)
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const handleAddColumn = () => {
    if (!newColumnQuestion.trim()) return
    
    const newCol: MatrixColumn = {
      id: `col-${Date.now()}`,
      question: newColumnQuestion.trim()
    }
    
    setColumns(prev => [...prev, newCol])
    setMatrixData(prev => prev.map(row => ({
      ...row,
      cells: { ...row.cells, [newCol.id]: { value: '', status: 'loading' } }
    })))
    
    setTimeout(() => {
      setMatrixData(prev => prev.map(row => ({
        ...row,
        cells: {
          ...row.cells,
          [newCol.id]: { value: `Analysis extracted from ${row.documentName}...`, status: 'complete' }
        }
      })))
    }, 2000)
    
    setNewColumnQuestion('')
    setShowAddColumnModal(false)
  }

  const handleCellClick = (row: MatrixRow, colId: string) => {
    const cell = row.cells[colId]
    if (cell?.status === 'complete' && cell.value && !cell.value.includes('Not in document')) {
      setEditorContent(prev => prev + (prev ? '\n\n' : '') + cell.value)
      setShowEditorPane(true)
    }
  }

  const handleSubmitQuery = () => {
    if (!query.trim()) return
    
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', content: query }])
    setQuery('')
    setIsProcessing(true)
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Analysis complete. Key findings extracted from the selected documents.',
        stepsCompleted: 8
      }])
      setIsProcessing(false)
    }, 1500)
  }

  if (authLoading || !user) return null

  return (
    <div className="h-screen flex bg-white">
      <Sidebar connectedSourceCount={3} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">First Screen Project Alpha</span>
            <span className="text-xs text-gray-400">Saved at 10:49am</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditorPane(!showEditorPane)}
              className={`p-2 rounded transition-colors cursor-pointer ${showEditorPane ? 'bg-gray-100' : 'hover:bg-gray-50'} text-gray-500`}
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat */}
            <div className="border-b border-gray-200">
              <div className="max-w-3xl mx-auto px-6 py-5">
                <div className="space-y-5 mb-5">
                  {messages.map(msg => (
                    <div key={msg.id} className="flex gap-3">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-blue-600">
                          <AlignJustify className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          {msg.role === 'user' ? 'You' : 'Matrix Agent'}
                        </div>
                        {msg.role === 'assistant' && msg.stepsCompleted && (
                          <button className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer text-sm text-gray-600">
                            {msg.stepsCompleted} steps completed
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-blue-600">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                      <span className="text-sm text-gray-500 self-center">Analyzing...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200">
                  <MessageSquare className="w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuery()}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  />
                  <button onClick={handleSubmitQuery} disabled={!query.trim()} className="p-1 text-gray-300 hover:text-gray-500 disabled:text-gray-200 cursor-pointer">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                  <List className="w-4 h-4" />
                  Display
                </button>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                    <FileText className="w-4 h-4" />
                    Add documents
                  </button>
                  <button onClick={() => setShowAddColumnModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                    <Plus className="w-4 h-4" />
                    Add columns
                  </button>
                </div>
              </div>
              
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="w-10 px-3 py-2.5 text-left"><input type="checkbox" className="rounded border-gray-300 cursor-pointer" /></th>
                    <th className="w-10 px-1 py-2.5"></th>
                    <th className="min-w-[180px] px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Document</div>
                    </th>
                    <th className="w-28 px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-1.5"><span className="text-gray-400">#</span>Date</div>
                    </th>
                    <th className="w-40 px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Document Type</div>
                    </th>
                    {columns.map(col => (
                      <th key={col.id} className="min-w-[220px] px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1.5"><span className="text-gray-400">=</span>{col.question}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-3 py-2.5"><input type="checkbox" className="rounded border-gray-300 cursor-pointer" /></td>
                      <td className="px-1 py-2.5">
                        <div className="flex items-center gap-0.5 text-gray-400">
                          <span className="text-xs w-4">{idx + 1}</span>
                          <GripVertical className="w-3 h-3 cursor-grab" />
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{row.documentName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-600">{row.date}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium" style={{ background: docTypeColors[row.documentType]?.bg, color: docTypeColors[row.documentType]?.text }}>
                          {row.documentType}
                        </span>
                      </td>
                      {columns.map(col => {
                        const cell = row.cells[col.id]
                        const isEmpty = cell?.status === 'empty' || cell?.value?.includes('Not in document')
                        return (
                          <td key={col.id} className="px-3 py-2.5">
                            {cell?.status === 'loading' ? (
                              <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span className="text-xs">Extracting...</span>
                              </div>
                            ) : (
                              <button onClick={() => handleCellClick(row, col.id)} className={`text-left text-sm cursor-pointer ${isEmpty ? 'text-gray-400 italic' : 'text-gray-700 hover:text-gray-900'}`}>
                                {cell?.value}
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <button className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer">
                <Plus className="w-4 h-4" />Add row
              </button>
            </div>
          </div>

          {/* Editor Pane */}
          {showEditorPane && (
            <>
              <div onMouseDown={() => setIsResizing(true)} className="w-1 bg-gray-200 hover:bg-blue-300 cursor-col-resize" />
              <div className="flex flex-col bg-white" style={{ width: editorWidth }}>
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
                  <select value={selectedDocForEditor} onChange={(e) => setSelectedDocForEditor(e.target.value)} className="text-sm font-medium text-gray-900 bg-transparent outline-none cursor-pointer">
                    {MOCK_USER_DOCS.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                  </select>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400"><Copy className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400"><MoreHorizontal className="w-4 h-4" /></button>
                    <button onClick={() => setShowEditorPane(false)} className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 text-gray-500">
                  <button className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-xs">Tr</button>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer font-bold text-sm">B</button>
                  <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer italic text-sm">I</button>
                  <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-sm">"</button>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-xs">&lt;/&gt;</button>
                  <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400"><ExternalLink className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400"><Table2 className="w-3.5 h-3.5" /></button>
                  <div className="w-px h-4 bg-gray-200 mx-1" />
                  <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400"><List className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {editorContent ? (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{editorContent}</div>
                  ) : (
                    <p className="text-sm text-gray-400">Begin typing markdown here...</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showAddColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddColumnModal(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Column</h2>
              <p className="text-sm text-gray-500 mt-1">Ask a question to extract from all documents</p>
            </div>
            <div className="px-6 py-4">
              <input
                type="text"
                value={newColumnQuestion}
                onChange={(e) => setNewColumnQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                placeholder="e.g., What is the company's competitive advantage?"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-gray-400 outline-none text-sm"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button onClick={() => setShowAddColumnModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer">Cancel</button>
              <button onClick={handleAddColumn} disabled={!newColumnQuestion.trim()} className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium cursor-pointer disabled:cursor-not-allowed">Add Column</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}