'use client'

import { useState, useRef, useCallback } from 'react'
import { useReadingStore } from '../store/useReadingStore'
import QueryCards from './QueryCards'

interface ReadingViewProps {
  articleId: number
  content: string
  title?: string
  onNewArticle: () => void
}

export default function ReadingView({ articleId, content, title, onNewArticle }: ReadingViewProps) {
  const { clearAll } = useReadingStore()
  const [selectionData, setSelectionData] = useState<{
    text: string
    range: { start: number; end: number }
    position: { x: number; y: number }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const textRef = useRef<HTMLDivElement>(null)
  const { isHighlighted, addWordQuery, addSentenceQuery, addHighlight, wordQueries, sentenceQueries } = useReadingStore()

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

    // Simple and direct approach: find the selected text in original content
    // Get all text content from the DOM (which may include formatting)
    const domTextContent = textRef.current.textContent || ''
    
    // Calculate position within DOM text
    const walker = document.createTreeWalker(
      textRef.current,
      NodeFilter.SHOW_TEXT,
      null
    )

    let domOffset = 0
    let node
    let selectionStartInDOM = -1

    // Find where the selection starts in the DOM text
    while ((node = walker.nextNode())) {
      if (node === range.startContainer) {
        selectionStartInDOM = domOffset + range.startOffset
        break
      }
      domOffset += node.textContent?.length || 0
    }

    if (selectionStartInDOM === -1) return

    // Now find this text in the original content
    // Look for the selected text around the expected position
    const searchWindowStart = Math.max(0, selectionStartInDOM - 100)
    const searchWindowEnd = Math.min(content.length, selectionStartInDOM + 100)
    const searchWindow = content.slice(searchWindowStart, searchWindowEnd)
    
    const relativeIndex = searchWindow.indexOf(selectedText)
    if (relativeIndex === -1) {
      // Fallback: search in entire content
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

    // Check if already highlighted - if yes, scroll to existing card
    const existingQuery = findExistingQuery(startOffset, endOffset)
    if (existingQuery) {
      const cardId = existingQuery.type === 'word' 
        ? `word-card-${existingQuery.id}` 
        : `sentence-card-${existingQuery.id}`
      scrollToCard(cardId)
      setSelectionData(null)
      return
    }

    // Calculate tooltip position
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

  const handleHighlightClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    
    // Check if clicked on a highlighted element
    if (target.tagName === 'MARK') {
      e.preventDefault()
      e.stopPropagation()
      
      // Get the text content and find corresponding query
      const clickedText = target.textContent || ''
      
      // Find matching word query
      const wordQuery = wordQueries.find(q => q.word_text === clickedText)
      if (wordQuery) {
        scrollToCard(`word-card-${wordQuery.id}`)
        return
      }
      
      // Find matching sentence query
      const sentenceQuery = sentenceQueries.find(q => q.sentence_text === clickedText)
      if (sentenceQuery) {
        scrollToCard(`sentence-card-${sentenceQuery.id}`)
        return
      }
    }
  }, [wordQueries, sentenceQueries])

  const scrollToCard = (cardId: string) => {
    setTimeout(() => {
      const element = document.getElementById(cardId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add highlight effect
        element.style.boxShadow = '0 0 20px rgba(147, 51, 234, 0.3)'
        setTimeout(() => {
          element.style.boxShadow = ''
        }, 2000)
      }
    }, 100)
  }

  const handleQuery = async (type: 'word' | 'sentence') => {
    if (!selectionData || isLoading) return

    setIsLoading(true)
    try {
      const endpoint = type === 'word' ? 'query-word' : 'query-sentence'
      const res = await fetch(`/api/english-reading/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          [type === 'word' ? 'wordText' : 'sentenceText']: selectionData.text,
          startOffset: selectionData.range.start,
          endOffset: selectionData.range.end,
          queryType: 'ai_query'
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
        
        // Scroll to the new card
        const cardId = type === 'word' ? `word-card-${data.id}` : `sentence-card-${data.id}`
        scrollToCard(cardId)
      }
    } catch (error) {
      console.error('Query failed:', error)
    } finally {
      setIsLoading(false)
      setSelectionData(null)
      window.getSelection()?.removeAllRanges()
    }
  }

  const handleMarkOnly = async (type: 'word' | 'sentence') => {
    if (!selectionData || isLoading) return

    setIsLoading(true)
    try {
      const endpoint = type === 'word' ? 'mark-word' : 'mark-sentence'
      const res = await fetch(`/api/english-reading/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          [type === 'word' ? 'wordText' : 'sentenceText']: selectionData.text,
          startOffset: selectionData.range.start,
          endOffset: selectionData.range.end,
          queryType: 'manual_mark'
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
        
        // Scroll to the new card
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

  const renderHighlightedText = () => {
    const ranges = useReadingStore.getState().highlightedRanges
    if (ranges.length === 0) {
      // Preserve paragraph formatting when no highlights
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

    // Sort ranges by start position and merge overlapping ranges to prevent duplication
    const sortedRanges = [...ranges].sort((a, b) => a.start - b.start)
    const mergedRanges: Array<{
      start: number
      end: number
      types: Array<'word' | 'sentence'>
      ids: number[]
    }> = []

    sortedRanges.forEach(range => {
      // Check if this range overlaps with the last merged range
      const lastMerged = mergedRanges[mergedRanges.length - 1]
      
      if (lastMerged && range.start <= lastMerged.end && range.end >= lastMerged.start) {
        // Overlapping ranges - merge them
        lastMerged.start = Math.min(lastMerged.start, range.start)
        lastMerged.end = Math.max(lastMerged.end, range.end)
        if (!lastMerged.types.includes(range.type)) {
          lastMerged.types.push(range.type)
        }
        lastMerged.ids.push(range.id)
      } else {
        // Non-overlapping range - add as new
        mergedRanges.push({
          start: range.start,
          end: range.end,
          types: [range.type],
          ids: [range.id]
        })
      }
    })
    
    let result = ''
    let lastIndex = 0

    mergedRanges.forEach((range) => {
      // Add text before highlight
      result += content.slice(lastIndex, range.start)
      
      // Determine style based on types - sentence takes priority if both exist
      const hasBoth = range.types.includes('word') && range.types.includes('sentence')
      const hasSentence = range.types.includes('sentence')
      
      let className = ''
      if (hasBoth) {
        // Both word and sentence - use gradient or special styling
        className = 'inline-block px-2 py-1 rounded-lg bg-gradient-to-r from-purple-100/30 to-blue-100/30 text-purple-800 backdrop-blur-xs shadow-sm transition-all duration-200 ease-in-out hover:from-purple-200/40 hover:to-blue-200/40 hover:shadow-md hover:scale-[1.005] cursor-pointer border-l-2 border-purple-400'
      } else if (hasSentence) {
        className = 'inline-block px-2 py-1 rounded-lg bg-blue-100/20 text-blue-800 backdrop-blur-xs shadow-sm transition-all duration-200 ease-in-out hover:bg-blue-200/30 hover:shadow-md hover:scale-[1.005] cursor-pointer'
      } else {
        className = 'inline-block px-2 py-1 rounded-lg bg-purple-100/20 text-purple-800 backdrop-blur-xs shadow-sm transition-all duration-200 ease-in-out hover:bg-purple-200/30 hover:shadow-md hover:scale-[1.005] cursor-pointer'
      }
      
      result += `<mark class="${className}">${content.slice(range.start, range.end)}</mark>`
      
      lastIndex = range.end
    })

    // Add remaining text
    result += content.slice(lastIndex)
    
    // Convert to paragraphs with proper formatting - preserve original spacing
    const formattedResult = result
      .split('\n')
      .map(paragraph => paragraph ? `<p class="mb-4 leading-relaxed">${paragraph}</p>` : '<br/>')
      .join('')
    
    return formattedResult
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Reading Session</h2>
          {title && (
            <p className="text-sm text-purple-600 font-medium mt-1">"{title}"</p>
          )}
        </div>
        <button
          onClick={() => {
            clearAll()
            onNewArticle()
          }}
          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          New Article
        </button>
      </div>
      
      <div className="flex gap-6">
        {/* Left Panel - Article Content */}
        <div className="w-1/2">
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
        </div>

        {/* Right Panel - Query Results */}
        <div className="w-1/2">
          <QueryCards />
        </div>
      </div>

      {/* Selection Tooltip */}
      {selectionData && (
        <div
          className="fixed z-50 w-80 bg-white shadow-xl border border-purple-200 rounded-2xl text-gray-700 overflow-hidden"
          style={{
            left: Math.max(10, selectionData.position.x - 160), // Center the tooltip, ensure it stays within viewport
            top: selectionData.position.y - 100,
            pointerEvents: 'auto'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-200 rounded-full"></div>
                <p className="text-white font-medium text-sm">Text Analysis</p>
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
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-purple-600 text-sm font-medium">Analyzing text...</p>
              </div>
            )}
            
            {/* AI Query Section */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">AI Analysis</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuery('word')}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
                >
                  🔍 {isLoading ? 'Analyzing...' : 'Query Word'}
                </button>
                <button
                  onClick={() => handleQuery('sentence')}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
                >
                  📝 {isLoading ? 'Analyzing...' : 'Query Sentence'}
                </button>
              </div>
            </div>
            
            {/* Manual Mark Section */}
            <div className="border-t border-purple-100 pt-3">
              <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">Manual Notes</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkOnly('word')}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors font-medium border border-purple-200"
                >
                  ✏️ {isLoading ? 'Marking...' : 'Mark Word'}
                </button>
                <button
                  onClick={() => handleMarkOnly('sentence')}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors font-medium border border-purple-200"
                >
                  📋 {isLoading ? 'Marking...' : 'Mark Sentence'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}