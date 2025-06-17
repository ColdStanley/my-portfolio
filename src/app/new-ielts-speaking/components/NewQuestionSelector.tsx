'use client'

import { useEffect } from 'react'

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
  // 初始加载自动拉取 Part 2
  useEffect(() => {
    if (part === 'Part 2') {
      fetchQuestions('Part 2')
    }
  }, [])

  const handleClick = (q: QuestionItem) => {
    onSelect(q.id, q.questionText)
    if (window.innerWidth < 768) {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
    }
  }

  const parts: ('Part 1' | 'Part 2' | 'Part 3')[] = ['Part 1', 'Part 2', 'Part 3']

  const questionCardStyle = `
    cursor-pointer 
    bg-purple-50 border border-purple-200 
    hover:border-purple-400 hover:bg-purple-100 hover:shadow-md 
    transition rounded-md 
    p-4 text-[15px] text-gray-800 font-medium
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

      {/* 题目卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start mt-6">
        {questions.map((q, i) => (
          <div
            key={i}
            onClick={() => handleClick(q)}
            className={questionCardStyle}
          >
            {q.questionText}
          </div>
        ))}
      </div>
    </>
  )
}
