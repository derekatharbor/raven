// src/app/(dashboard)/search/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Plus, ChevronRight, ChevronDown, FileText, Folder,
  FolderOpen, X, MoreHorizontal, Sparkles,
  Upload, Database, Filter, Loader2, Check,
  MessageSquare, Table2, ArrowRight, ExternalLink, Copy,
  PanelRightOpen
} from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/lib/hooks/useAuth'

// Mock document tree
const MOCK_DOCUMENT_TREE = [
  {
    id: 'project-alpha',
    name: 'Project Alpha',
    type: 'folder' as const,
    expanded: true,
    children: [
      { id: 'nvda-10k', name: 'NVIDIA 10-K 2024', type: 'document' as const, date: 'Jan 18, 2024', docType: 'SEC Filing' },
      { id: 'nvda-10q', name: 'NVIDIA 10-Q Q3 2024', type: 'document' as const, date: 'Nov 15, 2024', docType: 'SEC Filing' },
      { id: 'nvda-earnings', name: 'NVIDIA Earnings Call Q3', type: 'document' as const, date: 'Nov 20, 2024', docType: 'Transcript' },
    ]
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    type: 'folder' as const,
    expanded: true,
    children: [
      { id: 'amd-10k', name: 'AMD 10-K 2024', type: 'document' as const, date: 'Feb 26, 2024', docType: 'SEC Filing' },
      { id: 'intc-10k', name: 'Intel 10-K 2024', type: 'document' as const, date: 'Feb 22, 2024', docType: 'SEC Filing' },
      { id: 'market-report', name: 'GPU Market Report 2024', type: 'document' as const, date: 'Mar 15, 2024', docType: 'Report' },
    ]
  },
  {
    id: 'due-diligence',
    name: 'Due Diligence',
    type: 'folder' as const,
    expanded: false,
    children: [
      { id: 'dd-memo', name: 'Investment Memo Draft', type: 'document' as const, date: 'Jan 10, 2025', docType: 'Internal' },
      { id: 'expert-calls', name: 'Expert Network Calls', type: 'document' as const, date: 'Jan 5, 2025', docType: 'Transcript' },
    ]
  },
]

// Document type colors
const docTypeColors: Record<string, { bg: string; text: string }> = {
  'SEC Filing': { bg: '#EFF6FF', text: '#1E40AF' },
  'Transcript': { bg: '#F5F3FF', text: '#5B21B6' },
  'Report': { bg: '#ECFDF5', text: '#065F46' },
  'Internal': { bg: '#FEF3C7', text: '#92400E' },
  'Customer': { bg: '#FCE7F3', text: '#9D174D' },
}

// Mock matrix data
interface MatrixCell {
  value: string
  status: 'complete' | 'loading' | 'error' | 'empty'
  source?: string
}

interface MatrixRow {
  documentId: string
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
  { id: 'col-1', question: 'What was total revenue?' },
  { id: 'col-2', question: 'Key risk factors?' },
  { id: 'col-3', question: 'Growth guidance?' },
]

