'use client'

import React, { useEffect } from 'react'
import { HighlightWord } from '../types'

interface Props {
  paragraph: string
  highlightData: HighlightWord[]
  maxHighlightIndex: number
  manuallyHighlightedWords: Set<string>
  forceHighlightAll: boolean
  globalForceHighlightIndex: number
  paragraphIndex: number
  onWordClick: (word: string) => void
  onWordHover: (word: string, note: string, x: number, y: number) => void
  onWordLeave: () => void
}

export default function LueurTextSegment({
  paragraph,
  highlightData,
  maxHighlightIndex,
  manuallyHighlightedWords,
  forceHighlightAll,
  globalForceHighlightIndex,
  paragraphIndex,
  onWordClick,
  onWordHover,
  onWordLeave,
}: Props) {
  useEffect(() => {
    const styleId = 'lueur-mark-style'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.innerHTML = `
        mark[data-note] {
          background-color: rgba(196, 181, 253, 0.28);
          color: #000;
          border-radius: 0.5rem;
          padding: 2px 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        mark[data-note]:hover {
          background-color: rgba(168, 142, 251, 0.4);
          transform: scale(1.02);
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  const wordsInParagraph = highlightData.filter(h => paragraph.includes(h.word))

  const shouldHighlight = (highlight: HighlightWord, highlightIndex: number) => {
    return (
      highlightIndex <= maxHighlightIndex ||
      manuallyHighlightedWords.has(highlight.word) ||
      (forceHighlightAll && paragraphIndex <= globalForceHighlightIndex)
    )
  }

  const renderParagraph = () => {
    let result = paragraph
    wordsInParagraph.forEach((highlight, index) => {
      if (shouldHighlight(highlight, index)) {
        const regex = new RegExp(`\\b(${highlight.word})\\b`, 'g')
        result = result.replace(
          regex,
          `<mark data-word="${highlight.word}" data-note="${highlight.note}">$1</mark>`
        )
      }
    })
    return result
  }

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'MARK') {
      const word = target.dataset.word
      if (word) {
        onWordClick(word)
      }
    }
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'MARK') {
      const word = target.dataset.word
      const note = target.dataset.note
      const rect = target.getBoundingClientRect()
      if (word && note) {
        const x = rect.right + 62
        const y = rect.top + rect.height + window.scrollY + 55
        onWordHover(word, note, x, y)
      }
    }
  }

  const handleMouseLeave = () => {
    onWordLeave()
  }

  return (
    <p
      className="relative text-white leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderParagraph() }}
      onClick={handleClick}
      onMouseOver={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  )
}
