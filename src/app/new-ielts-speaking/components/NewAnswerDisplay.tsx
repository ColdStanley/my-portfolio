'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { AnimatePresence, motion } from 'framer-motion'

interface AnswerData {
  level: string
  text: string
  bandHighlightWords?: string[]
  bandHighlightNotes?: Array<{ word: string; note: string }>
}

interface Props {
  questionId: string | null
}

export default function NewAnswerDisplay({ questionId }: Props) {
  const [answers, setAnswers] = useState<AnswerData[]>([])
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    if (!questionId) return

    const fetchAnswers = async () => {
      try {
        const res = await fetch(
          `/api/new-ielts-speaking/supabase-band-answers?questionId=${encodeURIComponent(
            questionId
          )}`
        )
        const data = await res.json()
        setAnswers(data.answers || [])
      } catch (error) {
        console.error('❌ 获取答案失败:', error)
      }
    }

    fetchAnswers()
  }, [questionId])

  function parseHighlightWords(raw: string | string[] | null | undefined): string[] {
    if (Array.isArray(raw)) {
      return raw;
    }
    if (typeof raw !== 'string' || !raw) {
      return [];
    }
    return raw.split(/[，,]/).map((s) => s.trim()).filter(Boolean)
  }

  function parseNotes(raw: string | Array<{ word: string; note: string }> | null | undefined): Record<string, string> {
    if (Array.isArray(raw)) {
      return raw.reduce((acc, current) => {
        if (current.word && current.note) {
          acc[current.word] = current.note;
        }
        return acc;
      }, {} as Record<string, string>);
    }
    if (typeof raw !== 'string' || !raw) {
      return {};
    }

    const result: Record<string, string> = {}
    raw.split(/[；;]/).forEach((pair) => {
      const [word, note] = pair.split(/[:：]/).map((s) => s.trim())
      if (word && note) result[word] = note
    })
    return result
  }

  function buildSegments(text: string, highlightWords: string[], notesMap: Record<string, string>) {
    const ranges: { start: number; end: number; word: string }[] = []

    highlightWords.forEach((word) => {
      const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi')
      let match
      while ((match = pattern.exec(text)) !== null) {
        ranges.push({ start: match.index, end: match.index + match[0].length, word })
      }
    })

    ranges.sort((a, b) => a.start - b.start)

    const result: { text: string; highlight?: { word: string; note: string } }[] = []
    let cursor = 0

    for (const { start, end, word } of ranges) {
      if (start > cursor) {
        result.push({ text: text.slice(cursor, start) })
      }
      result.push({ text: text.slice(start, end), highlight: { word, note: notesMap[word] || '' } })
      cursor = end
    }

    if (cursor < text.length) {
      result.push({ text: text.slice(cursor) })
    }

    return result
  }

  function renderWithHighlights(text: string, rawWords: string | string[] | null | undefined = '', rawNotes: string | Array<{ word: string; note: string }> | null | undefined = '') {
    const highlightWords = parseHighlightWords(rawWords)
    const notesMap = parseNotes(rawNotes) // parseNotes 会将 route.ts 传来的对象数组转换为 Record<string, string>
    const parts = buildSegments(text, highlightWords, notesMap)

    return parts.map((part, i) => {
      if (!part.highlight) return <span key={i}>{part.text}</span>
      const { word, note } = part.highlight

      // 调整后的高亮样式：更柔和、透明、立体，文字非粗体
      const highlightClassName = `
        inline-block px-2 py-1 rounded-lg // 基础框样式：内边距、适中圆角
        bg-purple-100/20 // 背景色：浅紫色，20% 透明度
        text-purple-800 // 文本颜色：深紫色
        backdrop-blur-xs // 核心透明效果：更小的模糊程度，更自然
        shadow-sm // 默认小阴影，减少突兀感
        cursor-pointer
        transition-all duration-200 ease-in-out // 平滑过渡

        // 悬停动效 (桌面端)
        hover:bg-purple-200/30 // 悬停时背景色略微加深，透明度也略增
        hover:shadow-md // 悬停时阴影变大一点，增加微弱立体感
        hover:scale-[1.005] // 悬停时非常轻微地放大 (更小的幅度)
      `;

      return isMobile ? (
        <span
          key={i}
          onClick={() => {
            setSelectedWord(word)
            setSelectedNote(note)
            setIsSheetOpen(true)
          }}
          className={highlightClassName}
        >
          {part.text}
        </span>
      ) : (
        <Popover key={i}>
          <PopoverTrigger asChild>
            <span
              className={highlightClassName}
            >
              {part.text}
            </span>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-64 p-4 text-sm text-gray-700 bg-white shadow-md border border-purple-200 rounded-xl">
            <p className="text-purple-700 font-semibold mb-2">🧠 {word}</p>
            {/* 核心改动：确保这里能够保留和显示换行符 */}
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap"> {/* <-- ⚠️ 关键修改：添加了 whitespace-pre-wrap */}
              {note}
            </p>
          </PopoverContent>
        </Popover>
      )
    })
  }

  return (
    <div className="space-y-6">
      {answers.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-purple-700 mb-3">{item.level} Answer</h3>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {renderWithHighlights(item.text, item.bandHighlightWords, item.bandHighlightNotes)}
          </p>
        </div>
      ))}

      <AnimatePresence>
        {isMobile && isSheetOpen && selectedWord && selectedNote && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="bottom" className="max-h-[60vh] overflow-y-auto p-6">
              <SheetTitle className="text-lg font-semibold mb-3 text-purple-700">
                🧠 Explanation: {selectedWord}
              </SheetTitle>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* 核心改动：确保这里能够保留和显示换行符 */}
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap"> {/* <-- ⚠️ 关键修改：添加了 whitespace-pre-wrap */}
                  {selectedNote}
                </p>
              </motion.div>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}