'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Language, getUITexts } from '../config/uiText'

interface AIDialogProps {
  isOpen: boolean
  onClose: () => void
  queryData: any
  queryType: 'word' | 'sentence'
  language: Language
  initialResponse?: string
  onSaved?: () => void
}

export default function AIDialog({ 
  isOpen, 
  onClose, 
  queryData, 
  queryType, 
  language, 
  initialResponse,
  onSaved 
}: AIDialogProps) {
  const [userPrompt, setUserPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState(initialResponse || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [conversationHistory, setConversationHistory] = useState<Array<{question: string, answer: string}>>([])
  
  const uiTexts = getUITexts(language)

  useEffect(() => {
    if (initialResponse) {
      setAiResponse(initialResponse)
    }
  }, [initialResponse])

  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setUserPrompt('')
      if (!initialResponse) {
        setAiResponse('')
      }
      setIsLoading(false)
      setConversationHistory([])
    }
  }, [isOpen, initialResponse])

  const getQueryInfo = () => {
    if (queryType === 'word') {
      return (
        <div className="space-y-2">
          <h3 className="font-bold text-purple-800 text-lg">{queryData.word_text}</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="font-medium">Definition: </span>{queryData.definition}</p>
            {queryData.part_of_speech && (
              <p><span className="font-medium">Part of Speech: </span>{queryData.part_of_speech}</p>
            )}
            {queryData.examples?.[0] && (
              <p><span className="font-medium">Example: </span>{queryData.examples[0]}</p>
            )}
          </div>
        </div>
      )
    } else {
      return (
        <div className="space-y-2">
          <h3 className="font-bold text-purple-800 text-lg">Sentence Analysis</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="font-medium">Sentence: </span>"{queryData.sentence_text}"</p>
            <p><span className="font-medium">Translation: </span>{queryData.translation}</p>
            {queryData.analysis && (
              <p><span className="font-medium">Analysis: </span>{queryData.analysis}</p>
            )}
          </div>
        </div>
      )
    }
  }

  const handleAskAI = async () => {
    if (!userPrompt.trim()) return

    setIsLoading(true)
    const currentQuestion = userPrompt.trim()

    try {
      const response = await fetch('/api/language-reading/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryData: { ...queryData, type: queryType },
          language,
          userPrompt: currentQuestion
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiResponse(data.response)
        
        // Add to conversation history
        setConversationHistory(prev => [...prev, {
          question: currentQuestion,
          answer: data.response
        }])
        
        // Clear input for next question
        setUserPrompt('')
      } else {
        throw new Error('AI request failed')
      }
    } catch (error) {
      console.error('Ask AI error:', error)
      setAiResponse('AI服务暂时不可用，请稍后重试。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAI = async () => {
    if (!aiResponse) return

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      console.log('Saving AI notes with data:', {
        id: queryData?.id,
        type: queryType,
        language,
        aiNotesLength: aiResponse.length,
        queryData
      })

      const response = await fetch('/api/language-reading/save-ai-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: queryData.id,
          type: queryType,
          aiNotes: aiResponse,
          language
        }),
      })

      const result = await response.json()
      console.log('API response:', result)

      if (response.ok) {
        console.log('AI notes saved successfully')
        setSaveStatus('success')
        
        // 调用回调函数通知父组件刷新数据
        if (onSaved) {
          onSaved()
        }
        
        // 延迟关闭对话框，让用户看到保存成功状态
        setTimeout(() => {
          onClose()
          // 滚动到对应的卡片
          const cardId = `${queryType}-card-${queryData.id}`
          const cardElement = document.getElementById(cardId)
          if (cardElement) {
            cardElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            })
            // 高亮卡片
            cardElement.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.6)'
            setTimeout(() => {
              cardElement.style.boxShadow = ''
            }, 2000)
          }
        }, 1500) // 1.5秒后关闭对话框
      } else {
        console.error('Save failed with status:', response.status, result)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 5000) // Reset after 5 seconds
      }
    } catch (error) {
      console.error('Save AI notes error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500/20 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-xl flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Query Info Section */}
        <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
          {getQueryInfo()}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left side - Input (30%) */}
          <div className="w-[30%] border-r border-gray-200 p-6 flex flex-col">
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Question
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="flex-1 w-full text-sm text-gray-700 border border-purple-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Enter your question..."
              />
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAskAI}
                disabled={!userPrompt.trim() || isLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>AI is thinking...</span>
                  </>
                ) : (
                  'Ask Question'
                )}
              </button>
            </div>
          </div>

          {/* Right side - AI Response (70%) */}
          <div className="w-[70%] p-6 flex flex-col">
            {aiResponse ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">AI Response</h3>
                </div>

                <div className="flex-1 max-h-[50vh] overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                  <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none pr-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-lg font-bold mt-4 mb-2 text-purple-800">{children}</h1>,
                        h2: ({children}) => <h2 className="text-base font-bold mt-3 mb-2 text-purple-700">{children}</h2>,
                        h3: ({children}) => <h3 className="text-sm font-bold mt-2 mb-1 text-purple-600">{children}</h3>,
                        strong: ({children}) => <strong className="font-semibold text-purple-800">{children}</strong>,
                        ul: ({children}) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="text-gray-700">{children}</li>,
                        p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        code: ({children}) => <code className="bg-purple-50 text-purple-800 px-1 py-0.5 rounded text-xs">{children}</code>,
                        blockquote: ({children}) => <blockquote className="border-l-3 border-purple-300 pl-3 italic text-gray-600">{children}</blockquote>
                      }}
                    >
                      {aiResponse}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Conversation History */}
                {conversationHistory.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <details className="group">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        View conversation history ({conversationHistory.length - 1} previous conversations)
                      </summary>
                      <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                        {conversationHistory.slice(0, -1).map((item, index) => (
                          <div key={index} className="text-xs bg-gray-50 rounded p-2">
                            <p className="font-medium text-gray-600 mb-1">Q: {item.question}</p>
                            <p className="text-gray-500 line-clamp-2">A: {item.answer.slice(0, 100)}...</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    <svg className="w-12 h-12 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <p className="text-sm">Enter your question on the left, AI will respond here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-purple-50 border-t border-purple-100 rounded-b-xl">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Tip: You can have multiple conversations to learn more about this {queryType === 'word' ? 'word' : 'sentence'}</span>
            <div className="flex gap-2 items-center">
              {aiResponse && (
                <button
                  onClick={handleSaveAI}
                  disabled={isSaving}
                  className={`px-4 py-2 text-white text-sm rounded-md transition-colors flex items-center gap-2 ${
                    saveStatus === 'success' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : saveStatus === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : saveStatus === 'success' ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Saved!
                    </>
                  ) : saveStatus === 'error' ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Failed
                    </>
                  ) : (
                    'Save to Notes'
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}