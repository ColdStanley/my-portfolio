'use client'

import { useState, useEffect, useRef } from 'react'
import AskAI from './AskAI'

// Analysis Section Component
interface AnalysisSectionProps {
  title: string
  icon: string
  children: React.ReactNode
  isExpanded?: boolean
}

function AnalysisSection({ title, icon, children, isExpanded = false }: AnalysisSectionProps) {
  const [expanded, setExpanded] = useState(isExpanded)

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-medium text-gray-800">{title}</span>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

// Types
interface QueryResult {
  selectedText: string
  startIndex: number
  endIndex: number
  analysisResult: AnalysisResult | null
  timestamp: number
  id: string
}

interface AnalysisResult {
  paragraph: {
    summary: string
    organization: string
  }
  phrases: Array<{
    phrase: string
    type: string
    meaning: string
    example: string
  }>
  words: Array<{
    word: string
    ipa: string
    meaning: string
    usage: string
    example: string
  }>
  grammar: Array<{
    point: string
    explanation: string
    example: string
  }>
  exercises: Array<{
    type: string
    question: string
    answer: string
  }>
}

interface ArticleData {
  id: string
  content: string
  queries: QueryResult[]
  timestamp: number
}

// Email content interface (same as IELTS Speaking)
interface SelectedEmailContent {
  id: string
  content: string
  type: 'query_response' | 'ai_response' | 'user_query'
  source: 'query_history'
  timestamp: string
  queryId?: string
}

export default function ParagrapheMagique() {
  const [articleContent, setArticleContent] = useState('')
  const [isLearningMode, setIsLearningMode] = useState(false)
  const [queries, setQueries] = useState<QueryResult[]>([])
  const [activeQueryId, setActiveQueryId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Refs
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const articleDisplayRef = useRef<HTMLDivElement>(null)
  
  // ReadLingua style states - 100% same as ReadLingua
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarArea, setToolbarArea] = useState<'article' | 'analysis'>('article')
  
  // Email collection states (same as IELTS Speaking)
  const [selectedEmailContents, setSelectedEmailContents] = useState<SelectedEmailContent[]>([])
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  
  // Tooltip states for right-corner buttons
  const [showAskAITooltip, setShowAskAITooltip] = useState(false)
  const [showEmailTooltip, setShowEmailTooltip] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('paragraphe-magique-data')
    if (savedData) {
      try {
        const data: ArticleData = JSON.parse(savedData)
        setArticleContent(data.content)
        setQueries(data.queries)
        setIsLearningMode(true)
      } catch (error) {
        console.error('Failed to load saved data:', error)
      }
    }
  }, [])

  // Save data to localStorage
  const saveToLocalStorage = (content: string, queriesData: QueryResult[]) => {
    const articleData: ArticleData = {
      id: Date.now().toString(),
      content,
      queries: queriesData,
      timestamp: Date.now()
    }
    localStorage.setItem('paragraphe-magique-data', JSON.stringify(articleData))
  }

  // Confirm article and enter learning mode
  const handleConfirmArticle = () => {
    if (!articleContent.trim()) return
    
    setIsLearningMode(true)
    saveToLocalStorage(articleContent, [])
  }

  // Delete article and reset
  const handleDeleteArticle = () => {
    setArticleContent('')
    setIsLearningMode(false)
    setQueries([])
    setActiveQueryId(null)
    localStorage.removeItem('paragraphe-magique-data')
  }

  // Handle text selection - support both article and analysis areas
  const handleTextSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLearningMode) return
    
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    
    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      
      if (rect) {
        // Detect area from data attribute
        const area = e.currentTarget.getAttribute('data-area') as 'article' | 'analysis' || 'article'
        
        setSelectedText(text)
        setToolbarArea(area)
        // Use viewport coordinates directly for fixed positioning
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        })
        setShowToolbar(true)
      }
    } else {
      setShowToolbar(false)
    }
  }

  // Close toolbar
  const handleCloseToolbar = () => {
    setShowToolbar(false)
  }

  // Handle query request - only for article area
  const handleQuery = async () => {
    if (!selectedText || toolbarArea !== 'article') return

    setShowToolbar(false)

    // Create new query
    const newQuery: QueryResult = {
      selectedText,
      startIndex: 0, // Simplified for now
      endIndex: selectedText.length,
      analysisResult: null,
      timestamp: Date.now(),
      id: Date.now().toString()
    }

    // Add to queries
    const updatedQueries = [...queries, newQuery]
    setQueries(updatedQueries)
    setActiveQueryId(newQuery.id)
    setIsLoading(true)

    try {
      // Call n8n API
      const response = await fetch('https://agentworkflow.stanleyhi.com/webhook/57e814ce-9cd5-4425-8295-424738359d0f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: selectedText })
      })

      const rawData = await response.text()
      const parsedData = JSON.parse(rawData)

      // Parse nested JSON strings
      const analysisResult: AnalysisResult = {
        paragraph: JSON.parse(parsedData.paragraph.text),
        phrases: JSON.parse(parsedData.phrases.text),
        words: JSON.parse(parsedData.words.text),
        grammar: JSON.parse(parsedData.grammar.text),
        exercises: JSON.parse(parsedData.exercises.text)
      }

      // Update query with result
      const finalQueries = updatedQueries.map(q => 
        q.id === newQuery.id 
          ? { ...q, analysisResult }
          : q
      )
      
      setQueries(finalQueries)
      saveToLocalStorage(articleContent, finalQueries)

    } catch (error) {
      console.error('Query failed:', error)
      // Remove failed query
      const filteredQueries = updatedQueries.filter(q => q.id !== newQuery.id)
      setQueries(filteredQueries)
    } finally {
      setIsLoading(false)
    }
  }

  // Get active query result
  const activeQuery = queries.find(q => q.id === activeQueryId)
  const activeResult = activeQuery?.analysisResult

  // Render article with highlights
  const renderArticleWithHighlights = () => {
    if (queries.length === 0) {
      return articleContent
    }

    // Sort queries by startIndex to avoid overlap issues
    const sortedQueries = [...queries].sort((a, b) => a.startIndex - b.startIndex)
    
    let result = []
    let currentIndex = 0

    sortedQueries.forEach((query) => {
      // Add text before highlight
      if (currentIndex < query.startIndex) {
        result.push(
          <span key={`text-${currentIndex}`}>
            {articleContent.slice(currentIndex, query.startIndex)}
          </span>
        )
      }

      // Add highlighted text
      const isActive = query.id === activeQueryId
      result.push(
        <span
          key={`highlight-${query.id}`}
          className={`cursor-pointer transition-all ${
            isActive
              ? 'bg-purple-300 border-2 border-purple-500 rounded px-1'
              : 'bg-purple-200 hover:bg-purple-250 rounded px-1'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            setActiveQueryId(query.id)
            setShowToolbar(false)
          }}
          title={`点击查看分析结果: ${query.selectedText}`}
        >
          {articleContent.slice(query.startIndex, query.endIndex)}
        </span>
      )

      currentIndex = Math.max(currentIndex, query.endIndex)
    })

    // Add remaining text
    if (currentIndex < articleContent.length) {
      result.push(
        <span key={`text-end`}>
          {articleContent.slice(currentIndex)}
        </span>
      )
    }

    return result
  }

  // Email collection functions (same as IELTS Speaking)
  const addToEmailSelection = (content: Omit<SelectedEmailContent, 'id' | 'timestamp'>) => {
    const id = `email-content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date().toISOString()
    
    const newContent: SelectedEmailContent = {
      ...content,
      id,
      timestamp
    }
    
    setSelectedEmailContents(prev => [...prev, newContent])
  }

  const removeFromEmailSelection = (id: string) => {
    setSelectedEmailContents(prev => prev.filter(item => item.id !== id))
  }

  const sendEmailContent = async () => {
    if (!userEmail || selectedEmailContents.length === 0) return
    
    setIsSendingEmail(true)
    try {
      const emailBody = selectedEmailContents.map(item => `${item.content}`).join('\n\n---\n\n')
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          subject: 'Paragraphe Magique - Selected Content',
          body: emailBody
        })
      })
      
      if (response.ok) {
        setSelectedEmailContents([])
        setUserEmail('')
        setShowEmailPanel(false)
      }
    } catch (error) {
      console.error('Failed to send email:', error)
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-20">
      <div className="max-w-7xl mx-auto h-full flex gap-6">
        
        {/* Left Panel - Article Input */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                法语文章
              </h2>
              {isLearningMode && (
                <button
                  onClick={handleDeleteArticle}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  删除文章
                </button>
              )}
            </div>

            {!isLearningMode ? (
              // Input Mode
              <div className="flex-1 flex flex-col">
                <textarea
                  ref={textAreaRef}
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  placeholder="请输入法语文章..."
                  className="flex-1 w-full p-4 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                />
                <button
                  onClick={handleConfirmArticle}
                  disabled={!articleContent.trim()}
                  className={`mt-4 w-32 px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
                    articleContent.trim()
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  确认文章
                </button>
              </div>
            ) : (
              // Learning Mode
              <div 
                ref={articleDisplayRef}
                className="flex-1 p-4 bg-white border border-gray-200 rounded-lg overflow-y-auto cursor-text select-text"
                data-area="article"
                onMouseUp={handleTextSelection}
              >
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {renderArticleWithHighlights()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                分析结果
              </h2>
              {isLoading && (
                <div className="text-purple-600 text-sm">
                  分析中...
                </div>
              )}
            </div>

{!activeResult ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="mb-2">📚</div>
                  <div>选择法语文本并右键查询以显示分析结果</div>
                </div>
              </div>
            ) : (
              <div 
                className="flex-1 overflow-y-auto space-y-4"
                data-area="analysis"
                onMouseUp={handleTextSelection}
              >
                {/* Paragraph Analysis */}
                <AnalysisSection 
                  title="段落分析" 
                  icon="📝"
                  isExpanded={true}
                >
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-purple-600">段落结构：</span>
                      <span className="text-gray-700">{activeResult.paragraph.summary}</span>
                    </div>
                    <div>
                      <span className="font-medium text-purple-600">构造逻辑：</span>
                      <span className="text-gray-700">{activeResult.paragraph.organization}</span>
                    </div>
                  </div>
                </AnalysisSection>

                {/* Phrases Analysis */}
                <AnalysisSection 
                  title="词组分析" 
                  icon="🔗"
                  isExpanded={true}
                >
                  <div className="grid gap-3">
                    {activeResult.phrases.map((phrase, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-800">{phrase.phrase}</span>
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                            {phrase.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>释义：</strong>{phrase.meaning}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>例句：</strong>{phrase.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnalysisSection>

                {/* Words Analysis */}
                <AnalysisSection 
                  title="单词分析" 
                  icon="📚"
                  isExpanded={true}
                >
                  <div className="grid gap-3">
                    {activeResult.words.map((word, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-800">{word.word}</span>
                          <span className="text-gray-500 text-sm">{word.ipa}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>释义：</strong>{word.meaning}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>用法：</strong>{word.usage}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>例句：</strong>{word.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnalysisSection>

                {/* Grammar Analysis */}
                <AnalysisSection 
                  title="语法分析" 
                  icon="📖"
                  isExpanded={true}
                >
                  <div className="grid gap-3">
                    {activeResult.grammar.map((grammar, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-800 mb-2">{grammar.point}</div>
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>说明：</strong>{grammar.explanation}
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>例句：</strong>{grammar.example}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnalysisSection>

                {/* Exercises */}
                <AnalysisSection 
                  title="练习题" 
                  icon="✏️"
                  isExpanded={true}
                >
                  <div className="space-y-4">
                    {activeResult.exercises.map((exercise, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                            {exercise.type === 'reorder' ? '句子重排' : '填空题'}
                          </span>
                        </div>
                        <div className="text-gray-800 mb-3">
                          <strong>题目：</strong>{exercise.question}
                        </div>
                        <div className="text-sm text-gray-600 bg-white p-2 rounded border-l-4 border-green-400">
                          <strong>答案：</strong>{exercise.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnalysisSection>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar with smooth animation */}
        {(showToolbar || true) && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={handleCloseToolbar}
              style={{
                pointerEvents: showToolbar ? 'auto' : 'none'
              }}
            />
            <div
              className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
              style={{
                left: selectionPosition.x,
                top: selectionPosition.y,
                transform: `translate(-50%, -100%) scale(${showToolbar ? 1 : 0.85})`,
                marginTop: '-8px',
                opacity: showToolbar ? 1 : 0,
                transition: 'all 0.15s ease-out',
                pointerEvents: showToolbar ? 'auto' : 'none'
              }}
            >
              <button
                onClick={async () => {
                  try {
                    setShowToolbar(false) // Close toolbar immediately
                    
                    const response = await fetch('/api/readlingua/text-to-speech', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        text: selectedText,
                        language: 'french'
                      })
                    })
                    
                    if (response.ok) {
                      const audioBlob = await response.blob()
                      const audioUrl = URL.createObjectURL(audioBlob)
                      const audio = new Audio(audioUrl)
                      
                      audio.onended = () => {
                        URL.revokeObjectURL(audioUrl)
                      }
                      
                      audio.onerror = () => {
                        URL.revokeObjectURL(audioUrl)
                        console.error('Audio playback failed')
                      }
                      
                      await audio.play()
                    } else {
                      const errorData = await response.json()
                      console.error('Failed to get audio:', errorData.error)
                    }
                  } catch (error) {
                    console.error('Error playing pronunciation:', error)
                  }
                }}
                className="w-full px-4 py-2 text-left text-purple-600 hover:bg-purple-50 transition-colors"
              >
                🔊 发音
              </button>
              
              {/* Conditional buttons based on area */}
              {toolbarArea === 'article' && (
                <button
                  onClick={handleQuery}
                  className="w-full px-4 py-2 text-left text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  🔍 查询
                </button>
              )}
              
              {toolbarArea === 'analysis' && (
                <button
                  onClick={() => {
                    addToEmailSelection({
                      content: selectedText,
                      type: 'ai_response',
                      source: 'query_history'
                    })
                    setShowToolbar(false)
                  }}
                  className="w-full px-4 py-2 text-left text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  📧 添加到邮箱
                </button>
              )}
            </div>
          </>
        )}

        {/* Ask AI Component - Same as IELTS Speaking */}
        <AskAI 
          show={!isLoading} 
          onMouseEnter={() => setShowAskAITooltip(true)}
          onMouseLeave={() => setShowAskAITooltip(false)}
        />
        
        {/* Email Collection Button - Same as IELTS Speaking */}
        {!isLoading && (
          <div className="fixed bottom-[88px] right-6 z-20">
            <button
              onClick={() => setShowEmailPanel(!showEmailPanel)}
              onMouseEnter={() => setShowEmailTooltip(true)}
              onMouseLeave={() => setShowEmailTooltip(false)}
              className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group relative"
              style={{
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)'
              }}
            >
              <svg 
                className="w-5 h-5 text-purple-500 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {selectedEmailContents.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                  {selectedEmailContents.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Email Panel - Same as IELTS Speaking */}
        {showEmailPanel && (
          <>
            <div 
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
              onClick={() => setShowEmailPanel(false)}
            />
            
            {/* Email Panel */}
            <div className="fixed bottom-[152px] right-6 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl min-w-80 transform transition-all duration-200"
              style={{
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)'
              }}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-medium text-gray-800">Send Selected Content</h3>
                </div>
                
                {/* Email Input */}
                <div className="mb-3">
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                {/* Selected Content */}
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-2">
                    Selected Content ({selectedEmailContents.length})
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {selectedEmailContents.map((item) => (
                      <div key={item.id} className="bg-gray-50 p-2 rounded text-xs flex items-start gap-2">
                        <span className="flex-1 truncate">{item.content}</span>
                        <button
                          onClick={() => removeFromEmailSelection(item.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Send Button */}
                <button
                  onClick={sendEmailContent}
                  disabled={!userEmail || selectedEmailContents.length === 0 || isSendingEmail}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingEmail ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Tooltips for right-corner buttons */}
        {showAskAITooltip && !isLoading && (
          <div 
            className="fixed bottom-[72px] right-[72px] z-30 bg-gray-800 text-white text-sm px-2 py-1 rounded whitespace-nowrap"
            style={{
              transform: `translate(-50%, 0) scale(${showAskAITooltip ? 1 : 0.85})`,
              opacity: showAskAITooltip ? 1 : 0,
              transition: 'all 0.15s ease-out',
              pointerEvents: 'none'
            }}
          >
            Ask AI
          </div>
        )}

        {showEmailTooltip && !isLoading && (
          <div 
            className="fixed bottom-[144px] right-[72px] z-30 bg-gray-800 text-white text-sm px-2 py-1 rounded whitespace-nowrap"
            style={{
              transform: `translate(-50%, 0) scale(${showEmailTooltip ? 1 : 0.85})`,
              opacity: showEmailTooltip ? 1 : 0,
              transition: 'all 0.15s ease-out',
              pointerEvents: 'none'
            }}
          >
            Send Selected Content
          </div>
        )}
      </div>
    </div>
  )
}