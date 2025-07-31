'use client'

import React, { useState, useRef } from 'react'

interface SentenceQuery {
  id: number
  sentence_text: string
  translation: string
  analysis: string
  start_offset: number
  end_offset: number
  query_type?: string
  user_notes?: string
  ai_notes?: string
}

interface ChineseFrenchSentenceCardProps {
  query: SentenceQuery
  articleId: number
  onDelete: (sentenceId: string) => void
  onScrollToHighlight?: (query: SentenceQuery) => void
}

type TabType = 'words' | 'phrases' | 'grammar' | 'others'

interface AnalysisItem {
  id: string
  query: string
  response: string
  isStreaming: boolean
  timestamp: number
}

export default function ChineseFrenchSentenceCard({ 
  query, 
  articleId,
  onDelete, 
  onScrollToHighlight
}: ChineseFrenchSentenceCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('words')
  const [analysisItems, setAnalysisItems] = useState<{[key in TabType]: AnalysisItem[]}>({
    words: [],
    phrases: [],
    grammar: [],
    others: []
  })
  const [selectedItems, setSelectedItems] = useState<{[key in TabType]: string | null}>({
    words: null,
    phrases: null,
    grammar: null,
    others: null
  })
  const [searchInputs, setSearchInputs] = useState<{[key in TabType]: string}>({
    words: '',
    phrases: '',
    grammar: '',
    others: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load existing analysis data from database on mount
  React.useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        const response = await fetch(`/api/master-language/sentence-queries?articleId=${articleId}`)
        if (response.ok) {
          const sentences = await response.json()
          const targetSentence = sentences.find((s: any) => s.id === query.id)
          
          if (targetSentence) {
            // Restore analysis items from database
            const restoredItems: {[key in TabType]: AnalysisItem[]} = {
              words: targetSentence.words || [],
              phrases: targetSentence.phrases || [],
              grammar: targetSentence.grammar || [],
              others: targetSentence.others || []
            }
            
            setAnalysisItems(restoredItems)
            
            // Set first item as selected for each dimension that has data
            const newSelectedItems: {[key in TabType]: string | null} = {
              words: restoredItems.words[0]?.id || null,
              phrases: restoredItems.phrases[0]?.id || null,
              grammar: restoredItems.grammar[0]?.id || null,
              others: restoredItems.others[0]?.id || null
            }
            setSelectedItems(newSelectedItems)
          }
        }
      } catch (error) {
        console.error('Failed to load analysis data:', error)
      }
    }

    loadAnalysisData()
  }, [articleId, query.id])

  const tabs = [
    { id: 'words', label: 'Mots' },
    { id: 'phrases', label: 'Expressions' },
    { id: 'grammar', label: 'Grammaire' },
    { id: 'others', label: 'Autres' }
  ] as const

  const handleSearch = async (tabType: TabType) => {
    const input = searchInputs[tabType].trim()
    if (!input) return

    const queryId = Date.now().toString()
    const newItem: AnalysisItem = {
      id: queryId,
      query: input,
      response: '',
      isStreaming: true,
      timestamp: Date.now()
    }

    setAnalysisItems(prev => ({
      ...prev,
      [tabType]: [newItem, ...prev[tabType]]
    }))
    setSelectedItems(prev => ({
      ...prev,
      [tabType]: queryId
    }))
    setSearchInputs(prev => ({
      ...prev,
      [tabType]: ''
    }))
    setIsLoading(true)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/openai/ielts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Context: ${query.sentence_text}\n\nQuestion: ${input}`
            }
          ],
          model: 'deepseek-chat',
          stream: true
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) throw new Error('Query failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulatedResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.choices?.[0]?.delta?.content) {
                accumulatedResponse += parsed.choices[0].delta.content
                
                setAnalysisItems(prev => ({
                  ...prev,
                  [tabType]: prev[tabType].map(item => 
                    item.id === queryId 
                      ? { ...item, response: accumulatedResponse }
                      : item
                  )
                }))
              }
            } catch (e) {
              continue
            }
          }
        }
      }

      setAnalysisItems(prev => ({
        ...prev,
        [tabType]: prev[tabType].map(item => 
          item.id === queryId 
            ? { ...item, isStreaming: false }
            : item
        )
      }))

      // Save to database
      await fetch('/api/master-language/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          sentenceId: query.id,
          dimension: tabType,
          query: input,
          response: accumulatedResponse
        })
      })

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      
      console.error('Query failed:', error)
      setAnalysisItems(prev => ({
        ...prev,
        [tabType]: prev[tabType].map(item => 
          item.id === queryId 
            ? { ...item, response: 'Query failed. Please try again.', isStreaming: false }
            : item
        )
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, tabType: TabType) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch(tabType)
    }
  }

  const currentItems = analysisItems[activeTab]
  const selectedItemId = selectedItems[activeTab]
  const selectedItem = currentItems.find(item => item.id === selectedItemId)

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6" style={{ height: '800px' }}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-lg text-gray-800 leading-relaxed mb-2">
              "{query.sentence_text}"
            </p>
            <button
              onClick={() => onScrollToHighlight?.(query)}
              className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
            >
              Localiser dans le texte
            </button>
          </div>
          <button
            onClick={() => onDelete(query.id.toString())}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors ml-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchInputs[activeTab]}
              onChange={(e) => setSearchInputs(prev => ({
                ...prev,
                [activeTab]: e.target.value
              }))}
              onKeyPress={(e) => handleKeyPress(e, activeTab)}
              placeholder="Rechercher..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSearch(activeTab)}
              disabled={isLoading || !searchInputs[activeTab].trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isLoading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </div>

        {/* Left-Right Layout */}
        <div className="flex gap-6 h-[600px]">
          {/* Left Panel - Analysis Items */}
          <div className="w-1/3">
            {currentItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">Aucune recherche effectuée</p>
              </div>
            ) : (
              <div className="space-y-2 h-full overflow-y-auto">
                {currentItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItems(prev => ({
                      ...prev,
                      [activeTab]: item.id
                    }))}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedItemId === item.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {item.query}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Response */}
          <div className="flex-1">
            {selectedItem ? (
              <div className="bg-gray-50 rounded-lg p-6 h-full overflow-y-auto">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-purple-700 mb-2">
                    {selectedItem.query}
                  </h4>
                </div>
                <div className="prose prose-sm max-w-none">
                  {selectedItem.isStreaming ? (
                    <div className="text-gray-600">
                      {selectedItem.response}
                      <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse"></span>
                    </div>
                  ) : (
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {selectedItem.response}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  Sélectionnez un élément à gauche pour voir les détails
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}