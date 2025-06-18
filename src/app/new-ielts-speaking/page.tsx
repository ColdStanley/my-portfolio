'use client'

import { useEffect, useState } from 'react'
import NewIELTSHeader from './components/NewIELTSHeader'
import NewQuestionSelector from './components/NewQuestionSelector'
import NewAnswerDisplay from './components/NewAnswerDisplay'
import { Toaster } from 'sonner' // ✅ Toast 支持

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
      const res = await fetch(`/api/new-ielts-speaking/list?part=${part}`)
      const data = await res.json()
      const items = data.items || []
      setQuestions(items)

      // ✅ 初始加载默认选择一道 Part 2 题目
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
      <Toaster /> {/* ✅ 启用 toast 提示 */}

      {/* 顶部页头 */}
      <NewIELTSHeader />

      {/* ✅ 题目选择区（锚点定位） */}
      <section id="selector">
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

      {/* ✅ 参考答案显示 */}
      {selectedQuestionText && (
        <section>
          <h2 className="text-lg font-bold mb-2">📚 Reference Answers</h2>
          <NewAnswerDisplay questionText={selectedQuestionText} />
        </section>
      )}

      {/* ✅ Footer锚点区域（用于 Suggest a Topic 跳转） */}
      <section id="footer" className="mt-20">
        {/* 留空占位，实际页脚已由全局 Footer.tsx 渲染 */}
        <div className="text-center text-sm text-gray-400 italic">
          You're now at the bottom. Thanks for exploring!
        </div>
      </section>
    </main>
  )
}
