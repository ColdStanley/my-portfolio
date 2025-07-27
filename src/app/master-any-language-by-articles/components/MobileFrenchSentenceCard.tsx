'use client'

import React, { useState, useRef } from 'react'
import { Language } from '../config/uiText'
import { playText } from '../utils/tts'

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
  language?: string
}

interface MobileFrenchSentenceCardProps {
  query: SentenceQuery
  language: Language
  articleId: number
  onDelete: (id: number) => void
}

type TabType = 'words' | 'phrases' | 'grammar' | 'test'

interface WordQuery {
  id: string
  word: string
  response: string
  isStreaming: boolean
  timestamp: number
}

export default function MobileFrenchSentenceCard({ 
  query, 
  language, 
  articleId,
  onDelete
}: MobileFrenchSentenceCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('words')
  const [wordQueries, setWordQueries] = useState<WordQuery[]>([])
  const [wordInput, setWordInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [playingText, setPlayingText] = useState<string | null>(null)
  const [phrasesAnalysis, setPhrasesAnalysis] = useState('')
  const [isLoadingPhrases, setIsLoadingPhrases] = useState(false)
  const [grammarAnalysis, setGrammarAnalysis] = useState('')
  const [isLoadingGrammar, setIsLoadingGrammar] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Handle TTS playback
  const handleSpeak = async (text: string) => {
    if (playingText === text) return
    
    try {
      setPlayingText(text)
      await playText(text, language, 0.8)
    } catch (error) {
      console.error('TTS failed:', error)
    } finally {
      setPlayingText(null)
    }
  }

  // Parse markdown-like formatting (simplified for mobile)
  const parseMarkdown = (text: string) => {
    let processedText = text.replace(/^(#{1,3})\s+(.+)$/gm, '$2')
    
    const boldRegex = /\*\*(.*?)\*\*/g
    const italicRegex = /\*(.*?)\*/g
    
    const parts = processedText.split(boldRegex)
    const elements: (string | JSX.Element)[] = []
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        const regularText = parts[i]
        const italicParts = regularText.split(italicRegex)
        
        for (let j = 0; j < italicParts.length; j++) {
          if (j % 2 === 0) {
            if (italicParts[j]) {
              elements.push(italicParts[j])
            }
          } else {
            elements.push(
              <em key={`italic-${i}-${j}`} className="italic">
                {italicParts[j]}
              </em>
            )
          }
        }
      } else {
        elements.push(
          <strong key={`bold-${i}`} className="font-semibold">
            {parts[i]}
          </strong>
        )
      }
    }
    
    return elements.length === 1 && typeof elements[0] === 'string' 
      ? elements[0] 
      : <span>{elements}</span>
  }

  // Format AI response for mobile
  const formatAIResponse = (response: string) => {
    const lines = response.split('\n').filter(line => line.trim())
    const elements: JSX.Element[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line.match(/^(#{1,3}\s*)?[1-5]\.\s/)) {
        elements.push(
          <div key={i} className="bg-purple-50 p-2 rounded-lg border-l-2 border-purple-300 mb-2">
            <div className="text-xs font-semibold text-purple-800 mb-1">
              {parseMarkdown(line)}
            </div>
          </div>
        )
      } else if (line.includes('→') || line.includes('翻译:') || line.includes('翻译：')) {
        elements.push(
          <div key={i} className="text-xs text-gray-600 italic pl-2 border-l border-gray-200 mb-1">
            {parseMarkdown(line)}
          </div>
        )
      } else if (line.length > 0) {
        if (elements.length > 0 && elements[elements.length - 1].props.className.includes('bg-purple-50')) {
          const lastCard = elements[elements.length - 1]
          elements[elements.length - 1] = (
            <div key={lastCard.key} className="bg-purple-50 p-2 rounded-lg border-l-2 border-purple-300 mb-2">
              {lastCard.props.children}
              <div className="text-xs text-gray-700 leading-relaxed">
                {parseMarkdown(line)}
              </div>
            </div>
          )
        } else {
          elements.push(
            <div key={i} className="text-xs text-gray-700 mb-1 leading-relaxed">
              {parseMarkdown(line)}
            </div>
          )
        }
      }
    }
    
    return elements.length > 0 ? elements : (
      <div className="whitespace-pre-wrap text-xs text-gray-700 leading-relaxed">
        {parseMarkdown(response)}
      </div>
    )
  }

  // Load existing data on mount
  React.useEffect(() => {
    const loadExistingData = async () => {
      try {
        // Load phrase analysis for this specific sentence
        const phrasesResponse = await fetch(`/api/language-reading/queries?articleId=${articleId}&type=sentence&contentType=phrase_analysis&language=${language}&sentenceId=${query.id}`)
        if (phrasesResponse.ok) {
          const phrasesData = await phrasesResponse.json()
          if (phrasesData && phrasesData.length > 0) {
            setPhrasesAnalysis(phrasesData[0].analysis)
          }
        }

        // Load grammar analysis for this specific sentence
        const grammarResponse = await fetch(`/api/language-reading/queries?articleId=${articleId}&type=sentence&contentType=grammar_analysis&language=${language}&sentenceId=${query.id}`)
        if (grammarResponse.ok) {
          const grammarData = await grammarResponse.json()
          if (grammarData && grammarData.length > 0) {
            setGrammarAnalysis(grammarData[0].analysis)
          }
        }

        // Load word queries for this specific sentence
        const wordsResponse = await fetch(`/api/language-reading/queries?articleId=${articleId}&type=sentence&contentType=word_query&language=${language}&sentenceId=${query.id}`)
        if (wordsResponse.ok) {
          const wordsData = await wordsResponse.json()
          if (wordsData && wordsData.length > 0) {
            const savedWordQueries = wordsData.map((item: any) => ({
              id: item.id.toString(),
              word: item.sentence_text,
              response: item.analysis,
              isStreaming: false,
              timestamp: new Date(item.created_at).getTime()
            }))
            setWordQueries(savedWordQueries)
          }
        }
      } catch (error) {
        console.error('Failed to load existing data:', error)
      }
    }
    
    loadExistingData()
  }, [query.id, articleId, language])

  // Handle word query
  const handleWordQuery = async (word: string) => {
    if (!word.trim() || isLoading) return
    
    const existingQuery = wordQueries.find(q => q.word.toLowerCase() === word.trim().toLowerCase())
    if (existingQuery) {
      setWordInput('')
      return
    }

    const queryId = Date.now().toString()
    const newQuery: WordQuery = {
      id: queryId,
      word: word.trim(),
      response: '',
      isStreaming: true,
      timestamp: Date.now()
    }

    setWordQueries(prev => [newQuery, ...prev])
    setWordInput('')
    setIsLoading(true)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/language-reading/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryData: query,
          language: language,
          userPrompt: `请用简洁易懂的方式解释这个法语单词 "${word}" 在句子 "${query.sentence_text}" 中的意思和用法。

请按照以下结构回答，并确保每一项都非常简短、清晰：

1. 中文解释（1句话，告诉我这个词在句中是什么意思）
2. 用法说明（最多2句话，说明它在语法上起什么作用）
3. 简单例句（1个法语例句 + 中文翻译，例句不能太难）

不要添加过多术语或语法细节。风格要温和、简洁，适合法语初学者阅读。`
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) throw new Error(`API request failed: ${response.status}`)

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
              const content = parsed.content
              
              if (content) {
                accumulatedResponse += content
                setWordQueries(prev => 
                  prev.map(q => 
                    q.id === queryId 
                      ? { ...q, response: accumulatedResponse }
                      : q
                  )
                )
              }
            } catch (e) {
              continue
            }
          }
        }
      }

      setWordQueries(prev => 
        prev.map(q => 
          q.id === queryId 
            ? { ...q, isStreaming: false }
            : q
        )
      )

      // Save to database
      if (accumulatedResponse) {
        try {
          await fetch('/api/language-reading/save-phrase-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleId: articleId,
              sentenceText: word.trim(),
              analysis: accumulatedResponse,
              startOffset: query.start_offset,
              endOffset: query.end_offset,
              language: language,
              contentType: 'word_query'
            })
          })
        } catch (saveError) {
          console.error('Failed to save word query:', saveError)
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setWordQueries(prev => prev.filter(q => q.id !== queryId))
      } else {
        console.error('Word query failed:', error)
        setWordQueries(prev => 
          prev.map(q => 
            q.id === queryId 
              ? { ...q, response: '查询失败，请重试', isStreaming: false }
              : q
          )
        )
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleWordInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleWordQuery(wordInput)
  }

  const tabs = [
    { id: 'words' as TabType, label: '单词', icon: '📝' },
    { id: 'phrases' as TabType, label: '词组', icon: '🔗' },
    { id: 'grammar' as TabType, label: '语法', icon: '📚' },
    { id: 'test' as TabType, label: '测试', icon: '🎯' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'words':
        return (
          <div className="space-y-2">
            <form onSubmit={handleWordInputSubmit} className="flex gap-1">
              <input
                type="text"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                placeholder="输入单词..."
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!wordInput.trim() || isLoading}
                className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:opacity-50"
              >
                查询
              </button>
            </form>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {wordQueries.map((wordQuery) => (
                <div key={wordQuery.id} className="bg-gray-50 border border-gray-200 rounded p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-semibold text-purple-800 text-xs">
                      {wordQuery.word}
                    </span>
                    <button
                      onClick={() => handleSpeak(wordQuery.word)}
                      disabled={playingText === wordQuery.word}
                      className="text-purple-500 hover:text-purple-700 p-0.5 rounded"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-700 leading-relaxed">
                    {wordQuery.response && (
                      <div className="formatted-response">
                        {formatAIResponse(wordQuery.response)}
                        {wordQuery.isStreaming && (
                          <span className="inline-block w-1 h-3 bg-purple-500 ml-1 animate-pulse"></span>
                        )}
                      </div>
                    )}
                    {!wordQuery.response && wordQuery.isStreaming && (
                      <div className="text-gray-500 text-xs">AI正在思考...</div>
                    )}
                  </div>
                </div>
              ))}
              {wordQueries.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-xs">
                  输入单词来向AI提问
                </div>
              )}
            </div>
          </div>
        )
      
      default:
        return (
          <div className="text-center py-4 text-gray-500 text-xs">
            {activeTab} 功能开发中...
          </div>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
            句子
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => onDelete(query.id)}
          className="text-red-500 hover:text-red-700 p-1 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Sentence Display */}
      <div className="p-3 bg-gray-50/50 border-l-2 border-blue-300">
        <p className="text-xs text-gray-700 italic leading-relaxed">"{query.sentence_text}"</p>
        <p className="text-xs text-gray-500 mt-1">{query.translation}</p>
      </div>
      
      {/* Expandable Content */}
      {isExpanded && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 px-3">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-2 text-xs font-medium rounded-t-lg transition-colors duration-200 flex items-center gap-1 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-3">
            {renderTabContent()}
          </div>
        </>
      )}
    </div>
  )
}