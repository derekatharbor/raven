// src/app/(dashboard)/workspace/page.tsx
// 
// Three-pane architecture: Sidebar | Block Canvas | Proof Pane

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
        documentTitle="Q4 2024 Investment Analysis"
        showProofPane={true}
        initialBlocks={[
          { 
            id: '1', 
            type: 'live', 
            content: '<p>Apple Inc. reported revenue of $119.6 billion for Q4 2024, representing a 6% increase year-over-year.</p>', 
            status: 'verified',
            sourceName: 'SEC EDGAR',
            lastChecked: '2 hours ago',
          },
          { 
            id: '2', 
            type: 'static', 
            content: '<h2>Key Findings</h2>', 
            status: 'default' 
          },
          { 
            id: '3', 
            type: 'live', 
            content: '<p>iPhone revenue reached $69.7 billion, up 5% from the prior year period. Services revenue grew to $23.1 billion, a 14% increase that exceeded analyst expectations.</p>', 
            status: 'drifted',
            sourceName: 'AlphaSense',
            lastChecked: '1 day ago',
          },
          { 
            id: '4', 
            type: 'static', 
            content: '<p>The company maintained healthy gross margins of 45.2% despite continued macroeconomic headwinds and currency pressures in international markets.</p>', 
            status: 'default' 
          },
          { 
            id: '5', 
            type: 'summary', 
            content: '<p>Apple demonstrated strong performance across all major product categories in Q4 2024, with particular strength in Services revenue. The company maintained healthy margins and continued to return capital to shareholders through dividends and buybacks.</p>', 
            status: 'default' 
          },
          { 
            id: '6', 
            type: 'static', 
            content: '', 
            status: 'default' 
          },
        ]}
      />
    </div>
  )
}