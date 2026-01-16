// src/lib/blocks/types.ts

export type BlockType = 
  | 'static' 
  | 'live' 
  | 'derived' 
  | 'synced' 
  | 'delta' 
  | 'summary'

export type BlockStatus = 
  | 'default' 
  | 'verified' 
  | 'drifted' 
  | 'stale' 
  | 'loading'

export type DeltaDirection = 'up' | 'down' | 'neutral'

export interface BlockSource {
  id: string
  name: string
  type: 'alphasense' | 'salesforce' | 'sec-edgar' | 'custom-api' | 'manual'
  field?: string
  lastValue?: string
  lastChecked?: string
}

export interface BlockData {
  id: string
  type: BlockType
  content: string // HTML content from TipTap
  status: BlockStatus
  
  // Live block specific
  source?: BlockSource
  cadence?: 'realtime' | 'hourly' | 'daily' | 'weekly'
  
  // Derived block specific
  formula?: string
  referencedBlocks?: string[]
  
  // Synced block specific
  syncGroupId?: string
  isSyncSource?: boolean
  
  // Delta block specific
  previousValue?: string
  currentValue?: string
  deltaDirection?: DeltaDirection
  deltaPercent?: number
  
  // Summary block specific
  sourceBlocks?: string[]
  summaryPrompt?: string
  
  // Drift tracking
  driftDetails?: {
    originalContent: string
    newSourceValue: string
    detectedAt: string
    field?: string
  }
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface BlockTypeConfig {
  type: BlockType
  label: string
  description: string
  icon: string
  color: string
  defaultContent?: string
}

export const BLOCK_TYPE_CONFIGS: Record<BlockType, BlockTypeConfig> = {
  static: {
    type: 'static',
    label: 'Text',
    description: 'Plain text block with no external connections',
    icon: 'Type',
    color: 'transparent',
  },
  live: {
    type: 'live',
    label: 'Live Data',
    description: 'Connected to an external data source',
    icon: 'Radio',
    color: '#3B82F6', // Blue
  },
  derived: {
    type: 'derived',
    label: 'Derived',
    description: 'Calculated from other blocks',
    icon: 'Calculator',
    color: '#8B5CF6', // Purple
  },
  synced: {
    type: 'synced',
    label: 'Synced',
    description: 'Linked across documents',
    icon: 'Link2',
    color: '#14B8A6', // Teal
  },
  delta: {
    type: 'delta',
    label: 'Delta',
    description: 'Shows value changes over time',
    icon: 'TrendingUp',
    color: '#10B981', // Green (changes based on direction)
  },
  summary: {
    type: 'summary',
    label: 'AI Summary',
    description: 'Auto-generated summary from other blocks',
    icon: 'Sparkles',
    color: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', // Blue to purple gradient
  },
}

// Status indicator colors
export const STATUS_COLORS: Record<BlockStatus, { bg: string; border: string }> = {
  default: { bg: 'transparent', border: 'transparent' },
  verified: { bg: '#10B981', border: '#10B981' },
  drifted: { bg: '#F59E0B', border: '#F59E0B' },
  stale: { bg: '#9CA3AF', border: '#9CA3AF' },
  loading: { bg: '#3B82F6', border: '#3B82F6' },
}

// Helper to create a new block
export function createBlock(type: BlockType = 'static', content: string = ''): BlockData {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    status: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
