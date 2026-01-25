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


// Document type colors - Consulting palette
const docTypeColors: Record<string, { bg: string; text: string }> = {
  'Interview': { bg: '#EEF2F6', text: '#4B5C6B' },
  'Industry Report': { bg: '#FDF6E3', text: '#8B7355' },
  'Client Data': { bg: '#E8F4EF', text: '#5B7B6B' },
  'Benchmark': { bg: '#F3F0F7', text: '#6B5B7B' },
  'Internal Analysis': { bg: '#FAECEC', text: '#8B6B6B' },
  'Survey': { bg: '#EEF2F6', text: '#4B5C6B' },
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
  query?: string  // Original question (for "Add as column")
  extractedCells?: Record<string, Cell>  // Cells extracted for this query
}

// Mock data with full cell structure - CONSULTING VERSION
const MOCK_COLUMNS: MatrixColumn[] = [
  { id: 'col-1', question: 'Key Findings' },
  { id: 'col-2', question: 'Strategic Implications' },
]

const MOCK_MATRIX_DATA: MatrixRow[] = [
  {
    id: 'doc-1',
    documentName: 'VP Operations Interview - Midwest Region',
    documentType: 'Interview',
    date: 'Jan 12, 2026',
    logoUrl: 'https://cdn.brandfetch.io/zoom.us?c=1id1Fyz-h7an5-5KR_y',
    cells: {
      'col-1': { 
        id: 'cell-1-1',
        value: 'Distribution center consolidation created 23% cost savings but increased delivery times by 1.2 days. Customer complaints up 34% in affected regions since Q3.',
        status: 'complete',
        sourceDocId: 'doc-1',
        sourceLocation: 'Transcript, 14:32-16:45',
        sourceSnippet: '"The consolidation saved us money, no question—about 23% on logistics costs. But we\'re hearing it from customers now. Delivery times went from 2.1 days to 3.3 days average, and complaints are through the roof."',
        reasoning: 'Quantifies cost-service tradeoff from consolidation. Customer impact data directly from regional leadership.',
        confidence: 0.94,
        verified: true,
        verifiedBy: 'M. Torres'
      },
      'col-2': { 
        id: 'cell-1-2',
        value: 'Consolidation savings at risk if customer churn accelerates. Recommend modeling breakeven point where logistics savings are offset by revenue loss.',
        status: 'complete',
        sourceDocId: 'doc-1',
        sourceLocation: 'Transcript, 18:20-19:15',
        sourceSnippet: '"We\'ve already lost two mid-size accounts who cited delivery times. If this continues through Q1, we\'re looking at real revenue impact."',
        reasoning: 'VP flagged early churn signals. Financial modeling needed to quantify risk.',
        confidence: 0.89
      },
    }
  },
  {
    id: 'doc-2',
    documentName: 'McKinsey Logistics Benchmark 2025',
    documentType: 'Benchmark',
    date: 'Nov 2025',
    logoUrl: 'https://cdn.brandfetch.io/mckinsey.com?c=1id1Fyz-h7an5-5KR_y',
    cells: {
      'col-1': { 
        id: 'cell-2-1',
        value: 'Industry leaders average 2.4-day delivery in comparable markets. Top quartile achieves 1.8 days with hub-and-spoke models retaining regional nodes.',
        status: 'complete',
        sourceDocId: 'doc-2',
        sourceLocation: 'Page 34, Exhibit 12',
        sourceSnippet: '"Best-in-class operators maintain delivery windows of 1.8-2.4 days through hybrid distribution models that balance consolidation efficiency with regional responsiveness."',
        reasoning: 'External benchmark establishes competitive context. Client at 3.3 days is significantly below industry standard.',
        confidence: 0.92,
        verified: true,
        verifiedBy: 'M. Torres'
      },
      'col-2': { 
        id: 'cell-2-2',
        value: 'Client underperforming benchmark by 0.9-1.5 days. Hybrid model (partial reconsolidation) could recover service levels while retaining ~60% of cost savings.',
        status: 'complete',
        sourceDocId: 'doc-2',
        sourceLocation: 'Page 41, Exhibit 17',
        sourceSnippet: '"Organizations that reversed full consolidation to hybrid models typically retained 55-65% of logistics savings while recovering 80%+ of service level performance."',
        reasoning: 'Benchmark suggests partial rollback is viable. Provides data point for recommendation.',
        confidence: 0.88
      },
    }
  },
  {
    id: 'doc-3',
    documentName: 'Customer Satisfaction Survey - Q4 2025',
    documentType: 'Survey',
    date: 'Dec 2025',
    logoUrl: 'https://cdn.brandfetch.io/qualtrics.com?c=1id1Fyz-h7an5-5KR_y',
    cells: {
      'col-1': { 
        id: 'cell-3-1',
        value: 'NPS dropped from 42 to 28 since consolidation. "Delivery speed" now #1 detractor, cited by 67% of detractors. Previously ranked #4.',
        status: 'complete',
        sourceDocId: 'doc-3',
        sourceLocation: 'Executive Summary, Page 3',
        sourceSnippet: '"Net Promoter Score declined 14 points from Q2 (42) to Q4 (28). Delivery speed emerged as the primary driver of detractor sentiment, cited by 67% of respondents scoring 0-6."',
        reasoning: 'Quantifies customer sentiment impact. NPS decline is significant and directly attributable to delivery times.',
        confidence: 0.95,
        verified: true,
        verifiedBy: 'S. Patel'
      },
      'col-2': { 
        id: 'cell-3-2',
        value: 'NPS trajectory suggests continued erosion without intervention. Each 0.5-day improvement in delivery correlates with ~4 point NPS recovery based on driver analysis.',
        status: 'complete',
        sourceDocId: 'doc-3',
        sourceLocation: 'Driver Analysis, Page 18',
        sourceSnippet: '"Regression analysis indicates delivery time improvements of 0.5 days correlate with NPS improvements of 3.8-4.2 points, controlling for other factors."',
        reasoning: 'Survey provides quantified relationship between delivery time and NPS. Useful for modeling intervention impact.',
        confidence: 0.87
      },
    }
  },
  {
    id: 'doc-4',
    documentName: 'CFO Interview - Cost Structure Deep Dive',
    documentType: 'Interview',
    date: 'Jan 8, 2026',
    logoUrl: 'https://cdn.brandfetch.io/zoom.us?c=1id1Fyz-h7an5-5KR_y',
    cells: {
      'col-1': { 
        id: 'cell-4-1',
        value: 'Logistics consolidation saves $14M annually. Reopening 2 regional hubs would cost $8M but CFO open to "partial reversal if customer data supports it."',
        status: 'complete',
        sourceDocId: 'doc-4',
        sourceLocation: 'Transcript, 23:10-25:40',
        sourceSnippet: '"Look, we\'re saving $14 million a year from the consolidation. Reopening two hubs would run us about $8 million annually. But if you can show me the customer impact justifies it, I\'m willing to have that conversation with the board."',
        reasoning: 'CFO quantified financial tradeoffs and signaled openness to reversal. Key stakeholder buy-in for recommendation.',
        confidence: 0.93,
        relatedCells: ['cell-1-1', 'cell-2-2']
      },
      'col-2': { 
        id: 'cell-4-2',
        value: 'Net cost of hybrid model: ~$8M. But preserves $6M of original savings vs. full reversal. CFO receptive—frame recommendation around "optimizing" not "reversing."',
        status: 'complete',
        sourceDocId: 'doc-4',
        sourceLocation: 'Transcript, 27:15-28:30',
        sourceSnippet: '"Whatever you recommend, don\'t call it a reversal. The board approved consolidation 18 months ago. Frame it as optimization based on new customer data."',
        reasoning: 'CFO provided explicit guidance on positioning. Political context important for recommendation acceptance.',
        confidence: 0.91
      },
    }
  },
  {
    id: 'doc-5',
    documentName: 'Competitor Analysis - Regional Players',
    documentType: 'Internal Analysis',
    date: 'Jan 5, 2026',
    cells: {
      'col-1': { 
        id: 'cell-5-1',
        value: 'Two regional competitors (FastTrack, RegionalPro) gained 4.2% combined market share in affected territories since Q3. Both emphasize "next-day delivery" in marketing.',
        status: 'complete',
        sourceDocId: 'doc-5',
        sourceLocation: 'Market Share Analysis, Slide 8',
        sourceSnippet: '"FastTrack and RegionalPro have captured 4.2% market share in the Midwest region since Q3 2025. Both competitors have increased marketing spend on delivery speed messaging by 40%+."',
        reasoning: 'Competitor data validates customer churn risk. Market share loss is measurable and ongoing.',
        confidence: 0.90
      },
      'col-2': { 
        id: 'cell-5-2',
        value: 'Competitor gains accelerating—1.8% in Q3, 2.4% in Q4. Without service improvement, projected 6-8% additional share loss by end of 2026.',
        status: 'complete',
        sourceDocId: 'doc-5',
        sourceLocation: 'Projection Model, Slide 14',
        sourceSnippet: '"At current trajectory, regional competitors are projected to capture an additional 6-8% market share by Q4 2026, representing $22-29M in annual revenue at risk."',
        reasoning: 'Trajectory analysis quantifies urgency. Revenue-at-risk figure useful for business case.',
        confidence: 0.85
      },
    }
  },
  {
    id: 'doc-6',
    documentName: 'Gartner Supply Chain Report 2025',
    documentType: 'Industry Report',
    date: 'Oct 2025',
    logoUrl: 'https://cdn.brandfetch.io/gartner.com?c=1id1Fyz-h7an5-5KR_y',
    cells: {
      'col-1': { 
        id: 'cell-6-1',
        value: 'Post-pandemic, 78% of B2B buyers rank delivery speed in top 3 purchase criteria, up from 45% in 2019. Tolerance for delays has "permanently decreased."',
        status: 'complete',
        sourceDocId: 'doc-6',
        sourceLocation: 'Key Findings, Page 12',
        sourceSnippet: '"Our survey of 2,400 B2B procurement leaders found that 78% now rank delivery speed among their top 3 vendor selection criteria, compared to 45% pre-pandemic. This shift appears structural rather than temporary."',
        reasoning: 'Industry trend validates strategic importance of delivery speed. Not just a client-specific issue.',
        confidence: 0.93,
        verified: true,
        verifiedBy: 'M. Torres'
      },
      'col-2': { 
        id: 'cell-6-2',
        value: 'Industry-wide shift means delivery speed is now table stakes, not differentiator. Client\'s 3.3-day average is strategic liability, not just operational issue.',
        status: 'complete',
        sourceDocId: 'doc-6',
        sourceLocation: 'Strategic Implications, Page 28',
        sourceSnippet: '"Organizations unable to meet 2.5-day delivery expectations face structural competitive disadvantage. Speed has shifted from differentiator to baseline expectation."',
        reasoning: 'Gartner framing elevates recommendation from operational fix to strategic imperative.',
        confidence: 0.89
      },
    }
  },
]

