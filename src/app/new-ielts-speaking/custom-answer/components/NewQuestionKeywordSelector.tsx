'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface QuestionItem {
  id: string
  questionText: string
}

interface Props {
  part: 'Part 1' | 'Part 2' | 'Part 3'
  onKeywordsReady: (
    keywords: string[],
    questionText: string,
    part: 'Part 1' | 'Part 2' | 'Part 3'
  ) => void
}

export default function NewQuestionKeywordSelector({
  part: initialPart,
  onKeywordsReady
}: Props) {
  const [part, setPart] = useState(initialPart)
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([])
  const [displayedQuestions, setDisplayedQuestions] = useState<QuestionItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const fetchQuestions = async (partToFetch: 'Part 1' | 'Part 2' | 'Part 3') => {
    try {
      setPart(partToFetch) // ✅ 保证切换按钮高亮正确
      const res = await fetch(`/api/new-ielts-speaking/list?part=${partToFetch}`)
      const data = await res.json()
      setAllQuestions(data.items || [])
      const shuffled = [...data.items].sort(() => 0.5 - Math.random())
      setDisplayedQuestions(shuffled.slice(0, 3))
      setSelectedId(null)
      setSelectedText('')
    } catch (err) {
      console.error('题库加载失败', err)
    }
  }

  useEffect(() => {
    fetchQuestions(part)
  }, [])

  const handleClick = (q: QuestionItem) => {
    setSelectedId(q.id)
    setSelectedText(q.questionText)
  }

  const handleConfirm = async () => {
    if (!selectedId || !selectedText) return alert('请先选择一道题目')

    setLoading(true)

    try {
      const res = await fetch('/api/new-ielts-speaking/part1-keyword-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: selectedText })
      })

      if (!res.ok) throw new Error('关键词生成失败')

      const data = await res.json()
      onKeywordsReady(data.keywords || [], selectedText, part)
    } catch (err) {
      console.error(err)
      alert('关键词生成出错，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const reshuffleQuestions = () => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random())
    setDisplayedQuestions(shuffled.slice(0, 3))
    setSelectedId(null)
    setSelectedText('')
  }

  const questionCardStyle = (id: string) => `
    cursor-pointer border rounded-xl p-4 text-[15px] font-medium transition
    ${selectedId === id
      ? 'bg-purple-100 border-purple-500 shadow-lg'
      : 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100 hover:shadow-md'}
    text-gray-800
  `

  return (
    <div className="w-full">
      {/* Part 切换按钮 */}
      <div className="flex justify-start gap-4 mt-6 w-full">
        {(['Part 1', 'Part 2', 'Part 3'] as const).map((p) => (
          <button
            key={p}
            onClick={() => fetchQuestions(p)}
            className={`rounded-md text-sm font-semibold border px-5 py-2 transition-all duration-200
              ${part === p
                ? 'bg-purple-600 text-white border-transparent shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:shadow-sm'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 换一组按钮 */}
      <div className="mt-4">
        <button
          onClick={reshuffleQuestions}
          className="text-sm text-purple-600 hover:underline font-medium"
        >
          换一组
        </button>
      </div>

      {/* 题目展示区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 w-full">
        {displayedQuestions.map((q) => (
          <div
            key={q.id}
            onClick={() => handleClick(q)}
            className={questionCardStyle(q.id)}
          >
            {q.questionText}
          </div>
        ))}
      </div>

      {/* 提示文字 */}
      <p className="text-sm text-gray-600 leading-relaxed mt-6">
        请选择 Part 1、Part 2 或 Part 3 的任一题目，点击下方确认按钮开始生成关键词。
      </p>

      {/* 确认按钮 */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full max-w-[400px] mx-auto bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-6 rounded-xl transition-all"
        >
          {loading
            ? '正在召唤关键词，它们有点社恐，请稍等'
            : '确认'}
        </Button>
      </motion.div>
    </div>
  )
}
