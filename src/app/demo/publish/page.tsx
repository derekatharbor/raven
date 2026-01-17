// Path: src/app/demo/publish/page.tsx
'use client'

import { useState } from 'react'
import { 
  X, Link2, Lock, Globe, Check, Copy,
  Mail, Eye, Share2
} from 'lucide-react'

// Mock data for demo
const mockPublishState = {
  published: true,
  url: 'https://tryraven.io/d/q3analysis',
  slug: 'q3analysis',
  version: 3,
  requireEmail: false,
  notifyOnView: true,
  stats: {
    total_views: 47,
    unique_viewers: 23,
  },
}

export default function PublishDemoPage() {
  const [isOpen, setIsOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [accessLevel, setAccessLevel] = useState<'private' | 'link' | 'public'>('link')
  const [requireEmail, setRequireEmail] = useState(false)
  const [notifyOnView, setNotifyOnView] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')

  const copyLink = () => {
    navigator.clipboard.writeText(mockPublishState.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Preview button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium"
        >
          <Share2 className="w-4 h-4" />
          Open Publish Modal
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-md">
            <div className="bg-[#2D2D2D] rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 className="text-white font-medium">
                  Share "Q3 2024 Investment Analysis"
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#7DD3FC] hover:bg-white/5 rounded transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Invite Input */}
              <div className="px-5 py-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Add comma separated emails to invite"
                      className="w-full px-4 py-2.5 bg-transparent border border-[#4DA8DA] rounded-lg text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#4DA8DA]"
                    />
                  </div>
                  <button
                    disabled={!inviteEmail.trim()}
                    className="px-4 py-2.5 bg-[#4A4A4A] text-white rounded-lg text-sm font-medium hover:bg-[#5A5A5A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Invite
                  </button>
                </div>
              </div>

              {/* Access Section */}
              <div className="px-5 pb-2">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Who has access</div>
                
                <div className="space-y-1">
                  {/* Private */}
                  <button
                    onClick={() => setAccessLevel('private')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      accessLevel === 'private' ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <Lock className="w-5 h-5 text-gray-400" />
                    <span className="flex-1 text-left text-sm text-white">Only those invited</span>
                    {accessLevel === 'private' && <Check className="w-4 h-4 text-[#4DA8DA]" />}
                  </button>

                  {/* Anyone with link */}
                  <button
                    onClick={() => setAccessLevel('link')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      accessLevel === 'link' ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <Link2 className="w-5 h-5 text-gray-400" />
                    <span className="flex-1 text-left text-sm text-white">Anyone with the link</span>
                    <span className="text-xs text-gray-500">{mockPublishState.stats.unique_viewers} viewers</span>
                    {accessLevel === 'link' && <Check className="w-4 h-4 text-[#4DA8DA]" />}
                  </button>

                  {/* Public */}
                  <button
                    onClick={() => setAccessLevel('public')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      accessLevel === 'public' ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="flex-1 text-left text-sm text-white">Public on web</span>
                    {accessLevel === 'public' && <Check className="w-4 h-4 text-[#4DA8DA]" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="px-5 py-3 border-t border-white/10">
                <div className="space-y-2">
                  {/* Require email */}
                  <button
                    onClick={() => setRequireEmail(!requireEmail)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-left text-sm text-gray-300">Require email to view</span>
                    <div className={`w-8 h-5 rounded-full transition-colors cursor-pointer ${requireEmail ? 'bg-[#4DA8DA]' : 'bg-gray-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${requireEmail ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>

                  {/* Notify on view */}
                  <button
                    onClick={() => setNotifyOnView(!notifyOnView)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-left text-sm text-gray-300">Notify me when viewed</span>
                    <div className={`w-8 h-5 rounded-full transition-colors cursor-pointer ${notifyOnView ? 'bg-[#4DA8DA]' : 'bg-gray-600'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${notifyOnView ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Published URL */}
              <div className="px-5 py-4 bg-[#252525] border-t border-white/10">
                <div className="space-y-3">
                  {/* URL Display */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-[#1A1A1A] rounded-lg">
                      <span className="text-sm text-gray-400 font-mono">
                        {mockPublishState.url}
                      </span>
                    </div>
                    <button
                      onClick={copyLink}
                      className="p-2 bg-[#3A3A3A] hover:bg-[#4A4A4A] rounded-lg transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Stats & Update */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>v{mockPublishState.version}</span>
                      <span>•</span>
                      <span>{mockPublishState.stats.total_views} views</span>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer">
                      Push Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}