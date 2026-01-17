// Path: src/components/publish/PublishModal.tsx
// Path: src/components/publish/PublishModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  X, Link2, Lock, Globe, Users, Check, Copy,
  ChevronRight, Mail, Loader2, Eye, EyeOff,
  Clock, Shield
} from 'lucide-react'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentTitle: string
  blocks: any[]
}

interface PublishState {
  published: boolean
  url?: string
  slug?: string
  version?: number
  requireEmail: boolean
  notifyOnView: boolean
  expiresAt?: string
  stats?: {
    total_views: number
    unique_viewers: number
  }
}

export default function PublishModal({ 
  isOpen, 
  onClose, 
  documentId, 
  documentTitle,
  blocks 
}: PublishModalProps) {
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('error')
  const [publishState, setPublishState] = useState<PublishState | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [accessLevel, setAccessLevel] = useState<'private' | 'link' | 'public'>('link')
  const [requireEmail, setRequireEmail] = useState(false)
  const [notifyOnView, setNotifyOnView] = useState(true)
  const [showAccessMenu, setShowAccessMenu] = useState(false)

  // Fetch current publish state
  useEffect(() => {
    if (isOpen && documentId) {
      fetchPublishState()
    }
  }, [isOpen, documentId])

  const fetchPublishState = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/publish?document_id=${documentId}`)
      const data = await res.json()
      
      if (data.published) {
        setPublishState({
          published: true,
          url: data.url,
          slug: data.slug,
          version: data.current_version?.version_number,
          requireEmail: data.require_email,
          notifyOnView: data.notify_on_view,
          expiresAt: data.expires_at,
          stats: data.stats,
        })
        setRequireEmail(data.require_email)
        setNotifyOnView(data.notify_on_view)
        setAccessLevel(data.require_email ? 'private' : 'link')
      } else {
        setPublishState({ published: false, requireEmail: false, notifyOnView: true })
      }
    } catch (err) {
      console.error('Failed to fetch publish state:', err)
      setPublishState({ published: false, requireEmail: false, notifyOnView: true })
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    // Can't publish unsaved documents
    if (!documentId || documentId === 'new') {
      setMessage('Please save the document first')
      setMessageType('error')
      return
    }

    setPublishing(true)
    setMessage('')
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: documentId,
          title: documentTitle,
          blocks,
          require_email: accessLevel === 'private',
          notify_on_view: notifyOnView,
          commit_message: publishState?.published ? 'Updated document' : 'Initial publish',
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        console.error('Publish error:', data)
        setMessage(data.error || 'Failed to publish')
        setMessageType('error')
        return
      }
      
      if (data.success) {
        setPublishState({
          published: true,
          url: data.url,
          slug: data.slug,
          version: data.version_number,
          requireEmail: accessLevel === 'private',
          notifyOnView,
          stats: publishState?.stats,
        })
        setMessage('')
      } else {
        setMessage(data.error || 'Failed to publish')
        setMessageType('error')
      }
    } catch (err) {
      console.error('Publish failed:', err)
      setMessage('Network error - please try again')
      setMessageType('error')
    } finally {
      setPublishing(false)
    }
  }

  const copyLink = () => {
    if (publishState?.url) {
      navigator.clipboard.writeText(publishState.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleInvite = () => {
    // TODO: Implement invite logic
    console.log('Invite:', inviteEmail)
    setInviteEmail('')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-[#2D2D2D] rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="text-white font-medium">
              {publishState?.published ? 'Share' : 'Publish'} "{documentTitle}"
            </h2>
            <div className="flex items-center gap-2">
              {publishState?.published && (
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#7DD3FC] hover:bg-white/5 rounded transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              {/* Invite Input */}
              <div className="px-5 py-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Add comma separated emails to invite"
                      className="w-full px-4 py-2.5 bg-transparent border border-[#4DA8DA] rounded-lg text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#4DA8DA]"
                    />
                  </div>
                  <button
                    onClick={handleInvite}
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
                
                {/* Access Level Options */}
                <div className="space-y-1">
                  {/* Private - Only invited */}
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
                    {publishState?.stats && (
                      <span className="text-xs text-gray-500">{publishState.stats.unique_viewers} viewers</span>
                    )}
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

              {/* Published URL / Publish Button */}
              <div className="px-5 py-4 bg-[#252525] border-t border-white/10">
                {publishState?.published ? (
                  <div className="space-y-3">
                    {/* URL Display */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-[#1A1A1A] rounded-lg">
                        <span className="text-sm text-gray-400 font-mono">
                          {publishState.url}
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
                        <span>v{publishState.version}</span>
                        {publishState.stats && (
                          <>
                            <span>•</span>
                            <span>{publishState.stats.total_views} views</span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {publishing && <Loader2 className="w-3 h-3 animate-spin" />}
                        Push Update
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        Publish Document
                      </>
                    )}
                  </button>
                )}
                
                {/* Error/Success Message */}
                {message && (
                  <p className={`text-sm text-center mt-3 ${messageType === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                    {message}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}