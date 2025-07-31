'use client'

import React, { useState, useRef } from 'react'
import './typewriter.css'
import { playFrenchText } from '../utils/googleTts'

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

// Markdown formatting function
const formatMarkdownResponse = (content: string): string => {
  if (!content) return ''
  
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-purple-700 mb-2 mt-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-semibold text-purple-800 mb-3 mt-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-purple-800 mb-3 mt-4">$1</h1>')
    
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-purple-700">$1</strong>')
    
    // Italic text  
    .replace(/\*(.*?)\*/g, '<em class="italic text-purple-600">$1</em>')
    
    // Code inline
    .replace(/`([^`]+)`/g, '<code class="bg-purple-50 text-purple-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Bullet points
    .replace(/^[•·*-]\s+(.+$)/gim, '<li class="text-gray-700 mb-1">$1</li>')
    
    // Wrap consecutive li elements in ul
    .replace(/(<li[^>]*>.*<\/li>(?:\s*<li[^>]*>.*<\/li>)*)/gs, '<ul class="list-disc ml-4 space-y-1 mb-3">$1</ul>')
    
    // Line breaks
    .replace(/\n\n+/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br>')
    
    // Wrap in paragraphs
    .replace(/^(.+)$/gm, '<p class="mb-3">$1</p>')
    
    // Clean up empty paragraphs
    .replace(/<p class="mb-3"><\/p>/g, '')
    .replace(/<p class="mb-3">(<h[1-6][^>]*>)/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
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
        const response = await fetch(`/api/master-language/chinese-french-sentences?articleId=${articleId}`)
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
      // Create prompt based on tab type
      const promptTemplates = {
        words: `讲解一下"${input}"这个法语单词，目标是让法语初学者（A1-A2）能彻底掌握该单词。最好使用例句。`,
        phrases: `分析一下"${input}"这个法语表达/短语，解释其含义、用法和使用场景。请提供例句帮助法语初学者（A1-A2）理解和运用。`,
        grammar: `解释一下"${input}"相关的法语语法知识，用简单易懂的方式讲解语法规则、变位规律或句型结构，适合法语初学者（A1-A2）学习。请提供实例说明。`,
        others: `关于"${input}"，请提供相关的法语学习知识，可以包括文化背景、使用技巧、翻译对比或其他有助于法语初学者（A1-A2）理解的内容。`
      }
      
      const fullPrompt = promptTemplates[tabType] || promptTemplates.others

      const response = await fetch('/api/master-language/smart-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'simple',
          selectedText: fullPrompt,
          contextSentence: query.sentence_text,
          language: 'french',
          nativeLanguage: 'chinese',
          articleId: articleId
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) throw new Error('Query failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let accumulatedResponse = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.content || ''
              if (content) {
                accumulatedResponse += content
                
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
      await fetch('/api/master-language/chinese-french-sentences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          sentenceId: query.id,
          dimension: tabType,
          query: input,
          response: accumulatedResponse,
          prompt: fullPrompt
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
    <div className="bg-white rounded-lg shadow-lg mb-6" style={{ minHeight: '400px', height: 'auto' }}>
      {/* Header */}
      <div className="bg-purple-25 p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={() => onScrollToHighlight?.(query)}
              className="text-lg text-purple-800 leading-relaxed mb-2 text-left hover:text-purple-600 transition-colors cursor-pointer w-full"
            >
              "{query.sentence_text}"
            </button>
          </div>
          <button
            onClick={async () => {
              try {
                await playFrenchText(query.sentence_text)
              } catch (error) {
                console.error('Google TTS failed:', error)
              }
            }}
            className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-2 rounded-lg transition-colors mr-2"
            title="Écouter la phrase"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(query.id.toString())}
            className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-2 rounded-lg transition-colors ml-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-3">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-purple-700 bg-purple-100 rounded-lg'
                  : 'text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInputs[activeTab]}
              onChange={(e) => setSearchInputs(prev => ({
                ...prev,
                [activeTab]: e.target.value
              }))}
              onKeyPress={(e) => handleKeyPress(e, activeTab)}
              placeholder="Rechercher dans le texte..."
              className="w-full pl-10 pr-4 py-2 bg-purple-25 border border-purple-300 rounded-lg shadow-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Left-Right Layout */}
        <div className="flex gap-4 min-h-[300px]">
          {/* Left Panel - Analysis Items */}
          <div className="w-1/3">
            {currentItems.length === 0 ? (
              <div className="text-center py-8 text-purple-400">
                <p className="text-sm">Aucune recherche effectuée</p>
              </div>
            ) : (
              <div className="space-y-1 h-full overflow-y-auto">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className={`w-full text-left p-2 rounded-lg shadow-sm transition-all flex items-center justify-between ${
                      selectedItemId === item.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-white hover:bg-purple-50 text-purple-600'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedItems(prev => ({
                        ...prev,
                        [activeTab]: item.id
                      }))}
                      className="flex-1 text-left"
                    >
                      <div className="text-sm font-medium truncate">
                        {item.query}
                      </div>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await playFrenchText(item.query)
                        } catch (error) {
                          console.error('Google TTS failed:', error)
                        }
                      }}
                      className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-1 rounded-lg transition-colors flex-shrink-0 ml-2"
                      title="Écouter le mot/phrase"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Response */}
          <div className="flex-1">
            {selectedItem ? (
              <div className="bg-white border border-gray-200 rounded-lg p-6 h-full overflow-y-auto">
                <div className="prose prose-xs max-w-none">
                  <div className={`text-gray-700 leading-relaxed text-sm ${selectedItem.isStreaming ? 'streaming-content' : ''}`}>
                    <div 
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMarkdownResponse(selectedItem.response) 
                      }}
                    />
                    {selectedItem.isStreaming && (
                      <>
                        <span className="streaming-cursor"></span>
                        <div className="streaming-progress"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Sélectionnez une recherche pour voir le contenu
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}