'use client'

import { useState, useEffect } from 'react'
import { useLanguageReadingStore } from '../store/useLanguageReadingStore'
import AnimatedButton from './AnimatedButton'
import { Language, getUITexts } from '../config/uiText'
import { playText } from '../utils/tts'
import AIDialog from './AIDialog'
import Tooltip from './Tooltip'

interface CollapsibleContentProps {
  content: string
  maxLength: number
  className?: string
  language: Language
}

function CollapsibleContent({ content, maxLength, className = '', language }: CollapsibleContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const uiTexts = getUITexts(language)
  
  if (content.length <= maxLength) {
    return <div className={`${className} whitespace-pre-wrap`}>{content}</div>
  }

  return (
    <div className={className}>
      <div className="whitespace-pre-wrap">
        {isExpanded ? content : `${content.slice(0, maxLength)}...`}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="text-purple-600 hover:text-purple-800 text-xs mt-1 font-medium transition-colors inline-flex items-center gap-1"
      >
        <span>{isExpanded ? uiTexts.collapse : uiTexts.expand}</span>
        <svg 
          className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}

interface QueryCardsProps {
  language: Language
  articleId: number
  isTestMode: boolean
  onExitTestMode: () => void
  onAINotesRefresh?: () => void
}

interface TestQuestion {
  id: string | number
  type: 'word_fill' | 'sentence_fill'
  question?: string
  chineseTranslation?: string
  englishSentence?: string
  answer: string
  questionType: 'word' | 'sentence'
}

export default function QueryCards({ language, articleId, isTestMode, onExitTestMode, onAINotesRefresh }: QueryCardsProps) {
  const { wordQueries, sentenceQueries, deleteWordQuery, deleteSentenceQuery, updateWordNotes, updateSentenceNotes, loadStoredData } = useLanguageReadingStore()
  const [editingNotes, setEditingNotes] = useState<{id: number, type: 'word' | 'sentence', notes: string} | null>(null)
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [testScore, setTestScore] = useState(0)
  const [testLoading, setTestLoading] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [aiDialog, setAiDialog] = useState<{
    isOpen: boolean
    queryData: any
    queryType: 'word' | 'sentence'
    initialResponse?: string
  }>({ isOpen: false, queryData: null, queryType: 'word' })
  const [fromQuizQueryId, setFromQuizQueryId] = useState<string | null>(null)
  const uiTexts = getUITexts(language)

  // 获取测试题目
  useEffect(() => {
    if (isTestMode && testQuestions.length === 0) {
      setTestLoading(true)
      fetch(`/api/language-reading/review-test?articleId=${articleId}&language=${language}`)
        .then(response => response.json())
        .then(data => {
          if (data.questions) {
            setTestQuestions(data.questions)
            setCurrentQuestionIndex(0)
            setTestScore(0)
            setTestCompleted(false)
          }
        })
        .catch(error => {
          console.error('Failed to fetch test questions:', error)
        })
        .finally(() => {
          setTestLoading(false)
        })
    }
  }, [isTestMode, articleId, language, testQuestions.length])

  // 重置测试状态
  useEffect(() => {
    if (!isTestMode) {
      setTestQuestions([])
      setCurrentQuestionIndex(0)
      setUserAnswer('')
      setIsAnswered(false)
      setIsCorrect(false)
      setTestScore(0)
      setTestCompleted(false)
    }
  }, [isTestMode])

  // 测试提交逻辑
  const handleTestSubmit = () => {
    if (isAnswered) {
      // 下一题
      if (currentQuestionIndex < testQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setUserAnswer('')
        setIsAnswered(false)
        setIsCorrect(false)
      } else {
        // 测试完成
        setTestCompleted(true)
      }
      return
    }

    // 检查答案
    const currentQuestion = testQuestions[currentQuestionIndex]
    const trimmedAnswer = userAnswer.trim().toLowerCase()
    const correctAnswer = currentQuestion.answer.toLowerCase()
    const correct = trimmedAnswer === correctAnswer

    setIsCorrect(correct)
    setIsAnswered(true)
    
    if (correct) {
      setTestScore(testScore + 1)
    }
  }

  // 重新开始测试
  const handleTestAgain = () => {
    // 重置所有测试状态
    setTestQuestions([])
    setCurrentQuestionIndex(0)
    setUserAnswer('')
    setIsAnswered(false)
    setIsCorrect(false)
    setTestScore(0)
    setTestCompleted(false)
    // testQuestions为空会触发useEffect重新获取题目
  }

  // 跳转到对应的查询卡片
  const scrollToQueryCard = (questionId: string | number) => {
    // 移除前缀获取真实的查询ID
    const realId = questionId.toString().replace('sent_', '')
    
    // 尝试查找word card或sentence card
    let cardElement = document.getElementById(`word-card-${realId}`)
    if (!cardElement) {
      cardElement = document.getElementById(`sentence-card-${realId}`)
    }
    
    if (cardElement) {
      // 记录这是从quiz来的查询
      setFromQuizQueryId(realId)
      
      cardElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
      
      // 添加临时高亮效果
      cardElement.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.5)'
      setTimeout(() => {
        cardElement.style.boxShadow = ''
      }, 2000)
    }
  }

  // 返回到quiz的函数
  const scrollBackToQuiz = () => {
    setFromQuizQueryId(null)
    // 找到test card并滚动到那里
    const testCard = document.querySelector('.bg-purple-50.rounded-xl.shadow-lg.border.border-purple-200')
    if (testCard) {
      testCard.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
  }

  // AI助手相关函数
  const handleAskAI = (query: any, type: 'word' | 'sentence') => {
    setAiDialog({
      isOpen: true,
      queryData: query,
      queryType: type,
      initialResponse: query.ai_notes || undefined
    })
  }

  const handleCloseAIDialog = () => {
    setAiDialog({ isOpen: false, queryData: null, queryType: 'word' })
  }

  const handleAISaved = async () => {
    // 刷新数据以显示新保存的AI notes
    await loadStoredData(articleId, language)
    
    // 刷新AI Notes Cards显示
    if (onAINotesRefresh) {
      onAINotesRefresh()
    }
  }

  // Get language-specific speech language code
  const handleSpeak = async (text: string, rate: number = 0.8) => {
    try {
      await playText(text, language, rate)
    } catch (error) {
      console.error('TTS failed:', error)
    }
  }
  
  const handleDelete = async (id: number, type: 'word' | 'sentence') => {
    try {
      const res = await fetch(`/api/language-reading/queries?id=${id}&type=${type}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        if (type === 'word') {
          deleteWordQuery(id)
        } else {
          deleteSentenceQuery(id)
        }
      }
    } catch (error) {
      console.error('Failed to delete query:', error)
    }
  }

  const scrollToHighlight = (query: any, type: 'word' | 'sentence') => {
    // Get the article content element
    const articleElement = document.querySelector('.prose')
    if (!articleElement) return
    
    // Find span with the matching query ID using data-query-ids attribute
    const highlightedElements = articleElement.querySelectorAll('span[data-query-ids]')
    
    for (const element of highlightedElements) {
      const queryIdsStr = element.getAttribute('data-query-ids')
      if (!queryIdsStr) continue
      
      try {
        const queryIds = JSON.parse(queryIdsStr) as number[]
        
        // Check if this span contains our target query ID
        if (queryIds.includes(query.id)) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
          
          // Add visual feedback
          const originalStyle = element.getAttribute('style') || ''
          element.style.boxShadow = '0 0 15px rgba(147, 51, 234, 0.8)'
          element.style.transform = 'scale(1.05)'
          element.style.transition = 'all 0.3s ease'
          
          setTimeout(() => {
            element.setAttribute('style', originalStyle)
          }, 2000)
          break
        }
      } catch (error) {
        console.error('Error parsing query IDs:', error)
      }
    }
  }

  const handleStartEditing = (id: number, type: 'word' | 'sentence', currentNotes: string = '') => {
    setEditingNotes({
      id,
      type,
      notes: currentNotes
    })
  }

  const handleSaveNotes = async () => {
    if (!editingNotes) return
    
    try {
      const response = await fetch('/api/language-reading/update-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingNotes.id,
          type: editingNotes.type,
          notes: editingNotes.notes
        })
      })

      if (response.ok) {
        if (editingNotes.type === 'word') {
          updateWordNotes(editingNotes.id, editingNotes.notes)
        } else {
          updateSentenceNotes(editingNotes.id, editingNotes.notes)
        }
        setEditingNotes(null)
      } else {
        console.error('Failed to save notes')
      }
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }

  const handleCancelEditing = () => {
    setEditingNotes(null)
  }

  // Enhanced highlighting function for French accents
  const highlightWordInExample = (example: string, wordText: string) => {
    if (!example || !wordText) return example
    
    // For French, handle accented characters more intelligently
    let searchWord = wordText
    if (language === 'french') {
      // Create pattern that matches both accented and non-accented versions
      searchWord = wordText
        .replace(/[àáâãäå]/g, '[àáâãäåa]')
        .replace(/[èéêë]/g, '[èéêëe]')
        .replace(/[ìíîï]/g, '[ìíîïi]')
        .replace(/[òóôõö]/g, '[òóôõöo]')
        .replace(/[ùúûü]/g, '[ùúûüu]')
        .replace(/[ç]/g, '[çc]')
        .replace(/[ñ]/g, '[ñn]')
    }
    
    const regex = new RegExp(`(${searchWord})`, 'gi')
    return example.replace(regex, '<mark class="bg-purple-200 text-purple-800 px-1 rounded">$1</mark>')
  }

  // Combine and sort queries by creation time
  const allQueries = [
    ...wordQueries.map(q => ({ ...q, type: 'word' as const })),
    ...sentenceQueries.map(q => ({ ...q, type: 'sentence' as const }))
  ].sort((a, b) => a.id - b.id)

  if (allQueries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">📖</div>
          <p>{uiTexts.selectForExplanations}</p>
        </div>
      </div>
    )
  }

  // Separate word and sentence queries
  const words = allQueries.filter(q => q.type === 'word')
  const sentences = allQueries.filter(q => q.type === 'sentence')
  
  // Distribute word queries into two columns
  const leftColumnWords = words.filter((_, index) => index % 2 === 0)
  const rightColumnWords = words.filter((_, index) => index % 2 === 1)

  return (
    <div className="h-full overflow-hidden">
      <div className="space-y-6">
        {/* Sentence queries - full width */}
        {sentences.map((query) => (
          <div
            key={`sentence-${query.id}`}
            id={`sentence-card-${query.id}`}
            className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 w-full transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-blue-200"
            onClick={() => scrollToHighlight(query, 'sentence')}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1.5 text-xs bg-blue-100 text-blue-800 rounded-full font-semibold">
                  {uiTexts.sentence}
                </span>
                <div className="flex-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(query.id, 'sentence')
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-all duration-200"
                  title={uiTexts.delete}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-50/50 p-3 rounded-lg border-l-4 border-blue-300">
                  <p className="text-sm text-gray-700 italic leading-relaxed">"{query.sentence_text}"</p>
                </div>
                
                {query.query_type === 'manual_mark' ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm font-medium text-gray-700 mb-1">{uiTexts.yourNotes}</p>
                    {editingNotes?.id === query.id && editingNotes?.type === 'sentence' ? (
                      <div>
                        <textarea
                          value={editingNotes.notes}
                          onChange={(e) => setEditingNotes({...editingNotes, notes: e.target.value})}
                          className="w-full text-sm text-gray-600 border border-purple-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder={uiTexts.notesPlaceholder}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <AnimatedButton
                            onClick={handleSaveNotes}
                            variant="primary"
                            size="sm"
                          >
                            {uiTexts.save}
                          </AnimatedButton>
                          <AnimatedButton
                            onClick={handleCancelEditing}
                            variant="secondary"
                            size="sm"
                          >
                            {uiTexts.cancel}
                          </AnimatedButton>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleStartEditing(query.id, 'sentence', query.user_notes || '')}
                        className={`w-full text-sm rounded p-2 min-h-[60px] cursor-text border transition-colors whitespace-pre-wrap ${
                          query.user_notes 
                            ? 'text-gray-600 border-gray-300 hover:border-purple-300' 
                            : 'text-gray-400 border-gray-200 hover:border-purple-300 italic'
                        }`}
                      >
{query.user_notes || uiTexts.notesPlaceholder}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50/50 p-3 rounded-lg">
                      <CollapsibleContent
                        content={query.translation}
                        maxLength={100}
                        className="text-sm text-blue-900 leading-relaxed font-medium"
                        language={language}
                      />
                    </div>
                    
                    <div className="bg-gray-50/30 p-3 rounded-lg">
                      <CollapsibleContent
                        content={query.analysis}
                        maxLength={150}
                        className="text-sm text-gray-700 leading-relaxed"
                        language={language}
                      />
                    </div>
                  </>
                )}
                
                {/* AI Assistant Section for Sentences */}
                <div className="mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAskAI(query, 'sentence')}
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Ask AI
                      </button>
                      {query.ai_notes && (
                        <Tooltip content={query.ai_notes} position="right">
                          <button className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-all duration-200 border border-purple-200">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
                              <path d="M6 8h8v2H6V8zm0 4h5v2H6v-2z"/>
                            </svg>
                            Notes
                          </button>
                        </Tooltip>
                      )}
                    </div>
                    {/* Back to Quiz button - only show if this card was accessed from quiz */}
                    {isTestMode && fromQuizQueryId === query.id.toString() && (
                      <button
                        onClick={scrollBackToQuiz}
                        className="text-xs text-gray-500 hover:text-purple-600 hover:bg-gray-50 px-2 py-1 rounded transition-all duration-200 flex items-center gap-1"
                        title="Return to quiz"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {uiTexts.backToQuiz}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Word queries - two columns */}
        {words.length > 0 && (
          <div className="flex gap-6">
            {/* Left column */}
            <div className="w-1/2 space-y-5">
              {leftColumnWords.map((query) => (
                <div
                  key={`word-left-${query.id}`}
                  id={`word-card-${query.id}`}
                  className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-purple-200"
                  onClick={() => scrollToHighlight(query, 'word')}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1.5 text-xs bg-purple-100 text-purple-800 rounded-full font-semibold">
                        {uiTexts.word}
                      </span>
                      <h3 className="font-bold text-gray-900 flex-1 text-base">
                        {query.word_text}
                      </h3>
                      <div className="flex gap-1 items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSpeak(query.word_text)
                          }}
                          className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 p-1.5 rounded-full transition-all duration-200"
                          title={uiTexts.playWord}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(query.id, 'word')
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-all duration-200"
                          title={uiTexts.delete}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {query.query_type === 'manual_mark' ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <p className="text-sm font-medium text-gray-700 mb-1">{uiTexts.yourNotes}</p>
                          {editingNotes?.id === query.id && editingNotes?.type === 'word' ? (
                            <div>
                              <textarea
                                value={editingNotes.notes}
                                onChange={(e) => setEditingNotes({...editingNotes, notes: e.target.value})}
                                className="w-full text-sm text-gray-600 border border-purple-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder={uiTexts.notesPlaceholder}
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2">
                                <AnimatedButton
                                  onClick={handleSaveNotes}
                                  variant="primary"
                                  size="sm"
                                >
                                  {uiTexts.save}
                                </AnimatedButton>
                                <AnimatedButton
                                  onClick={handleCancelEditing}
                                  variant="secondary"
                                  size="sm"
                                >
                                  {uiTexts.cancel}
                                </AnimatedButton>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleStartEditing(query.id, 'word', query.user_notes || '')}
                              className={`w-full text-sm rounded p-2 min-h-[60px] cursor-text border transition-colors whitespace-pre-wrap ${
                                query.user_notes 
                                  ? 'text-gray-600 border-gray-300 hover:border-purple-300' 
                                  : 'text-gray-400 border-gray-200 hover:border-purple-300 italic'
                              }`}
                            >
      {query.user_notes || uiTexts.notesPlaceholder}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Definition */}
                          <div className="bg-purple-50/50 p-3 rounded-lg border-l-4 border-purple-300">
                            <CollapsibleContent
                              content={query.definition}
                              maxLength={80}
                              className="text-sm text-gray-800 leading-relaxed font-medium"
                              language={language}
                            />
                          </div>
                          
                          {/* Part of speech, gender, and root form */}
                          <div className="flex gap-2 text-xs flex-wrap">
                            {query.part_of_speech && (
                              <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full font-semibold text-xs">
                                {query.part_of_speech}
                              </span>
                            )}
                            {query.gender && language === 'french' && (
                              <span className="bg-pink-100 text-pink-800 px-3 py-1.5 rounded-full font-semibold text-xs">
                                {query.gender}
                              </span>
                            )}
                            {query.root_form && query.root_form !== query.word_text && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5">
                                → {query.root_form}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSpeak(query.root_form || '')
                                  }}
                                  className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-1 rounded-full transition-all duration-200"
                                  title={`${uiTexts.playWord}: ${query.root_form}`}
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </span>
                            )}
                          </div>
                          
                          {/* French conjugation info */}
                          {query.conjugation_info && language === 'french' && 
                           !['不适用', 'N/A', '无', '无变位信息', 'Not applicable', 'None'].some(skip => 
                             query.conjugation_info?.toLowerCase().includes(skip.toLowerCase())
                           ) && (
                            <div className="text-xs text-gray-500 italic">
                              {query.conjugation_info}
                            </div>
                          )}
                          
                          {/* Example sentence with highlighting and translation */}
                          {query.examples && query.examples.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div 
                                    className="text-sm text-gray-700 mb-1 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                      __html: highlightWordInExample(query.examples[0], query.word_text)
                                    }}
                                  />
                                  {query.example_translation && (
                                    <div className="text-xs text-gray-500 italic">
                                      {query.example_translation}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSpeak(query.examples[0], 0.8)
                                  }}
                                  className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-1.5 rounded-full opacity-70 hover:opacity-100 transition-all duration-200 flex-shrink-0"
                                  title={uiTexts.playExample}
                                >
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* AI Assistant Section for Words - Left Column */}
                      <div className="mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-between items-center">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAskAI(query, 'word')}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Ask AI
                            </button>
                            {query.ai_notes && (
                              <Tooltip content={query.ai_notes} position="right">
                                <button className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-all duration-200 border border-purple-200">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
                                    <path d="M6 8h8v2H6V8zm0 4h5v2H6v-2z"/>
                                  </svg>
                                  Notes
                                </button>
                              </Tooltip>
                            )}
                          </div>
                          {/* Back to Quiz button - only show if this card was accessed from quiz */}
                          {isTestMode && fromQuizQueryId === query.id.toString() && (
                            <button
                              onClick={scrollBackToQuiz}
                              className="text-xs text-gray-500 hover:text-purple-600 hover:bg-gray-50 px-2 py-1 rounded transition-all duration-200 flex items-center gap-1"
                              title="Return to quiz"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                              </svg>
                              {uiTexts.backToQuiz}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right column */}
            <div className="w-1/2 space-y-5">
              {rightColumnWords.map((query) => (
                <div
                  key={`word-right-${query.id}`}
                  id={`word-card-${query.id}`}
                  className="bg-white rounded-xl shadow-lg border border-gray-200/80 p-4 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-purple-200"
                  onClick={() => scrollToHighlight(query, 'word')}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1.5 text-xs bg-purple-100 text-purple-800 rounded-full font-semibold">
                        {uiTexts.word}
                      </span>
                      <h3 className="font-bold text-gray-900 flex-1 text-base">
                        {query.word_text}
                      </h3>
                      <div className="flex gap-1 items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSpeak(query.word_text)
                          }}
                          className="text-purple-500 hover:text-purple-700 hover:bg-purple-50 p-1.5 rounded-full transition-all duration-200"
                          title={uiTexts.playWord}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(query.id, 'word')
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-all duration-200"
                          title={uiTexts.delete}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {query.query_type === 'manual_mark' ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <p className="text-sm font-medium text-gray-700 mb-1">{uiTexts.yourNotes}</p>
                          {editingNotes?.id === query.id && editingNotes?.type === 'word' ? (
                            <div>
                              <textarea
                                value={editingNotes.notes}
                                onChange={(e) => setEditingNotes({...editingNotes, notes: e.target.value})}
                                className="w-full text-sm text-gray-600 border border-purple-300 rounded p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder={uiTexts.notesPlaceholder}
                                autoFocus
                              />
                              <div className="flex gap-2 mt-2">
                                <AnimatedButton
                                  onClick={handleSaveNotes}
                                  variant="primary"
                                  size="sm"
                                >
                                  {uiTexts.save}
                                </AnimatedButton>
                                <AnimatedButton
                                  onClick={handleCancelEditing}
                                  variant="secondary"
                                  size="sm"
                                >
                                  {uiTexts.cancel}
                                </AnimatedButton>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleStartEditing(query.id, 'word', query.user_notes || '')}
                              className={`w-full text-sm rounded p-2 min-h-[60px] cursor-text border transition-colors whitespace-pre-wrap ${
                                query.user_notes 
                                  ? 'text-gray-600 border-gray-300 hover:border-purple-300' 
                                  : 'text-gray-400 border-gray-200 hover:border-purple-300 italic'
                              }`}
                            >
      {query.user_notes || uiTexts.notesPlaceholder}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Definition */}
                          <div className="bg-purple-50/50 p-3 rounded-lg border-l-4 border-purple-300">
                            <CollapsibleContent
                              content={query.definition}
                              maxLength={80}
                              className="text-sm text-gray-800 leading-relaxed font-medium"
                              language={language}
                            />
                          </div>
                          
                          {/* Part of speech, gender, and root form */}
                          <div className="flex gap-2 text-xs flex-wrap">
                            {query.part_of_speech && (
                              <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full font-semibold text-xs">
                                {query.part_of_speech}
                              </span>
                            )}
                            {query.gender && language === 'french' && (
                              <span className="bg-pink-100 text-pink-800 px-3 py-1.5 rounded-full font-semibold text-xs">
                                {query.gender}
                              </span>
                            )}
                            {query.root_form && query.root_form !== query.word_text && (
                              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1.5">
                                → {query.root_form}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSpeak(query.root_form || '')
                                  }}
                                  className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-1 rounded-full transition-all duration-200"
                                  title={`${uiTexts.playWord}: ${query.root_form}`}
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </span>
                            )}
                          </div>
                          
                          {/* French conjugation info */}
                          {query.conjugation_info && language === 'french' && 
                           !['不适用', 'N/A', '无', '无变位信息', 'Not applicable', 'None'].some(skip => 
                             query.conjugation_info?.toLowerCase().includes(skip.toLowerCase())
                           ) && (
                            <div className="text-xs text-gray-500 italic">
                              {query.conjugation_info}
                            </div>
                          )}
                          
                          {/* Example sentence with highlighting and translation */}
                          {query.examples && query.examples.length > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div 
                                    className="text-sm text-gray-700 mb-1 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                      __html: highlightWordInExample(query.examples[0], query.word_text)
                                    }}
                                  />
                                  {query.example_translation && (
                                    <div className="text-xs text-gray-500 italic">
                                      {query.example_translation}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSpeak(query.examples[0], 0.8)
                                  }}
                                  className="text-purple-400 hover:text-purple-600 hover:bg-purple-50 p-1.5 rounded-full opacity-70 hover:opacity-100 transition-all duration-200 flex-shrink-0"
                                  title={uiTexts.playExample}
                                >
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* AI Assistant Section for Words - Right Column */}
                      <div className="mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 justify-between items-center">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAskAI(query, 'word')}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Ask AI
                            </button>
                            {query.ai_notes && (
                              <Tooltip content={query.ai_notes} position="left">
                                <button className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg hover:bg-purple-100 transition-all duration-200 border border-purple-200">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
                                    <path d="M6 8h8v2H6V8zm0 4h5v2H6v-2z"/>
                                  </svg>
                                  Notes
                                </button>
                              </Tooltip>
                            )}
                          </div>
                          {/* Back to Quiz button - only show if this card was accessed from quiz */}
                          {isTestMode && fromQuizQueryId === query.id.toString() && (
                            <button
                              onClick={scrollBackToQuiz}
                              className="text-xs text-gray-500 hover:text-purple-600 hover:bg-gray-50 px-2 py-1 rounded transition-all duration-200 flex items-center gap-1"
                              title="Return to quiz"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                              </svg>
                              {uiTexts.backToQuiz}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Card */}
        {isTestMode && (
          <div className="bg-purple-50 rounded-xl shadow-lg border border-purple-200 p-6 w-full">
            {testLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-purple-600">{uiTexts.loadingTest}</p>
              </div>
            ) : testQuestions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-purple-600 mb-4">{uiTexts.noWordsForReview}</p>
                <AnimatedButton onClick={onExitTestMode} variant="secondary" size="sm">
                  {uiTexts.exitReview}
                </AnimatedButton>
              </div>
            ) : testCompleted ? (
              <div className="text-center py-8">
                <div className="bg-purple-100 rounded-lg p-6 mb-4">
                  <h3 className="text-xl font-bold text-purple-800 mb-2">{uiTexts.testCompleted} 🎉</h3>
                  <p className="text-lg text-purple-700 mb-2">
                    {uiTexts.score}: {testScore} / {testQuestions.length}
                  </p>
                  <p className="text-sm text-purple-600">
                    {Math.round((testScore / testQuestions.length) * 100)}% {uiTexts.correct}
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <AnimatedButton onClick={handleTestAgain} variant="secondary" size="md">
                    🔄 {uiTexts.testAgain}
                  </AnimatedButton>
                  <AnimatedButton onClick={onExitTestMode} variant="primary" size="md">
                    {uiTexts.continueReading}
                  </AnimatedButton>
                </div>
              </div>
            ) : (
              <div>
                {/* Test Header */}
                <div className="bg-purple-100 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-purple-800">
                      📝 {uiTexts.reviewTest} ({currentQuestionIndex + 1}/{testQuestions.length})
                    </h3>
                    <button
                      onClick={onExitTestMode}
                      className="text-purple-400 hover:text-purple-600 text-sm"
                    >
                      {uiTexts.exitReview}
                    </button>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / testQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Question Content */}
                {testQuestions[currentQuestionIndex] && (
                  <div className="space-y-4">
                    {testQuestions[currentQuestionIndex].questionType === 'word' ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-purple-600 font-medium">{uiTexts.translateToEnglish}</p>
                          <button
                            onClick={() => scrollToQueryCard(testQuestions[currentQuestionIndex].id)}
                            className="text-xs text-purple-500 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded-md transition-all duration-200 flex items-center gap-1"
                            title="Go to original query card"
                          >
                            📍 {uiTexts.viewQuery}
                          </button>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-200 mb-4">
                          <p className="text-lg text-gray-800">
                            {testQuestions[currentQuestionIndex].question}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-purple-600 font-medium">{uiTexts.fillInBlank}</p>
                          <button
                            onClick={() => scrollToQueryCard(testQuestions[currentQuestionIndex].id)}
                            className="text-xs text-purple-500 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded-md transition-all duration-200 flex items-center gap-1"
                            title="Go to original query card"
                          >
                            📍 {uiTexts.viewQuery}
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-gray-600 mb-1">{uiTexts.chinese}</p>
                            <p className="text-lg text-gray-800">
                              {testQuestions[currentQuestionIndex].chineseTranslation}
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-600 mb-1">{uiTexts.english}</p>
                            <p className="text-lg text-gray-800 font-mono">
                              {testQuestions[currentQuestionIndex].englishSentence}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Input */}
                    <div>
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={uiTexts.typeAnswer}
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                        disabled={isAnswered}
                        autoFocus
                      />
                    </div>

                    {/* Feedback */}
                    {isAnswered && (
                      <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        {isCorrect ? (
                          <p className="text-green-800 font-semibold">{uiTexts.greatJob} 🎉</p>
                        ) : (
                          <div className="text-red-800">
                            <p className="font-semibold mb-1">{uiTexts.correctAnswer}</p>
                            <p className="text-lg font-mono">{testQuestions[currentQuestionIndex].answer}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="text-center">
                      <AnimatedButton
                        onClick={handleTestSubmit}
                        variant="primary"
                        disabled={!userAnswer.trim() && !isAnswered}
                      >
                        {isAnswered ? (
                          currentQuestionIndex < testQuestions.length - 1 ? uiTexts.nextQuestion : uiTexts.finishTest
                        ) : uiTexts.submit}
                      </AnimatedButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* AI Dialog */}
      <AIDialog
        isOpen={aiDialog.isOpen}
        onClose={handleCloseAIDialog}
        queryData={aiDialog.queryData}
        queryType={aiDialog.queryType}
        language={language}
        initialResponse={aiDialog.initialResponse}
        onSaved={handleAISaved}
      />
    </div>
  )
}