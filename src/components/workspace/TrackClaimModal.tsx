// src/components/workspace/TrackClaimModal.tsx

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  text: string
  onConfirm: (config: { source: string; cadence: string; category: string }) => void
  onCancel: () => void
}

const SOURCES = [
  { id: 'web', label: 'Web' },
  { id: 'sec', label: 'SEC' },
  { id: 'news', label: 'News' },
]

const CADENCES = [
  { id: 'realtime', label: 'Real-time' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
]

export default function TrackClaimModal({ text, onConfirm, onCancel }: Props) {
  const [source, setSource] = useState('web')
  const [cadence, setCadence] = useState('daily')
  const [category, setCategory] = useState('general')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[380px] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Track Claim</h3>
            <p className="text-sm text-gray-500 mt-0.5">Configure verification</p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-700 line-clamp-3">"{text}"</p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Verify against</label>
            <div className="flex gap-2">
              {SOURCES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSource(s.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-colors ${source === s.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Frequency</label>
            <div className="flex gap-2">
              {CADENCES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCadence(c.id)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${cadence === c.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="financial">Financial</option>
              <option value="market">Market Data</option>
              <option value="regulatory">Regulatory</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">Cancel</button>
          <button onClick={() => onConfirm({ source, cadence, category })} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg cursor-pointer">Track</button>
        </div>
      </div>
    </div>
  )
}