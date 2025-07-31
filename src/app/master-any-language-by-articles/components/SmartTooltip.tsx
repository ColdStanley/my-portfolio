'use client'

import { useState, useEffect, useRef } from 'react'
import { Language } from '../config/uiText'
import { playText } from '../utils/tts'
import AnalysisRenderer from './AnalysisRenderer'

export type AnalysisMode = 'mark' | 'simple' | 'deep' | 'grammar'

interface SmartTooltipProps {
  isVisible: boolean
  position: { x: number; y: number; width: number; height: number }
  selectedText: string
  contextSentence: string
  language: Language
  nativeLanguage: string
  articleId: number
  textRange?: { start: number; end: number } // Add text range for accurate positioning
  onClose: () => void
  onCardCreated: (mode: AnalysisMode, data: any) => void
}

interface ModeConfig {
  id: AnalysisMode
  label: string
  icon: string
  color: string
  description: string
}

const MODE_CONFIGS: ModeConfig[] = [
  {
    id: 'mark',
    label: 'Mark',
    icon: '',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md',
    description: ''
  },
  {
    id: 'simple',
    label: 'Simple',
    icon: '',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md',
    description: ''
  },
  {
    id: 'deep',
    label: 'Deep',
    icon: '',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md',
    description: ''
  },
  {
    id: 'grammar',
    label: 'Grammar',
    icon: '',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md',
    description: ''
  }
]

