'use client'

import { useState, useRef, useCallback } from 'react'
import { useReadingStore } from '../store/useReadingStore'
import QueryCards from './QueryCards'

interface ReadingViewProps {
  articleId: number
  content: string
  onNewArticle: () => void
}

export default function ReadingView({ articleId, content, onNewArticle }: ReadingViewProps) {
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

    // Sort ranges by start position
    const sortedRanges = [...ranges].sort((a, b) => a.start - b.start)
    
    let result = ''
    let lastIndex = 0

    sortedRanges.forEach((range) => {
      // Add text before highlight
      result += content.slice(lastIndex, range.start)
      
      // Add highlighted text with IELTS speaking style + click cursor
      const className = range.type === 'word' 
        ? 'inline-block px-2 py-1 rounded-lg bg-purple-100/20 text-purple-800 backdrop-blur-xs shadow-sm transition-all duration-200 ease-in-out hover:bg-purple-200/30 hover:shadow-md hover:scale-[1.005] cursor-pointer'
        : 'inline-block px-2 py-1 rounded-lg bg-blue-100/20 text-blue-800 backdrop-blur-xs shadow-sm transition-all duration-200 ease-in-out hover:bg-blue-200/30 hover:shadow-md hover:scale-[1.005] cursor-pointer'
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
        <h2 className="text-xl font-semibold text-gray-800">Reading Session</h2>
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
          className="fixed z-50 w-72 p-4 text-sm bg-white shadow-md border border-purple-200 rounded-xl text-gray-700"
          style={{
            left: selectionData.position.x - 144, // Center the tooltip (w-72 = 288px / 2)
            top: selectionData.position.y - 80,
            pointerEvents: 'auto'
          }}
        >
          <p className="text-purple-700 font-semibold mb-2">Selected: {selectionData.text}</p>
          {isLoading && (
            <p className="text-gray-600 text-xs mb-2 italic">Analyzing text, please wait...</p>
          )}
          <div className="space-y-2">
            <div className="flex gap-2">
              {!selectionData.text.includes('.') && !selectionData.text.includes('!') && !selectionData.text.includes('?') && selectionData.text.split(' ').length <= 8 && (
                <button
                  onClick={() => handleQuery('word')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {isLoading ? 'Analyzing...' : 'Query Word'}
                </button>
              )}
              <button
                onClick={() => handleQuery('sentence')}
                disabled={isLoading}
                className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {isLoading ? 'Analyzing...' : 'Query Sentence'}
              </button>
            </div>
            
            <div className="flex gap-2 pt-1 border-t border-gray-200">
              {!selectionData.text.includes('.') && !selectionData.text.includes('!') && !selectionData.text.includes('?') && selectionData.text.split(' ').length <= 8 && (
                <button
                  onClick={() => handleMarkOnly('word')}
                  disabled={isLoading}
                  className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {isLoading ? 'Marking...' : 'Mark Word'}
                </button>
              )}
              <button
                onClick={() => handleMarkOnly('sentence')}
                disabled={isLoading}
                className="px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
              >
                {isLoading ? 'Marking...' : 'Mark Sentence'}
              </button>
            </div>
          </div>
          <button
            onClick={() => setSelectionData(null)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

    </div>
  )
}