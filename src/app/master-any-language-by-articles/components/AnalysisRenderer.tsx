'use client'

import { useState, useEffect } from 'react'

export type AnalysisMode = 'simple' | 'deep' | 'grammar'

interface AnalysisRendererProps {
  mode: AnalysisMode
  content: string
  isStreaming?: boolean
  className?: string
}

export default function AnalysisRenderer({ mode, content, isStreaming = false, className = '' }: AnalysisRendererProps) {
  const [typewriterText, setTypewriterText] = useState('')
  const [typewriterTimer, setTypewriterTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!content) return
    
    // Start/continue typewriter effect with new content
    startTypewriterEffect(content)
  }, [content])

  // Start typewriter effect
  const startTypewriterEffect = (newContent: string) => {
    // Clear existing timer
    if (typewriterTimer) {
      clearTimeout(typewriterTimer)
    }
    
    let index = typewriterText.length
    
    const typeWriter = () => {
      if (index < newContent.length) {
        setTypewriterText(newContent.substring(0, index + 1))
        index++
        const timer = setTimeout(typeWriter, 30) // 30ms per character
        setTypewriterTimer(timer)
      }
    }
    
    // Only start typing if there's new content
    if (newContent.length > typewriterText.length) {
      typeWriter()
    }
  }

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (typewriterTimer) {
        clearTimeout(typewriterTimer)
      }
    }
  }, [typewriterTimer])

  // Show typewriter effect for all modes
  return (
    <div className={`text-sm leading-relaxed ${className}`}>
      <div className="prose prose-sm max-w-none">
        <div 
          className="whitespace-pre-wrap text-gray-700"
          dangerouslySetInnerHTML={{
            __html: typewriterText
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-800 font-semibold">$1</strong>')
              .replace(/• (.*?)(?=\n|$)/g, '<li class="ml-4 text-gray-700 list-disc">$1</li>')
              .replace(/\(([^)]+)\)/g, '<span class="text-gray-600 text-xs">($1)</span>')
              .replace(/\n\n+/g, '<br/>')
              .replace(/\n/g, '<br/>')
          }}
        />
        {/* Show cursor when still typing or streaming */}
        {(typewriterText.length < content.length || isStreaming) && (
          <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse rounded-sm"></span>
        )}
      </div>
    </div>
  )
}