export default function SmartTooltip({
  isVisible,
  position,
  selectedText,
  contextSentence,
  language,
  nativeLanguage,
  articleId,
  textRange,
  onClose,
  onCardCreated
}: SmartTooltipProps) {
  const [selectedMode, setSelectedMode] = useState<AnalysisMode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [streamContent, setStreamContent] = useState('')
  const [userNotes, setUserNotes] = useState('')
  const [isStreamComplete, setIsStreamComplete] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Reset state when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      setSelectedMode(null)
      setIsLoading(false)
      setStreamContent('')
      setUserNotes('')
      setIsStreamComplete(false)
      // Reset drag position to default
      setIsDragging(false)
      setTooltipPosition({ x: 0, y: 0 })
    }
  }, [isVisible])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isVisible && !isDragging) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose, isDragging])

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setTooltipPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    const rect = tooltipRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
      e.preventDefault()
    }
  }

  // Calculate tooltip position - default to right of selected text, but allow dragging
  const getTooltipStyle = () => {
    // Compact width for mode selection, expand for content
    const baseWidth = selectedMode ? 380 : 240
    const tooltipWidth = (selectedMode === 'deep' || selectedMode === 'grammar') ? baseWidth * 1.2 : baseWidth
    const tooltipHeight = selectedMode ? 500 : 280

    // If dragged, use the dragged position
    if (tooltipPosition.x !== 0 || tooltipPosition.y !== 0) {
      return {
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        width: tooltipWidth,
        maxHeight: tooltipHeight
      }
    }

    // Default position - to the right of selected text
    const offset = 5 // Closer to selected text
    const selectionRect = position
    const x = selectionRect.x + selectionRect.width + offset
    const y = selectionRect.y

    return {
      left: x,
      top: y,
      width: tooltipWidth,
      maxHeight: tooltipHeight
    }
  }

  const handleModeSelect = async (mode: AnalysisMode) => {
    setSelectedMode(mode)

    if (mode === 'mark') {
      // For French: create sentence card directly and close tooltip
      if (language === 'french') {
        const cardData = {
          id: Date.now(),
          sentence_text: selectedText,
          translation: '',
          analysis: '',
          start_offset: 0,
          end_offset: selectedText.length,
          query_type: 'french_sentence',
          created_at: new Date().toISOString()
        }
        
        try {
          await saveToDatabase(mode, cardData)
          onCardCreated(mode, cardData)
          onClose() // Close tooltip immediately for French
        } catch (error) {
          console.error('Failed to save French sentence:', error)
        }
        return
      }

      // Mark mode for English: create card immediately, keep tooltip for notes input
      const cardData = {
        id: Date.now(),
        word_text: selectedText,
        sentence_text: contextSentence,
        definition: '',
        analysis_mode: mode,
        user_notes: '',
        created_at: new Date().toISOString()
      }
      
      try {
        await saveToDatabase(mode, cardData)
        onCardCreated(mode, cardData)
      } catch (error) {
        console.error('Failed to save mark:', error)
      }
      return
    }

    // For Simple/Deep/Grammar modes: start streaming analysis
    setIsLoading(true)
    setStreamContent('')
    setIsStreamComplete(false)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/master-language/smart-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          selectedText,
          contextSentence,
          language,
          nativeLanguage,
          articleId
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`API request failed: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let accumulatedContent = ''
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
            if (data === '[DONE]') {
              setIsStreamComplete(true)
              break
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.content || ''
              if (content) {
                accumulatedContent += content
                setStreamContent(accumulatedContent)
              }
            } catch (e) {
              continue
            }
          }
        }
      }

      // Save to database and create card
      const cardData = {
        id: Date.now(),
        word_text: selectedText,
        sentence_text: contextSentence,
        definition: accumulatedContent,
        analysis: accumulatedContent,
        analysis_mode: mode,
        created_at: new Date().toISOString()
      }

      await saveToDatabase(mode, cardData)
      onCardCreated(mode, cardData)

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('Streaming analysis failed:', error)
      setStreamContent('分析失败，请重试')
      setIsStreamComplete(true)
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const saveToDatabase = async (mode: AnalysisMode, data: any) => {
    try {
      // Use new unified API for chinese-english
      const languagePair = nativeLanguage === 'chinese' && language === 'english' ? 'chinese-english' : `${nativeLanguage}-${language}`
      
      const endpoint = '/api/master-language/analysis-records'
      
      console.log('Saving to database:', {
        articleId,
        languagePair,
        selectedText,
        contextSentence,
        analysis: data.definition || data.analysis || '',
        analysisMode: mode,
        userNotes: userNotes || '',
        aiNotes: data.ai_notes || '',
        startOffset: textRange?.start || 0,
        endOffset: textRange?.end || selectedText.length,
        queryType: 'ai_query'
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          languagePair,
          selectedText,
          contextSentence,
          analysis: data.definition || data.analysis || '',
          analysisMode: mode,
          userNotes: userNotes || '',
          aiNotes: data.ai_notes || '',
          startOffset: textRange?.start || 0,
          endOffset: textRange?.end || selectedText.length,
          queryType: 'ai_query'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', response.status, errorData)
        throw new Error(`API Error: ${response.status} ${JSON.stringify(errorData)}`)
      }
      
      const result = await response.json()
      console.log('Save successful:', result)
    } catch (error) {
      console.error('Failed to save to database:', error)
      throw error
    }
  }

  const handleNotesSubmit = async () => {
    if (selectedMode === 'mark' && userNotes.trim()) {
      // Update the card with user notes
      try {
        await fetch('/api/master-language/update-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedText,
            notes: userNotes,
            language
          })
        })
      } catch (error) {
        console.error('Failed to update notes:', error)
      }
    }
    onClose()
  }

  if (!isVisible) return null

  // Calculate arrow position - always points left to selected text
  const getArrowStyle = () => {
    const selectionRect = position
    
    // Arrow always points left (tooltip is always to the right of selection)
    return {
      left: -8,
      top: selectionRect.height / 2 - 8, // Center arrow with selected text height
      transform: 'none',
      borderLeft: '8px solid #a855f7',
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderRight: 'none'
    }
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white border-2 border-purple-200 rounded-xl shadow-2xl shadow-purple-100 overflow-hidden backdrop-blur-sm"
      style={getTooltipStyle()}
    >
      {/* Arrow pointing to selected text */}
      <div
        className="absolute w-0 h-0"
        style={getArrowStyle()}
      />
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3"
        onMouseDown={handleDragStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 flex items-center gap-2">
            <p className="text-white text-sm font-medium truncate">
              "{selectedText}"
            </p>
            <button
              onClick={async () => {
                try {
                  await playText(selectedText, language, 0.8)
                } catch (error) {
                  console.error('TTS failed:', error)
                }
              }}
              className="text-purple-200 hover:text-white p-1 rounded-full hover:bg-purple-600/50 transition-colors flex-shrink-0"
              title="Play pronunciation"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.343 13.5H2a1 1 0 01-1-1v-5a1 1 0 011-1h2.343l4.04-3.317a1 1 0 01.997-.106zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M13.243 8.757a1 1 0 011.414 0A5.98 5.98 0 0116 12a5.98 5.98 0 01-1.343 3.243 1 1 0 01-1.414-1.414A3.99 3.99 0 0014 12a3.99 3.99 0 00-.757-2.329 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-purple-200 hover:text-white p-1.5 rounded-full hover:bg-purple-600/50 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mode Selection or French Confirmation */}
      {!selectedMode && (
        <div className="p-3">
          {language === 'french' ? (
            // French confirmation dialog
            <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-600 mb-2 text-center">
                Créer une carte pour analyser ce texte?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleModeSelect('mark')}
                  className="flex-1 px-3 py-2 rounded-md border transition-all duration-200 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md text-xs font-medium"
                >
                  Oui
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-3 py-2 rounded-md border transition-all duration-200 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-xs font-medium"
                >
                  Non
                </button>
              </div>
            </div>
          ) : (
            // English mode selection
            <div className="flex flex-col gap-1.5">
              {MODE_CONFIGS.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`px-3 py-2 rounded-md border transition-all duration-200 ${mode.color} text-xs font-medium transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mark Mode - Notes Input */}
      {selectedMode === 'mark' && (
        <div className="p-4">
          <div className="mb-3">
            <span className="font-medium text-gray-800 text-sm">Add Notes</span>
            <div className="text-xs text-gray-500 mt-1">
              Card created. Add optional notes:
            </div>
          </div>
          
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Add your notes here..."
            className="w-full h-24 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleNotesSubmit}
              className="flex-1 bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Streaming Analysis Content */}
      {selectedMode && selectedMode !== 'mark' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-800 text-sm">
              {MODE_CONFIGS.find(m => m.id === selectedMode)?.label} Analysis
            </span>
            {isLoading && (
              <div className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-500"></div>
                <span className="text-xs text-gray-500">Analyzing...</span>
              </div>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {streamContent ? (
              <AnalysisRenderer
                mode={selectedMode as 'simple' | 'deep' | 'grammar'}
                content={streamContent}
                isStreaming={isLoading}
                className="text-xs"
              />
            ) : (
              <div className="text-xs text-gray-700 whitespace-pre-wrap">
                {isLoading ? 'Starting analysis...' : 'Select a mode to begin'}
                {isLoading && (
                  <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse rounded-sm"></span>
                )}
              </div>
            )}
          </div>

          {/* Close button for completed analysis */}
          {isStreamComplete && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}