const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'What\'s the business case for reopening regional distribution hubs? Summarize the key data points for the steering committee.'
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: `Here's the business case summary for the steering committee:

**The Problem**
Distribution consolidation saved $14M annually but increased delivery times from 2.1 to 3.3 days. [1] This has triggered a 34% increase in customer complaints and a 14-point NPS drop (42 → 28). [2]

**Competitive Impact**
Regional competitors have captured 4.2% market share since Q3, with delivery speed as their primary message. [3] At current trajectory, we're projecting $22-29M in annual revenue at risk by end of 2026.

**Industry Context**
This isn't just our problem—78% of B2B buyers now rank delivery speed in their top 3 criteria, up from 45% pre-pandemic. [4] The benchmark for our segment is 2.4 days; we're nearly a full day behind.

**The Recommendation**
Reopen 2 regional hubs at $8M annual cost. This retains ~$6M of the original $14M savings while recovering service levels. [5] CFO is supportive if framed as "optimization based on new customer data." [6]

**Bottom Line**
Net $6M in retained savings vs. $22-29M revenue at risk. The math favors action.`,
    sources: [
      { cellId: 'cell-1-1', label: '1' },
      { cellId: 'cell-3-1', label: '2' },
      { cellId: 'cell-5-1', label: '3' },
      { cellId: 'cell-6-1', label: '4' },
      { cellId: 'cell-4-1', label: '5' },
      { cellId: 'cell-4-2', label: '6' },
    ],
    stepsCompleted: 14,
    query: 'What\'s the business case for reopening regional distribution hubs? Summarize the key data points for the steering committee.'
  },
]

