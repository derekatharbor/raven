// src/app/(dashboard)/search/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, ChevronDown, ChevronRight, FileText, X, MoreHorizontal, GripVertical,
  Loader2, MessageSquare, ArrowUp, Copy, PanelRightOpen, ExternalLink, Table2, List,
  CheckCircle2, AlertCircle, Eye, Link2, Sparkles, BookOpen, Quote, Info
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

// Cell interface - the core unit of extracted information
interface Cell {
  id: string
  value: string
  status: 'complete' | 'loading' | 'empty' | 'error'
  
  // Citation layer
  sourceDocId: string
  sourceLocation?: string      // "Page 12, Paragraph 3"
  sourceSnippet?: string       // Actual quoted text
  
  // Transparency layer
  reasoning?: string           // How Ranger arrived at this
  confidence?: number          // 0-1 score
  relatedCells?: string[]      // Cross-references
  
  // Verification
  verified?: boolean
  verifiedBy?: string
}

interface MatrixRow {
  id: string
  documentName: string
  documentType: string
  date: string
  cells: Record<string, Cell>
}

interface MatrixColumn {
  id: string
  question: string
}

// Source pill in chat responses
interface SourceReference {
  cellId: string
  label: string  // [1], [2], etc.
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SourceReference[]
  stepsCompleted?: number
  isSearching?: boolean
}

