// components/SpeakingQuestionBankView.tsx
'use client'

import { useEffect, useState } from 'react'
import NewIELTSHeader from './NewIELTSHeader'
import NewQuestionSelector from './NewQuestionSelector'
import NewAnswerDisplay from './NewAnswerDisplay'

interface QuestionItem {
  id: string
  questionText: string
}

export default function SpeakingQuestionBankView() {
  const [selectedPart, setSelectedPart] = useState<'Part 1' | 'Part 2' | 'Part 3'>('Part 2')
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [selectedQuestionText, setSelectedQuestionText] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuestionItem[]>([])

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

  const handlePartChange = (newPart: 'Part 1' | 'Part 2' | 'Part 3') => {
    setSelectedPart(newPart)
    fetchQuestions(newPart)
  }

  useEffect(() => {
    fetchQuestions(selectedPart)
  }, [selectedPart])

  return (
    <div className="space-y-10">
      <NewIELTSHeader />

      <section id="selector">
        <h2 className="text-lg font-bold mb-2">Select a question from {selectedPart}</h2>
        <NewQuestionSelector
          part={selectedPart}
          onSelect={(id, text) => {
            setSelectedQuestionId(id)
            setSelectedQuestionText(text)
          }}
          onPartChange={handlePartChange}
        />
      </section>

      {selectedQuestionId && (
        <section>
          <h2 className="text-lg font-bold mb-2">📚 Reference Answers</h2>
          <NewAnswerDisplay questionId={selectedQuestionId} />
        </section>
      )}
    </div>
  )
}
