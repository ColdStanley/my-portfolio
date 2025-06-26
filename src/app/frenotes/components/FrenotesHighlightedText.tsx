// src/app/frenotes/components/FrenotesHighlightedText.tsx
'use client'

import React, { useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

// ✅ 引入外部工具函数：提取高亮词和解释映射
import { parseHighlightWords, parseHighlightNotes } from '../utils/buildHighlightData'

// 定义简化类型（用于 props）
interface HighlightableFrenotesItem {
  core_expression1?: string | null;
  core_expression2?: string | null;
  core_expression3?: string | null;
  expression_usage1?: string | null;
  expression_usage2?: string | null;
  expression_usage3?: string | null;
}

interface FrenotesHighlightedTextProps {
  text: string;
  item: FlexibleFrenotesItem;
}


// 分割文本为带高亮段落
function buildSegments(
  text: string,
  highlightWords: string[],
  notesMap: Record<string, string>
) {
  const ranges: { start: number; end: number; word: string }[] = []

  if (!highlightWords || highlightWords.length === 0) {
    return [{ text }]
  }

  highlightWords.forEach((word) => {
    const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi')
    let match
    while ((match = pattern.exec(text)) !== null) {
      const isOverlapping = ranges.some(
        (range) =>
          match!.index < range.end &&
          match!.index + match![0].length > range.start
      )
      if (!isOverlapping) {
        ranges.push({
          start: match.index,
          end: match.index + match[0].length,
          word: match[0],
        })
      }
    }
  })

  ranges.sort((a, b) => a.start - b.start)

  const result: { text: string; highlight?: { word: string; note: string } }[] = []
  let cursor = 0

  for (const { start, end, word } of ranges) {
    if (start > cursor) {
      result.push({ text: text.slice(cursor, start) })
    }
    result.push({
      text: text.slice(start, end),
      highlight: {
        word,
        note: notesMap[word.toLowerCase()] || '',
      },
    })
    cursor = end
  }

  if (cursor < text.length) {
    result.push({ text: text.slice(cursor) })
  }

  return result
}

export default function FrenotesHighlightedText({ text, item }: FrenotesHighlightedTextProps) {
  const highlightWords = parseHighlightWords(item)
  const notesMap = parseHighlightNotes(item)
  const parts = buildSegments(text, highlightWords, notesMap)

  const highlightClassName = `
    inline-block px-2 py-1 rounded-lg
    bg-purple-100/20
    text-purple-800
    backdrop-blur-xs
    shadow-sm
    cursor-pointer
    transition-all duration-200 ease-in-out
    hover:bg-purple-200/30
    hover:shadow-md
    hover:scale-[1.005]
  `

  const popoverContentClassName = `
    w-64 p-4 text-sm text-gray-700
    bg-white/90
    backdrop-blur-md
    shadow-lg
    border border-purple-200 rounded-xl
    data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
    data-[state=open]:slide-in-from-top-2
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
    data-[state=closed]:slide-out-to-top-2
  `

  return (
    <>
      {parts.map((part, i) => {
        if (!part.highlight) {
          return <span key={i}>{part.text}</span>
        }

        const { word, note } = part.highlight
        const [isOpen, setIsOpen] = useState(false)
        const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
        const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

        const handleMouseEnter = () => {
          if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
          }
          if (!openTimeoutRef.current) {
            openTimeoutRef.current = setTimeout(() => {
              setIsOpen(true)
              openTimeoutRef.current = null
            }, 200)
          }
        }

        const handleMouseLeave = () => {
          if (openTimeoutRef.current) {
            clearTimeout(openTimeoutRef.current)
            openTimeoutRef.current = null
          }
          if (!closeTimeoutRef.current) {
            closeTimeoutRef.current = setTimeout(() => {
              setIsOpen(false)
              closeTimeoutRef.current = null
            }, 50)
          }
        }

        return (
          <Popover key={i} open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <span
                className={highlightClassName}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {part.text}
              </span>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              className={popoverContentClassName}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <p className="text-purple-700 font-semibold mb-2">🧠 {word}</p>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {note}
              </p>
            </PopoverContent>
          </Popover>
        )
      })}
    </>
  )
}
