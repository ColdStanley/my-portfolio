'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Smooth entrance with micro-delay
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])
  
  // Graceful exit animation
  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300) // Wait for animation completion
  }, [onClose])
  
  // Calculate optimal tooltip position
  const calculatePosition = () => {
    const offsetX = 20  // Horizontal distance from selected text
    const offsetY = 20  // Vertical distance from selected text
    
    // Position to bottom-right of selected text
    let left = position.x + offsetX
    let top = position.y + offsetY
    
    // Check if tooltip would go off-screen horizontally
    const tooltipWidth = 150  // Width for vertical button layout
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = position.x - tooltipWidth - offsetX // Switch to bottom-left
    }
    
    // Check if tooltip would go off-screen vertically
    const tooltipHeight = 110
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
      className={`fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 p-3 selection-toolbar transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
      }`}
      style={{
        ...tooltipStyle,
        position: 'fixed',
        zIndex: 9999
      }}
    >      
      {/* Action Buttons - Vertical Stack */}
      <div className="flex flex-col gap-2">
        {supportsPronunciation && onPlayPronunciation && (
          <button
            onClick={onPlayPronunciation}
            disabled={isPlaying}
            className="w-full px-3 py-2 bg-white hover:bg-purple-50 disabled:bg-gray-100 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-md font-medium text-sm shadow-sm transition-all"
            title="Play pronunciation"
          >
            {isPlaying ? 'Playing...' : 'Pronounce'}
          </button>
        )}
        
        <button
          onClick={onAddToEmail}
          className="w-full px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-300 rounded-md font-medium text-sm shadow-sm transition-all"
          title="Add to email collection"
        >
          Add to Email
        </button>
      </div>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-[10px] transition-all duration-150 hover:scale-110 shadow-sm"
        title="Close"
      >
        ×
      </button>
    </div>
  )
  
  return typeof document !== 'undefined' ? createPortal(tooltipContent, document.body) : null
}