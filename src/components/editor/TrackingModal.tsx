'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Prompt {
  id?: string
  text: string
  cadence: string
  until: string
}

interface TrackingModalProps {
  highlightedText: string
  existingPrompts?: Prompt[]
  onConfirm: (prompts: Prompt[]) => void
  onCancel: () => void
  position?: { top: number; left: number }
}

const CADENCE_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: '1 week' },
  { value: 'biweekly', label: '2 weeks' },
  { value: 'monthly', label: 'Monthly' },
]

export function TrackingModal({
  highlightedText,
  existingPrompts = [],
  onConfirm,
  onCancel,
  position,
}: TrackingModalProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(existingPrompts)
  const [newPromptText, setNewPromptText] = useState('')
  const [newPromptCadence, setNewPromptCadence] = useState('biweekly')
  const [newPromptUntil, setNewPromptUntil] = useState('')
  const [isAddingPrompt, setIsAddingPrompt] = useState(false)

  const handleAddPrompt = () => {
    if (!newPromptText.trim()) return
    
    setPrompts([
      ...prompts,
      {
        text: newPromptText,
        cadence: newPromptCadence,
        until: newPromptUntil,
      },
    ])
    setNewPromptText('')
    setNewPromptCadence('biweekly')
    setNewPromptUntil('')
    setIsAddingPrompt(false)
  }

  const handleRemovePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index))
  }

  const formatCadence = (cadence: string) => {
    return CADENCE_OPTIONS.find(o => o.value === cadence)?.label || cadence
  }

  return (
    <div
      className="absolute z-50 w-[402px] bg-white rounded-[13px] shadow-[0px_5px_13px_5px_rgba(134,134,134,0.25)]"
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-4 pb-2">
        <div className="w-3 h-3 bg-[#5BDFFA] rounded-full" />
        <h3 className="text-[22px] font-semibold text-black font-['Source_Sans_3']">
          Track Live Data Point
        </h3>
      </div>

      {/* Highlighted Text Display */}
      <div className="mx-4 p-3 bg-[#F8F8F8] rounded-[7px] flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="shrink-0">
          <path d="M8 12L16 20L24 12" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[#828282] text-[20px] font-medium font-['Source_Sans_3'] leading-[25px]">
          "{highlightedText}"
        </span>
      </div>

      {/* Existing Prompts */}
      <div className="p-4 space-y-3">
        {prompts.map((prompt, index) => (
          <div
            key={prompt.id || index}
            className="p-3 bg-[#F9F9F9] rounded-[8px] border border-[#EFEFEF] relative group"
          >
            <button
              onClick={() => handleRemovePrompt(index)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
            <p className="text-black text-[16px] font-medium font-['Source_Sans_3'] pr-6">
              {prompt.text}
            </p>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-[#787878] text-[14px] font-medium font-['Source_Sans_3']">
                  Check Every:
                </span>
                <span className="text-black text-[14px] font-medium italic font-['Source_Sans_3']">
                  {formatCadence(prompt.cadence)}
                </span>
              </div>
              {prompt.until && (
                <div className="flex items-center gap-1">
                  <span className="text-[#787878] text-[14px] font-medium font-['Source_Sans_3']">
                    Until:
                  </span>
                  <span className="text-black text-[14px] font-medium italic font-['Source_Sans_3']">
                    {prompt.until}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add New Prompt */}
        {isAddingPrompt ? (
          <div className="p-3 bg-[#F9F9F9] rounded-[8px] border border-[#5BDFFA] space-y-3">
            <input
              type="text"
              placeholder="What should we track?"
              value={newPromptText}
              onChange={(e) => setNewPromptText(e.target.value)}
              className="w-full p-2 text-[16px] font-['Source_Sans_3'] bg-white rounded border border-[#EFEFEF] focus:outline-none focus:border-[#5BDFFA]"
              autoFocus
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[#787878] text-[12px] font-medium font-['Source_Sans_3'] block mb-1">
                  Check Every
                </label>
                <select
                  value={newPromptCadence}
                  onChange={(e) => setNewPromptCadence(e.target.value)}
                  className="w-full p-2 text-[14px] font-['Source_Sans_3'] bg-white rounded border border-[#EFEFEF] focus:outline-none focus:border-[#5BDFFA]"
                >
                  {CADENCE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[#787878] text-[12px] font-medium font-['Source_Sans_3'] block mb-1">
                  Until
                </label>
                <input
                  type="date"
                  value={newPromptUntil}
                  onChange={(e) => setNewPromptUntil(e.target.value)}
                  className="w-full p-2 text-[14px] font-['Source_Sans_3'] bg-white rounded border border-[#EFEFEF] focus:outline-none focus:border-[#5BDFFA]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddingPrompt(false)}
                className="px-3 py-1 text-[14px] font-medium font-['Source_Sans_3'] text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrompt}
                className="px-3 py-1 text-[14px] font-medium font-['Source_Sans_3'] text-white bg-black rounded"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingPrompt(true)}
            className="w-full p-2 bg-white rounded-[3px] border border-[#F3F3F3] text-black text-[15px] font-medium font-['Source_Sans_3'] hover:bg-gray-50 transition-colors"
          >
            + Start tracking
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 p-4 pt-2">
        <button
          onClick={onCancel}
          className="px-5 py-2 bg-white rounded-[5px] border border-[#F7F7F7] text-black text-[16px] font-medium font-['Source_Sans_3'] hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(prompts)}
          className="px-5 py-2 bg-black rounded-[5px] border border-black text-white text-[16px] font-medium font-['Source_Sans_3'] hover:bg-gray-800 transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  )
}
