'use client'

import { useState, useEffect } from 'react'
import SimpleVoiceRecorder from './SimpleVoiceRecorder'
import IELTSTips from './IELTSTips'
import AskAI from './AskAI'
import TextSelectionToolbar from './TextSelectionToolbar'

interface SelectedEmailContent {
  id: string
  content: string
  type: 'query_response' | 'ai_response' | 'user_query'
  source: 'query_history'
  timestamp: string
  queryId?: string
}

export default function IELTSSpeaking() {
  const [questionResponse, setQuestionResponse] = useState('')
  const [answerResponse, setAnswerResponse] = useState('')
  const [isQuestionLoading, setIsQuestionLoading] = useState(false)
  const [isAnswerLoading, setIsAnswerLoading] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  
  // Text selection states  
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null)
  const [showSelectionToolbar, setShowSelectionToolbar] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Email collection states (like Readlingua)
  const [selectedEmailContents, setSelectedEmailContents] = useState<SelectedEmailContent[]>([])
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const questionWebhookUrl = 'http://localhost:5678/webhook/3bcd7132-a248-4700-af8c-e01d81a9d00a'
  const answerWebhookUrl = 'http://localhost:5678/webhook/682c8778-cd25-4c44-8c5b-421c599348ed'

  // Email collection functions (copied from Readlingua)
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
    setSelectedEmailContents(prev => prev.filter(content => content.id !== id))
  }

  const clearEmailSelection = () => {
    setSelectedEmailContents([])
  }

  // Parse and format question response
  const formatQuestionResponse = (rawResponse: string) => {
    try {
      const parsed = JSON.parse(rawResponse)
      if (parsed.output && parsed.output.question && parsed.output.analysis) {
        return {
          question: parsed.output.question,
          analysis: parsed.output.analysis.replace(/\\n/g, '\n')
        }
      }
    } catch (error) {
      // If parsing fails, return raw response
    }
    return null
  }

  // Generate question by part
  const generateQuestion = async (part: string) => {
    setIsQuestionLoading(true)
    setQuestionResponse('')
    setSelectedPart(part)
    
    try {
      const response = await fetch(questionWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: `Generate an IELTS Speaking Part ${part} question` 
        })
      })
      
      const data = await response.text()
      setQuestionResponse(data)
    } catch (error) {
      setQuestionResponse('Error: Failed to generate question')
    } finally {
      setIsQuestionLoading(false)
    }
  }

  // Parse and format answer response (same as left side)
  const formatAnswerResponse = (rawResponse: string) => {
    try {
      const parsed = JSON.parse(rawResponse)
      if (parsed.output && parsed.output.Answer && parsed.output.Analysis) {
        return {
          answer: parsed.output.Answer,
          analysis: parsed.output.Analysis.replace(/\\n/g, '\n')
        }
      }
    } catch (error) {
      // If parsing fails, return raw response
    }
    return null
  }

  // Submit answer for analysis
  const submitAnswer = async () => {
    if (!userAnswer.trim() || !selectedPart) return

    setIsAnswerLoading(true)
    setAnswerResponse('')
    
    const answerWithPart = `Part ${selectedPart} - ${userAnswer}`
    
    try {
      const response = await fetch(answerWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: answerWithPart 
        })
      })
      
      const data = await response.text()
      setAnswerResponse(data)
    } catch (error) {
      setAnswerResponse('Error: Failed to analyze answer')
    } finally {
      setIsAnswerLoading(false)
    }
  }

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    setUserAnswer(prev => prev ? prev + ' ' + transcript : transcript)
  }

  // TTS functionality
  const handlePlayPronunciation = async (text: string) => {
    if (isPlaying || !text.trim()) return
    
    setIsPlaying(true)
    try {
      const response = await fetch('/api/readlingua/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text.trim(),
          language: 'english' // Default to English
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
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error)
      setIsPlaying(false)
    }
  }

  // Handle text selection for toolbar (updated from Readlingua)
  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    
    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      
      if (rect) {
        setSelectedText(text)
        // Use viewport coordinates directly for fixed positioning
        setSelectionPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        })
        setShowSelectionToolbar(true)
      }
    } else {
      setShowSelectionToolbar(false)
    }
  }

  const handleSelectionPronunciation = async () => {
    if (selectedText) {
      await handlePlayPronunciation(selectedText)
      // Hide toolbar after click
      setShowSelectionToolbar(false)
      // Clear selection
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleAddToEmail = () => {
    if (selectedText) {
      // Add selected text to email collection (like Readlingua)
      addToEmailSelection({
        content: selectedText,
        type: 'ai_response', // Could be enhanced to detect actual type
        source: 'query_history'
      })
      
      // Hide toolbar after selection
      setShowSelectionToolbar(false)
      // Clear text selection
      window.getSelection()?.removeAllRanges()
    }
  }

  // Hide selection toolbar when clicking outside
  const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as Element
    if (!target.closest('.selection-toolbar') && !target.closest('.selectable-text')) {
      setShowSelectionToolbar(false)
    }
  }

  // Add document click listener
  useEffect(() => {
    document.addEventListener('click', handleDocumentClick)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])

  // Email sending functionality
  const collectStudyData = () => {
    const studyData: any = {}
    
    // Collect question data
    if (questionResponse && selectedPart) {
      const formatted = formatQuestionResponse(questionResponse)
      if (formatted) {
        studyData.question = {
          part: selectedPart,
          content: formatted.question,
          analysis: formatted.analysis
        }
      }
    }
    
    // Collect answer data
    if (answerResponse && userAnswer) {
      const formatted = formatAnswerResponse(answerResponse)
      if (formatted) {
        studyData.userAnswer = {
          content: userAnswer,
          analysis: formatted.analysis
        }
      }
    }
    
    // Note: Ask AI queries would be collected from a global store in real implementation
    // For now, we'll just send what we have
    
    return studyData
  }

  const handleSendEmail = async () => {
    if (!userEmail.trim() || isSendingEmail || selectedEmailContents.length === 0) return

    setIsSendingEmail(true)
    
    try {
      const response = await fetch('/api/readlingua/send-selected-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedContents: selectedEmailContents,
          userEmail: userEmail.trim()
        })
      })

      if (response.ok) {
        alert('Selected content sent successfully!')
        setShowEmailPanel(false)
        setUserEmail('')
        clearEmailSelection()
      } else {
        alert('Failed to send email. Please try again.')
      }
    } catch (error) {
      console.error('Email sending error:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendEmail()
    }
  }

  return (
    <div 
      className="h-full bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 selectable-text"
      onMouseUp={handleTextSelection}
    >
      {/* IELTS Tips Tooltip */}
      <IELTSTips show={isQuestionLoading || isAnswerLoading} />
      
      {/* Ask AI Component - Hidden when IELTS Tips is showing */}
      <AskAI show={!isQuestionLoading && !isAnswerLoading} />
      
      {/* Email Collection Button - Above Ask AI (like Readlingua) */}
      {!isQuestionLoading && !isAnswerLoading && (
        <div className="fixed bottom-[88px] right-6 z-20">
          <button
            onClick={() => setShowEmailPanel(!showEmailPanel)}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group relative"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
            title="Send Selected Content"
          >
            <svg 
              className="w-5 h-5 text-purple-500 transition-transform duration-200" 
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            
            {/* Badge showing selected content count (like Readlingua) */}
            {selectedEmailContents.length > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {selectedEmailContents.length}
              </div>
            )}
          </button>
        </div>
      )}
      
      {/* Email Input Panel */}
      {showEmailPanel && (
        <>
          {/* Backdrop */}
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
                <span className="text-sm font-medium text-gray-700">Send Selected Content</span>
                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  {selectedEmailContents.length} items
                </div>
                <button
                  onClick={() => setShowEmailPanel(false)}
                  className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {selectedEmailContents.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">
                  No content selected. Select text to add to email collection.
                </div>
              ) : (
                <>
                  {/* Email Input */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      onKeyPress={handleEmailKeyPress}
                      placeholder="Enter your email..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                      disabled={isSendingEmail}
                      autoFocus
                    />
                    <button
                      onClick={handleSendEmail}
                      disabled={!userEmail.trim() || isSendingEmail || selectedEmailContents.length === 0}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-all"
                    >
                      {isSendingEmail ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Sending
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    Send all selected content to your email
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
      
      <div className="h-full flex gap-6">
        
        {/* Left Column - Question Generation */}
        <div className="flex-1 bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Question Generator</h2>
          
          {/* Part Buttons */}
          <div className="flex gap-3 mb-4">
            {['1', '2', '3'].map((part) => (
              <button
                key={part}
                onClick={() => generateQuestion(part)}
                disabled={isQuestionLoading}
                className={`w-32 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  isQuestionLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : selectedPart === part
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-500 text-white hover:bg-purple-600 hover:shadow-md'
                }`}
              >
                Part {part}
              </button>
            ))}
          </div>

          {/* Question Response */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto">
            {isQuestionLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-sm">Generating question...</div>
              </div>
            ) : questionResponse ? (
              (() => {
                const formatted = formatQuestionResponse(questionResponse)
                if (formatted) {
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-700 mb-2">Question:</h3>
                        <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded border-l-4 border-purple-500">
                          {formatted.question}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-700 mb-2">Analysis:</h3>
                        <div className="text-sm text-gray-800 whitespace-pre-line">
                          {formatted.analysis}
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono">
                      {questionResponse}
                    </pre>
                  )
                }
              })()
            ) : (
              <div className="text-gray-400 text-sm">Click a Part button to generate an IELTS question...</div>
            )}
          </div>
        </div>

        {/* Right Column - Answer Analysis */}
        <div className="flex-1 bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Answer Analysis</h2>
            {selectedPart && (
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                Part {selectedPart} Selected
              </div>
            )}
          </div>
          
          {/* Recording Area */}
          <div className="mb-4 space-y-3">
            <label className="block text-sm font-medium text-gray-600">Your Answer</label>
            <div className="relative">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Start recording or type your answer here..."
                rows={4}
                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none transition-colors"
              />
              <div className="absolute top-3 right-3">
                <SimpleVoiceRecorder onTranscript={handleVoiceTranscript} />
              </div>
            </div>
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || !selectedPart || isAnswerLoading}
              className={`w-40 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                !userAnswer.trim() || !selectedPart || isAnswerLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600 hover:shadow-md'
              }`}
            >
              {isAnswerLoading ? 'Analyzing...' : 'Submit Answer'}
            </button>
          </div>

          {/* Analysis Response */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto">
            {isAnswerLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-sm">Analyzing your answer...</div>
              </div>
            ) : answerResponse ? (
              (() => {
                const formatted = formatAnswerResponse(answerResponse)
                if (formatted) {
                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-700 mb-2">Your Answer:</h3>
                        <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded border-l-4 border-purple-500">
                          {formatted.answer}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-700 mb-2">Analysis:</h3>
                        <div className="text-sm text-gray-800 whitespace-pre-line">
                          {formatted.analysis}
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono">
                      {answerResponse}
                    </pre>
                  )
                }
              })()
            ) : (
              <div className="text-gray-400 text-sm">
                {!selectedPart 
                  ? 'First generate a question from the left panel, then record or type your answer...'
                  : 'Record or type your answer, then click Submit to get analysis...'
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Selection Toolbar (like Readlingua) */}
      {showSelectionToolbar && selectionPosition && (
        <TextSelectionToolbar
          position={selectionPosition}
          selectedText={selectedText}
          onPlayPronunciation={handleSelectionPronunciation}
          onAddToEmail={handleAddToEmail}
          onClose={() => setShowSelectionToolbar(false)}
          supportsPronunciation={true}
          isPlaying={isPlaying}
        />
      )}
    </div>
  )
}