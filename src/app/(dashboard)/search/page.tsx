// src/app/(dashboard)/search/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, ChevronDown, ChevronRight, FileText, X, MoreHorizontal, GripVertical,
  Loader2, MessageSquare, ArrowUp, Copy, PanelRightOpen, ExternalLink, Table2, List,
  CheckCircle2, AlertCircle, Eye, Link2, BookOpen, Quote, Info, Upload, Building2, Search
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
  logoUrl?: string  // Favicon/logo for the document source
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
    logoUrl: 'https://logo.clearbit.com/quickbooks.com',
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
    logoUrl: 'https://logo.clearbit.com/canva.com',
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
    logoUrl: 'https://logo.clearbit.com/notion.so',
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
    logoUrl: 'https://logo.clearbit.com/productboard.com',
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
    logoUrl: 'https://logo.clearbit.com/gong.io',
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
    logoUrl: 'https://logo.clearbit.com/zoom.us',
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
    logoUrl: 'https://logo.clearbit.com/gartner.com',
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
  const [matrixData, setMatrixData] = useState<MatrixRow[]>([])  // Start empty
  const [messages, setMessages] = useState<Message[]>([])  // Start empty
  const [query, setQuery] = useState('')
  const [showEditorPane, setShowEditorPane] = useState(false)
  const [editorWidth, setEditorWidth] = useState(400)
  const [selectedDocForEditor, setSelectedDocForEditor] = useState(MOCK_USER_DOCS[0].id)
  const [editorContent, setEditorContent] = useState('')
  const [showAddColumnModal, setShowAddColumnModal] = useState(false)
  const [newColumnQuestion, setNewColumnQuestion] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<MatrixRow | null>(null)
  const [highlightedCell, setHighlightedCell] = useState<string | null>(null)
  const [chatExpanded, setChatExpanded] = useState(true)
  const [chatHeight, setChatHeight] = useState(280)
  const [isResizingChat, setIsResizingChat] = useState(false)
  const [stepsExpanded, setStepsExpanded] = useState(false)
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadTab, setUploadTab] = useState<'upload' | 'edgar'>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [edgarTicker, setEdgarTicker] = useState('')
  const [edgarFormTypes, setEdgarFormTypes] = useState<string[]>(['10-K'])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Chat section resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingChat) return
      const container = document.getElementById('search-main-container')
      if (container) {
        const containerTop = container.getBoundingClientRect().top
        const newHeight = e.clientY - containerTop
        setChatHeight(Math.max(100, Math.min(500, newHeight)))
      }
    }
    
    const handleMouseUp = () => setIsResizingChat(false)
    
    if (isResizingChat) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingChat])

  // Clear highlight after delay
  useEffect(() => {
    if (highlightedCell) {
      const timer = setTimeout(() => setHighlightedCell(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [highlightedCell])

  const handleSourceClick = (cellId: string) => {
    const cell = findCell(cellId)
    if (cell) {
      setSelectedCell(cell)
      setHighlightedCell(cellId)
      // Scroll to cell in table
      const cellElement = document.getElementById(`cell-${cellId}`)
      if (cellElement) {
        cellElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      // Clear highlight after animation
      setTimeout(() => setHighlightedCell(null), 2000)
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

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(f => 
      f.type === 'application/pdf' || 
      f.type === 'text/plain' ||
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      f.name.endsWith('.txt') ||
      f.name.endsWith('.md')
    )
    
    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles])
      setUploadError(null)
    } else {
      setUploadError('Please upload PDF, DOCX, TXT, or MD files')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files])
      setUploadError(null)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadSubmit = async () => {
    if (uploadTab === 'upload' && uploadedFiles.length === 0) return
    if (uploadTab === 'edgar' && !edgarTicker.trim()) return
    
    setIsUploading(true)
    setUploadError(null)
    
    try {
      if (uploadTab === 'upload') {
        // Upload files
        const formData = new FormData()
        uploadedFiles.forEach(file => formData.append('files', file))
        
        const response = await fetch('/api/ranger/documents', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Upload failed')
        }
        
        const result = await response.json()
        
        // Add uploaded docs to matrix
        const newRows: MatrixRow[] = result.documents.map((doc: { id: string; name: string; type: string }) => ({
          id: doc.id,
          documentName: doc.name,
          documentType: doc.type || 'Document',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          cells: columns.reduce((acc, col) => ({
            ...acc,
            [col.id]: {
              id: `cell-${doc.id}-${col.id}`,
              value: 'Pending extraction...',
              status: 'loading' as const,
              sourceDocId: doc.id,
            }
          }), {})
        }))
        
        setMatrixData(prev => [...prev, ...newRows])
        
      } else {
        // Import from SEC EDGAR
        const response = await fetch('/api/ranger/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'sec-edgar',
            ticker: edgarTicker.toUpperCase(),
            formTypes: edgarFormTypes,
            limit: 5,
          }),
        })
        
        if (!response.ok) {
          throw new Error('SEC import failed')
        }
        
        const result = await response.json()
        
        // Add imported docs to matrix
        const newRows: MatrixRow[] = result.documents.map((doc: { id: string; name: string; type: string }) => ({
          id: doc.id,
          documentName: doc.name,
          documentType: doc.type || '10-K',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          logoUrl: 'https://logo.clearbit.com/sec.gov',
          cells: columns.reduce((acc, col) => ({
            ...acc,
            [col.id]: {
              id: `cell-${doc.id}-${col.id}`,
              value: 'Pending extraction...',
              status: 'loading' as const,
              sourceDocId: doc.id,
            }
          }), {})
        }))
        
        setMatrixData(prev => [...prev, ...newRows])
      }
      
      // Reset and close
      setUploadedFiles([])
      setEdgarTicker('')
      setShowUploadModal(false)
      
      // TODO: Trigger actual Ranger extraction for the new documents
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCellClick = (cell: Cell) => {
    if (cell.status === 'complete' && cell.value) {
      setSelectedCell(cell)
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

        <div id="search-main-container" className="flex-1 flex overflow-hidden">
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Section - Collapsible */}
            <div className="flex-shrink-0 border-b border-gray-200">
              {/* Chat Header */}
              <button 
                onClick={() => setChatExpanded(!chatExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${chatExpanded ? '' : '-rotate-90'}`} />
                  <span className="text-xs font-medium text-gray-600">Ranger Chat</span>
                  {messages.length > 0 && (
                    <span className="text-xs text-gray-400">{messages.length} messages</span>
                  )}
                </div>
                {!chatExpanded && messages.length > 0 && (
                  <span className="text-xs text-gray-400 truncate max-w-xs">
                    {messages[messages.length - 1].content.slice(0, 50)}...
                  </span>
                )}
              </button>
              
              {/* Chat Content */}
              {chatExpanded && (
                <div style={{ height: chatHeight }}>
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-auto px-6 py-4">
                      <div className="max-w-3xl mx-auto space-y-4">
                        {messages.map(msg => (
                          <div key={msg.id} className="flex gap-3">
                            {msg.role === 'user' ? (
                              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-gray-900 p-1">
                                <img src="/images/raven-logo-white.png" alt="Ranger" className="w-full h-full object-contain" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-500 mb-1">
                                {msg.role === 'user' ? 'You' : 'Ranger'}
                              </div>
                              {msg.role === 'assistant' && msg.stepsCompleted && (
                                <button 
                                  onClick={() => setStepsExpanded(!stepsExpanded)}
                                  className="flex items-center gap-2 mb-2 px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs text-gray-600"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                  {msg.stepsCompleted} steps
                                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${stepsExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                              {renderMessageContent(msg)}
                            </div>
                          </div>
                        ))}
                        {isProcessing && (
                          <div className="flex gap-3">
                            <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-gray-900">
                              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-500 mb-1">Ranger</div>
                              <span className="text-xs text-gray-500">Searching documents...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Input */}
                    <div className="flex-shrink-0 px-6 pb-3">
                      <div className="max-w-3xl mx-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white">
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
                </div>
              )}
              
              {/* Resize Handle */}
              {chatExpanded && (
                <div 
                  onMouseDown={() => setIsResizingChat(true)}
                  className="h-1 bg-gray-100 hover:bg-blue-200 cursor-row-resize transition-colors"
                />
              )}
            </div>

            {/* Table Section */}
            <div ref={tableRef} className="flex-1 overflow-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                  <List className="w-4 h-4" />
                  Display
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add documents
                  </button>
                  <button onClick={() => setShowAddColumnModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
                    <Plus className="w-4 h-4" />
                    Add columns
                  </button>
                </div>
              </div>
              
              <div className="border-t border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white">
                      <th className="w-10 px-3 py-3 text-left border-b border-r border-gray-200">
                        <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                      </th>
                      <th className="w-8 px-1 py-3 border-b border-r border-gray-200"></th>
                      <th className="min-w-[220px] px-3 py-3 text-left border-b border-r border-gray-200">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <FileText className="w-3.5 h-3.5" />
                          Document
                        </div>
                      </th>
                      <th className="w-32 px-3 py-3 text-left border-b border-r border-gray-200">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <span className="text-gray-400">=</span>
                          Date
                        </div>
                      </th>
                      <th className="w-44 px-3 py-3 text-left border-b border-r border-gray-200">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Document Type
                        </div>
                      </th>
                      {columns.map(col => (
                        <th key={col.id} className="min-w-[260px] px-3 py-3 text-left border-b border-r border-gray-200 last:border-r-0">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <span className="text-gray-400">=</span>
                            {col.question}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixData.map((row, idx) => {
                      const isDocSelected = selectedDocument?.id === row.id
                      
                      return (
                        <tr key={row.id} className="group">
                          {/* Checkbox */}
                          <td className="px-3 py-0 border-b border-r border-gray-200 bg-white">
                            <input type="checkbox" className="rounded border-gray-300 cursor-pointer" />
                          </td>
                          
                          {/* Row number + grip */}
                          <td className="px-1 py-0 border-b border-r border-gray-200 bg-white">
                            <div className="flex items-center gap-0.5 text-gray-400">
                              <span className="text-xs w-4">{idx + 1}</span>
                              <GripVertical className="w-3 h-3 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </td>
                          
                          {/* Document cell - clickable badge */}
                          <td 
                            className={`px-3 py-3 border-b border-r border-gray-200 cursor-pointer transition-colors ${
                              isDocSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedDocument(isDocSelected ? null : row)}
                          >
                            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-gray-100 max-w-full">
                              {row.logoUrl ? (
                                <img 
                                  src={row.logoUrl} 
                                  alt="" 
                                  className="w-4 h-4 rounded flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className="text-sm font-medium text-gray-900 truncate">{row.documentName}</span>
                            </div>
                          </td>
                          
                          {/* Date cell */}
                          <td className="px-3 py-3 border-b border-r border-gray-200 text-sm text-gray-600">
                            {row.date}
                          </td>
                          
                          {/* Document Type cell - colored badge */}
                          <td className="px-3 py-3 border-b border-r border-gray-200">
                            <span 
                              className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium"
                              style={{ 
                                background: docTypeColors[row.documentType]?.bg, 
                                color: docTypeColors[row.documentType]?.text 
                              }}
                            >
                              {row.documentType}
                            </span>
                          </td>
                          
                          {/* Data cells */}
                          {columns.map(col => {
                            const cell = row.cells[col.id]
                            const isEmpty = cell?.status === 'empty'
                            const isSelected = selectedCell?.id === cell?.id
                            const isHighlighted = highlightedCell === cell?.id
                            
                            return (
                              <td 
                                key={col.id}
                                id={`cell-${cell?.id}`}
                                onClick={() => !isEmpty && cell && handleCellClick(cell)}
                                className={`
                                  px-3 py-3 border-b border-r border-gray-200 last:border-r-0
                                  align-top transition-colors
                                  ${isEmpty ? 'cursor-default' : 'cursor-pointer'}
                                  ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' : ''}
                                  ${isHighlighted ? 'bg-yellow-50 ring-2 ring-inset ring-yellow-400' : ''}
                                  ${!isSelected && !isHighlighted && !isEmpty ? 'hover:bg-gray-50' : ''}
                                `}
                              >
                                {cell?.status === 'loading' ? (
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span className="text-xs">Extracting...</span>
                                  </div>
                                ) : (
                                  <div className={isEmpty ? 'text-gray-400 italic' : 'text-gray-700'}>
                                    <p className="text-sm leading-snug line-clamp-2">{cell?.value}</p>
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              <button className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer border-t border-gray-200">
                <Plus className="w-4 h-4" />Add row
              </button>
            </div>
          </div>

          {/* Document Viewer Pane */}
          {selectedDocument && !selectedCell && (
            <>
              <div className="w-px bg-gray-200" />
              <div className="w-96 flex flex-col bg-white border-l border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 min-w-0">
                    {selectedDocument.logoUrl ? (
                      <img src={selectedDocument.logoUrl} alt="" className="w-5 h-5 rounded flex-shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-900 truncate">{selectedDocument.documentName}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedDocument(null)}
                    className="p-1 rounded hover:bg-gray-100 cursor-pointer text-gray-400 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Document Meta */}
                <div className="px-4 py-3 border-b border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Type</span>
                    <span 
                      className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                      style={{ 
                        background: docTypeColors[selectedDocument.documentType]?.bg, 
                        color: docTypeColors[selectedDocument.documentType]?.text 
                      }}
                    >
                      {selectedDocument.documentType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Date</span>
                    <span className="text-xs text-gray-700">{selectedDocument.date}</span>
                  </div>
                </div>
                
                {/* Document Preview Placeholder */}
                <div className="flex-1 overflow-auto p-4">
                  <div className="h-full rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <div className="text-center p-4">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Document Preview</p>
                      <p className="text-xs text-gray-400">Full document viewer coming soon</p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer">
                    <ExternalLink className="w-4 h-4" />
                    Open Full Document
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Cell Detail Pane */}
          {selectedCell && (
            <>
              <div className="w-px bg-gray-200" />
              <div className="w-80 flex flex-col bg-white border-l border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Cell Details</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCell(null)}
                    className="p-1 rounded hover:bg-gray-100 cursor-pointer text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {/* Extracted Value */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">Extracted Answer</div>
                    <div className="text-sm text-gray-900 leading-relaxed">{selectedCell.value}</div>
                  </div>
                  
                  {/* Confidence */}
                  {selectedCell.confidence && (
                    <div className="flex items-center gap-2">
                      <div className={`text-xs font-medium ${getConfidenceColor(selectedCell.confidence)}`}>
                        {getConfidenceLabel(selectedCell.confidence)} confidence
                      </div>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            selectedCell.confidence >= 0.8 ? 'bg-green-500' :
                            selectedCell.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${selectedCell.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{Math.round(selectedCell.confidence * 100)}%</span>
                    </div>
                  )}
                  
                  {/* Source Location */}
                  {selectedCell.sourceLocation && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Source Location</div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{selectedCell.sourceLocation}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Source Snippet */}
                  {selectedCell.sourceSnippet && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                        <Quote className="w-3 h-3" />
                        Source Text
                      </div>
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <p className="text-sm text-gray-700 italic leading-relaxed">
                          {selectedCell.sourceSnippet}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Reasoning */}
                  {selectedCell.reasoning && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                        <Info className="w-3 h-3" />
                        How Ranger Found This
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedCell.reasoning}</p>
                    </div>
                  )}
                  
                  {/* Related Cells */}
                  {selectedCell.relatedCells && selectedCell.relatedCells.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Related Cells</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCell.relatedCells.map(cellId => (
                          <button 
                            key={cellId}
                            onClick={() => {
                              const cell = findCell(cellId)
                              if (cell) {
                                setSelectedCell(cell)
                                setHighlightedCell(cellId)
                                const cellElement = document.getElementById(`cell-${cellId}`)
                                if (cellElement) {
                                  cellElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                }
                              }
                            }}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 cursor-pointer"
                          >
                            {cellId}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Verification Status */}
                  {selectedCell.verified && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-green-800">Verified</div>
                        {selectedCell.verifiedBy && (
                          <div className="text-xs text-green-600">by {selectedCell.verifiedBy}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 space-y-2">
                  <button 
                    onClick={() => {
                      insertToEditor(selectedCell)
                      setSelectedCell(null)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Insert to Editor
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(selectedCell.value)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>
            </>
          )}

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

      {/* Upload Documents Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !isUploading && setShowUploadModal(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Documents</h2>
              <p className="text-sm text-gray-500 mt-1">Upload files or import from SEC EDGAR</p>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setUploadTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  uploadTab === 'upload' 
                    ? 'text-gray-900 border-b-2 border-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Files
              </button>
              <button
                onClick={() => setUploadTab('edgar')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  uploadTab === 'edgar' 
                    ? 'text-gray-900 border-b-2 border-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                SEC EDGAR
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 py-6">
              {uploadTab === 'upload' ? (
                <div>
                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                      ${isDragging 
                        ? 'border-gray-900 bg-gray-50' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.docx,.txt,.md"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Drop files here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, TXT, MD up to 50MB each
                    </p>
                  </div>
                  
                  {/* File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </span>
                          </div>
                          <button 
                            onClick={() => removeFile(idx)}
                            className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Ticker Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Ticker
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={edgarTicker}
                        onChange={(e) => setEdgarTicker(e.target.value.toUpperCase())}
                        placeholder="e.g., NVDA, AAPL, MSFT"
                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:border-gray-400 outline-none text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Form Types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filing Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['10-K', '10-Q', '8-K', 'DEF 14A'].map(form => (
                        <button
                          key={form}
                          onClick={() => {
                            setEdgarFormTypes(prev => 
                              prev.includes(form) 
                                ? prev.filter(f => f !== form)
                                : [...prev, form]
                            )
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                            edgarFormTypes.includes(form)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {form}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      SEC EDGAR filings are publicly available. We&apos;ll import the most recent filings matching your criteria.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Error */}
              {uploadError && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button 
                onClick={() => setShowUploadModal(false)}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={isUploading || (uploadTab === 'upload' ? uploadedFiles.length === 0 : !edgarTicker.trim())}
                className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploadTab === 'upload' ? 'Upload' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}