// Mock data with full cell structure
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
      'col-1': { 
        id: 'cell-1-1',
        value: 'There have been increasing costs related to raw materials and supply chain disruptions, with a 23% YoY increase in COGS.',
        status: 'complete',
        sourceDocId: 'doc-1',
        sourceLocation: 'Page 12, Section 3.2',
        sourceSnippet: '"Cost of goods sold increased by 23% year-over-year, primarily driven by elevated raw material costs and ongoing supply chain challenges affecting procurement timelines."',
        reasoning: 'Identified as investment risk due to presence in Risk Factors section and explicit mention of cost increases impacting margins.',
        confidence: 0.92,
        verified: true,
        verifiedBy: 'Sarah Chen'
      },
      'col-2': { 
        id: 'cell-1-2',
        value: 'Not found in document',
        status: 'empty',
        sourceDocId: 'doc-1',
        reasoning: 'Searched for market considerations, competitive positioning, and TAM references. No relevant content found in this financial document.',
        confidence: 0.88
      },
    }
  },
  {
    id: 'doc-2',
    documentName: 'Project Alpha CIM',
    documentType: 'Marketing Materials',
    date: 'Apr 29, 2024',
    cells: {
      'col-1': { 
        id: 'cell-2-1',
        value: 'Risk factors not detailed in the CIM include regulatory exposure in EU markets and dependency on three key enterprise clients representing 67% of ARR.',
        status: 'complete',
        sourceDocId: 'doc-2',
        sourceLocation: 'Page 8, Customer Concentration',
        sourceSnippet: '"Top three enterprise customers represent approximately 67% of annual recurring revenue as of Q4 2023."',
        reasoning: 'Customer concentration identified as risk factor. Cross-referenced with industry benchmarks where >50% concentration is flagged as elevated risk.',
        confidence: 0.89,
        relatedCells: ['cell-6-1']
      },
      'col-2': { 
        id: 'cell-2-2',
        value: 'Despite the growing TAM ($4.2B by 2027), competition is intensifying with 12 new entrants in the past 18 months.',
        status: 'complete',
        sourceDocId: 'doc-2',
        sourceLocation: 'Page 15, Market Analysis',
        sourceSnippet: '"The total addressable market is projected to reach $4.2 billion by 2027, representing a 18% CAGR. However, the competitive landscape has evolved significantly with twelve new market entrants since Q2 2022."',
        reasoning: 'Market consideration identified from dedicated Market Analysis section. Extracted both opportunity (TAM growth) and risk (competition).',
        confidence: 0.94
      },
    }
  },
  {
    id: 'doc-3',
    documentName: 'Product Overview Alpha',
    documentType: 'Product',
    date: 'Feb 26, 2024',
    cells: {
      'col-1': { 
        id: 'cell-3-1',
        value: 'Current product lacks detail regarding the moat and defensibility. No patents filed, open-source alternatives exist.',
        status: 'complete',
        sourceDocId: 'doc-3',
        sourceLocation: 'Page 4, Technology Stack',
        sourceSnippet: '"Built on modern cloud-native architecture utilizing industry-standard frameworks and open-source components."',
        reasoning: 'Risk inferred from absence of IP protection mentions and explicit use of open-source. Verified no patent filings in USPTO database.',
        confidence: 0.78
      },
      'col-2': { 
        id: 'cell-3-2',
        value: 'Not found in document',
        status: 'empty',
        sourceDocId: 'doc-3',
        reasoning: 'Product document focuses on features and technical specifications. No market analysis content present.',
        confidence: 0.91
      },
    }
  },
  {
    id: 'doc-4',
    documentName: 'Product Roadmap',
    documentType: 'Product',
    date: 'Feb 26, 2024',
    cells: {
      'col-1': { 
        id: 'cell-4-1',
        value: 'Several integrations listed within the roadmap have uncertain timelines, with 4 of 7 marked as "TBD" for delivery.',
        status: 'complete',
        sourceDocId: 'doc-4',
        sourceLocation: 'Page 6, Integration Roadmap',
        sourceSnippet: '"Salesforce Integration: Q3 2024 | SAP Integration: TBD | Workday Integration: TBD | Oracle Integration: TBD | HubSpot Integration: Q4 2024 | Slack Integration: Q2 2024 | Teams Integration: TBD"',
        reasoning: 'Execution risk identified from roadmap analysis. 57% of planned integrations lack committed timelines.',
        confidence: 0.95
      },
      'col-2': { 
        id: 'cell-4-2',
        value: 'Roadmap details particularities that align with enterprise buyer requirements, including SOC2 compliance by Q3.',
        status: 'complete',
        sourceDocId: 'doc-4',
        sourceLocation: 'Page 3, Compliance Milestones',
        sourceSnippet: '"SOC2 Type II certification targeted for Q3 2024, enabling enterprise sales motion."',
        reasoning: 'Market consideration: compliance requirements are table-stakes for enterprise sales. Timeline alignment is positive signal.',
        confidence: 0.87
      },
    }
  },
  {
    id: 'doc-5',
    documentName: 'Expert Calls Project Alpha',
    documentType: 'Customer',
    date: 'Mar 12, 2024',
    cells: {
      'col-1': { 
        id: 'cell-5-1',
        value: 'Experts hesitate on defensibility of the technology long-term. Two of three experts cited "commoditization risk" within 3-5 years.',
        status: 'complete',
        sourceDocId: 'doc-5',
        sourceLocation: 'Call 2, Timestamp 34:12',
        sourceSnippet: '"I think the core technology is solid today, but honestly, I see this becoming commoditized within three to five years. The barriers just aren\'t high enough."',
        reasoning: 'Synthesized from three expert interviews. Sentiment analysis indicates 67% negative outlook on long-term defensibility.',
        confidence: 0.82,
        relatedCells: ['cell-3-1']
      },
      'col-2': { 
        id: 'cell-5-2',
        value: 'Experts differ in opinion regarding the growth trajectory. Range of estimates from 15% to 45% annual growth.',
        status: 'complete',
        sourceDocId: 'doc-5',
        sourceLocation: 'Summary, Page 2',
        sourceSnippet: '"Expert A projects 40-45% growth based on enterprise adoption trends. Expert B is more conservative at 15-20%, citing market saturation concerns."',
        reasoning: 'Wide variance in expert projections indicates uncertainty. Flagged for further diligence.',
        confidence: 0.76
      },
    }
  },
  {
    id: 'doc-6',
    documentName: 'Customer Reference Calls',
    documentType: 'Customer',
    date: 'Mar 18, 2024',
    cells: {
      'col-1': { 
        id: 'cell-6-1',
        value: 'Common negative feedback across customers regarding onboarding complexity. Average implementation time: 12 weeks vs. 4 weeks promised.',
        status: 'complete',
        sourceDocId: 'doc-6',
        sourceLocation: 'Call Summary, Implementation Feedback',
        sourceSnippet: '"We were told four weeks, but it took us almost three months to get fully operational. The complexity was significantly underestimated."',
        reasoning: 'Implementation risk identified across multiple customer interviews. 3x delta between promised and actual timelines.',
        confidence: 0.91,
        verified: true,
        verifiedBy: 'Mike Torres'
      },
      'col-2': { 
        id: 'cell-6-2',
        value: 'Customers list several tailwinds including regulatory pressure driving adoption and lack of viable alternatives in the mid-market.',
        status: 'complete',
        sourceDocId: 'doc-6',
        sourceLocation: 'Call 4, Timestamp 12:45',
        sourceSnippet: '"Honestly, we didn\'t have many options in our price range. And with the new regulations coming, we had to move fast."',
        reasoning: 'Positive market signal: regulatory tailwind and limited competition in segment creates favorable dynamics.',
        confidence: 0.88
      },
    }
  },
  {
    id: 'doc-7',
    documentName: 'Market Report',
    documentType: 'Public Report',
    date: 'Mar 30, 2024',
    cells: {
      'col-1': { 
        id: 'cell-7-1',
        value: 'Headwinds raised across this report include macro uncertainty affecting enterprise IT budgets and extended sales cycles in H2.',
        status: 'complete',
        sourceDocId: 'doc-7',
        sourceLocation: 'Section 5.1, Market Headwinds',
        sourceSnippet: '"Enterprise IT budget surveys indicate 23% of organizations plan to reduce software spending in H2 2024, with sales cycles extending an average of 2.3 months versus H1."',
        reasoning: 'Macro risk factor with quantified impact metrics. Relevant for revenue projections and sales planning.',
        confidence: 0.93
      },
      'col-2': { 
        id: 'cell-7-2',
        value: 'The TAM is estimated at approximately $72B by 2028, with the served addressable market (SAM) at $8.4B for mid-market segment.',
        status: 'complete',
        sourceDocId: 'doc-7',
        sourceLocation: 'Section 3.2, Market Sizing',
        sourceSnippet: '"Total addressable market reaches $72 billion by 2028. The mid-market segment, defined as companies with 500-5000 employees, represents a serviceable addressable market of $8.4 billion."',
        reasoning: 'Key market sizing data from third-party research. SAM more relevant than TAM for investment thesis given company positioning.',
        confidence: 0.96,
        verified: true,
        verifiedBy: 'Sarah Chen'
      },
    }
  },
]

