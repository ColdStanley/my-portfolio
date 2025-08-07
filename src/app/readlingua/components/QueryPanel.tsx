'use client'

import { useState, useEffect } from 'react'
import { marked } from 'marked'
import { useReadLinguaStore, QuizQuestion } from '../store/useReadLinguaStore'
import { queryApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'

export default function QueryPanel() {
  const { 
    queries, 
    selectedQuery, 
    setSelectedQuery, 
    setShowQueryPanel, 
    removeQuery,
    quizQuestions,
    generateQuizQuestions,
    submitQuizAnswer,
    isGeneratingQuiz,
    selectedArticle
  } = useReadLinguaStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<'quick' | 'standard' | 'deep' | 'ask_ai' | 'quiz'>('quick')
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [deleteMode, setDeleteMode] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({})
  const [currentQuizAnswer, setCurrentQuizAnswer] = useState('')

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
        console.log('Using anonymous mode for delete')
      }

      // Delete from database
      await queryApi.deleteQuery(queryId, userId)
      
      // Remove from store
      removeQuery(queryId)
      
    } catch (error) {
      console.error('Error deleting query:', error)
      alert('Failed to delete query. Please try again.')
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

  const getQueryCountByType = (type: string) => {
    return queries.filter(q => q.query_type === type).length
  }

  const getFilteredQueries = () => {
    if (activeTab === 'quiz') return []
    return queries.filter(q => q.query_type === activeTab && q.selected_text)
  }

  const getQuizCandidateCount = () => {
    return queries.filter(q => q.query_type !== 'ask_ai' && q.selected_text && q.selected_text.trim()).length
  }

  const tabs = [
    { id: 'quick' as const, label: 'Quick', count: getQueryCountByType('quick') },
    { id: 'standard' as const, label: 'Standard', count: getQueryCountByType('standard') },
    { id: 'deep' as const, label: 'Deep', count: getQueryCountByType('deep') },
    { id: 'ask_ai' as const, label: 'Ask AI', count: getQueryCountByType('ask_ai') },
    { id: 'quiz' as const, label: 'Knowledge Quiz', count: getQuizCandidateCount() },
  ]

  const handleTabChange = (tabId: 'quick' | 'standard' | 'deep' | 'ask_ai' | 'quiz') => {
    setActiveTab(tabId)
    
    // Auto-select first query in the new tab, or clear if no queries
    if (tabId === 'quiz') {
      // Quiz tab - clear query selection, generate quiz if needed
      setSelectedQuery(null)
      if (quizQuestions.length === 0 && !isGeneratingQuiz && getQuizCandidateCount() > 0) {
        generateQuizQuestions()
      }
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

  // Check if text language supports pronunciation
  const supportsPronunciation = (text: string) => {
    if (!text || text.length === 0) return false
    
    const { selectedArticle } = useReadLinguaStore.getState()
    if (!selectedArticle) return false
    
    // Simple: if user selected English or French learning, show pronunciation button
    return selectedArticle.source_language === 'english' || selectedArticle.source_language === 'french'
  }

  // Quiz functions
  const handleQuizSubmit = (questionIndex: number) => {
    const answer = quizAnswers[questionIndex] || ''
    if (answer.trim()) {
      submitQuizAnswer(questionIndex, answer.trim())
      // Clear the answer after submission
      setQuizAnswers(prev => ({
        ...prev,
        [questionIndex]: ''
      }))
    }
  }

  const handleQuizAnswerChange = (questionIndex: number, value: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }))
  }

  const handleQuizQuestionClick = (question: QuizQuestion) => {
    // Jump to original query
    setSelectedQuery(question.originalQuery)
    setActiveTab(question.originalQuery.query_type as any)
  }

  const handlePlayPronunciation = async (text: string) => {
    if (isPlaying) return
    
    const { selectedArticle } = useReadLinguaStore.getState()
    if (!selectedArticle) return
    
    setIsPlaying(true)
    try {
      const response = await fetch('/api/readlingua/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          language: selectedArticle.source_language // Pass the article's language
        })
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
        const errorData = await response.json()
        console.error('Failed to get audio:', errorData.error)
        alert(errorData.error || 'Failed to generate pronunciation')
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error)
      setIsPlaying(false)
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
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative flex-1 px-3 py-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                activeTab === tab.id
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-500 hover:bg-purple-25'
              }`}
            >
              <div className="flex items-center justify-center gap-1 relative">
                <span className="truncate">{tab.label}</span>
                {/* Number Badge */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {tab.count}
                </div>
              </div>
              {/* Active Tab Indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 transition-all duration-300 ease-in-out"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'quiz' ? (
        /* Knowledge Quiz Content */
        <div className="flex-1 bg-gray-50 min-h-0 flex flex-col">
          {isGeneratingQuiz ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-gray-600">Generating Quiz Questions...</p>
              <p className="text-xs text-gray-400 mt-1">This may take a moment</p>
            </div>
          ) : quizQuestions.length === 0 ? (
            /* Empty State */
            getQuizCandidateCount() === 0 ? (
              <div className="text-center py-8">
                <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                </svg>
                <p className="text-gray-500 text-sm">No queries available for quiz</p>
                <p className="text-gray-400 text-xs mt-1">Select text and analyze with Quick, Standard, or Deep modes first</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <button
                  onClick={generateQuizQuestions}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
                >
                  Generate Quiz Questions
                </button>
                <p className="text-gray-400 text-xs mt-2">{getQuizCandidateCount()} queries available for quiz</p>
              </div>
            )
          ) : (
            /* Quiz Questions - Progressive Display */
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {quizQuestions.map((question, index) => {
                // Show question if it's answered or if it's the next unanswered question
                const shouldShow = question.isAnswered || 
                  index === 0 || 
                  quizQuestions[index - 1]?.isAnswered
                
                if (!shouldShow) return null
                
                return (
                  <div
                    key={question.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-500 font-medium">
                        Question {index + 1}/{quizQuestions.length}
                      </div>
                      <button
                        onClick={() => handleQuizQuestionClick(question)}
                        className="text-xs text-purple-600 hover:text-purple-800 hover:underline"
                      >
                        View original query →
                      </button>
                    </div>
                    
                    {/* Question Text */}
                    <div
                      className="text-base text-gray-900 mb-4 leading-relaxed cursor-pointer hover:bg-purple-50 p-2 rounded transition-colors"
                      onClick={() => handleQuizQuestionClick(question)}
                    >
                      {question.question}
                    </div>
                    
                    {/* Answer Input or Result */}
                    {!question.isAnswered ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={quizAnswers[index] || ''}
                          onChange={(e) => handleQuizAnswerChange(index, e.target.value)}
                          placeholder="Type your answer..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleQuizSubmit(index)
                            }
                          }}
                        />
                        <button
                          onClick={() => handleQuizSubmit(index)}
                          disabled={!quizAnswers[index]?.trim()}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium whitespace-nowrap"
                        >
                          Submit
                        </button>
                      </div>
                    ) : (
                      /* Answer Result */
                      <div className="space-y-3">
                        {/* User Answer vs Correct Answer */}
                        <div className={`p-3 rounded-lg flex items-center gap-2 ${
                          question.isCorrect 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          {question.isCorrect ? (
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                Answer: {question.answer}
                              </span>
                              {supportsPronunciation(question.answer) && (
                                <button
                                  onClick={() => handlePlayPronunciation(question.answer)}
                                  disabled={isPlaying}
                                  className="w-5 h-5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
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
                            {!question.isCorrect && question.userAnswer && (
                              <div className="text-sm text-gray-600 mt-1">
                                Your answer: {question.userAnswer}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Explanation */}
                        {question.explanation && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-sm text-gray-700">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
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
          /* Tag Style Query List */
          <div className="flex flex-wrap gap-2">
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
                    ? 'bg-purple-600 text-white shadow-lg'
                    : `${getQueryTypeColor(query.query_type)} hover:shadow-md hover:scale-105`
                } ${
                  deleteMode === query.id ? 'animate-pulse' : ''
                }`}
                title={deleteMode === query.id ? 'Click X to delete' : `${query.selected_text} - Long press to delete`}
              >
                <div className="flex items-center gap-1 max-w-xs">
                  <span className="truncate">{query.selected_text}</span>
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
                {selectedQuery.selected_text && (
                  <div className="flex items-start gap-1">
                    <div className="text-lg font-bold text-gray-900">
                      {selectedQuery.selected_text}
                    </div>
                    {supportsPronunciation(selectedQuery.selected_text) && (
                      <button
                        onClick={() => handlePlayPronunciation(selectedQuery.selected_text!)}
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
          </div>
          
          {/* AI Response Content */}
          <div className="flex-1 overflow-y-auto p-3 mx-3 mb-3 bg-white rounded-lg"
            style={{
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          >
            {!selectedQuery.ai_response ? (
              /* Loading State */
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
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
          `}</style>
        </div>
      )}
    </div>
  )
}