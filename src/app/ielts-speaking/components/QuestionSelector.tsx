'use client'

import { useEffect } from 'react'

interface Props {
  selectedPart: 'Part 1' | 'Part 2' | 'Part 3'
  setSelectedPart: (part: 'Part 1' | 'Part 2' | 'Part 3') => void
  question: string
  setQuestion: (q: string) => void
  questions: string[]
  setQuestions: (qs: string[]) => void
  scrollRef: React.RefObject<HTMLTextAreaElement>
  fetchQuestions: (part: 'Part 1' | 'Part 2' | 'Part 3') => void
}

export default function QuestionSelector({
  selectedPart,
  setSelectedPart,
  question,
  setQuestion,
  questions,
  setQuestions,
  scrollRef,
  fetchQuestions
}: Props) {
  useEffect(() => {
    fetchQuestions(selectedPart)
  }, [selectedPart])

  const handleQuestionClick = (q: string) => {
    setQuestion(q)
    if (window.innerWidth < 768) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const questionCardStyle = `cursor-pointer bg-gray-100 hover:bg-purple-100 transition p-3 rounded-xl text-sm flex items-center ${selectedPart === 'Part 2' ? 'h-33' : 'h-24'}`

  return (
    <>
      {/* 下拉选择 + 刷新 */}
      <div className="w-full flex flex-col md:flex-row items-center justify-start md:justify-between gap-4 mt-6">
        <select
          value={selectedPart}
          onChange={(e) => setSelectedPart(e.target.value as 'Part 1' | 'Part 2' | 'Part 3')}
          className="w-full md:w-[66.24%] p-2 rounded-xl border border-purple-500 shadow focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer bg-white text-gray-800 hover:shadow-lg transition"
        >
          <option value="" disabled hidden>请选择 Part 1, Part 2 or Part 3</option>
          <option value="Part 1">Part 1</option>
          <option value="Part 2">Part 2</option>
          <option value="Part 3">Part 3</option>
        </select>

        <button
          onClick={() => fetchQuestions(selectedPart)}
          className="w-full md:w-[32%] px-4 py-2 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 shadow hover:shadow-lg transition-all text-center"
        >
          刷新题目
        </button>
      </div>

      {/* 题目卡片 + 文本框 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
        <div className="space-y-2">
          {questions.slice(0, selectedPart === 'Part 2' ? 3 : 4).map((q, i) => (
            <div key={i} onClick={() => handleQuestionClick(q)} className={questionCardStyle}>
              {q}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {questions.slice(selectedPart === 'Part 2' ? 3 : 4).map((q, i) => (
            <div key={i + (selectedPart === 'Part 2' ? 3 : 4)} onClick={() => handleQuestionClick(q)} className={questionCardStyle}>
              {q}
            </div>
          ))}
        </div>
        <div className="flex flex-col h-full justify-between">
          <textarea
            ref={scrollRef}
            readOnly
            placeholder="点击题目"
            value={question}
            className="w-full h-90 border border-purple-300 px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800"
          />
        </div>
      </div>
    </>
  )
}
