// src/app/(dashboard)/workspace/page.tsx
// 
// Block-based document canvas - Notion-style with intelligent block types

'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import BlockCanvas from '@/components/canvas/BlockCanvas'

export default function WorkspacePage() {
  const [activeWorkspaceId] = useState('ws-1')
  
  return (
    <div className="h-screen flex bg-white">
      <Sidebar 
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceSelect={() => {}}
        connectedSourceCount={3}
      />
      
      <BlockCanvas 
        documentId="doc-1"
        initialBlocks={[
          { 
            id: '1', 
            type: 'static', 
            content: '<h1>Q4 2024 Investment Analysis</h1>', 
            status: 'default' 
          },
          { 
            id: '2', 
            type: 'live', 
            content: '<p>Apple Inc. reported revenue of $119.6 billion for Q4 2024, representing a 6% increase year-over-year.</p>', 
            status: 'verified',
            sourceName: 'SEC EDGAR',
            lastChecked: '2 hours ago',
          },
          { 
            id: '3', 
            type: 'delta', 
            content: '<p>Market Cap</p>', 
            status: 'default',
            currentValue: '$3.45T',
            previousValue: '$3.12T',
            changePercent: 10.6,
          },
          { 
            id: '4', 
            type: 'static', 
            content: '<h2>Key Findings</h2>', 
            status: 'default' 
          },
          { 
            id: '5', 
            type: 'live', 
            content: '<p>iPhone revenue reached $69.7 billion, up 5% from the prior year period.</p>', 
            status: 'drifted',
            sourceName: 'AlphaSense',
            lastChecked: '1 day ago',
          },
          { 
            id: '6', 
            type: 'summary', 
            content: '<p>Apple demonstrated strong performance across all major product categories in Q4 2024, with particular strength in Services revenue which grew 14% YoY. The company maintained healthy margins despite inflationary pressures.</p>', 
            status: 'default' 
          },
          { 
            id: '7', 
            type: 'static', 
            content: '', 
            status: 'default' 
          },
        ]}
      />
    </div>
  )
}