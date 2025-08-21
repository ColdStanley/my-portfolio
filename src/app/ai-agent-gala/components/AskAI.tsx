'use client'

import { useState, useRef, useEffect } from 'react'
import { marked } from 'marked'

interface AskAIProps {
  show: boolean
}

export default function AskAI({ show }: AskAIProps) {
  const [question, setQuestion] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [showResponse, setShowResponse] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [displayedResponse, setDisplayedResponse] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Process AI query with streaming
  const processQueryStream = async (
    queryData: {
      selected_text?: string
      query_type: string
      user_question?: string
      source_language: string
      native_language: string
      ai_model?: 'deepseek' | 'openai'
      custom_prompt_template?: string
    },
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    try {
      const response = await fetch('/api/readlingua/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...queryData,
          ai_model: queryData.ai_model || 'deepseek'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process AI query')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'chunk') {
                onChunk(data.content)
              } else if (data.type === 'complete') {
                onComplete(data.full_response)
                return
              } else if (data.type === 'error') {
                onError(data.error)
                return
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      onError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Parse markdown response
  const parseMarkdownResponse = (text: string): string => {
    try {
      const result = marked.parse(text, {
        breaks: true,
        gfm: true,
      })
      return typeof result === 'string' ? result : text.replace(/\n/g, '<br>')
    } catch (error) {
      console.warn('Failed to parse AI response markdown:', error)
      return text.replace(/\n/g, '<br>')
    }
  }

  // Typing effect for streaming display
  const startTypingEffect = (fullText: string) => {
    setDisplayedResponse('')
    setIsTyping(true)
    
    let currentIndex = 0
    const typingSpeed = 30 // milliseconds per character
    
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
    }
    
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedResponse(fullText.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsTyping(false)
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current)
          typingIntervalRef.current = null
        }
      }
    }, typingSpeed)
  }

  // Clean up typing effect on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [])

  const handleSearch = async () => {
    if (!question.trim() || isSearching) return

    setIsSearching(true)
    setHasError(false)
    setAiResponse('')
    setDisplayedResponse('')
    setShowResponse(true)
    setIsTyping(false)

    // Clear any existing typing effect
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }

    let fullResponse = ''

    await processQueryStream(
      {
        selected_text: '',
        query_type: 'ask_ai',
        user_question: question,
        source_language: 'english',
        native_language: 'chinese',
        ai_model: 'deepseek'
      },
      // onChunk - immediate streaming display
      (chunk: string) => {
        fullResponse += chunk
        setAiResponse(fullResponse)
        setDisplayedResponse(fullResponse) // Show chunks immediately without typing effect
      },
      // onComplete - start typing effect for final polished display
      (complete: string) => {
        setAiResponse(complete)
        startTypingEffect(complete) // Final typing effect for completed response
        setIsSearching(false)
      },
      // onError
      (error: string) => {
        const errorMsg = `Error: ${error}`
        setAiResponse(errorMsg)
        setDisplayedResponse(errorMsg)
        setHasError(true)
        setIsSearching(false)
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setShowResponse(false)
    setQuestion('')
    setAiResponse('')
    setDisplayedResponse('')
    setHasError(false)
    setIsTyping(false)
    
    // Clear typing effect
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }
  }

  if (!show) return null

  return (
    <>
      {/* Ask AI Button - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group"
          style={{
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
          title="Ask AI"
        >
          <svg 
            className="w-5 h-5 text-purple-500 transition-transform duration-200" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Centered Response Modal */}
      {isOpen && showResponse && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"
            onClick={handleClose}
          />
          
          {/* Centered Response Panel */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100"
              style={{
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-lg font-semibold text-gray-700">Ask AI</span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Question Display */}
              <div className="p-4 bg-purple-50 border-b border-gray-200">
                <div className="text-sm text-purple-700 font-medium mb-1">Your Question:</div>
                <div className="text-gray-800">{question}</div>
              </div>

              {/* Response Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                ) : hasError ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <div className="text-red-600">{displayedResponse}</div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    style={{
                      '--tw-prose-body': '#374151',
                      '--tw-prose-headings': '#111827',
                      '--tw-prose-links': '#7c3aed',
                      '--tw-prose-bold': '#111827',
                      '--tw-prose-counters': '#6b7280',
                      '--tw-prose-bullets': '#d1d5db',
                    } as React.CSSProperties}
                    dangerouslySetInnerHTML={{ 
                      __html: parseMarkdownResponse(displayedResponse || 'No response received') 
                    }}
                  />
                )}
                
                {/* Typing indicator */}
                {isTyping && !isSearching && (
                  <div className="mt-2 flex items-center gap-1 text-purple-500">
                    <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Powered by DeepSeek AI
                  </div>
                  <button
                    onClick={() => {
                      setShowResponse(false)
                      setQuestion('')
                      setAiResponse('')
                      setDisplayedResponse('')
                      setHasError(false)
                    }}
                    className="px-3 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors"
                  >
                    Ask Another Question
                  </button>
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            .prose :global(p) {
              margin-bottom: 1rem;
            }
            .prose :global(ul),
            .prose :global(ol) {
              margin: 0.75rem 0;
            }
            .prose :global(li) {
              margin-bottom: 0.25rem;
            }
            .prose :global(strong) {
              font-weight: 600;
              color: #111827;
            }
            .prose :global(em) {
              font-style: italic;
              color: #374151;
            }
            .prose :global(h1),
            .prose :global(h2),
            .prose :global(h3),
            .prose :global(h4) {
              margin: 1.25rem 0 0.75rem 0;
              font-weight: 600;
            }
            .prose :global(br) {
              margin-bottom: 0.5rem;
            }
          `}</style>
        </>
      )}

      {/* Ask AI Search Interface - Bottom Right */}
      {isOpen && !showResponse && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
          
          {/* Search Content */}
          <div className="fixed bottom-24 right-6 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl min-w-80 transform transition-all duration-200"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Search Input Section */}
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Ask AI</span>
                <button
                  onClick={handleClose}
                  className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                  disabled={isSearching}
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  disabled={!question.trim() || isSearching}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-all"
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Helper text */}
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Press Enter to search
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}