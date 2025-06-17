'use client'

import { useEffect, useState } from 'react'
import NewIELTSHeader from './components/NewIELTSHeader'
import NewQuestionSelector from './components/NewQuestionSelector'
import NewAnswerDisplay from './components/NewAnswerDisplay'

interface QuestionItem {
  id: string
  questionText: string
}

export default function NewIELTSSpeakingPage() {
  const [selectedPart, setSelectedPart] = useState<'Part 1' | 'Part 2' | 'Part 3'>('Part 2') // ✅ 默认选中 Part 2
  const [selectedQuestionText, setSelectedQuestionText] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuestionItem[]>([])

  const fetchQuestions = async (part: 'Part 1' | 'Part 2' | 'Part 3') => {
    try {
      const res = await fetch(`/api/new-ielts-speaking/list?part=${part}`)
      const data = await res.json()
      setQuestions(data.items || [])
    } catch (error) {
      console.error('❌ 获取题目失败:', error)
    }
  }

  useEffect(() => {
    fetchQuestions(selectedPart)
  }, [])

  return (
    <main className="flex flex-col justify-start gap-8 p-6 max-w-7xl mx-auto font-sans text-gray-800">
      {/* ❌ 删除了原先的 Part 按钮区域 */}

      <NewIELTSHeader />

      <section>
        <h2 className="text-lg font-bold mb-2">Select a question from {selectedPart}</h2>
        <NewQuestionSelector
          part={selectedPart}
          onSelect={(_, text) => setSelectedQuestionText(text)}
          questions={questions}
          fetchQuestions={(p) => {
            setSelectedPart(p)
            setSelectedQuestionText(null)
            fetchQuestions(p)
          }}
        />
      </section>

      {selectedQuestionText && (
        <section>
          <h2 className="text-lg font-bold mb-2">📚 Reference Answers</h2>
          <NewAnswerDisplay questionText={selectedQuestionText} />
        </section>
      )}
    </main>
  )
}
