'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import clsx from 'clsx'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { AnimatePresence } from 'framer-motion'

interface QuestionItem {
  id: string
  questionText: string
}

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

export default function IELTSSpeakingQuestionBank() {
  // Main state
  const [selectedPart, setSelectedPart] = useState<'Part 1' | 'Part 2' | 'Part 3'>('Part 2')
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [selectedQuestionText, setSelectedQuestionText] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuestionItem[]>([])

  // Question selector state
  const [displayedQuestions, setDisplayedQuestions] = useState<QuestionItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Answer display state
  const [answers, setAnswers] = useState<AnswerData[]>([])
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [selectedExample, setSelectedExample] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Header state
  const router = useRouter()
  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const options = [
    '题目自定义：可手动输入题目',
    '串题：一个答案可用于多个题目',
  ]

  const parts: ('Part 1' | 'Part 2' | 'Part 3')[] = ['Part 1', 'Part 2', 'Part 3']

  // Fetch questions function
  const fetchQuestions = async (part: 'Part 1' | 'Part 2' | 'Part 3') => {
    try {
      const res = await fetch(`/api/new-ielts-speaking/supabase-list-questions?part=${encodeURIComponent(part)}`)
      const data = await res.json()
      const items = data.items || []
      setQuestions(items)

      if (part === 'Part 2' && selectedQuestionId === null && items.length > 0) {
        const random = items[Math.floor(Math.random() * items.length)]
        setSelectedQuestionId(random.id)
        setSelectedQuestionText(random.questionText)
      }
    } catch (error) {
      console.error('❌ 获取题目失败:', error)
    }
  }

  // Fetch answers function
  const fetchAnswers = async (questionId: string) => {
    try {
      const res = await fetch(
        `/api/new-ielts-speaking/supabase-band-answers?questionId=${encodeURIComponent(questionId)}`
      )
      const data = await res.json()
      setAnswers(data.answers || [])
    } catch (error) {
      console.error('❌ 获取答案失败:', error)
    }
  }

  // Handle part change
  const handlePartChange = (newPart: 'Part 1' | 'Part 2' | 'Part 3') => {
    setSelectedPart(newPart)
    fetchQuestions(newPart)
  }

  // Handle question selection
  const handleQuestionSelect = (id: string, text: string) => {
    setSelectedQuestionId(id)
    setSelectedQuestionText(text)
    setSelectedId(id)
  }

  // Handle feedback submission
  const handleSubmit = async () => {
    if (!response || submitted || submitting) return
    setSubmitting(true)

    const res = await fetch('/api/your-voice-matters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'new-ielts-speaking',
        responses: {
          'Feature Expectation': response,
        },
      }),
    })

    if (res.ok) {
      setSubmitted(true)
      setSubmitting(false)
      toast.success('🎉 感谢你的反馈，我们已收到！')
    } else {
      setSubmitting(false)
      alert('提交失败，请稍后再试')
    }
  }

  // Pick random questions
  const pickRandomQuestions = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    setDisplayedQuestions(shuffled.slice(0, 3))
    setSelectedId(null)
  }

  // Handle question click
  const handleQuestionClick = (q: QuestionItem) => {
    setSelectedId(q.id)
    handleQuestionSelect(q.id, q.questionText)
    if (window.innerWidth < 768) {
      // 滚动到答案区域
      setTimeout(() => {
        const answerSection = document.querySelector('[data-answer-section]')
        if (answerSection) {
          answerSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  // Question card style
  const questionCardStyle = (id: string) => `
    cursor-pointer 
    border rounded-md p-4 text-[15px] font-medium transition 
    ${selectedId === id
      ? 'bg-purple-100 border-purple-500 shadow-lg'
      : 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100 hover:shadow-md'
    }
    text-gray-800
  `

  // Render text with highlights
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

  // Effects
  useEffect(() => {
    fetchQuestions(selectedPart)
  }, [selectedPart])

  useEffect(() => {
    if (questions.length > 0) {
      const shuffled = [...questions].sort(() => 0.5 - Math.random())
      const selected = shuffled[0]
      setDisplayedQuestions(shuffled.slice(0, 3))
      setSelectedId(selected.id)
      handleQuestionSelect(selected.id, selected.questionText)
    }
  }, [questions])

  useEffect(() => {
    if (selectedQuestionId) {
      fetchAnswers(selectedQuestionId)
    }
  }, [selectedQuestionId])

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {/* 移动端显示简化版本 */}
        <div className="md:hidden col-span-1 bg-white shadow rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold text-purple-600">IELTS Speaking</h1>
            <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Image src="/images/IELTS7.png" alt="IELTS7" width={40} height={40} />
            </motion.div>
          </div>
          <p className="text-sm text-gray-600">真题题库 · 高分范文 · 关键词解析</p>
        </div>
        {/* 左侧：标题卡片 */}
        <div className="hidden md:block bg-white shadow rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-row items-center gap-3 mb-3">
              <h1 className="text-4xl font-extrabold text-purple-600">IELTS Speaking</h1>
              <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Image src="/images/IELTS7.png" alt="IELTS7" width={60} height={60} />
              </motion.div>
            </div>
            <blockquote className="text-sm text-gray-600 leading-relaxed pl-2 border-l-4 border-purple-400">
              <p>"We are what we repeatedly do.</p>
              <p>我们由我们反复做的事情塑造而成。</p>
              <p>Excellence, then, is not an act, but a habit."</p>
              <p>卓越并非一时之举，而是一种习惯</p>
              <footer className="mt-2 text-xs text-gray-500">—— Aristotle / 亚里士多德</footer>
            </blockquote>
          </div>
        </div>

        {/* 中间：功能介绍卡片 */}
        <div className="hidden md:block bg-white shadow rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">快速了解</h2>
            <ul className="text-sm text-gray-700 leading-relaxed list-none pl-0 space-y-1">
              <li>1- 选择 Part (Part 1, Part 2, Part 3)</li>
              <li>2- 点击题目</li>
              <li>3- 学习6分、7分、8分范文</li>
              <li>4- 掌握Highlight词汇</li>
            </ul>
          </div>
        </div>

        {/* 右侧：反馈问卷卡片 */}
        <div className="hidden md:block bg-white shadow rounded-xl p-6 flex flex-col justify-between">
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Your Voice Matters.</h2>

              {!submitted ? (
                <>
                  <p className="text-base font-medium text-gray-800 mb-3">你最期待的功能是什么？</p>
                  <div className="space-y-2">
                    {options.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-3 cursor-pointer text-sm text-gray-700"
                      >
                        <span
                          className={clsx(
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                            response === opt ? 'border-purple-600' : 'border-gray-300'
                          )}
                        >
                          {response === opt && (
                            <span className="w-2 h-2 rounded-full bg-purple-600" />
                          )}
                        </span>
                        <input
                          type="radio"
                          name="feature"
                          value={opt}
                          checked={response === opt}
                          onChange={() => setResponse(opt)}
                          className="hidden"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 italic">页面下方邮件订阅获取最新资讯！</p>
                  <p className="text-sm text-purple-600 font-medium">你选择了：{response}</p>
                </>
              )}
            </div>

            {/* 提交按钮始终保持位置不变 + 视觉降权 */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitted || submitting}
                className={clsx(
                  'w-[160px] h-[40px] text-sm font-medium text-gray-700',
                  'bg-gray-200 hover:bg-gray-300 transition-all rounded-lg',
                  'flex items-center justify-center',
                  submitted && 'bg-gray-300 cursor-not-allowed'
                )}
              >
                {submitted ? '感谢反馈！' : submitting ? '提交中...' : '提交'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question Selector Section */}
      <section id="selector">
        <h2 className="text-lg font-bold mb-2">Select a question from {selectedPart}</h2>
        
        {/* Part 切换按钮组 */}
        <div className="flex justify-start gap-4 mt-6 w-full">
          {parts.map((p) => (
            <button
              key={p}
              onClick={() => {
                fetchQuestions(p)
                handlePartChange(p)
              }}
              className={`rounded-md text-sm font-semibold border px-5 py-2 transition-all duration-200
                ${
                  selectedPart === p
                    ? 'bg-purple-600 text-white border-transparent shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:shadow-sm'
                }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* "换一组"按钮 */}
        <div className="mt-4">
          <button
            onClick={pickRandomQuestions}
            className="text-sm text-purple-600 hover:underline font-medium"
          >
            换一组
          </button>
        </div>

        {/* 题目卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full items-start mt-4">
          {displayedQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => handleQuestionClick(q)}
              className={questionCardStyle(q.id)}
            >
              <div className="whitespace-pre-wrap break-words">
                {q.questionText}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Answer Display Section */}
      {selectedQuestionId && (
        <section data-answer-section>
          <h2 className="text-lg font-bold mb-2">📚 Reference Answers</h2>
          <div className="space-y-6">
            {answers.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-purple-700 mb-3">{item.level} Answer</h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">
                  {renderWithHighlights(item.text, item.bandHighlightWords, item.bandHighlightNotes)}
                </p>

                {/* Grammar 区块 */}
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
          </div>
        </section>
      )}

      {/* Mobile Sheet for word explanations */}
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