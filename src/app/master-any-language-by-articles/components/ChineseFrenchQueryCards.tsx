'use client'

import { useState, useEffect } from 'react'
import { useChineseFrenchStore } from '../store/useChineseFrenchStore'
import ChineseFrenchSentenceCard from './ChineseFrenchSentenceCard'

interface ChineseFrenchQueryCardsProps {
  articleId: number
}

export default function ChineseFrenchQueryCards({ articleId }: ChineseFrenchQueryCardsProps) {
  const { 
    sentenceCards, 
    isLoading, 
    loadSentenceCards, 
    removeSentenceCard,
    selectedSentenceId,
    setSelectedSentenceId
  } = useChineseFrenchStore()

  // Load sentence cards when component mounts or articleId changes
  useEffect(() => {
    if (articleId) {
      loadSentenceCards(articleId)
    }
  }, [articleId, loadSentenceCards])

  const handleDelete = async (sentenceId: string) => {
    try {
      console.log('Deleting sentence with ID:', sentenceId, 'Type:', typeof sentenceId)
      
      const response = await fetch(`/api/master-language/sentence-queries?articleId=${articleId}&sentenceId=${sentenceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Remove from local state immediately
        removeSentenceCard(parseInt(sentenceId))
        console.log('Sentence card deleted successfully')
        
        // Reload data to ensure sync
        await loadSentenceCards(articleId)
      } else {
        console.error('Failed to delete sentence card:', response.status, response.statusText)
        const errorData = await response.json().catch(() => null)
        if (errorData) {
          console.error('Error details:', errorData)
          alert(`Delete failed: ${errorData.error || 'Unknown error'}`)
        } else {
          alert(`Delete failed: HTTP ${response.status}`)
        }
      }
    } catch (error) {
      console.error('Failed to delete sentence card:', error)
      alert('Failed to delete sentence card. Please try again.')
    }
  }

  const scrollToHighlight = (query: any) => {
    // Get the article content element
    const articleElement = document.querySelector('.prose')
    if (!articleElement) return
    
    // Simple text search and highlight
    // This is a basic implementation - you might want to enhance it based on your article structure
    const textNodes = getTextNodes(articleElement)
    const targetText = query.sentence_text
    
    for (const node of textNodes) {
      const text = node.textContent || ''
      const index = text.toLowerCase().indexOf(targetText.toLowerCase())
      
      if (index !== -1) {
        // Create a span to wrap the found text
        const span = document.createElement('span')
        span.style.backgroundColor = 'rgba(147, 51, 234, 0.3)'
        span.style.padding = '2px 4px'
        span.style.borderRadius = '4px'
        span.style.transition = 'all 0.3s ease'
        
        // Split the text and wrap the target portion
        const beforeText = text.substring(0, index)
        const matchText = text.substring(index, index + targetText.length)
        const afterText = text.substring(index + targetText.length)
        
        const parent = node.parentNode
        if (parent) {
          // Insert before text
          if (beforeText) {
            parent.insertBefore(document.createTextNode(beforeText), node)
          }
          
          // Insert highlighted span
          span.textContent = matchText
          parent.insertBefore(span, node)
          
          // Insert after text
          if (afterText) {
            parent.insertBefore(document.createTextNode(afterText), node)
          }
          
          // Remove original node
          parent.removeChild(node)
          
          // Scroll to the highlighted element
          span.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          })
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            if (span.parentNode) {
              const fullText = beforeText + matchText + afterText
              span.parentNode.replaceChild(document.createTextNode(fullText), span)
            }
          }, 3000)
          
          break
        }
      }
    }
  }

  // Helper function to get all text nodes
  const getTextNodes = (element: Element): Text[] => {
    const textNodes: Text[] = []
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let node: Node | null
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        textNodes.push(node as Text)
      }
    }
    
    return textNodes
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600">Loading French sentence cards...</p>
        </div>
      </div>
    )
  }

  if (sentenceCards.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">🇫🇷</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No French Sentences Yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Click on sentences in the French article to create sentence cards for detailed analysis. 
            Each card will help you understand words, phrases, and grammar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 h-full">
      <div className="h-full overflow-y-auto">
        <div className="space-y-6">
          {sentenceCards.map((query) => (
            <ChineseFrenchSentenceCard
              key={`french-sentence-${query.id}`}
              query={query}
              articleId={articleId}
              onDelete={handleDelete}
              onScrollToHighlight={scrollToHighlight}
            />
          ))}
        </div>
      </div>
    </div>
  )
}