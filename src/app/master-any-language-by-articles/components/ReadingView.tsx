'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useLanguageReadingStore } from '../store/useLanguageReadingStore'
import QueryCards from './QueryCards'
import AINotesCards, { AINotesCardsRef } from './AINotesCards'
import MobileReadingView from './MobileReadingView'
import ThinkingAnimation from './ThinkingAnimation'
import AnimatedButton from './AnimatedButton'
import ReadingTimer from './ReadingTimer'
import { Language, getUITexts } from '../config/uiText'
import { playText } from '../utils/tts'

interface ReadingViewProps {
  language: Language
  articleId: number
  content: string
  title?: string
  onNewArticle: () => void
}

export default function ReadingView({ language, articleId, content, title, onNewArticle }: ReadingViewProps) {
  const { clearAll } = useLanguageReadingStore()
  const uiTexts = getUITexts(language)
  const [selectionData, setSelectionData] = useState<{
    text: string
    range: { start: number; end: number }
    position: { x: number; y: number }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null)
  
  const textRef = useRef<HTMLDivElement>(null)
  const aiNotesRef = useRef<AINotesCardsRef>(null)
  const { 
    isHighlighted, 
    addWordQuery, 
    addSentenceQuery, 
    addHighlight, 
    wordQueries, 
    sentenceQueries, 
    pendingWordQueries,
    addPendingWordQuery,
    removePendingWordQuery,
    triggerWordBounce
  } = useLanguageReadingStore()

  const handleAINotesRefresh = useCallback(() => {
    if (aiNotesRef.current) {
      aiNotesRef.current.refreshData()
    }
  }, [])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch article background image
  useEffect(() => {
    const fetchArticleDetails = async () => {
      try {
        const res = await fetch(`/api/language-reading/articles?id=${articleId}&language=${language}`)
        if (res.ok) {
          const article = await res.json()
          console.log('Article data:', article) // Debug log
          console.log('Background image URL:', article.background_image_url) // Debug log
          setBackgroundImageUrl(article.background_image_url)
          console.log('Background state set to:', article.background_image_url) // Debug log
        }
      } catch (error) {
        console.error('Failed to fetch article details:', error)
      }
    }
    
    fetchArticleDetails()
  }, [articleId, language])

  const findExistingQuery = (start: number, end: number) => {
    // Find existing word query
    const wordQuery = wordQueries.find(q => 
      q.start_offset <= start && q.end_offset >= end
    )
    if (wordQuery) {
      return { type: 'word', id: wordQuery.id }
    }
    
    // Find existing sentence query
    const sentenceQuery = sentenceQueries.find(q => 
      q.start_offset <= start && q.end_offset >= end
    )
    if (sentenceQuery) {
      return { type: 'sentence', id: sentenceQuery.id }
    }
    
    return null
  }

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString().trim()
    
    if (!selectedText || !textRef.current) {
      setSelectionData(null)
      return
    }

    // Text selection and offset calculation logic (same as before)
    const domTextContent = textRef.current.textContent || ''
    
    const walker = document.createTreeWalker(
      textRef.current,
      NodeFilter.SHOW_TEXT,
      null
    )

    let domOffset = 0
    let node
    let selectionStartInDOM = -1

    while ((node = walker.nextNode())) {
      if (node === range.startContainer) {
        selectionStartInDOM = domOffset + range.startOffset
        break
      }
      domOffset += node.textContent?.length || 0
    }

    if (selectionStartInDOM === -1) return

    const searchWindowStart = Math.max(0, selectionStartInDOM - 100)
    const searchWindowEnd = Math.min(content.length, selectionStartInDOM + 100)
    const searchWindow = content.slice(searchWindowStart, searchWindowEnd)
    
    const relativeIndex = searchWindow.indexOf(selectedText)
    if (relativeIndex === -1) {
      const globalIndex = content.indexOf(selectedText)
      if (globalIndex === -1) return
      
      const startOffset = globalIndex
      const endOffset = startOffset + selectedText.length
      
      setSelectionData({
        text: selectedText,
        range: { start: startOffset, end: endOffset },
        position: {
          x: range.getBoundingClientRect().left + range.getBoundingClientRect().width / 2,
          y: range.getBoundingClientRect().top - 10
        }
      })
      return
    }

    const startOffset = searchWindowStart + relativeIndex
    const endOffset = startOffset + selectedText.length

    const existingQuery = findExistingQuery(startOffset, endOffset)
    if (existingQuery) {
      const cardId = existingQuery.type === 'word' 
        ? `word-card-${existingQuery.id}` 
        : `sentence-card-${existingQuery.id}`
      scrollToCard(cardId)
      setSelectionData(null)
      return
    }

    const rect = range.getBoundingClientRect()
    setSelectionData({
      text: selectedText,
      range: { start: startOffset, end: endOffset },
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    })
    
  }, [content, wordQueries, sentenceQueries])



  const scrollToCard = (cardId: string) => {
    setTimeout(() => {
      const element = document.getElementById(cardId)
      if (element) {
        // Add scroll path indicator
        const scrollIndicator = document.createElement('div')
        scrollIndicator.className = 'fixed z-50 pointer-events-none'
        scrollIndicator.style.cssText = `
          width: 4px;
          height: 50px;
          background: linear-gradient(to bottom, rgba(147, 51, 234, 0.8), rgba(147, 51, 234, 0.2));
          border-radius: 2px;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          animation: scrollPulse 1.5s ease-in-out;
        `
        
        // Add animation keyframes to document
        if (!document.getElementById('reading-view-styles')) {
          const style = document.createElement('style')
          style.id = 'reading-view-styles'
          style.textContent = `
            @keyframes scrollPulse {
              0% { opacity: 0; transform: translateY(-50%) scale(0.8); }
              50% { opacity: 1; transform: translateY(-50%) scale(1.1); }
              100% { opacity: 0; transform: translateY(-50%) scale(0.8); }
            }
            @keyframes wordBounce {
              0% { transform: scale(1); }
              25% { transform: scale(1.05); background-color: rgba(34, 197, 94, 0.2); }
              50% { transform: scale(1.1); background-color: rgba(34, 197, 94, 0.3); }
              75% { transform: scale(1.05); background-color: rgba(34, 197, 94, 0.2); }
              100% { transform: scale(1); background-color: initial; }
            }
            .word-bounce {
              animation: wordBounce 0.5s ease-in-out;
            }
          `
          document.head.appendChild(style)
        }
        
        document.body.appendChild(scrollIndicator)
        
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.3)'
        element.style.transform = 'scale(1.02)'
        element.style.transition = 'all 0.3s ease'
        
        setTimeout(() => {
          element.style.boxShadow = ''
          element.style.transform = ''
          scrollIndicator.remove()
        }, 2000)
      }
    }, 100)
  }

  const handleHighlightClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    
    // Check if clicked element is a highlighted span
    if (target.tagName === 'SPAN' && target.dataset.queryIds) {
      e.stopPropagation()
      
      try {
        const queryIds = JSON.parse(target.dataset.queryIds) as number[]
        
        // Scroll to the first query card (or you could show all)
        if (queryIds.length > 0) {
          const firstQueryId = queryIds[0]
          // Find the query type by checking both word and sentence queries
          const wordQuery = wordQueries.find(q => q.id === firstQueryId)
          const sentenceQuery = sentenceQueries.find(q => q.id === firstQueryId)
          
          if (wordQuery) {
            scrollToCard(`word-card-${firstQueryId}`)
          } else if (sentenceQuery) {
            scrollToCard(`sentence-card-${firstQueryId}`)
          }
        }
      } catch (error) {
        console.error('Error parsing query IDs:', error)
      }
    }
  }, [wordQueries, sentenceQueries])

  const handleQuery = async (type: 'word' | 'sentence') => {
    if (!selectionData || isLoading) return

    // Save selection data before potentially clearing it
    const savedSelectionData = { ...selectionData }

    // For word queries, add pending state, remove auto-scroll, and immediately hide tooltip
    if (type === 'word') {
      addPendingWordQuery(savedSelectionData.range.start, savedSelectionData.range.end, savedSelectionData.text)
      // Immediately hide tooltip to allow continued reading
      setSelectionData(null)
      window.getSelection()?.removeAllRanges()
    }

    setIsLoading(true)
    try {
      const endpoint = type === 'word' ? 'query-word' : 'query-sentence'
      const res = await fetch(`/api/language-reading/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          [type === 'word' ? 'wordText' : 'sentenceText']: savedSelectionData.text,
          startOffset: savedSelectionData.range.start,
          endOffset: savedSelectionData.range.end,
          queryType: 'ai_query',
          language: language
        }),
      })

      const data = await res.json()
      if (data.id) {
        if (type === 'word') {
          addWordQuery(data)
          // Remove pending state and trigger bounce
          removePendingWordQuery(savedSelectionData.range.start, savedSelectionData.range.end)
          // Trigger bounce after a short delay to ensure DOM is updated
          setTimeout(() => {
            triggerWordBounce(savedSelectionData.range.start, savedSelectionData.range.end)
          }, 100)
        } else {
          addSentenceQuery(data)
          // Keep auto-scroll for sentences
          const cardId = `sentence-card-${data.id}`
          scrollToCard(cardId)
        }
        addHighlight(type, savedSelectionData.range.start, savedSelectionData.range.end, data.id)
      }
    } catch (error) {
      console.error('Query failed:', error)
      // Remove pending state on error
      if (type === 'word') {
        removePendingWordQuery(savedSelectionData.range.start, savedSelectionData.range.end)
      }
    } finally {
      setIsLoading(false)
      // Only clear selection data for sentence queries (word queries already cleared)
      if (type === 'sentence') {
        setSelectionData(null)
        window.getSelection()?.removeAllRanges()
      }
    }
  }

  const handleMarkOnly = async (type: 'word' | 'sentence') => {
    if (!selectionData || isLoading) return

    setIsLoading(true)
    try {
      const endpoint = type === 'word' ? 'mark-word' : 'mark-sentence'
      const res = await fetch(`/api/language-reading/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          [type === 'word' ? 'wordText' : 'sentenceText']: selectionData.text,
          startOffset: selectionData.range.start,
          endOffset: selectionData.range.end,
          queryType: 'manual_mark',
          language: language
        }),
      })

      const data = await res.json()
      if (data.id) {
        if (type === 'word') {
          addWordQuery(data)
        } else {
          addSentenceQuery(data)
        }
        addHighlight(type, selectionData.range.start, selectionData.range.end, data.id)
        
        const cardId = type === 'word' ? `word-card-${data.id}` : `sentence-card-${data.id}`
        scrollToCard(cardId)
      }
    } catch (error) {
      console.error('Mark failed:', error)
    } finally {
      setIsLoading(false)
      setSelectionData(null)
      window.getSelection()?.removeAllRanges()
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


  const renderHighlightedText = () => {
    const ranges = useLanguageReadingStore.getState().highlightedRanges
    const pendingQueries = useLanguageReadingStore.getState().pendingWordQueries
    
    if (ranges.length === 0 && pendingQueries.length === 0) {
      return content.split('\n').map((paragraph, index) => (
        paragraph.trim() ? (
          <p key={index} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ) : (
          <br key={index} />
        )
      ))
    }

    // Add pending queries to the ranges for rendering
    const allRanges = [...ranges]
    pendingQueries.forEach(pending => {
      allRanges.push({
        type: 'word' as const,
        start: pending.start,
        end: pending.end,
        id: -1, // Special ID for pending queries
        isPending: true
      })
    })

    // Restore simple range merging (avoiding complex HTML generation)
    const sortedRanges = [...allRanges].sort((a, b) => a.start - b.start)
    const mergedRanges: Array<{
      start: number
      end: number
      types: Array<'word' | 'sentence'>
      ids: number[]
      isPending?: boolean
    }> = []

    sortedRanges.forEach(range => {
      const lastMerged = mergedRanges[mergedRanges.length - 1]
      
      if (lastMerged && range.start <= lastMerged.end && range.end >= lastMerged.start) {
        lastMerged.start = Math.min(lastMerged.start, range.start)
        lastMerged.end = Math.max(lastMerged.end, range.end)
        if (!lastMerged.types.includes(range.type)) {
          lastMerged.types.push(range.type)
        }
        if (range.id !== -1) {
          lastMerged.ids.push(range.id)
        }
        if ((range as any).isPending) {
          lastMerged.isPending = true
        }
      } else {
        mergedRanges.push({
          start: range.start,
          end: range.end,
          types: [range.type],
          ids: range.id !== -1 ? [range.id] : [],
          isPending: (range as any).isPending
        })
      }
    })
    
    let result = ''
    let lastIndex = 0

    mergedRanges.forEach((range) => {
      result += content.slice(lastIndex, range.start)
      
      const hasBoth = range.types.includes('word') && range.types.includes('sentence')
      const hasSentence = range.types.includes('sentence')
      const hasWord = range.types.includes('word')
      
      let className = ''
      let extraAttributes = ''
      
      if (range.isPending && hasWord) {
        // Pending word query - add pulsing animation with purple theme
        className = 'inline-block px-2 py-1 rounded-lg bg-purple-100/30 text-purple-800 backdrop-blur-xs shadow-sm cursor-pointer animate-pulse border-2 border-purple-300/50'
        extraAttributes = ` data-word-range="${range.start}-${range.end}"`
      } else if (hasBoth) {
        className = 'inline-block px-2 py-1 rounded-lg bg-purple-100/20 text-purple-800 backdrop-blur-xs shadow-sm transition-all duration-200 ease-in-out hover:bg-purple-200/30 hover:shadow-md hover:scale-[1.005] cursor-pointer font-bold'
        extraAttributes = ` data-word-range="${range.start}-${range.end}"`
      } else if (hasSentence) {
        className = 'font-bold cursor-pointer transition-all duration-200 ease-in-out hover:text-blue-800'
      } else if (hasWord) {
        className = 'inline-block px-2 py-1 rounded-lg bg-purple-100/20 text-purple-800 backdrop-blur-xs shadow-sm transition-all duration-200 ease-in-out hover:bg-purple-200/30 hover:shadow-md hover:scale-[1.005] cursor-pointer'
        extraAttributes = ` data-word-range="${range.start}-${range.end}"`
      }
      
      // Add query IDs for bidirectional mapping (only for non-pending queries)
      const queryIds = range.ids.length > 0 ? JSON.stringify(range.ids) : '[]'
      const queryIdsAttr = range.ids.length > 0 ? ` data-query-ids='${queryIds}'` : ''
      
      result += `<span class="${className}"${queryIdsAttr}${extraAttributes}>${content.slice(range.start, range.end)}</span>`
      
      lastIndex = range.end
    })

    result += content.slice(lastIndex)
    
    const formattedResult = result
      .split('\n')
      .map(paragraph => paragraph ? `<p class="mb-4 leading-relaxed">${paragraph}</p>` : '<br/>')
      .join('')
    
    return formattedResult
  }

  // Return mobile view if on mobile device
  if (isMobile) {
    return (
      <MobileReadingView
        language={language}
        articleId={articleId}
        content={content}
        title={title}
      />
    )
  }

  // Desktop view
  return (
    <div className="min-h-screen">
      {/* Full Screen Background Image */}
      {backgroundImageUrl && (
        <div 
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `url(${backgroundImageUrl})`,
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
                <h2 className="text-xl font-semibold text-gray-800">{uiTexts.readingSession}</h2>
                {title && (
                  <p className="text-sm text-purple-600 font-medium mt-1">"{title}"</p>
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
              onClick={() => setIsTestMode(!isTestMode)}
              variant="secondary"
              size="md"
            >
              {isTestMode ? uiTexts.exitReview : uiTexts.reviewTest}
            </AnimatedButton>
            <AnimatedButton
              onClick={() => {
                clearAll()
                onNewArticle()
              }}
              variant="primary"
              size="md"
            >
              {uiTexts.newArticle}
            </AnimatedButton>
          </div>
        </div>
      
      <div className="flex gap-6">
        {/* Left Panel - Article Content & AI Notes */}
        <div className="w-1/2 flex flex-col gap-6">
          {/* Article Content */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div
              ref={textRef}
              className="prose prose-lg max-w-none leading-relaxed select-text cursor-text"
              onMouseUp={handleTextSelection}
              onClick={handleHighlightClick}
            >
              {typeof renderHighlightedText() === 'string' ? (
                <div dangerouslySetInnerHTML={{ __html: renderHighlightedText() as string }} />
              ) : (
                renderHighlightedText()
              )}
            </div>
          </div>

          {/* AI Notes Cards Section */}
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
            <AINotesCards ref={aiNotesRef} language={language} articleId={articleId} />
          </div>
        </div>

        {/* Right Panel - Query Results */}
        <div className="w-1/2">
          <QueryCards 
            language={language} 
            articleId={articleId}
            isTestMode={isTestMode}
            onExitTestMode={() => setIsTestMode(false)}
            onAINotesRefresh={handleAINotesRefresh}
          />
        </div>
      </div>

      {/* Selection Tooltip */}
      {selectionData && (
        <div
          className="fixed z-50 w-80 bg-white shadow-xl border border-purple-200 rounded-2xl text-gray-700 overflow-hidden"
          style={{
            left: Math.min(window.innerWidth - 330, selectionData.position.x + 30),
            top: Math.max(10, selectionData.position.y - 240),
            pointerEvents: 'auto'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                <p className="text-white font-medium text-xs">{uiTexts.textAnalysis}</p>
              </div>
              <button
                onClick={() => setSelectionData(null)}
                className="text-purple-100 hover:text-white text-xl leading-none transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-purple-100 text-xs mt-2 max-w-full truncate">
              "{selectionData.text}"
            </p>
          </div>
          
          {/* Content */}
          <div className="p-4">
            {isLoading && (
              <div className="mb-3 relative">
                <ThinkingAnimation 
                  message={uiTexts.analyzing}
                  className="p-3 rounded-lg"
                />
              </div>
            )}
            
            {/* Manual Mark Section */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">{uiTexts.manualNotes}</p>
              <div className="flex gap-2">
                <AnimatedButton
                  onClick={() => handleMarkOnly('word')}
                  disabled={isLoading}
                  variant="accent"
                  size="sm"
                  className="flex-1"
                >
                  {uiTexts.markWord}
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => handleMarkOnly('sentence')}
                  disabled={isLoading}
                  variant="accent"
                  size="sm"
                  className="flex-1"
                >
                  {uiTexts.markSentence}
                </AnimatedButton>
              </div>
            </div>
            
            {/* AI Query Section */}
            <div className="border-t border-purple-100 pt-3">
              <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">{uiTexts.aiAnalysis}</p>
              <div className="flex gap-2">
                <AnimatedButton
                  onClick={() => handleQuery('word')}
                  disabled={isLoading}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  {uiTexts.queryWord}
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => handleQuery('sentence')}
                  disabled={isLoading}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  {uiTexts.querySentence}
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}