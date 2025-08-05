'use client'

import { useState } from 'react'
import { marked } from 'marked'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { queryApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'

export default function QueryPanel() {
  const { queries, selectedQuery, setSelectedQuery, setShowQueryPanel, removeQuery } = useReadLinguaStore()
  const [isPlaying, setIsPlaying] = useState(false)

  const handleQueryClick = (query: any) => {
    setSelectedQuery(query)
    
    // Scroll to highlight in article
    if (query.text_position?.highlight_id) {
      const element = document.querySelector(`[data-highlight-id="${query.text_position.highlight_id}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add flash effect
        element.classList.add('animate-pulse')
        setTimeout(() => element.classList.remove('animate-pulse'), 1000)
      }
    }
  }

  const handleDeleteQuery = async (queryId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering query click
    
    try {
      let userId = 'anonymous'
      
      // Try to get authenticated user, but don't require it
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
        }
      } catch (authError) {
        console.log('Using anonymous mode for delete')
      }

      // Delete from database
      await queryApi.deleteQuery(queryId, userId)
      
      // Remove from store
      removeQuery(queryId)
      
    } catch (error) {
      console.error('Error deleting query:', error)
      alert('Failed to delete query. Please try again.')
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

  const parseMarkdownResponse = (text: string) => {
    try {
      return marked.parse(text, {
        breaks: true,        // Convert line breaks to <br>
        gfm: true,          // GitHub Flavored Markdown
        sanitize: false,    // Don't sanitize HTML
      })
    } catch (error) {
      console.warn('Failed to parse AI response markdown:', error)
      return text.replace(/\n/g, '<br>')
    }
  }

  const handlePlayPronunciation = async (text: string) => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      const response = await fetch('/api/readlingua/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onerror = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
      } else {
        console.error('Failed to get audio')
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error)
      setIsPlaying(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-purple-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Query History</h3>
            <span className="text-xs text-gray-500">({queries.length})</span>
          </div>
          <button
            onClick={() => setShowQueryPanel(false)}
            className="w-6 h-6 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Query List - Categorized Tags */}
      <div className="border-b border-gray-200 flex-shrink-0 p-3 space-y-2">
        {queries.length === 0 ? (
          <div className="text-center py-4">
            <svg className="w-6 h-6 mx-auto text-gray-300 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            <p className="text-gray-500 text-xs">Select text to start learning</p>
          </div>
        ) : (
          <>
            {/* Quick Queries */}
            {queries.filter(q => q.query_type === 'quick').length > 0 && (
              <div className="flex items-start">
                <div className="w-20 text-xs font-medium text-purple-700 flex-shrink-0 pt-1">
                  Quick ({queries.filter(q => q.query_type === 'quick').length}):
                </div>
                <div className="flex flex-wrap gap-1 flex-1">
                  {queries
                    .filter(q => q.query_type === 'quick' && q.selected_text)
                    .map((query) => (
                      <div
                        key={query.id}
                        onClick={() => handleQueryClick(query)}
                        className={`group relative cursor-pointer px-2 py-1 rounded text-xs font-medium transition-all shadow-md border-2 ${
                          selectedQuery?.id === query.id
                            ? 'bg-purple-500 text-white shadow-lg border-purple-600'
                            : 'bg-white text-purple-700 hover:shadow-lg border-purple-300 hover:border-purple-400'
                        }`}
                      >
                        <span className="block truncate max-w-24">
                          {query.selected_text}
                        </span>
                        <button
                          onClick={(e) => handleDeleteQuery(query.id, e)}
                          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Standard Queries */}
            {queries.filter(q => q.query_type === 'standard').length > 0 && (
              <div className="flex items-start">
                <div className="w-20 text-xs font-medium text-purple-800 flex-shrink-0 pt-1">
                  Standard ({queries.filter(q => q.query_type === 'standard').length}):
                </div>
                <div className="flex flex-wrap gap-1 flex-1">
                  {queries
                    .filter(q => q.query_type === 'standard' && q.selected_text)
                    .map((query) => (
                      <div
                        key={query.id}
                        onClick={() => handleQueryClick(query)}
                        className={`group relative cursor-pointer px-2 py-1 rounded text-xs font-medium transition-all shadow-md border-2 ${
                          selectedQuery?.id === query.id
                            ? 'bg-purple-500 text-white shadow-lg border-purple-600'
                            : 'bg-white text-purple-700 hover:shadow-lg border-purple-300 hover:border-purple-400'
                        }`}
                      >
                        <span className="block truncate max-w-32">
                          {query.selected_text}
                        </span>
                        <button
                          onClick={(e) => handleDeleteQuery(query.id, e)}
                          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Deep Queries */}
            {queries.filter(q => q.query_type === 'deep').length > 0 && (
              <div className="flex items-start">
                <div className="w-20 text-xs font-medium text-purple-900 flex-shrink-0 pt-1">
                  Deep ({queries.filter(q => q.query_type === 'deep').length}):
                </div>
                <div className="flex flex-wrap gap-1 flex-1">
                  {queries
                    .filter(q => q.query_type === 'deep' && q.selected_text)
                    .map((query) => (
                      <div
                        key={query.id}
                        onClick={() => handleQueryClick(query)}
                        className={`group relative cursor-pointer px-2 py-1 rounded text-xs font-medium transition-all shadow-md border-2 ${
                          selectedQuery?.id === query.id
                            ? 'bg-purple-500 text-white shadow-lg border-purple-600'
                            : 'bg-white text-purple-700 hover:shadow-lg border-purple-300 hover:border-purple-400'
                        }`}
                      >
                        <span className="block truncate max-w-40">
                          {query.selected_text}
                        </span>
                        <button
                          onClick={(e) => handleDeleteQuery(query.id, e)}
                          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity w-3 h-3 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Current Query Detail */}
      {selectedQuery && (
        <div className="flex-1 bg-gray-50 min-h-0 flex flex-col">
          {/* Query Info Header */}
          <div className="p-3 border-b border-gray-200 flex-shrink-0 relative group">
            {/* Delete Button for Current Query */}
            <button
              onClick={(e) => handleDeleteQuery(selectedQuery.id, e)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center"
              title="Delete query"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM8 8a1 1 0 012 0v3a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v3a1 1 0 11-2 0V8z" clipRule="evenodd"/>
              </svg>
            </button>

            <div className="flex items-center justify-between pr-6">
              {/* Left: Query Content with Speaker */}
              <div className="flex items-center gap-2">
                {selectedQuery.selected_text && (
                  <>
                    <div className="text-lg font-bold text-gray-900">
                      "{selectedQuery.selected_text}"
                    </div>
                    <button
                      onClick={() => handlePlayPronunciation(selectedQuery.selected_text!)}
                      disabled={isPlaying}
                      className="w-6 h-6 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                      title="Play pronunciation"
                    >
                      {isPlaying ? (
                        <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </button>
                  </>
                )}
              </div>
              
              {/* Right: Query Type and Time */}
              <div className="text-xs text-gray-400 text-right">
                {getQueryTypeLabel(selectedQuery.query_type)} | {new Date(selectedQuery.created_at).toLocaleString([], { 
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </div>
            </div>
            
            {selectedQuery.user_question && (
              <div className="text-sm text-purple-700 italic mt-2">
                Q: {selectedQuery.user_question}
              </div>
            )}
          </div>
          
          {/* AI Response Content */}
          <div className="flex-1 overflow-y-auto p-3">
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
                __html: parseMarkdownResponse(selectedQuery.ai_response) 
              }}
            />
          </div>

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
        </div>
      )}
    </div>
  )
}