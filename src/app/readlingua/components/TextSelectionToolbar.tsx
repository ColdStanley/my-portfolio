'use client'

import React, { useState, memo, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useReadLinguaStore } from '../store/useReadLinguaStore'

interface TextSelectionToolbarProps {
  position: { x: number; y: number }
  selectedText: string
  onQuerySubmit: (queryType: string, userQuestion?: string) => Promise<void>
  onClose: () => void
}

const TextSelectionToolbar = memo<TextSelectionToolbarProps>(({
  position,
  selectedText,
  onQuerySubmit,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // 淡入动效
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  // 处理关闭动画
  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onClose(), 200) // 等待动画完成
  }, [onClose])

  // Check if text language supports pronunciation - use article language setting  
  const supportsPronunciation = (text: string) => {
    if (!text || text.length === 0) return false
    
    // Get current article from store context
    const store = useReadLinguaStore.getState?.() || {}
    const selectedArticle = store.selectedArticle
    if (!selectedArticle) return false
    
    // Simple: if user selected English or French learning, show pronunciation button
    return selectedArticle.source_language === 'english' || selectedArticle.source_language === 'french'
  }

  // 优化：使用useCallback稳定函数引用
  const handleQueryType = useCallback(async (queryType: string) => {
    if (queryType === 'copy') {
      try {
        await navigator.clipboard.writeText(selectedText)
        handleClose() // Direct close without flash effect
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = selectedText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        handleClose() // Direct close without flash effect
      }
      return
    }
    
    setIsSubmitting(true)
    try {
      await onQuerySubmit(queryType)
    } finally {
      setIsSubmitting(false)
    }
  }, [onQuerySubmit, selectedText, handleClose])

  // Calculate optimal tooltip position
  const calculatePosition = () => {
    const offsetX = 20  // Horizontal distance from selected text
    const offsetY = 20  // Vertical distance from selected text
    
    // Position to bottom-right of selected text
    let left = position.x + offsetX
    let top = position.y + offsetY
    
    // Check if tooltip would go off-screen horizontally
    const tooltipWidth = 192
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = position.x - tooltipWidth - offsetX // Switch to bottom-left
    }
    
    // Check if tooltip would go off-screen vertically
    const tooltipHeight = 100
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
      className={`fixed z-[9999] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-purple-200/50 p-3 w-[120px] transition-all duration-200 ease-out ${
        isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-2'
      }`}
      style={{
        ...tooltipStyle,
        position: 'fixed',
        zIndex: 9999,
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2), 0 2px 10px rgba(0, 0, 0, 0.1)',
        width: '120px'
      }}
    >
      
      {/* Action Buttons - Vertical Layout */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => handleQueryType('quick')}
          disabled={isSubmitting}
          className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium text-xs shadow-sm hover:shadow-md transition-all duration-200"
        >
          Quick
        </button>
        <button
          onClick={() => handleQueryType('standard')}
          disabled={isSubmitting}
          className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium text-xs shadow-sm hover:shadow-md transition-all duration-200"
        >
          Standard
        </button>
        <button
          onClick={() => handleQueryType('deep')}
          disabled={isSubmitting}
          className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md font-medium text-xs shadow-sm hover:shadow-md transition-all duration-200"
        >
          Deep
        </button>
        <button
          onClick={() => handleQueryType('copy')}
          className="w-full px-3 py-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-md font-medium text-xs border border-purple-200 shadow-sm hover:shadow-md transition-all duration-200"
        >
          Copy
        </button>
      </div>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm transition-all duration-150 hover:scale-110"
      >
        ×
      </button>

      {/* Pronunciation Button - Right Bottom Corner */}
      {supportsPronunciation(selectedText) && (
        <button
          onClick={async () => {
            try {
              const store = useReadLinguaStore.getState?.() || {}
              const selectedArticle = store.selectedArticle
              if (!selectedArticle) return
              
              const response = await fetch('/api/readlingua/text-to-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  text: selectedText,
                  language: selectedArticle.source_language
                })
              })
              
              if (response.ok) {
                const audioBlob = await response.blob()
                const audioUrl = URL.createObjectURL(audioBlob)
                const audio = new Audio(audioUrl)
                
                audio.onended = () => {
                  URL.revokeObjectURL(audioUrl)
                }
                
                audio.onerror = () => {
                  URL.revokeObjectURL(audioUrl)
                }
                
                await audio.play()
              } else {
                const errorData = await response.json()
                alert(errorData.error || 'Failed to generate pronunciation')
              }
            } catch (error) {
              // Silent fail
            }
          }}
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full flex items-center justify-center transition-all duration-150 shadow-sm hover:scale-110 hover:shadow-md"
          title="Play pronunciation"
        >
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.787L4.866 13.1a.5.5 0 00-.316-.1H2a1 1 0 01-1-1V8a1 1 0 011-1h2.55a.5.5 0 00.316-.1l3.517-3.687zm7.316 1.19a1 1 0 011.414 0 8.97 8.97 0 010 12.684 1 1 0 11-1.414-1.414 6.97 6.97 0 000-9.856 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0 4.985 4.985 0 010 7.072 1 1 0 11-1.415-1.414 2.985 2.985 0 000-4.244 1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      )}
    </div>
  )
  
  return typeof document !== 'undefined' ? createPortal(tooltipContent, document.body) : null
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在相关props改变时重渲染
  return (
    prevProps.position.x === nextProps.position.x &&
    prevProps.position.y === nextProps.position.y &&
    prevProps.selectedText === nextProps.selectedText &&
    prevProps.onQuerySubmit === nextProps.onQuerySubmit &&
    prevProps.onClose === nextProps.onClose
  )
})

TextSelectionToolbar.displayName = 'TextSelectionToolbar'

export default TextSelectionToolbar