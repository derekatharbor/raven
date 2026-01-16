// src/app/(dashboard)/workspace/page.tsx

'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import BlockCanvas from '@/components/canvas/BlockCanvas'

export default function WorkspacePage() {
  const [activeWorkspaceId] = useState('ws-1')
  const [tabs, setTabs] = useState([
    { id: 'doc-1', name: 'Q4 2024 Analysis', hasChanges: false },
    { id: 'doc-2', name: 'Due Diligence Report', hasChanges: true },
  ])
  const [activeTabId, setActiveTabId] = useState('doc-1')

  const handleNewTab = () => {
    const newId = `doc-${Date.now()}`
    setTabs(prev => [...prev, { id: newId, name: 'Untitled', hasChanges: false }])
    setActiveTabId(newId)
  }

  const handleCloseTab = (id: string) => {
    if (tabs.length === 1) return
    const newTabs = tabs.filter(t => t.id !== id)
    setTabs(newTabs)
    if (activeTabId === id) setActiveTabId(newTabs[0].id)
  }
  
  return (
    <div className="h-screen flex bg-white">
      <Sidebar 
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceSelect={() => {}}
        connectedSourceCount={3}
      />
      
      <BlockCanvas 
        documentId={activeTabId}
        documentTitle="Q4 2024 Investment Analysis"
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={setActiveTabId}
        onTabClose={handleCloseTab}
        onNewTab={handleNewTab}
        initialBlocks={[
          { id: '1', type: 'live', content: '<p>Apple Inc. reported revenue of $119.6 billion for Q4 2024, representing a 6% increase year-over-year.</p>', status: 'verified', sourceName: 'SEC EDGAR' },
          { id: '2', type: 'static', content: '<h2>Key Findings</h2>', status: 'default' },
          { id: '3', type: 'live', content: '<p>iPhone revenue reached $69.7 billion, up 5% from the prior year period. Services revenue grew to $23.1 billion, a 14% increase.</p>', status: 'drifted', sourceName: 'AlphaSense' },
          { id: '4', type: 'static', content: '<p>The company maintained healthy gross margins of 45.2% despite macroeconomic headwinds.</p>', status: 'default' },
          { id: '5', type: 'summary', content: '<p>Apple demonstrated strong performance across all major product categories in Q4 2024, with particular strength in Services revenue.</p>', status: 'default' },
          { id: '6', type: 'static', content: '', status: 'default' },
        ]}
      />
    </div>
  )
}