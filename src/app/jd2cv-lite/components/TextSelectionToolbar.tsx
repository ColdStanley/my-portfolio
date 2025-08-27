'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

interface TextSelectionToolbarProps {
  position: { x: number; y: number }
  selectedText: string
  onPlayPronunciation?: () => Promise<void>
  onAddToEmail: () => void
  onClose: () => void
  supportsPronunciation?: boolean
  isPlaying?: boolean
}

export default function TextSelectionToolbar({
  position,
  selectedText,
  onPlayPronunciation,
  onAddToEmail,
  onClose,
  supportsPronunciation = true,
  isPlaying = false
}: TextSelectionToolbarProps) {
  // Calculate optimal tooltip position
  const calculatePosition = () => {
    const offsetX = 20  // Horizontal distance from selected text
    const offsetY = 20  // Vertical distance from selected text
    
    // Position to bottom-right of selected text
    let left = position.x + offsetX
    let top = position.y + offsetY
    
    // Check if tooltip would go off-screen horizontally
    const tooltipWidth = 220  // Slightly wider to accommodate both buttons
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = position.x - tooltipWidth - offsetX // Switch to bottom-left
    }
    
    // Check if tooltip would go off-screen vertically
    const tooltipHeight = 120
    if (top + tooltipHeight > window.innerHeight - 10) {
      top = position.y - tooltipHeight - offsetY // Switch to top-right
    }
    
    return { 
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none'
    }
  }

  const tooltipStyle = calculatePosition()
  
  const tooltipContent = (
    <div
      className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-52 selection-toolbar"
      style={{
        ...tooltipStyle,
        position: 'fixed',
        zIndex: 9999
      }}
    >
      {/* Selected Text - Prominent Display with pronunciation button */}
      <div className="mb-3 text-center">
        <div className="inline-flex items-start gap-1">
          <span className="text-lg font-bold text-gray-900">
            "{selectedText}"
          </span>
          {supportsPronunciation && onPlayPronunciation && (
            <button
              onClick={onPlayPronunciation}
              className="w-4 h-4 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full flex items-center justify-center transition-colors flex-shrink-0 mt-1"
              title="Play pronunciation"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Pronunciation Button - Full width if available */}
        {supportsPronunciation && onPlayPronunciation && (
          <button
            onClick={onPlayPronunciation}
            disabled={isPlaying}
            className="w-full px-3 py-2 bg-white hover:bg-purple-50 disabled:bg-gray-100 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-md font-medium text-sm shadow-sm transition-all"
          >
            {isPlaying ? 'Playing...' : 'Pronounce'}
          </button>
        )}
        
        {/* Add to Email Button - Always show */}
        <button
          onClick={onAddToEmail}
          className="w-full px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-md font-medium text-sm shadow-sm transition-all"
          title="Add selected text to email collection"
        >
          Add to Email
        </button>
      </div>
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs"
      >
        ×
      </button>
    </div>
  )
  
  return typeof document !== 'undefined' ? createPortal(tooltipContent, document.body) : null
}