const MOCK_MATRIX_DATA: MatrixRow[] = [
  {
    documentId: 'nvda-10k',
    documentName: 'NVIDIA 10-K 2024',
    documentType: 'SEC Filing',
    date: 'Jan 18, 2024',
    cells: {
      'col-1': { value: '$60.9 billion, up 126% YoY driven by Data Center segment growth of 217%', status: 'complete', source: 'Page 45' },
      'col-2': { value: 'Supply chain concentration in Taiwan, export restrictions to China, customer concentration with major cloud providers', status: 'complete', source: 'Page 12-15' },
      'col-3': { value: 'Expects continued data center growth driven by AI infrastructure demand, targeting 70%+ gross margins', status: 'complete', source: 'Page 67' },
    }
  },
  {
    documentId: 'amd-10k',
    documentName: 'AMD 10-K 2024',
    documentType: 'SEC Filing',
    date: 'Feb 26, 2024',
    cells: {
      'col-1': { value: '$22.7 billion, down 4% YoY due to gaming segment decline partially offset by data center growth', status: 'complete', source: 'Page 38' },
      'col-2': { value: 'Competition from NVIDIA in AI accelerators, dependence on TSMC manufacturing, geopolitical risks', status: 'complete', source: 'Page 18-22' },
      'col-3': { value: 'Targeting MI300 adoption in enterprise, expects data center to become largest segment by 2025', status: 'complete', source: 'Page 52' },
    }
  },
  {
    documentId: 'intc-10k',
    documentName: 'Intel 10-K 2024',
    documentType: 'SEC Filing',
    date: 'Feb 22, 2024',
    cells: {
      'col-1': { value: '$54.2 billion, down 14% YoY reflecting PC market weakness and data center competition', status: 'complete', source: 'Page 41' },
      'col-2': { value: 'Manufacturing execution risks with Intel 4/3 nodes, market share loss in data center, foundry business uncertainty', status: 'complete', source: 'Page 25-30' },
      'col-3': { value: 'IDM 2.0 strategy focused on regaining process leadership by 2025, cautious near-term outlook', status: 'complete', source: 'Page 8' },
    }
  },
  {
    documentId: 'market-report',
    documentName: 'GPU Market Report 2024',
    documentType: 'Report',
    date: 'Mar 15, 2024',
    cells: {
      'col-1': { value: 'Total addressable market estimated at $150B by 2027, growing at 25% CAGR', status: 'complete', source: 'Section 3.2' },
      'col-2': { value: 'Market concentration risk with top 3 players controlling 95%+ of AI accelerator market', status: 'complete', source: 'Section 4.1' },
      'col-3': { value: 'Enterprise AI adoption expected to drive 40% of growth, followed by cloud infrastructure', status: 'complete', source: 'Section 5.3' },
    }
  },
]

// Mock conversation messages
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
    content: 'Compare the financial performance and risk profiles of NVIDIA, AMD, and Intel based on their latest 10-K filings.'
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `Based on my analysis of the 10-K filings, here are the key findings:

**Financial Performance:**
1. NVIDIA leads with $60.9B revenue (+126% YoY), driven by AI/data center demand
2. Intel at $54.2B but declining (-14% YoY) due to competition
3. AMD at $22.7B with mixed results (-4% YoY)

**Risk Comparison:**
- All three face Taiwan/TSMC concentration risk
- NVIDIA: Export restrictions to China, customer concentration
- AMD: NVIDIA competition in AI, manufacturing dependence
- Intel: Execution risk on new nodes, foundry uncertainty

**Strategic Outlook:**
- NVIDIA positioned strongest for AI infrastructure wave
- AMD gaining in data center, MI300 as key catalyst
- Intel restructuring with IDM 2.0, longer recovery timeline`,
    stepsCompleted: 12
  }
]

// User documents for editor pane dropdown
const MOCK_USER_DOCS = [
  { id: 'doc-1', name: 'Q4 Investment Memo', updatedAt: '2 hours ago' },
  { id: 'doc-2', name: 'Semiconductor Analysis', updatedAt: 'Yesterday' },
  { id: 'doc-3', name: 'Due Diligence Notes', updatedAt: '3 days ago' },
]

type TreeItem = {
  id: string
  name: string
  type: 'folder' | 'document'
  expanded?: boolean
  children?: TreeItem[]
  date?: string
  docType?: string
}

