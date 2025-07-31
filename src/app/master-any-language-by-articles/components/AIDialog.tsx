'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Language, getUITexts } from '../config/uiText'
import { playText } from '../utils/tts'

interface AIDialogProps {
  isOpen: boolean
  onClose: () => void
  queryData: any
  queryType: 'word' | 'sentence'
  language: Language
  initialResponse?: string
  onSaved?: () => void
}


// French text with TTS component
function FrenchTextWithTTS({ children }: { children: React.ReactNode }) {
  const detectFrenchSentences = (text: string) => {
    // French sentence patterns: contains French accented characters, common French words, proper sentence structure
    const frenchPatterns = [
      // Sentences with French accented characters
      /[^.!?]*[àáâäèéêëìíîïòóôöùúûüÿñç][^.!?]*[.!?]/gi,
      // Common French sentence starters and words
      /\b(je|tu|il|elle|nous|vous|ils|elles|le|la|les|un|une|des|ce|cette|ces|dans|sur|avec|pour|par|de|du|d'|qui|que|quoi|où|quand|comment|pourquoi|est|sont|avoir|être)\b[^.!?]*[.!?]/gi
    ]
    
    const sentences: { text: string; start: number; end: number }[] = []
    frenchPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const sentence = match[0].trim()
        if (sentence.length > 5) {
          sentences.push({
            text: sentence,
            start: match.index,
            end: match.index + match[0].length
          })
        }
      }
    })
    
    // Remove duplicates and sort by position
    const uniqueSentences = sentences.filter((sentence, index, self) => 
      index === self.findIndex(s => s.text === sentence.text)
    ).sort((a, b) => a.start - b.start)
    
    return uniqueSentences
  }

  const handleFrenchTTS = async (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await playText(text, 'french', 0.8)
    } catch (error) {
      console.error('French TTS failed:', error)
    }
  }

  const processTextWithTTS = (text: string) => {
    const frenchSentences = detectFrenchSentences(text)
    
    if (frenchSentences.length === 0) {
      return [{ type: 'text', content: text }]
    }

    const result = []
    let lastIndex = 0
    
    frenchSentences.forEach((sentence, index) => {
      // Add text before this sentence
      if (sentence.start > lastIndex) {
        result.push({
          type: 'text',
          content: text.slice(lastIndex, sentence.start)
        })
      }
      
      // Add the sentence with TTS button
      result.push({
        type: 'french',
        content: sentence.text,
        key: `french-${index}`
      })
      
      lastIndex = sentence.end
    })
    
    // Add remaining text
    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex)
      })
    }
    
    return result
  }

  if (typeof children === 'string') {
    const processedContent = processTextWithTTS(children)
    
    return (
      <>
        {processedContent.map((item, index) => {
          if (item.type === 'french') {
            return (
              <span key={item.key || index}>
                {item.content}
                <button
                  onClick={(e) => handleFrenchTTS(item.content, e)}
                  className="inline-flex items-center ml-1 p-1 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200"
                  title="Play French pronunciation"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )
          } else {
            return <span key={index}>{item.content}</span>
          }
        })}
      </>
    )
  }

  return <>{children}</>
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
  const [streamingResponse, setStreamingResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
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
      setStreamingResponse('')
      setIsLoading(false)
      setIsStreaming(false)
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
    setIsStreaming(true)
    setStreamingResponse('')
    const currentQuestion = userPrompt.trim()

    try {
      const response = await fetch('/api/master-language/smart-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'ask-ai',
          selectedText: queryData.word_text || queryData.sentence_text || '',
          contextSentence: queryData.sentence_text || '',
          language,
          nativeLanguage: 'chinese',
          articleId: queryData.article_id || 0,
          userPrompt: currentQuestion
        }),
      })

      if (response.ok) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        
        if (!reader) {
          throw new Error('No response body')
        }

        let accumulatedResponse = ''
        
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              
              if (data === '[DONE]') {
                // Stream complete
                setIsStreaming(false)
                setAiResponse(accumulatedResponse)
                
                // Add to conversation history
                setConversationHistory(prev => [...prev, {
                  question: currentQuestion,
                  answer: accumulatedResponse
                }])
                
                // Clear input for next question
                setUserPrompt('')
                return
              }
              
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  accumulatedResponse += parsed.content
                  setStreamingResponse(accumulatedResponse)
                }
              } catch (e) {
                // Skip invalid JSON
                continue
              }
            }
          }
        }
      } else {
        throw new Error('AI request failed')
      }
    } catch (error) {
      console.error('Ask AI error:', error)
      const errorMessage = 'AI服务暂时不可用，请稍后重试。'
      setAiResponse(errorMessage)
      setStreamingResponse(errorMessage)
      setIsStreaming(false)
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

      const response = await fetch('/api/master-language/save-ai-notes', {
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
        
        // 调用回调函数通知父组件刷新数据
        if (onSaved) {
          onSaved()
        }
        
        // 立即关闭对话框并跳转到卡片
        onClose()
        
        // 短暂延迟后滚动到对应的卡片
        setTimeout(() => {
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
        }, 100) // 短暂延迟确保DOM更新
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
            {(aiResponse || streamingResponse) ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">AI Response</h3>
                  {isStreaming && (
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <div className="animate-spin w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                      <span>AI is responding...</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 max-h-[50vh] overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                  <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none pr-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-lg font-bold mt-4 mb-2 text-purple-800"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></h1>,
                        h2: ({children}) => <h2 className="text-base font-bold mt-3 mb-2 text-purple-700"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></h2>,
                        h3: ({children}) => <h3 className="text-sm font-bold mt-2 mb-1 text-purple-600"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></h3>,
                        strong: ({children}) => <strong className="font-semibold text-purple-800"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></strong>,
                        ul: ({children}) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="text-gray-700"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></li>,
                        p: ({children}) => (
                          <p className="mb-2 last:mb-0">
                            <FrenchTextWithTTS>{children}</FrenchTextWithTTS>
                          </p>
                        ),
                        code: ({children}) => <code className="bg-purple-50 text-purple-800 px-1 py-0.5 rounded text-xs">{children}</code>,
                        blockquote: ({children}) => <blockquote className="border-l-3 border-purple-300 pl-3 italic text-gray-600"><FrenchTextWithTTS>{children}</FrenchTextWithTTS></blockquote>
                      }}
                    >
                      {isStreaming ? streamingResponse : aiResponse}
                    </ReactMarkdown>
                    {/* Add cursor at the end for non-paragraph content during streaming */}
                    {isStreaming && (
                      <span className="animate-pulse">|</span>
                    )}
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
          <div className="flex justify-end items-center text-xs text-gray-500">
            <div className="flex gap-2 items-center">
              {aiResponse && !isStreaming && (
                <button
                  onClick={handleSaveAI}
                  disabled={isSaving || isStreaming}
                  className={`px-4 py-2 text-white text-sm rounded-md transition-colors flex items-center gap-2 ${
                    saveStatus === 'success' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : saveStatus === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } ${(isSaving || isStreaming) ? 'opacity-50 cursor-not-allowed' : ''}`}
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