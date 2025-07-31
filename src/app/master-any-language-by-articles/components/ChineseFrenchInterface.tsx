'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useChineseFrenchStore } from '../store/useChineseFrenchStore'
import ChineseFrenchQueryCards from './ChineseFrenchQueryCards'
import ThinkingAnimation from './ThinkingAnimation'
import AnimatedButton from './AnimatedButton'
import ReadingTimer from './ReadingTimer'
import SmartTooltip, { AnalysisMode } from './SmartTooltip'
import { playText } from '../utils/tts'

interface Article {
  id: number
  title: string
  content: string
  background_image_url?: string
  difficulty_level?: string
  created_at: string
  updated_at: string
}

interface ChineseFrenchInterfaceProps {
  article: Article
  onBack: () => void
}

export default function ChineseFrenchInterface({ article, onBack }: ChineseFrenchInterfaceProps) {
  const { addSentenceCard, setSelectedSentenceId } = useChineseFrenchStore()
  const [selectionData, setSelectionData] = useState<{
    text: string
    range: { start: number; end: number }
    position: { x: number; y: number; width: number; height: number }
    contextSentence: string
  } | null>(null)
  const [showSmartTooltip, setShowSmartTooltip] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString().trim()
    
    // Allow selections from 1 character to 2000 characters
    if (!selectedText || selectedText.length < 1 || selectedText.length > 2000 || !textRef.current) {
      setSelectionData(null)
      return
    }

    // Calculate selection offsets relative to article content
    const articleContent = textRef.current.textContent || ''
    const beforeRange = range.cloneRange()
    beforeRange.selectNodeContents(textRef.current)
    beforeRange.setEnd(range.startContainer, range.startOffset)
    const startOffset = beforeRange.toString().length
    const endOffset = startOffset + selectedText.length

    // Extract context sentence (use the selected text as context for French)
    const contextSentence = selectedText

    const rect = range.getBoundingClientRect()
    setSelectionData({
      text: selectedText,
      range: { start: startOffset, end: endOffset },
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      },
      contextSentence
    })
    setShowSmartTooltip(true)
  }, [article.content])

  // Handle SmartTooltip card creation
  const handleSmartTooltipCardCreated = useCallback(async (mode: AnalysisMode, data: any) => {
    if (!selectionData) return

    try {
      // Create sentence card via chinese-french API with new JSON structure
      const createResponse = await fetch('/api/master-language/sentence-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({
          articleId: article.id,
          sentenceText: selectionData.text,
          startOffset: selectionData.range.start,
          endOffset: selectionData.range.end
        })
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create sentence card')
      }

      const result = await createResponse.json()
      
      if (result.success && result.data) {
        // Create a sentence query object compatible with the card component
        const sentenceQuery = {
          id: result.data.id,
          sentence_text: selectionData.text,
          translation: '',
          analysis: '',
          start_offset: selectionData.range.start,
          end_offset: selectionData.range.end,
          query_type: 'sentence_analysis',
          user_notes: '',
          ai_notes: ''
        }

        // Add to local store
        addSentenceCard(sentenceQuery)
        setSelectedSentenceId(result.data.id)
        
        // Scroll to the new card (at bottom of right panel)
        setTimeout(() => {
          const rightPanel = document.querySelector('.w-\\[65\\%\\]')
          if (rightPanel) {
            rightPanel.scrollTo({ 
              top: rightPanel.scrollHeight, 
              behavior: 'smooth' 
            })
          }
        }, 100)
        
        console.log('French sentence card created successfully')
      }

    } catch (error) {
      console.error('Failed to create sentence card:', error)
      alert('Failed to create sentence card. Please try again.')
    }
  }, [addSentenceCard, setSelectedSentenceId, selectionData, article.id])

  // Handle SmartTooltip close
  const handleSmartTooltipClose = useCallback(() => {
    setShowSmartTooltip(false)
    setSelectionData(null)
    // Clear text selection
    window.getSelection()?.removeAllRanges()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Mobile view - return to the mobile component later if needed
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6">
          <div className="mb-6 pt-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-purple-700">{article.title}</h1>
                <p className="text-sm text-gray-600">🇫🇷 Chinese → French Learning</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-6">
            <div ref={textRef} className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed space-y-6">
                {article.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 text-lg leading-relaxed">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <ChineseFrenchQueryCards articleId={article.id} />
        </div>
      </div>
    )
  }

  // Desktop view - match English ReadingView layout exactly (35% + 65%)
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Background Image */}
      {article.background_image_url && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${article.background_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            opacity: 0.15
          }}
        />
      )}
      
      {/* Page Content */}
      <div className="relative z-10 space-y-4">
        {/* Header Section */}
        <div className="flex justify-between items-start py-4">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">French Reading Session</h2>
                {article.title && (
                  <p className="text-sm text-purple-600 font-medium mt-1">"{article.title}"</p>
                )}
              </div>
              
              {/* Timer aligned with article card right edge */}
              <div className="w-1/2 flex justify-end">
                <ReadingTimer />
              </div>
            </div>
          </div>
          
          {/* Buttons on the right */}
          <div className="flex gap-3 ml-6">
            <AnimatedButton
              onClick={onBack}
              variant="secondary"
              size="md"
            >
              Back to Articles
            </AnimatedButton>
          </div>
        </div>
      
        <div className="flex gap-6">
          {/* Left Panel - Article Content & AI Notes */}
          <div className="w-[35%] flex flex-col gap-6">
            {/* Article Content */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div
                ref={textRef}
                className="prose prose-lg max-w-none leading-relaxed select-text cursor-text"
                onMouseUp={handleTextSelection}
              >
                {article.content.split('\n\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p 
                      key={index} 
                      className="mb-4 leading-relaxed"
                    >
                      {paragraph.trim()}
                    </p>
                  ) : (
                    <br key={index} />
                  )
                ))}
              </div>
            </div>

            {/* AI Notes Cards Section - Placeholder for future functionality */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  AI Study Notes
                </h3>
                <p className="text-sm text-gray-600 mt-1">Review your saved AI assistant responses</p>
              </div>
              
              {/* Placeholder for AI Notes */}
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">📝</div>
                <p className="text-sm">AI notes feature coming soon...</p>
                <p className="text-xs text-gray-400 mt-1">This will contain your French learning insights</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Query Results */}
          <div className="w-[65%]">
            <ChineseFrenchQueryCards articleId={article.id} />
          </div>
        </div>

        {/* Smart Tooltip */}
        <SmartTooltip
          isVisible={showSmartTooltip && selectionData !== null}
          position={selectionData?.position || { x: 0, y: 0, width: 0, height: 0 }}
          selectedText={selectionData?.text || ''}
          contextSentence={selectionData?.contextSentence || ''}
          language="french"
          nativeLanguage="chinese"
          articleId={article.id}
          onClose={handleSmartTooltipClose}
          onCardCreated={handleSmartTooltipCardCreated}
        />
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 z-40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  )
}