const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'We are meeting the management team of Project Alpha tomorrow. Draft some key DD questions based on your assessment of these documents.'
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `Based on my analysis of the documents, here are key DD questions for your meeting:

**On Customer Concentration & Implementation:**
The top 3 customers represent 67% of ARR [1], and implementation times are running 3x longer than promised [2]. Questions:
- What's your strategy to diversify the customer base over the next 18 months?
- What's causing the implementation delays, and what's being done to address them?

**On Competitive Positioning:**
Experts raised commoditization concerns [3], and there's no apparent IP protection [4]. Questions:
- What sustainable competitive advantages do you see beyond the current feature set?
- Any plans for patent filings or proprietary technology development?

**On Roadmap Execution:**
57% of planned integrations lack committed timelines [5]. Questions:
- What's driving the TBD status on key integrations like SAP and Workday?
- How does this impact enterprise sales conversations?

**On Market Dynamics:**
Despite macro headwinds affecting IT budgets [6], regulatory pressure is driving adoption [7]. Questions:
- How are you seeing sales cycles evolve in the current environment?
- Which regulatory drivers are most relevant to your pipeline?`,
    sources: [
      { cellId: 'cell-2-1', label: '1' },
      { cellId: 'cell-6-1', label: '2' },
      { cellId: 'cell-5-1', label: '3' },
      { cellId: 'cell-3-1', label: '4' },
      { cellId: 'cell-4-1', label: '5' },
      { cellId: 'cell-7-1', label: '6' },
      { cellId: 'cell-6-2', label: '7' },
    ],
    stepsCompleted: 12
  }
]

