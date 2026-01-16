// src/app/(dashboard)/workspace/page.tsx

'use client'

import Sidebar from '@/components/layout/Sidebar'
import BlockCanvas from '@/components/canvas/BlockCanvas'

export default function WorkspacePage() {
  return (
    <div className="h-screen flex bg-white">
      <Sidebar 
        activeWorkspaceId="ws-1"
        onWorkspaceSelect={() => {}}
        connectedSourceCount={3}
      />
      
      <BlockCanvas documentId="doc-1" />
    </div>
  )
}