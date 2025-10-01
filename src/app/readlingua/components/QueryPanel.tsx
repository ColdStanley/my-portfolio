'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { marked } from 'marked'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { queryApi , ttsApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'
import SimpleQuiz from './SimpleQuiz'

export default function QueryPanel() {
  const { 
    queries, 
    selectedQuery, 
    setSelectedQuery, 
    setShowQueryPanel, 
    removeQuery,
    selectedArticle,
    addToEmailSelection
  } = useReadLinguaStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<'quick' | 'standard' | 'deep' | 'ask_ai' | 'quiz'>('quick')
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [deleteMode, setDeleteMode] = useState<string | null>(null)
  // Text selection states for pronunciation and email selection
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null)
  const [showSelectionToolbar, setShowSelectionToolbar] = useState(false)


  // Tab change handler - simplified
  const handleTabChange = (tabId: 'quick' | 'standard' | 'deep' | 'ask_ai' | 'quiz') => {
    setActiveTab(tabId)
    
    // Auto-select first query in the new tab, or clear if no queries
    if (tabId === 'quiz') {
      // Quiz tab - clear query selection
      setSelectedQuery(null)
    } else {
      // Get first query of the new tab type
      const tabQueries = queries.filter(q => q.query_type === tabId && q.selected_text)
      if (tabQueries.length > 0) {
        // Auto-select first query
        setSelectedQuery(tabQueries[0])
      } else {
        // No queries in this tab, clear selection
        setSelectedQuery(null)
      }
    }
  }

  const handleQueryClick = (query: any) => {
    setSelectedQuery(query)
    // Removed article scrolling - only show query details
  }

  const handleLongPressStart = (queryId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const timer = setTimeout(() => {
      // Long press triggered - enter delete mode
      setDeleteMode(queryId)
      setLongPressTimer(null)
    }, 800) // 800ms long press
    
    setLongPressTimer(timer)
  }
  
  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }
  
  const handleDeleteConfirm = async (queryId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      let userId = 'anonymous'
      
      // Try to get authenticated user, but don't require it
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
        }
      } catch (authError) {
        // Using anonymous mode
      }

      // Delete from database
      await queryApi.deleteQuery(queryId, userId)
      
      // Remove from store
      removeQuery(queryId)
      
    } catch (error) {
      console.error('Error deleting query:', error)
      toast.error('Failed to delete query. Please try again.')
    } finally {
      setDeleteMode(null)
    }
  }
  
  const handleClickOutside = () => {
    setDeleteMode(null)
  }
  
  // Handle ESC key to exit delete mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDeleteMode(null)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Add document click listener for hiding pronunciation button
  useEffect(() => {
    document.addEventListener('click', handleDocumentClick)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  const getQueryTypeLabel = (type: string) => {
    const labels = {
      copy: 'Copy',
      quick: 'Quick',
      standard: 'Standard', 
      deep: 'Deep',
      ask_ai: 'Ask AI'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getQueryTypeColor = (type: string) => {
    const colors = {
      copy: 'bg-gray-100 text-gray-700',
      quick: 'bg-neutral-light text-text-primary',
      standard: 'bg-neutral-light text-text-primary',
      deep: 'bg-accent text-black',
      ask_ai: 'bg-primary text-white'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const parseMarkdownResponse = (text: string): string => {
    try {
      const result = marked.parse(text, {
        breaks: true,        // Convert line breaks to <br>
        gfm: true,          // GitHub Flavored Markdown
      })
      // marked.parse can return a string or Promise<string>, we need string only
      return typeof result === 'string' ? result : text.replace(/\n/g, '<br>')
    } catch (error) {
      return text.replace(/\n/g, '<br>')
    }
  }

  const getQueryCountByType = (type: string) => {
    return queries.filter(q => q.query_type === type).length
  }

  const getFilteredQueries = () => {
    if (activeTab === 'quiz') return []
    return queries.filter(q => q.query_type === activeTab && (q.selected_text || q.query_type === 'ask_ai'))
  }

  const getGridCols = (queryType: string) => {
    const gridCols = {
      'quick': 'grid-cols-4',
      'standard': 'grid-cols-3', 
      'deep': 'grid-cols-1',
      'ask_ai': 'grid-cols-1'
    }
    return gridCols[queryType as keyof typeof gridCols] || 'grid-cols-3'
  }


  const tabs = [
    { id: 'quick' as const, label: 'Quick', count: getQueryCountByType('quick') },
    { id: 'standard' as const, label: 'Standard', count: getQueryCountByType('standard') },
    { id: 'deep' as const, label: 'Deep', count: getQueryCountByType('deep') },
    { id: 'ask_ai' as const, label: 'Ask AI', count: getQueryCountByType('ask_ai') },
    { id: 'quiz' as const, label: 'Quiz', count: 0 },
  ]



  // Check if text language supports pronunciation
  const supportsPronunciation = (text: string) => {
    if (!text || text.length === 0) return false
    
    const { selectedArticle } = useReadLinguaStore.getState()
    if (!selectedArticle) return false
    
    // Simple: if user selected English or French learning, show pronunciation button
    return selectedArticle.source_language === 'english' || selectedArticle.source_language === 'french'
  }


  const handlePlayPronunciation = async (text: string) => {
    if (isPlaying) return

    const { selectedArticle } = useReadLinguaStore.getState()
    if (!selectedArticle) return

    setIsPlaying(true)
    try {
      const audioBlob = await ttsApi.getPronunciation(text, selectedArticle.source_language)
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
    } catch (error) {
      console.error('Error playing pronunciation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate pronunciation')
      setIsPlaying(false)
    }
  }

  // Handle text selection in AI response content
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setShowSelectionToolbar(false)
      return
    }

    const selectedText = selection.toString().trim()
    if (!selectedText) {
      setShowSelectionToolbar(false)
      return
    }

    // Get selection position for floating toolbar
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    if (rect.width > 0 && rect.height > 0) {
      setSelectedText(selectedText)
      setSelectionPosition({
        x: rect.right + 8, // Position slightly to the right of selection
        y: rect.top + (rect.height / 2) - 40 // Center vertically with toolbar height
      })
      setShowSelectionToolbar(true)
    } else {
      setShowSelectionToolbar(false)
    }
  }

  const handleSelectionPronunciation = () => {
    if (selectedText) {
      handlePlayPronunciation(selectedText)
      // Hide toolbar after click
      setShowSelectionToolbar(false)
      // Clear selection
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleAddToEmail = () => {
    if (selectedText) {
      // Determine content type and source based on selection context
      addToEmailSelection({
        content: selectedText,
        type: 'ai_response', // Could be enhanced to detect actual type
        source: 'query_history'
      })
      
      // Hide toolbar after selection
      setShowSelectionToolbar(false)
      // Clear text selection
      window.getSelection()?.removeAllRanges()
    }
  }

  // Hide selection toolbar when clicking outside
  const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as Element
    if (!target.closest('.ai-response') && !target.closest('.selection-toolbar')) {
      setShowSelectionToolbar(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0" onClick={handleClickOutside}>
      {/* Header */}
      <div className="p-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900">Query History</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 relative">
        {/* Desktop: Equal Width Tabs */}
        <div className="hidden md:flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex-1 px-3 py-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                activeTab === tab.id
                  ? 'text-primary bg-neutral-light'
                  : 'text-gray-600 hover:text-primary hover:bg-neutral-light'
              }`}
            >
              <div className="flex items-center justify-center gap-1 relative">
                <span className="truncate">{tab.label}</span>
                {/* Number Badge */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {tab.count}
                </div>
              </div>
              {/* Active Tab Indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary hover:brightness-110 transition-all duration-300 ease-in-out"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* Mobile: Scrollable Tabs */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto scrollbar-hide px-3 gap-2 bg-gray-50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex-shrink-0 px-4 py-2 text-xs font-medium rounded-full transition-all duration-300 whitespace-nowrap flex items-center gap-1 ${
                  activeTab === tab.id
                    ? 'text-white bg-primary shadow-md'
                    : 'text-gray-600 bg-white hover:text-primary hover:bg-neutral-light'
                }`}
              >
                <span>{tab.label}</span>
                {/* Number Badge for Mobile */}
                <div className={`min-w-[16px] h-4 text-[10px] font-bold rounded-full flex items-center justify-center ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-primary text-white'
                }`}>
                  {tab.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'quiz' ? (
        /* Simplified Quiz Content */
        <SimpleQuiz />
      ) : (
        /* Regular Query Tab Content */
        <div className="flex-shrink-0 p-3 max-h-64 overflow-y-auto bg-gray-50/50">
          {getFilteredQueries().length === 0 ? (
            /* Empty State */
            <div className="text-center py-6">
              <svg className="w-6 h-6 mx-auto text-gray-300 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
              <p className="text-gray-500 text-sm">No {tabs.find(t => t.id === activeTab)?.label} queries yet</p>
              <p className="text-gray-400 text-xs mt-1">Select text and try {tabs.find(t => t.id === activeTab)?.label} analysis</p>
            </div>
        ) : (
          /* Grid Layout Query List */
          <div className={`grid ${getGridCols(activeTab)} gap-2`}>
            {getFilteredQueries().map((query) => (
              <div
                key={query.id}
                onClick={(e) => {
                  e.stopPropagation()
                  if (deleteMode !== query.id) {
                    handleQueryClick(query)
                  }
                }}
                onMouseDown={(e) => handleLongPressStart(query.id, e)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={(e) => handleLongPressStart(query.id, e as any)}
                onTouchEnd={handleLongPressEnd}
                onTouchCancel={handleLongPressEnd}
                className={`relative px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all duration-200 select-none ${
                  selectedQuery?.id === query.id
                    ? 'bg-primary hover:brightness-110 text-white shadow-lg'
                    : `${getQueryTypeColor(query.query_type)} hover:shadow-md hover:scale-105`
                } ${
                  deleteMode === query.id ? 'animate-pulse' : ''
                }`}
                title={deleteMode === query.id ? 'Click X to delete' : `${query.selected_text} - Long press to delete`}
              >
                <div className="flex items-center justify-between gap-1 max-w-xs">
                  <span className="truncate">
                    {query.selected_text || (query.query_type === 'ask_ai' && query.user_question ? `Ask: ${query.user_question}` : 'No content')}
                  </span>
                  
                  {/* French Pronunciation Button for Query History Tags */}
                  {query.selected_text && supportsPronunciation(query.selected_text) && deleteMode !== query.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayPronunciation(query.selected_text!)
                      }}
                      disabled={isPlaying}
                      className="w-4 h-4 text-gray-500 hover:text-primary hover:bg-neutral-light rounded-full flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                      title="Play pronunciation"
                    >
                      {isPlaying ? (
                        <svg className="w-2.5 h-2.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </button>
                  )}
                  
                  {deleteMode === query.id && (
                    <button
                      onClick={(e) => handleDeleteConfirm(query.id, e)}
                      className="ml-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-all animate-bounce flex-shrink-0"
                      title="Delete query"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      )}

      {/* Current Query Detail - Only show for non-quiz tabs */}
      {selectedQuery && activeTab !== 'quiz' && (
        <div className="flex-1 bg-gray-50 min-h-0 flex flex-col">
          {/* Query Info Header */}
          <div 
            className="p-3 bg-white mx-3 mt-2 rounded-lg flex-shrink-0 relative transition-all select-none"
            style={{
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => handleLongPressStart(selectedQuery.id, e)}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={(e) => handleLongPressStart(selectedQuery.id, e as any)}
            onTouchEnd={handleLongPressEnd}
            onTouchCancel={handleLongPressEnd}
            title={deleteMode === selectedQuery.id ? 'Click X to delete' : 'Long press to delete'}
          >
            {deleteMode === selectedQuery.id && (
              <button
                onClick={(e) => handleDeleteConfirm(selectedQuery.id, e)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-all animate-bounce z-10"
                style={{ animation: 'bounce 1s infinite' }}
                title="Delete query"
              >
                ×
              </button>
            )}
            
            {/* Header content with pulse animation overlay for delete mode */}
            <div className={deleteMode === selectedQuery.id ? 'animate-pulse' : ''}>

            <div className="flex items-center justify-between pr-6">
              {/* Left: Query Content with Speaker at end */}
              <div className="flex items-start">
                {selectedQuery.selected_text ? (
                  <div className="flex items-start gap-1">
                    <div className="text-lg font-bold text-gray-900">
                      {selectedQuery.selected_text}
                    </div>
                    {supportsPronunciation(selectedQuery.selected_text) && (
                      <button
                        onClick={() => handlePlayPronunciation(selectedQuery.selected_text!)}
                        disabled={isPlaying}
                        className="w-5 h-5 text-gray-500 hover:text-primary hover:bg-neutral-light rounded-full flex items-center justify-center transition-colors disabled:opacity-50 mt-1 ml-1 flex-shrink-0"
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
                ) : selectedQuery.query_type === 'ask_ai' && selectedQuery.user_question ? (
                  // Show user question for Ask AI queries without selected text
                  <div className="text-lg font-bold text-gray-900">
                    Ask AI: {selectedQuery.user_question}
                  </div>
                ) : null}
              </div>
              
              {/* Right: Query Type and Time */}
              <div className="text-xs text-gray-400 text-right">
                {getQueryTypeLabel(selectedQuery.query_type)} | {new Date(selectedQuery.created_at).toLocaleString([], { 
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </div>
            </div>
            
            {selectedQuery.user_question && (
              <div className="text-sm text-text-primary italic mt-2">
                Q: {selectedQuery.user_question}
              </div>
            )}
            </div>
          </div>
          
          {/* AI Response Content */}
          <div className="flex-1 overflow-y-auto p-3 mx-3 mb-3 bg-white rounded-lg ai-response"
            style={{
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
            onMouseUp={handleTextSelection}
          >
            {!selectedQuery.ai_response ? (
              /* Loading State */
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm">AI is analyzing...</p>
                <p className="text-xs text-gray-400 mt-1">Please wait, AI is generating response</p>
              </div>
            ) : selectedQuery.ai_response.startsWith('Error:') ? (
              /* Error State */
              <div className="flex flex-col items-center justify-center h-32 text-red-500">
                <svg className="w-8 h-8 mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <p className="text-sm text-center">{selectedQuery.ai_response}</p>
              </div>
            ) : (
              /* Normal Content */
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
            )}
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
            
            /* Clean, minimal styling for Notion-style layout */
            
            /* Quiz Animation Styles */
            :global(.answer-reveal) {
              animation: fadeInSlide 0.3s ease-out;
            }
            
            @keyframes fadeInSlide {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}

      {/* Floating Selection Toolbar for Text Selection */}
      {showSelectionToolbar && selectionPosition && (
        <div
          className="fixed z-50 selection-toolbar"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
          }}
        >
          <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden">
            {/* Pronounce Button - Only show for English/French content */}
            {supportsPronunciation(selectedText) && (
              <button
                onClick={handleSelectionPronunciation}
                disabled={isPlaying}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary disabled:opacity-50 text-white font-medium text-sm transition-all duration-200 whitespace-nowrap"
                title="Play pronunciation"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-3 h-3 animate-pulse inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Playing...
                  </>
                ) : (
                  'Pronounce'
                )}
              </button>
            )}
            
            {/* Add to Email Button - Always show */}
            <button
              onClick={handleAddToEmail}
              className="px-4 py-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-primary border-t border-neutral-mid font-medium text-sm transition-all duration-200 whitespace-nowrap"
              title="Add selected text to email collection"
            >
              Add to Email
            </button>
          </div>
        </div>
      )}
    </div>
  )
}