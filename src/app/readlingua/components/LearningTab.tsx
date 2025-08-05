'use client'

import { useEffect } from 'react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { queryApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'
import ArticleReader from './ArticleReader'
import QueryPanel from './QueryPanel'
import ModelSelector from './ModelSelector'
import PromptManager from './PromptManager'

export default function LearningTab() {
  const { selectedArticle, queries, setQueries, showQueryPanel, setShowPromptManager } = useReadLinguaStore()

  useEffect(() => {
    if (selectedArticle) {
      // Load queries for selected article
      loadQueries(selectedArticle.id)
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
    <div className="min-h-screen flex flex-col">
      {/* Model Selector Header */}
      <div className="p-4 border-b border-gray-200 bg-purple-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-gray-900">Learning Mode</h2>
            <ModelSelector />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPromptManager(true)}
              className="w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full flex items-center justify-center"
              title="Prompt Manager"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              onClick={() => useReadLinguaStore.getState().setActiveTab('dashboard')}
              className="w-24 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium whitespace-nowrap flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
              </svg>
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Article Reader - Left Side */}
        <div className={`transition-all duration-300 ${showQueryPanel ? 'w-2/5' : 'w-full'}`}>
          <ArticleReader article={selectedArticle} />
        </div>
        
        {/* Query Panel - Right Side */}
        {showQueryPanel && (
          <div className="w-3/5 border-l border-gray-200">
            <QueryPanel />
          </div>
        )}
      </div>

      {/* Prompt Manager Modal */}
      <PromptManager />
    </div>
  )
}