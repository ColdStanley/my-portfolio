'use client'

import { useState } from 'react'

interface TextSelectionToolbarProps {
  position: { x: number; y: number }
  selectedText: string
  onQuerySubmit: (queryType: string, userQuestion?: string) => Promise<void>
  onClose: () => void
}

export default function TextSelectionToolbar({
  position,
  selectedText,
  onQuerySubmit,
  onClose
}: TextSelectionToolbarProps) {
  const [showAskAI, setShowAskAI] = useState(false)
  const [userQuestion, setUserQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQueryType = async (queryType: string) => {
    if (queryType === 'ask_ai') {
      setShowAskAI(true)
      return
    }
    
    setIsSubmitting(true)
    try {
      await onQuerySubmit(queryType)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAskAISubmit = async () => {
    if (!userQuestion.trim()) return
    
    setIsSubmitting(true)
    try {
      await onQuerySubmit('ask_ai', userQuestion)
    } finally {
      setIsSubmitting(false)
      setShowAskAI(false)
      setUserQuestion('')
    }
  }

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-48"
      style={{
        left: position.x,
        top: position.y - 80,
        transform: 'translateX(-50%)'
      }}
    >
      {!showAskAI ? (
        <>
          {/* Selected Text - Prominent Display */}
          <div className="text-lg font-bold text-gray-900 mb-3 text-center">
            "{selectedText}"
          </div>
          
          {/* Action Buttons - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQueryType('quick')}
              disabled={isSubmitting}
              className="px-3 py-2 bg-white hover:bg-purple-50 disabled:bg-gray-100 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-md font-medium text-xs shadow-sm transition-all"
            >
              Quick
            </button>
            <button
              onClick={() => handleQueryType('standard')}
              disabled={isSubmitting}
              className="px-3 py-2 bg-white hover:bg-purple-50 disabled:bg-gray-100 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-md font-medium text-xs shadow-sm transition-all"
            >
              Standard
            </button>
            <button
              onClick={() => handleQueryType('deep')}
              disabled={isSubmitting}
              className="px-3 py-2 bg-white hover:bg-purple-50 disabled:bg-gray-100 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-md font-medium text-xs shadow-sm transition-all"
            >
              Deep
            </button>
            <button
              onClick={() => handleQueryType('ask_ai')}
              disabled={isSubmitting}
              className="px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white border border-purple-500 hover:border-purple-600 rounded-md font-medium text-xs shadow-sm transition-all"
            >
              Ask AI
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Ask AI Input */}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-2 max-w-xs truncate">
              Selected: "{selectedText}"
            </div>
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask anything about this text..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-purple-500 focus:border-purple-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAskAISubmit()}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAskAISubmit}
              disabled={isSubmitting || !userQuestion.trim()}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded font-medium whitespace-nowrap flex items-center gap-1 text-sm"
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414-1.414L9 5.586 7.707 4.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              )}
              Submit
            </button>
            <button
              onClick={() => setShowAskAI(false)}
              className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium whitespace-nowrap flex items-center gap-1 text-sm"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Back
            </button>
          </div>
        </>
      )}
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs"
      >
        ×
      </button>
    </div>
  )
}