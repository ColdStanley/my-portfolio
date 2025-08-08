'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { marked } from 'marked'
import { X } from 'lucide-react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'

interface AIResponseFloatingPanelProps {
  isVisible: boolean
  selectedText: string
  queryType: string
  aiResponse: string
  isLoading: boolean
  hasError: boolean
  onClose: () => void
  onPlayPronunciation?: (text: string) => void
  isPlaying?: boolean
}

export default function AIResponseFloatingPanel({
  isVisible,
  selectedText,
  queryType,
  aiResponse,
  isLoading,
  hasError,
  onClose,
  onPlayPronunciation,
  isPlaying = false
}: AIResponseFloatingPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Check if text language supports pronunciation - use article language setting
  const supportsPronunciation = (text: string) => {
    if (!text || text.length === 0) return false
    
    // Get current article from store context (passed via props would be better, but this works)
    const store = useReadLinguaStore.getState?.() || {}
    const selectedArticle = store.selectedArticle
    if (!selectedArticle) return false
    
    // Simple: if user selected English or French learning, show pronunciation button
    return selectedArticle.source_language === 'english' || selectedArticle.source_language === 'french'
  }

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(onClose, 200) // Wait for exit animation to complete
  }

  const parseMarkdownResponse = (text: string) => {
    if (!text) return ''
    try {
      return marked.parse(text, {
        breaks: true,
        gfm: true,
        sanitize: false,
      })
    } catch (error) {
      console.warn('Failed to parse AI response markdown:', error)
      return text.replace(/\n/g, '<br>')
    }
  }

  const getQueryTypeLabel = (type: string) => {
    const labels = {
      quick: 'Quick',
      standard: 'Standard', 
      deep: 'Deep',
      ask_ai: 'Ask AI'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getQueryTypeColor = (type: string) => {
    const colors = {
      quick: 'bg-purple-100 text-purple-700',
      standard: 'bg-purple-200 text-purple-800',
      deep: 'bg-purple-300 text-purple-900',
      ask_ai: 'bg-purple-500 text-white'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  if (!isVisible) return null

  const panelContent = (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[10000] transition-opacity duration-300 bg-black/20 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Floating Panel */}
      <div 
        className={`fixed bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col ${
          isAnimating ? 'ai-panel-enter' : 'ai-panel-exit'
        }`}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          width: Math.min(700, window.innerWidth * 0.9) + 'px',
          height: Math.min(600, window.innerHeight * 0.85) + 'px',
          maxHeight: window.innerHeight * 0.85 + 'px',
          marginLeft: -Math.min(700, window.innerWidth * 0.9) / 2 + 'px',
          marginTop: -Math.min(600, window.innerHeight * 0.85) / 2 + 'px',
          zIndex: 2147483647,
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-start">
            {/* Selected Text with Pronunciation Button at end */}
            <div className="flex items-start gap-1">
              <div className="text-lg font-bold text-gray-900">
                "{selectedText}"
              </div>
              
              {/* Pronunciation Button - only show for supported languages */}
              {onPlayPronunciation && supportsPronunciation(selectedText) && (
                <button
                  onClick={() => onPlayPronunciation(selectedText)}
                  disabled={isPlaying}
                  className="w-5 h-5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 mt-1 ml-1 flex-shrink-0"
                  title="Play pronunciation"
                >
                  {isPlaying ? (
                    <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Query Type Badge */}
            <span className={`px-2 py-1 rounded text-xs font-medium ${getQueryTypeColor(queryType)}`}>
              {getQueryTypeLabel(queryType)}
            </span>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="w-7 h-7 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0">
          {isLoading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">AI is analyzing...</p>
              <p className="text-xs text-gray-400 mt-1">Please wait, AI is generating response</p>
            </div>
          ) : hasError ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center h-full text-red-500">
              <svg className="w-8 h-8 mb-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm text-center max-w-md">{aiResponse || 'AI processing failed, please try again'}</p>
            </div>
          ) : (
            /* AI Response Content */
            <div 
              className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none ai-response"
              style={{
                '--tw-prose-body': '#374151',
                '--tw-prose-headings': '#111827',
                '--tw-prose-links': '#7c3aed',
                '--tw-prose-bold': '#111827',
                '--tw-prose-counters': '#6b7280',
                '--tw-prose-bullets': '#d1d5db',
              } as React.CSSProperties}
              dangerouslySetInnerHTML={{ 
                __html: parseMarkdownResponse(aiResponse) 
              }}
            />
          )}
        </div>

        {/* Inline Styles for AI Response */}
        <style jsx>{`
          .ai-response :global(p) {
            margin-bottom: 1rem;
          }
          .ai-response :global(ul),
          .ai-response :global(ol) {
            margin: 0.75rem 0;
          }
          .ai-response :global(li) {
            margin-bottom: 0.25rem;
          }
          .ai-response :global(strong) {
            font-weight: 600;
            color: #111827;
          }
          .ai-response :global(em) {
            font-style: italic;
            color: #374151;
          }
          .ai-response :global(h1),
          .ai-response :global(h2),
          .ai-response :global(h3),
          .ai-response :global(h4) {
            margin: 1.25rem 0 0.75rem 0;
            font-weight: 600;
          }
          .ai-response :global(br) {
            margin-bottom: 0.5rem;
          }
        `}</style>

        {/* Refined Sci-Fi Animation Styles */}
        <style jsx>{`
          :global(.ai-panel-enter) {
            animation: scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          :global(.ai-panel-exit) {
            animation: scaleOut 0.2s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
          }
          
          @keyframes scaleIn {
            0% { 
              opacity: 0;
              transform: scale(0.8);
              box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.4);
            }
            60% {
              transform: scale(1.02);
              box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
            }
            100% { 
              opacity: 1;
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(139, 92, 246, 0.15);
            }
          }
          
          @keyframes scaleOut {
            0% { 
              opacity: 1;
              transform: scale(1);
            }
            100% { 
              opacity: 0;
              transform: scale(0.9);
              box-shadow: 0 0 0 rgba(139, 92, 246, 0);
            }
          }
        `}</style>
      </div>
    </>
  )
  
  return typeof document !== 'undefined' ? createPortal(panelContent, document.body) : null
}