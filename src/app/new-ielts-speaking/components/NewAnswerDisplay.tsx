'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { AnimatePresence, motion } from 'framer-motion'

interface GrammarItem {
  pattern: string
  note: string
  example: string
}

interface AnswerData {
  level: string
  text: string
  bandHighlightWords?: string[]
  bandHighlightNotes?: Array<{ word: string; note: string; example: string }>
  grammar?: GrammarItem[]
}

interface Props {
  questionId: string | null
}

export default function NewAnswerDisplay({ questionId }: Props) {
  const [answers, setAnswers] = useState<AnswerData[]>([])
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [selectedExample, setSelectedExample] = useState<string | null>(null)
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

  function renderWithHighlights(
    text: string,
    highlightWords: string[] = [],
    highlightNotes: Array<{ word: string; note: string; example: string }> = []
  ) {
    const notesMap = Object.fromEntries(
      highlightNotes.map(({ word, note, example }) => [word, { note, example }])
    )

    const ranges: { start: number; end: number; word: string }[] = []
    highlightWords.forEach((word) => {
      const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      let match
      while ((match = pattern.exec(text)) !== null) {
        ranges.push({ start: match.index, end: match.index + match[0].length, word })
      }
    })
    ranges.sort((a, b) => a.start - b.start)

    const result: { text: string; highlight?: { word: string; note: string; example: string } }[] = []
    let cursor = 0
    for (const { start, end, word } of ranges) {
      if (start > cursor) {
        result.push({ text: text.slice(cursor, start) })
      }
      result.push({
        text: text.slice(start, end),
        highlight: { word, ...(notesMap[word] || { note: '', example: '' }) },
      })
      cursor = end
    }
    if (cursor < text.length) {
      result.push({ text: text.slice(cursor) })
    }

    return result.map((part, i) => {
      if (!part.highlight) return <span key={i}>{part.text}</span>
      const { word, note, example } = part.highlight

      const highlightClassName = `
        inline-block px-2 py-1 rounded-lg
        bg-purple-100/20 text-purple-800
        backdrop-blur-xs shadow-sm cursor-pointer
        transition-all duration-200 ease-in-out
        hover:bg-purple-200/30 hover:shadow-md hover:scale-[1.005]
      `

      return isMobile ? (
        <span
          key={i}
          onClick={() => {
            setSelectedWord(word)
            setSelectedNote(note)
            setSelectedExample(example)
            setIsSheetOpen(true)
          }}
          className={highlightClassName}
        >
          {part.text}
        </span>
      ) : (
        <Popover key={i}>
          <PopoverTrigger asChild>
            <span className={highlightClassName}>{part.text}</span>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-72 p-4 text-sm bg-white shadow-md border border-purple-200 rounded-xl text-gray-700">
            <p className="text-purple-700 font-semibold mb-2">🧠 {word}</p>
            <p className="whitespace-pre-wrap mb-2">{note}</p>
            {example && <p className="text-gray-600 text-sm italic whitespace-pre-wrap">💬 {example}</p>}
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
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">
            {renderWithHighlights(item.text, item.bandHighlightWords, item.bandHighlightNotes)}
          </p>

          {/* ✅ 新增 Grammar 区块 */}
          {item.grammar && item.grammar.length > 0 && (
            <div className="mt-4">
              <h4 className="text-purple-700 font-semibold mb-2">🧩 Grammar Points</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {item.grammar.map((g, idx) => (
                  <li key={idx} className="bg-purple-50 rounded-md px-3 py-2 border border-purple-100">
                    <p className="font-semibold text-purple-800">🔹 {g.pattern}</p>
                    <p className="text-gray-700">{g.note}</p>
                    {g.example && <p className="italic text-gray-600 mt-1">💬 {g.example}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                  {selectedNote}
                </p>
                {selectedExample && (
                  <p className="text-gray-600 text-sm italic whitespace-pre-wrap">
                    💬 {selectedExample}
                  </p>
                )}
              </motion.div>
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}


// end