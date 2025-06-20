'use client'

import { useEffect, useState } from 'react'
import NewIELTSHeader from './components/NewIELTSHeader'
import NewQuestionSelector from './components/NewQuestionSelector'
import NewAnswerDisplay from './components/NewAnswerDisplay'
import { Toaster } from 'sonner'

interface QuestionItem {
  id: string
  questionText: string
}

export default function NewIELTSSpeakingPage() {
  const [selectedPart, setSelectedPart] = useState<'Part 1' | 'Part 2' | 'Part 3'>('Part 2')
  const [selectedQuestionText, setSelectedQuestionText] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuestionItem[]>([])

  const fetchQuestions = async (part: 'Part 1' | 'Part 2' | 'Part 3') => {
    try {
      const res = await fetch(`/api/new-ielts-speaking/supabase-list-questions?part=${encodeURIComponent(part)}`)
      const data = await res.json()
      const items = data.items || []
      setQuestions(items)

      if (part === 'Part 2' && selectedQuestionText === null && items.length > 0) {
        const random = items[Math.floor(Math.random() * items.length)]
        setSelectedQuestionText(random.questionText)
      }
    } catch (error) {
      console.error('❌ 获取题目失败:', error)
    }
  }

  useEffect(() => {
    fetchQuestions(selectedPart)
  }, [])

  return (
    <main className="flex flex-col justify-start gap-8 p-6 max-w-7xl mx-auto font-sans text-gray-800 scroll-smooth">
      <Toaster />

      {/* 顶部页头 */}
      <NewIELTSHeader />

      {/* 题目选择区 */}
      <section id="selector">
        <h2 className="text-lg font-bold mb-2">Select a question from {selectedPart}</h2>
        <NewQuestionSelector
          part={selectedPart}
          onSelect={(_, text) => setSelectedQuestionText(text)}
          onPartChange={(newPart) => setSelectedPart(newPart)} // ✅ 仅新增此行
        />
      </section>

      {/* 参考答案 */}
      {selectedQuestionText && (
        <section>
          <h2 className="text-lg font-bold mb-2">📚 Reference Answers</h2>
          <NewAnswerDisplay questionText={selectedQuestionText} />
        </section>
      )}

      {/* Footer锚点 */}
      <section id="footer" className="mt-20 space-y-4">
        <div className="text-center text-sm text-gray-400 italic">
          You're now at the bottom. Thanks for exploring!
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-500">
          <span>属于你自己的，考场才能脱口而出 →</span>
          <a
            href="/new-ielts-speaking/custom-answer"
            className="text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-700
                       hover:scale-105 transition-transform rounded-full px-5 py-2 shadow-md
                       flex items-center justify-center"
          >
            口语私人定制
          </a>
        </div>
      </section>
    </main>
  )
}