const MOCK_USER_DOCS = [
  { id: 'doc-1', name: 'Steering Committee Deck Draft' },
  { id: 'doc-2', name: 'Interview Synthesis' },
  { id: 'doc-3', name: 'Financial Model - Hub Scenarios' },
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
      let importedDocs: { id: string; name: string; type: string; content?: string }[] = []
      
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
        importedDocs = result.documents
        
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
        importedDocs = result.documents
      }
      
      // Add docs to matrix with loading state (cells only for existing columns)
      const newRows: MatrixRow[] = importedDocs.map((doc) => ({
        id: doc.id,
        documentName: doc.name,
        documentType: doc.type || (uploadTab === 'edgar' ? '10-K' : 'Document'),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        logoUrl: uploadTab === 'edgar' ? 'https://logo.clearbit.com/sec.gov' : undefined,
        cells: {}  // Start with no cells - columns are added via chat
      }))
      
      setMatrixData(prev => [...prev, ...newRows])
      
      // Reset and close modal
      setUploadedFiles([])
      setEdgarTicker('')
      setShowUploadModal(false)
      
      // If there are existing columns, run extraction for the new docs
      if (columns.length > 0) {
        for (const col of columns) {
          try {
            const response = await fetch('/api/ranger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: col.question,
                documents: importedDocs.map(d => ({
                  id: d.id,
                  name: d.name,
                  content: d.content || '',
                })),
              }),
            })
            
            if (response.ok) {
              const result = await response.json()
              
              // Update cells with extraction results
              setMatrixData(prev => prev.map(row => {
                const cell = result.cells[row.id]
                if (cell) {
                  return {
                    ...row,
                    cells: {
                      ...row.cells,
                      [col.id]: {
                        ...cell,
                        id: `cell-${row.id}-${col.id}`,
                      }
                    }
                  }
                }
                return row
              }))
            }
          } catch (err) {
            console.error(`Extraction failed for column ${col.id}:`, err)
          }
        }
      }
      
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

  const handleSubmitQuery = async () => {
    if (!query.trim()) return
    if (matrixData.length === 0) {
      // No documents to search
      setMessages(prev => [...prev, 
        { id: `msg-${Date.now()}`, role: 'user', content: query },
        { id: `msg-${Date.now() + 1}`, role: 'assistant', content: 'Please upload some documents first so I can search through them.' }
      ])
      setQuery('')
      return
    }
    
    const userQuery = query
    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: 'user', content: userQuery }])
    setQuery('')
    setIsProcessing(true)
    
    try {
      // Call Ranger API
      const response = await fetch('/api/ranger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          documents: matrixData.map(row => ({
            id: row.id,
            name: row.documentName,
            content: '', // Content should be fetched from store or passed differently
          })),
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        
        setMessages(prev => [...prev, {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: result.summary || 'I analyzed the documents and found relevant information.',
          sources: result.sources || [],
          stepsCompleted: Object.keys(result.cells || {}).length,
          query: userQuery,
          extractedCells: result.cells,
        }])
      } else {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error while searching. Please try again.',
        }])
      }
    } catch (error) {
      console.error('Query failed:', error)
      setMessages(prev => [...prev, {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }])
    } finally {
      setIsProcessing(false)
    }
  }

  // Add a chat response as a new column
  const addAsColumn = (message: Message) => {
    if (!message.query || !message.extractedCells) return
    
    const newColId = `col-${Date.now()}`
    const newCol: MatrixColumn = {
      id: newColId,
      question: message.query,
    }
    
    setColumns(prev => [...prev, newCol])
    
    // Add cells to each row
    setMatrixData(prev => prev.map(row => {
      const extractedCell = message.extractedCells?.[row.id]
      return {
        ...row,
        cells: {
          ...row.cells,
          [newColId]: extractedCell ? {
            ...extractedCell,
            id: `cell-${row.id}-${newColId}`,
          } : {
            id: `cell-${row.id}-${newColId}`,
            value: 'Not found in document',
            status: 'empty' as const,
            sourceDocId: row.id,
          }
        }
      }
    }))
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

  // Render message content with clickable source pills and bold text
  const renderMessageContent = (message: Message) => {
    // Helper to parse bold markdown in a string
    const parseBold = (text: string, keyPrefix: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = []
      const boldRegex = /\*\*(.+?)\*\*/g
      let lastIdx = 0
      let match
      let partIdx = 0
      
      while ((match = boldRegex.exec(text)) !== null) {
        // Add text before bold
        if (match.index > lastIdx) {
          parts.push(<span key={`${keyPrefix}-t${partIdx++}`}>{text.slice(lastIdx, match.index)}</span>)
        }
        // Add bold text
        parts.push(<strong key={`${keyPrefix}-b${partIdx++}`} className="font-semibold">{match[1]}</strong>)
        lastIdx = match.index + match[0].length
      }
      // Add remaining text
      if (lastIdx < text.length) {
        parts.push(<span key={`${keyPrefix}-t${partIdx++}`}>{text.slice(lastIdx)}</span>)
      }
      return parts.length > 0 ? parts : [<span key={`${keyPrefix}-plain`}>{text}</span>]
    }

    if (!message.sources || message.sources.length === 0) {
      return <div className="text-sm text-gray-900 whitespace-pre-wrap">{parseBold(message.content, 'msg')}</div>
    }

    // Replace [N] with clickable pills
    let content = message.content
    const elements: React.ReactNode[] = []
    let lastIndex = 0

    message.sources.forEach((source) => {
      const pattern = `[${source.label}]`
      const index = content.indexOf(pattern, lastIndex)
      
      if (index !== -1) {
        // Add text before the reference (with bold parsing)
        if (index > lastIndex) {
          elements.push(...parseBold(content.slice(lastIndex, index), `text-${lastIndex}`))
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
    
    // Add remaining text (with bold parsing)
    if (lastIndex < content.length) {
      elements.push(...parseBold(content.slice(lastIndex), 'text-final'))
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
            <span className="text-sm font-semibold text-gray-900">Distribution Network Study</span>
            <span className="text-xs text-gray-400">Saved at 2:34pm</span>
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
                              {/* Add as column button for assistant messages with extractions */}
                              {msg.role === 'assistant' && msg.query && msg.extractedCells && (
                                <button
                                  onClick={() => addAsColumn(msg)}
                                  className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add as column
                                </button>
                              )}
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
            <div ref={tableRef} className="flex-1 flex flex-col min-h-0">
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
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
              
              <div className="flex-1 overflow-auto">
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
              </div>
              
              <button className="flex-shrink-0 w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 cursor-pointer border-t border-gray-200">
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
          <div className="relative w-full max-w-xl rounded-xl bg-gray-50 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 flex items-center gap-3">
              <img src="/images/raven-logo.png" alt="Raven" className="w-7 h-7" />
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-gray-900">Upload files</h2>
                <span className="text-sm text-gray-500">All documents are private and fully encrypted</span>
              </div>
              <button 
                onClick={() => !isUploading && setShowUploadModal(false)}
                className="ml-auto p-1.5 hover:bg-gray-200 rounded cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-1 px-6">
              <button
                onClick={() => setUploadTab('upload')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg cursor-pointer transition-colors ${
                  uploadTab === 'upload' 
                    ? 'bg-white text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Upload Files
              </button>
              <button
                onClick={() => setUploadTab('edgar')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg cursor-pointer transition-colors ${
                  uploadTab === 'edgar' 
                    ? 'bg-white text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                SEC EDGAR
              </button>
            </div>
            
            {/* Content */}
            <div className="bg-white rounded-b-xl rounded-tr-xl p-6">
              {uploadTab === 'upload' ? (
                <div>
                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-colors
                      ${isDragging 
                        ? 'border-gray-400 bg-gray-50' 
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
                    <p className="text-base font-medium text-gray-900 mb-2">
                      Drag and drop files here
                    </p>
                    <p className="text-sm text-gray-500">
                      .pdf, .docx, .txt, .md
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
                            onClick={(e) => { e.stopPropagation(); removeFile(idx) }}
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
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 focus:border-gray-400 outline-none text-sm"
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
              
              {/* Footer */}
              {(uploadedFiles.length > 0 || (uploadTab === 'edgar' && edgarTicker.trim())) && (
                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => setShowUploadModal(false)}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUploadSubmit}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {uploadTab === 'upload' ? `Upload ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''}` : 'Import from EDGAR'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}