'use client'

import { useState, useEffect } from 'react'
import SimpleVoiceRecorder from './SimpleVoiceRecorder'
import IELTSTips from './IELTSTips'
import AskAI from './AskAI'

export default function IELTSSpeaking() {
  const [questionResponse, setQuestionResponse] = useState('')
  const [answerResponse, setAnswerResponse] = useState('')
  const [isQuestionLoading, setIsQuestionLoading] = useState(false)
  const [isAnswerLoading, setIsAnswerLoading] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedPart, setSelectedPart] = useState<string | null>(null)
  
  // Text selection pronunciation states
  const [selectedText, setSelectedText] = useState('')
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null)
  const [showPronunciationButton, setShowPronunciationButton] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Email sending states
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const questionWebhookUrl = 'http://localhost:5678/webhook/3bcd7132-a248-4700-af8c-e01d81a9d00a'
  const answerWebhookUrl = 'http://localhost:5678/webhook/682c8778-cd25-4c44-8c5b-421c599348ed'

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

  // Handle text selection for pronunciation
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setShowPronunciationButton(false)
      return
    }

    const selectedText = selection.toString().trim()
    if (!selectedText) {
      setShowPronunciationButton(false)
      return
    }

    // Get selection position for floating button
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    if (rect.width > 0 && rect.height > 0) {
      setSelectedText(selectedText)
      setSelectionPosition({
        x: rect.right + 8, // Position slightly to the right of selection
        y: rect.top + (rect.height / 2) - 12 // Center vertically
      })
      setShowPronunciationButton(true)
    } else {
      setShowPronunciationButton(false)
    }
  }

  const handleSelectionPronunciation = () => {
    if (selectedText) {
      handlePlayPronunciation(selectedText)
      // Hide button after click
      setShowPronunciationButton(false)
      // Clear selection
      window.getSelection()?.removeAllRanges()
    }
  }

  // Hide pronunciation button when clicking outside
  const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as Element
    if (!target.closest('.pronunciation-button') && !target.closest('.selectable-text')) {
      setShowPronunciationButton(false)
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
    if (!userEmail.trim() || isSendingEmail) return

    setIsSendingEmail(true)
    
    try {
      const studyData = collectStudyData()
      
      const response = await fetch('/api/send-study-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...studyData,
          userEmail: userEmail.trim()
        })
      })

      if (response.ok) {
        alert('Study record sent successfully!')
        setShowEmailPanel(false)
        setUserEmail('')
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
      
      {/* Email Sending Button - Above Ask AI */}
      {!isQuestionLoading && !isAnswerLoading && (
        <div className="fixed bottom-[88px] right-6 z-20">
          <button
            onClick={() => setShowEmailPanel(!showEmailPanel)}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
            title="Send Study Record"
          >
            <svg 
              className="w-5 h-5 text-purple-500 transition-transform duration-200" 
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
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
                <span className="text-sm font-medium text-gray-700">Send Study Record</span>
                <button
                  onClick={() => setShowEmailPanel(false)}
                  className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

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
                  disabled={!userEmail.trim() || isSendingEmail}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition-all"
                >
                  {isSendingEmail ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                  Send
                </button>
              </div>

              {/* Helper text */}
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Send all current session data to your email
              </div>
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

      {/* Floating Pronunciation Button for Text Selection */}
      {showPronunciationButton && selectionPosition && (
        <div
          className="fixed z-50 pronunciation-button"
          style={{
            left: `${selectionPosition.x}px`,
            top: `${selectionPosition.y}px`,
          }}
        >
          <button
            onClick={handleSelectionPronunciation}
            disabled={isPlaying}
            className="w-6 h-6 bg-purple-400/70 hover:bg-purple-500/80 disabled:opacity-30 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            title="Play pronunciation"
          >
            {isPlaying ? (
              <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )
}