export default function SearchPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [documentTree, setDocumentTree] = useState<TreeItem[]>(MOCK_DOCUMENT_TREE)
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set(['nvda-10k', 'amd-10k', 'intc-10k', 'market-report']))
  const [columns, setColumns] = useState<MatrixColumn[]>(MOCK_COLUMNS)
  const [matrixData, setMatrixData] = useState<MatrixRow[]>(MOCK_MATRIX_DATA)
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [query, setQuery] = useState('')
  const [showEditorPane, setShowEditorPane] = useState(true)
  const [selectedDocForEditor, setSelectedDocForEditor] = useState(MOCK_USER_DOCS[0].id)
  const [editorContent, setEditorContent] = useState('')
  const [showAddColumnModal, setShowAddColumnModal] = useState(false)
  const [newColumnQuestion, setNewColumnQuestion] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const toggleFolder = (folderId: string) => {
    setDocumentTree(prev => prev.map(item => {
      if (item.id === folderId) {
        return { ...item, expanded: !item.expanded }
      }
      return item
    }))
  }

  const toggleDocSelection = (docId: string) => {
    setSelectedDocs(prev => {
      const next = new Set(prev)
      if (next.has(docId)) {
        next.delete(docId)
      } else {
        next.add(docId)
      }
      return next
    })
  }

  const handleAddColumn = () => {
    if (!newColumnQuestion.trim()) return
    
    const newCol: MatrixColumn = {
      id: `col-${Date.now()}`,
      question: newColumnQuestion.trim()
    }
    
    setColumns(prev => [...prev, newCol])
    
    // Add loading cells to all rows
    setMatrixData(prev => prev.map(row => ({
      ...row,
      cells: {
        ...row.cells,
        [newCol.id]: { value: '', status: 'loading' }
      }
    })))
    
    // Simulate extraction
    setTimeout(() => {
      setMatrixData(prev => prev.map(row => ({
        ...row,
        cells: {
          ...row.cells,
          [newCol.id]: { 
            value: `Analysis for "${newColumnQuestion}" extracted from ${row.documentName}. Key insights identified across multiple sections.`, 
            status: 'complete',
            source: 'Multiple sections'
          }
        }
      })))
    }, 2000)
    
    setNewColumnQuestion('')
    setShowAddColumnModal(false)
  }

  const handleCellClick = (row: MatrixRow, colId: string) => {
    const cell = row.cells[colId]
    if (cell?.status === 'complete' && cell.value) {
      // Insert into editor
      setEditorContent(prev => {
        const citation = `[${row.documentName}, ${cell.source}]`
        return prev + (prev ? '\n\n' : '') + cell.value + ' ' + citation
      })
    }
  }

  const handleSubmitQuery = () => {
    if (!query.trim()) return
    
    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query
    }
    setMessages(prev => [...prev, userMsg])
    setQuery('')
    setIsProcessing(true)
    
    // Simulate response
    setTimeout(() => {
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Processing your query across the selected documents. Analysis complete with key findings extracted.',
        stepsCompleted: 8
      }
      setMessages(prev => [...prev, assistantMsg])
      setIsProcessing(false)
    }, 1500)
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="h-screen flex bg-[#FAFAFA]">
      <Sidebar connectedSourceCount={3} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Document Tree Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
              <button className="p-1 rounded hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-600">
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="flex-1 bg-transparent border-none outline-none text-xs text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          
          {/* Tree */}
          <div className="flex-1 overflow-auto p-2">
            {documentTree.map(item => (
              <TreeNode 
                key={item.id} 
                item={item} 
                selectedDocs={selectedDocs}
                onToggleFolder={toggleFolder}
                onToggleDoc={toggleDocSelection}
                level={0}
              />
            ))}
          </div>
          
          {/* Footer actions */}
          <div className="p-3 border-t border-gray-200 space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-sm text-gray-700">
              <Database className="w-4 h-4" />
              Connect Source
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat/Query Section */}
          <div className="border-b border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto p-4">
              {/* Messages */}
              <div className="space-y-4 mb-4 max-h-64 overflow-auto">
                {messages.map(msg => (
                  <div key={msg.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-gray-200' : 'bg-violet-100'
                    }`}>
                      {msg.role === 'user' ? (
                        <span className="text-xs font-medium text-gray-600">You</span>
                      ) : (
                        <Sparkles className="w-4 h-4 text-violet-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {msg.role === 'assistant' && msg.stepsCompleted && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-violet-50 text-violet-700 text-xs font-medium">
                            <Table2 className="w-3 h-3" />
                            Matrix Agent
                          </div>
                          <span className="text-xs text-gray-400">{msg.stepsCompleted} steps completed</span>
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-violet-100">
                      <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Analyzing documents...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Query input */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuery()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
                />
                <button 
                  onClick={handleSubmitQuery}
                  disabled={!query.trim()}
                  className="p-1.5 rounded-lg bg-gray-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors hover:bg-gray-800"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="flex-1 overflow-auto bg-white">
            {/* Table toolbar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer text-xs text-gray-600">
                  <Filter className="w-3.5 h-3.5" />
                  Display
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer text-xs text-gray-600">
                  <Plus className="w-3.5 h-3.5" />
                  Add documents
                </button>
                <button 
                  onClick={() => setShowAddColumnModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer text-xs text-gray-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add columns
                </button>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-medium text-gray-500 w-12">
                      <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                    </th>
                    <th className="sticky left-12 z-10 bg-white px-4 py-3 text-left text-xs font-medium text-gray-500 min-w-[200px]">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        Document
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-28">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 w-32">
                      Document Type
                    </th>
                    {columns.map(col => (
                      <th key={col.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 min-w-[250px]">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                          {col.question}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.map((row) => (
                    <tr key={row.documentId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="sticky left-0 z-10 bg-white px-4 py-3">
                        <input type="checkbox" checked className="rounded border-gray-300 cursor-pointer" readOnly />
                      </td>
                      <td className="sticky left-12 z-10 bg-white px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{row.documentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">{row.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                          style={{ 
                            background: docTypeColors[row.documentType]?.bg || '#F3F4F6',
                            color: docTypeColors[row.documentType]?.text || '#6B7280'
                          }}
                        >
                          {row.documentType}
                        </span>
                      </td>
                      {columns.map(col => {
                        const cell = row.cells[col.id]
                        return (
                          <td key={col.id} className="px-4 py-3">
                            {cell?.status === 'loading' ? (
                              <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span className="text-xs">Extracting...</span>
                              </div>
                            ) : cell?.status === 'complete' ? (
                              <button 
                                onClick={() => handleCellClick(row, col.id)}
                                className="text-left group cursor-pointer"
                              >
                                <p className="text-sm text-gray-700 line-clamp-3 group-hover:text-gray-900">
                                  {cell.value}
                                </p>
                                {cell.source && (
                                  <p className="text-xs text-gray-400 mt-1 group-hover:text-violet-500">
                                    {cell.source} · Click to insert
                                  </p>
                                )}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300">Not in document</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Add row button */}
            <button className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
              <Plus className="w-4 h-4" />
              Add row
            </button>
          </div>
        </div>

        {/* Editor Side Pane */}
        {showEditorPane && (
          <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
            {/* Header with doc selector */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <select
                value={selectedDocForEditor}
                onChange={(e) => setSelectedDocForEditor(e.target.value)}
                className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none cursor-pointer"
              >
                {MOCK_USER_DOCS.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setShowEditorPane(false)}
                  className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100">
              <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-500 text-xs font-medium">Tr</button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-500 font-bold text-sm">B</button>
              <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-500 italic text-sm">I</button>
              <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-500 text-sm">"</button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400">
                <span className="text-xs">&lt;/&gt;</span>
              </button>
              <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer text-gray-400">
                <Table2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Editor content */}
            <div className="flex-1 overflow-auto p-4">
              {editorContent ? (
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{editorContent}</div>
              ) : (
                <p className="text-sm text-gray-400">Begin typing markdown here...</p>
              )}
            </div>
          </div>
        )}
        
        {/* Toggle editor pane button */}
        {!showEditorPane && (
          <button
            onClick={() => setShowEditorPane(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 cursor-pointer text-gray-500"
          >
            <PanelRightOpen className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddColumnModal(false)} />
          <div className="relative w-full max-w-md rounded-xl overflow-hidden bg-white shadow-2xl">
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
              <button
                onClick={() => setShowAddColumnModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddColumn}
                disabled={!newColumnQuestion.trim()}
                className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium cursor-pointer disabled:cursor-not-allowed"
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Tree Node Component
function TreeNode({ 
  item, 
  selectedDocs, 
  onToggleFolder, 
  onToggleDoc,
  level 
}: { 
  item: TreeItem
  selectedDocs: Set<string>
  onToggleFolder: (id: string) => void
  onToggleDoc: (id: string) => void
  level: number
}) {
  const isFolder = item.type === 'folder'
  const isExpanded = item.expanded
  const isSelected = selectedDocs.has(item.id)
  
  return (
    <div>
      <div 
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
          isSelected ? 'bg-violet-50' : 'hover:bg-gray-50'
        }`}
        style={{ paddingLeft: `${8 + level * 12}px` }}
        onClick={() => isFolder ? onToggleFolder(item.id) : onToggleDoc(item.id)}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-gray-400" />
            ) : (
              <Folder className="w-4 h-4 text-gray-400" />
            )}
          </>
        ) : (
          <>
            <div className="w-3.5 h-3.5" />
            <FileText className={`w-4 h-4 ${isSelected ? 'text-violet-500' : 'text-gray-400'}`} />
          </>
        )}
        <span className={`text-xs truncate ${isSelected ? 'text-violet-700 font-medium' : 'text-gray-700'}`}>
          {item.name}
        </span>
        {!isFolder && isSelected && (
          <Check className="w-3 h-3 text-violet-500 ml-auto" />
        )}
      </div>
      
      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map(child => (
            <TreeNode
              key={child.id}
              item={child}
              selectedDocs={selectedDocs}
              onToggleFolder={onToggleFolder}
              onToggleDoc={onToggleDoc}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
