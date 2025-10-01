'use client'

import { useState, useRef } from 'react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { aiApi, queryApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'

interface AskAISearchBoxProps {
  onSearchSubmit?: (question: string) => void
  onShowFloatingPanel?: (data: {
    queryType: string
    aiResponse: string
    isLoading: boolean
    hasError: boolean
    selectedText?: string
    userQuestion?: string
  }) => void
}

export default function AskAISearchBox({ onSearchSubmit, onShowFloatingPanel }: AskAISearchBoxProps) {
  const [question, setQuestion] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { selectedArticle, selectedAiModel, getCurrentPromptTemplates, addQuery, setShowQueryPanel } = useReadLinguaStore()

  const handleSearch = async () => {
    if (!question.trim() || isSearching) return

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

      setIsSearching(true)
      
      // Show floating panel with loading state immediately
      if (onShowFloatingPanel) {
        onShowFloatingPanel({
          queryType: 'ask_ai',
          aiResponse: '',
          isLoading: true,
          hasError: false,
          selectedText: '',
          userQuestion: question
        })
      }

      // Auto-show Query Panel to display results
      setShowQueryPanel(true)

      // Get custom prompt templates
      const promptTemplates = getCurrentPromptTemplates()
      const customPrompt = promptTemplates.ask_ai

      let fullResponse = ''

      // Call AI API with streaming
      await aiApi.processQueryStream(
        {
          selected_text: '', // No selected text for independent search
          query_type: 'ask_ai',
          user_question: question,
          source_language: selectedArticle?.source_language || 'english',
          native_language: selectedArticle?.native_language || 'chinese',
          ai_model: selectedAiModel,
          custom_prompt_template: customPrompt
        },
        // onChunk - update floating panel in real-time
        (chunk: string) => {
          fullResponse += chunk
          onShowFloatingPanel?.({
            queryType: 'ask_ai',
            aiResponse: fullResponse,
            isLoading: true,
            hasError: false,
            selectedText: '',
            userQuestion: question
          })
        },
        // onComplete - finalize response and save to database
        async () => {
          try {
            // Save to database
            const queryData = await queryApi.createQuery({
              article_id: selectedArticle?.id || '',
              user_id: userId,
              selected_text: '', // No selected text for independent search
              query_type: 'ask_ai',
              user_question: question,
              ai_response: fullResponse,
              source_language: selectedArticle?.source_language || 'english',
              native_language: selectedArticle?.native_language || 'chinese',
              ai_model: selectedAiModel
            })
            
            // Add to store
            addQuery(queryData)
            
            // Update floating panel to show completion
            onShowFloatingPanel?.({
              queryType: 'ask_ai',
              aiResponse: fullResponse,
              isLoading: false,
              hasError: false,
              selectedText: '',
              userQuestion: question
            })

            // Clear search input and close tooltip after successful completion
            setQuestion('')
            setIsOpen(false) // Auto-close tooltip after search completes
            
          } catch (error) {
            console.error('Error saving query:', error)
            onShowFloatingPanel?.({
              queryType: 'ask_ai',
              aiResponse: 'Error: Failed to save search result',
              isLoading: false,
              hasError: true,
              selectedText: '',
              userQuestion: question
            })
          }
        },
        // onError - handle streaming errors
        (error: string) => {
          console.error('Streaming error:', error)
          onShowFloatingPanel?.({
            queryType: 'ask_ai',
            aiResponse: `Error: ${error}`,
            isLoading: false,
            hasError: true,
            selectedText: '',
            userQuestion: question
          })
        }
      )
    } catch (error) {
      console.error('Search error:', error)
      onShowFloatingPanel?.({
        queryType: 'ask_ai',
        aiResponse: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isLoading: false,
        hasError: true,
        selectedText: '',
        userQuestion: question
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <>
      {/* Ask AI Button - Fixed Bottom Right, above Settings */}
      <div className="fixed bottom-24 right-6 z-20">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group"
          style={{
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
          title="Ask AI"
        >
          <svg 
            className="w-5 h-5 text-primary transition-transform duration-200" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Ask AI Search Tooltip */}
      {isOpen && (
          <div className="fixed bottom-40 right-6 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-4 min-w-80 transform transition-all duration-200"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Ask AI</span>
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400"
                disabled={isSearching}
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={!question.trim() || isSearching}
                className="px-4 py-2 bg-primary hover:bg-primary hover:brightness-110 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-all"
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
      )}
    </>
  )
}