'use client'

import { useEffect, useState } from 'react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { queryApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'
import ArticleReader from './ArticleReader'
import QueryPanel from './QueryPanel'
import PromptManager from './PromptManager'
import SettingsPanel from './SettingsPanel'
import AskAISearchBox from './AskAISearchBox'
import AIResponseFloatingPanel from './AIResponseFloatingPanel'

export default function LearningTab() {
  const { selectedArticle, queries, setQueries, setSelectedQuery, showQueryPanel, setShowQueryPanel, setShowPromptManager } = useReadLinguaStore()
  const [showFloatingPanel, setShowFloatingPanel] = useState(false)
  const [floatingPanelData, setFloatingPanelData] = useState({
    queryType: '',
    aiResponse: '',
    isLoading: false,
    hasError: false,
    selectedText: '',
    userQuestion: ''
  })
  const [isPlaying, setIsPlaying] = useState(false)

  const handleShowFloatingPanel = (data: {
    queryType: string
    aiResponse: string
    isLoading: boolean
    hasError: boolean
    selectedText?: string
    userQuestion?: string
  }) => {
    setFloatingPanelData({
      queryType: data.queryType,
      aiResponse: data.aiResponse,
      isLoading: data.isLoading,
      hasError: data.hasError,
      selectedText: data.selectedText || '',
      userQuestion: data.userQuestion || ''
    })
    setShowFloatingPanel(true)
  }

  const handlePlayPronunciation = async (text: string) => {
    if (isPlaying || !selectedArticle) return
    
    setIsPlaying(true)
    try {
      const response = await fetch('/api/readlingua/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          language: selectedArticle.source_language
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

  useEffect(() => {
    if (selectedArticle) {
      // Clear previous queries and selected query immediately
      setQueries([])
      setSelectedQuery(null)
      
      // Auto-show Query Panel when entering learning mode
      setShowQueryPanel(true)
      
      // Load queries for selected article
      loadQueries(selectedArticle.id)
    } else {
      // Clear queries when no article is selected
      setQueries([])
      setSelectedQuery(null)
    }
  }, [selectedArticle])

  const loadQueries = async (articleId: string) => {
    try {
      let userId = 'anonymous'
      
      // Try to get authenticated user, but don't require it
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
        }
      } catch (authError) {
        console.log('Using anonymous mode for loading queries')
      }

      const articleQueries = await queryApi.getQueries(articleId, userId)
      setQueries(articleQueries)
    } catch (error) {
      console.error('Error loading queries:', error)
    }
  }

  if (!selectedArticle) {
    return (
      <div className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Article Selected</h3>
          <p className="text-gray-500 mb-4">
            Select an article from the Dashboard to start learning
          </p>
          <button
            onClick={() => useReadLinguaStore.getState().setActiveTab('dashboard')}
            className="w-32 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Desktop-only floating components */}
      <div className="hidden md:block">
        {/* Ask AI Search Box - Bottom Right */}
        <AskAISearchBox 
          onShowFloatingPanel={handleShowFloatingPanel}
        />

        {/* Settings Panel - Bottom Right */}
        <SettingsPanel />

        {/* AI Response Floating Panel */}
        {showFloatingPanel && (
          <AIResponseFloatingPanel 
            isVisible={showFloatingPanel}
            selectedText={floatingPanelData.selectedText || ''}
            queryType={floatingPanelData.queryType}
            aiResponse={floatingPanelData.aiResponse}
            isLoading={floatingPanelData.isLoading}
            hasError={floatingPanelData.hasError}
            onClose={() => setShowFloatingPanel(false)}
            onPlayPronunciation={handlePlayPronunciation}
            isPlaying={isPlaying}
            userQuestion={floatingPanelData.userQuestion}
          />
        )}

        {/* Prompt Manager Modal */}
        <PromptManager />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 max-w-7xl mx-auto px-4 w-full gap-6">
        {/* Article Reader - Desktop Only */}
        <div className={`hidden md:block transition-all duration-300 ${showQueryPanel ? 'w-1/2' : 'w-full'}`}>
          <div className="bg-white/95 rounded-xl shadow-xl h-full"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
            <ArticleReader article={selectedArticle} />
          </div>
        </div>
        
        {/* Query Panel - Desktop: Conditional Display, Mobile: Always Show */}
        <div className={`block md:${showQueryPanel ? 'block' : 'hidden'} md:w-1/2 w-full`}>
          <div className="bg-white/95 rounded-xl shadow-xl h-full md:h-auto"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
            <QueryPanel />
          </div>
        </div>
      </div>
    </div>
  )
}