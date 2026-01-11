// Route: src/app/(dashboard)/monitoring/page.tsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Radio, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Claim {
  id: string
  document_id: string
  text: string
  cadence: string
  status: string
  current_status: string
  last_checked_at: string | null
  next_check_at: string | null
  source_url: string | null
  source_title: string | null
}

const STATUS_CONFIG = {
  ok: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Verified' },
  contradiction: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Contradiction' },
  pending: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Pending' },
  error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Error' },
  uncertain: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Uncertain' },
}

export default function MonitoringPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/claims')
      if (res.ok) {
        const data = await res.json()
        setClaims(data)
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClaims = claims.filter(claim => {
    if (filter === 'all') return true
    return claim.current_status === filter
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCadence = (cadence: string) => {
    const map: Record<string, string> = {
      hourly: 'Every hour',
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Every 2 weeks',
      monthly: 'Monthly',
      manual: 'Manual',
    }
    return map[cadence] || cadence
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Monitoring</h1>
        <p className="text-gray-600 mt-1">Track all claims across your documents</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'ok', 'contradiction', 'pending', 'error'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All' : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status}
          </button>
        ))}
      </div>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Radio size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No claims being tracked</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all' 
              ? 'Start by creating a document and highlighting text to track'
              : `No claims with status "${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label || filter}"`
            }
          </p>
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Documents
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadence
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Check
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClaims.map((claim) => {
                const statusConfig = STATUS_CONFIG[claim.current_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
                const StatusIcon = statusConfig.icon

                return (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium truncate max-w-md">
                        "{claim.text}"
                      </p>
                      {claim.source_title && (
                        <p className="text-xs text-gray-500 mt-1">
                          from {claim.source_title}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatCadence(claim.cadence)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(claim.last_checked_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(claim.next_check_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
