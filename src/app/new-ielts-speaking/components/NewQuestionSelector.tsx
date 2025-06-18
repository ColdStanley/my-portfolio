'use client'

import { useEffect, useState } from 'react'

interface QuestionItem {
  id: string
  questionText: string
}

interface Props {
  part: 'Part 1' | 'Part 2' | 'Part 3'
  onSelect: (id: string, text: string) => void
  questions: QuestionItem[]
  fetchQuestions: (part: 'Part 1' | 'Part 2' | 'Part 3') => void
}

export default function NewQuestionSelector({
  part,
  onSelect,
  questions,
  fetchQuestions
}: Props) {
  const [displayedQuestions, setDisplayedQuestions] = useState<QuestionItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestions(part)
  }, [part])

  useEffect(() => {
    if (questions.length > 0) {
      const shuffled = [...questions].sort(() => 0.5 - Math.random())
      const selected = shuffled[0]
      setDisplayedQuestions(shuffled.slice(0, 3))
      setSelectedId(selected.id)
      onSelect(selected.id, selected.questionText)
    }
  }, [questions])

  const pickRandomQuestions = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    setDisplayedQuestions(shuffled.slice(0, 3))
    setSelectedId(null)
  }

  const handleClick = (q: QuestionItem) => {
    setSelectedId(q.id)
    onSelect(q.id, q.questionText)
    if (window.innerWidth < 768) {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }
  }

  const parts: ('Part 1' | 'Part 2' | 'Part 3')[] = ['Part 1', 'Part 2', 'Part 3']

  const questionCardStyle = (id: string) => `
    cursor-pointer 
    border rounded-md p-4 text-[15px] font-medium transition 
    ${selectedId === id
      ? 'bg-purple-100 border-purple-500 shadow-lg'
      : 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100 hover:shadow-md'
    }
    text-gray-800
  `

  return (
    <>
      {/* Part 切换按钮组 */}
      <div className="flex justify-start gap-4 mt-6 w-full">
        {parts.map((p) => (
          <button
            key={p}
            onClick={() => fetchQuestions(p)}
            className={`rounded-md text-sm font-semibold border px-5 py-2 transition-all duration-200
              ${
                part === p
                  ? 'bg-purple-600 text-white border-transparent shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:shadow-sm'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* “换一组”按钮 */}
      <div className="mt-4">
        <button
          onClick={pickRandomQuestions}
          className="text-sm text-purple-600 hover:underline font-medium"
        >
          换一组
        </button>
      </div>

      {/* 题目卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start mt-4">
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
    </>
  )
}