const MOCK_USER_DOCS = [
  { id: 'doc-1', name: 'Q4 Investment Memo' },
  { id: 'doc-2', name: 'Project Alpha DD Notes' },
  { id: 'doc-3', name: 'Management Meeting Prep' },
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
  const [expandedCell, setExpandedCell] = useState<string | null>(null)
  const [highlightedCell, setHighlightedCell] = useState<string | null>(null)
  const [stepsExpanded, setStepsExpanded] = useState(false)

  const tableRef = useRef<HTMLDivElement>(null)

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

  // Clear highlight after delay
  useEffect(() => {
    if (highlightedCell) {
      const timer = setTimeout(() => setHighlightedCell(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [highlightedCell])

  const handleSourceClick = (cellId: string) => {
    setHighlightedCell(cellId)
    setExpandedCell(cellId)
    // Scroll to cell in table
    const cellElement = document.getElementById(`cell-${cellId}`)
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleAddColumn = () => {
    if (!newColumnQuestion.trim()) return
    
    const newCol: MatrixColumn = {
      id: `col-${Date.now()}`,
      question: newColumnQuestion.trim()
    }
    
    setColumns(prev => [...prev, newCol])
    setMatrixData(prev => prev.map(row => ({
      ...row,
      cells: { 
        ...row.cells, 
        [newCol.id]: { 
          id: `cell-${row.id}-${newCol.id}`,
          value: '', 
          status: 'loading',
          sourceDocId: row.id
        } 
      }
    })))
    
    // Simulate Ranger extraction
    setTimeout(() => {
      setMatrixData(prev => prev.map(row => ({
        ...row,
        cells: {
          ...row.cells,
          [newCol.id]: { 
            id: `cell-${row.id}-${newCol.id}`,
            value: `Analysis for "${newColumnQuestion}" extracted from ${row.documentName}.`,
            status: 'complete',
            sourceDocId: row.id,
            sourceLocation: 'Page 1, Section 1',
            reasoning: `Ranger searched for content related to "${newColumnQuestion}" and found relevant passages.`,
            confidence: 0.85
          }
        }
      })))
    }, 2500)
    
    setNewColumnQuestion('')
    setShowAddColumnModal(false)
  }

  const handleCellClick = (cell: Cell) => {
    if (cell.status === 'complete' && cell.value && cell.status !== 'empty') {
      if (expandedCell === cell.id) {
        setExpandedCell(null)
      } else {
        setExpandedCell(cell.id)
      }
    }
  }

  const insertToEditor = (cell: Cell) => {
    const citation = cell.sourceLocation ? ` [${cell.sourceLocation}]` : ''
    setEditorContent(prev => prev + (prev ? '\n\n' : '') + cell.value + citation)
    setShowEditorPane(true)
  }

  const handleSubmitQuery = () => {
    if (!query.trim()) return
    
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', content: query }])
    setQuery('')
    setIsProcessing(true)
    
    // Simulate Ranger searching
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Based on my analysis of the selected documents, I found several relevant findings. The key points have been extracted and linked to their source cells below.',
        sources: [
          { cellId: 'cell-1-1', label: '1' },
          { cellId: 'cell-2-2', label: '2' },
        ],
        stepsCompleted: 8
      }])
      setIsProcessing(false)
    }, 2000)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.75) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High'
    if (confidence >= 0.75) return 'Medium'
    return 'Low'
  }

  if (authLoading || !user) return null

  // Find a cell by ID across all data
  const findCell = (cellId: string): Cell | null => {
    for (const row of matrixData) {
      for (const cell of Object.values(row.cells)) {
        if (cell.id === cellId) return cell
      }
    }
    return null
  }

  // Render message content with clickable source pills
  const renderMessageContent = (message: Message) => {
    if (!message.sources || message.sources.length === 0) {
      return <div className="text-sm text-gray-900 whitespace-pre-wrap">{message.content}</div>
    }

    // Replace [N] with clickable pills
    let content = message.content
    const elements: React.ReactNode[] = []
    let lastIndex = 0

    message.sources.forEach((source) => {
      const pattern = `[${source.label}]`
      const index = content.indexOf(pattern, lastIndex)
      
      if (index !== -1) {
        // Add text before the reference
        if (index > lastIndex) {
          elements.push(
            <span key={`text-${lastIndex}`}>{content.slice(lastIndex, index)}</span>
          )
        }
        
        // Add clickable pill
        elements.push(
          <button
            key={`source-${source.cellId}`}
            onClick={() => handleSourceClick(source.cellId)}
            className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 cursor-pointer mx-0.5 transition-colors"
          >
            {source.label}
          </button>
        )
        
        lastIndex = index + pattern.length
      }
    })
    
    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(<span key={`text-final`}>{content.slice(lastIndex)}</span>)
    }

    return <div className="text-sm text-gray-900 whitespace-pre-wrap">{elements}</div>
  }

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
                <div className="space-y-5 mb-5 max-h-80 overflow-auto">
                  {messages.map(msg => (
                    <div key={msg.id} className="flex gap-3">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-gray-900">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          {msg.role === 'user' ? 'You' : 'Ranger'}
                        </div>
                        {msg.role === 'assistant' && msg.stepsCompleted && (
                          <button 
                            onClick={() => setStepsExpanded(!stepsExpanded)}
                            className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer text-sm text-gray-600"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            {msg.stepsCompleted} steps completed
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${stepsExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                        {renderMessageContent(msg)}
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-gray-900">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">Ranger</div>
                        <span className="text-sm text-gray-500">Searching documents...</span>
                      </div>
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
            <div ref={tableRef} className="flex-1 overflow-auto">
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
                      <th key={col.id} className="min-w-[280px] px-3 py-2.5 text-left text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1.5"><span className="text-gray-400">=</span>{col.question}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixData.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-100">
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
                        const isEmpty = cell?.status === 'empty'
                        const isExpanded = expandedCell === cell?.id
                        const isHighlighted = highlightedCell === cell?.id
                        
                        return (
                          <td key={col.id} className="px-3 py-2.5 align-top">
                            <div 
                              id={`cell-${cell?.id}`}
                              className={`rounded-lg transition-all ${isHighlighted ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
                            >
                              {cell?.status === 'loading' ? (
                                <div className="flex items-center gap-2 text-gray-400 p-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span className="text-xs">Ranger is extracting...</span>
                                </div>
                              ) : (
                                <div>
                                  {/* Cell Content */}
                                  <button 
                                    onClick={() => handleCellClick(cell)}
                                    className={`text-left w-full p-2 rounded-lg transition-colors ${
                                      isEmpty 
                                        ? 'text-gray-400 italic cursor-default' 
                                        : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm flex-1">{cell?.value}</span>
                                      {!isEmpty && cell?.confidence && (
                                        <div className={`flex-shrink-0 text-xs ${getConfidenceColor(cell.confidence)}`}>
                                          {Math.round(cell.confidence * 100)}%
                                        </div>
                                      )}
                                    </div>
                                    {!isEmpty && (
                                      <div className="flex items-center gap-2 mt-1">
                                        {cell?.sourceLocation && (
                                          <span className="text-xs text-gray-400">{cell.sourceLocation}</span>
                                        )}
                                        {cell?.verified && (
                                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Verified
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </button>
                                  
                                  {/* Expanded Cell Details */}
                                  {isExpanded && !isEmpty && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                      {/* Source Snippet */}
                                      {cell?.sourceSnippet && (
                                        <div>
                                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
                                            <Quote className="w-3 h-3" />
                                            Source Text
                                          </div>
                                          <p className="text-xs text-gray-600 italic bg-white p-2 rounded border border-gray-100">
                                            {cell.sourceSnippet}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {/* Reasoning */}
                                      {cell?.reasoning && (
                                        <div>
                                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
                                            <Info className="w-3 h-3" />
                                            How Ranger Found This
                                          </div>
                                          <p className="text-xs text-gray-600">{cell.reasoning}</p>
                                        </div>
                                      )}
                                      
                                      {/* Confidence & Related */}
                                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                        <div className="flex items-center gap-3">
                                          {cell?.confidence && (
                                            <span className={`text-xs font-medium ${getConfidenceColor(cell.confidence)}`}>
                                              {getConfidenceLabel(cell.confidence)} confidence ({Math.round(cell.confidence * 100)}%)
                                            </span>
                                          )}
                                          {cell?.relatedCells && cell.relatedCells.length > 0 && (
                                            <span className="text-xs text-gray-400">
                                              {cell.relatedCells.length} related cells
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button 
                                            onClick={() => insertToEditor(cell)}
                                            className="p-1.5 rounded hover:bg-gray-200 cursor-pointer text-gray-400 hover:text-gray-600"
                                            title="Insert to editor"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </button>
                                          <button 
                                            onClick={() => navigator.clipboard.writeText(cell.value)}
                                            className="p-1.5 rounded hover:bg-gray-200 cursor-pointer text-gray-400 hover:text-gray-600"
                                            title="Copy"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
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

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddColumnModal(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Column</h2>
              <p className="text-sm text-gray-500 mt-1">Ranger will extract answers from all documents</p>
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