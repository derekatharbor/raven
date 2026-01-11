// Route: src/app/(dashboard)/overview/page.tsx

export default function OverviewPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
      <p className="text-gray-600 mt-2">Dashboard stats and recent activity will appear here.</p>
      
      {/* Placeholder stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Active Documents</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Tracked Claims</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Active Contradictions</p>
          <p className="text-3xl font-bold text-[#5BDFFA] mt-1">0</p>
        </div>
      </div>
    </div>
  )
}
