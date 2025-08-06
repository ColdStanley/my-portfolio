'use client'

import { useState } from 'react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'

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

  // Check if text language supports pronunciation - use article language setting  
  const supportsPronunciation = (text: string) => {
    if (!text || text.length === 0) return false
    
    // Get current article from store context
    const store = useReadLinguaStore.getState?.() || {}
    const selectedArticle = store.selectedArticle
    if (!selectedArticle) return false
    
    // Simple: if user selected English or French learning, show pronunciation button
    return selectedArticle.source_language === 'english' || selectedArticle.source_language === 'french'
  }

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
          {/* Selected Text - Prominent Display with pronunciation button */}
          <div className="mb-3 text-center">
            <div className="inline-flex items-start gap-1">
              <span className="text-lg font-bold text-gray-900">
                "{selectedText}"
              </span>
              {supportsPronunciation(selectedText) && (
                <button
                  onClick={async () => {
                    try {
                      const store = useReadLinguaStore.getState?.() || {}
                      const selectedArticle = store.selectedArticle
                      if (!selectedArticle) return
                      
                      const response = await fetch('/api/readlingua/text-to-speech', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          text: selectedText,
                          language: selectedArticle.source_language // Use article's language
                        })
                      })
                      
                      if (response.ok) {
                        const audioBlob = await response.blob()
                        const audioUrl = URL.createObjectURL(audioBlob)
                        const audio = new Audio(audioUrl)
                        
                        audio.onended = () => {
                          URL.revokeObjectURL(audioUrl)
                        }
                        
                        audio.onerror = () => {
                          URL.revokeObjectURL(audioUrl)
                        }
                        
                        await audio.play()
                      } else {
                        const errorData = await response.json()
                        console.error('Failed to get audio:', errorData.error)
                        alert(errorData.error || 'Failed to generate pronunciation')
                      }
                    } catch (error) {
                      console.error('Error playing pronunciation:', error)
                    }
                  }}
                  className="w-4 h-4 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full flex items-center justify-center transition-colors flex-shrink-0 mt-1"
                  title="Play pronunciation"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              )}
            </div>
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