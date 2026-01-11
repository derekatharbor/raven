// Route: src/app/page.tsx

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Harbor</h1>
        <p className="text-gray-600 mb-8">Living Reports Platform</p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/signup" 
            className="px-6 py-3 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}