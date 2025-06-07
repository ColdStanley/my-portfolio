'use client'

import { useEffect, useState } from 'react'
import IELTSHeader from './components/IELTSHeader'
import ReadingQuestionPanel from './components/ReadingQuestionPanel'

interface Question {
  题号: string
  题目: string
  Passage: string
  题型: string
  答案: string
  答案句: string
  单词?: string
  词组?: string
  剑雅?: string
}

export default function IELTSReadingPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPassage, setSelectedPassage] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const passages = Array.from(new Set(questions.map(q => q.Passage))).filter(Boolean)
  const types = Array.from(new Set(questions
    .filter(q => !selectedPassage || q.Passage === selectedPassage)
    .map(q => q.题型))).filter(Boolean)

  useEffect(() => {
    fetch('/api/notion/page?pageId=ielts-reading')
      .then(res => res.json())
      .then(res => {
        if (res?.data && Array.isArray(res.data)) {
          setQuestions(res.data)
        } else {
          setQuestions([])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="flex flex-col items-start justify-start w-full px-4 md:px-8 py-6 space-y-8">
      {/* 顶部标题区域 */}
      <IELTSHeader />

      {/* 选择区 */}
      <div className="w-full bg-white border border-purple-200 rounded-2xl shadow-md p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Passage 下拉 */}
          <select
            value={selectedPassage}
            onChange={(e) => setSelectedPassage(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm text-gray-700"
          >
            <option value="">选择 Passage</option>
            {passages.map((p, i) => <option key={i} value={p}>{p}</option>)}
          </select>

          {/* 题型 下拉 */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm text-gray-700"
          >
            <option value="">选择题型</option>
            {types.map((t, i) => <option key={i} value={t}>{t}</option>)}
          </select>

          {/* 题目数量展示 */}
          <div className="text-sm text-gray-500 text-center md:text-right">
            共 <span className="font-semibold text-purple-600">{questions.length}</span> 题
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      {!loading ? (
        <ReadingQuestionPanel
          questionData={questions}
          selectedPassage={selectedPassage}
          selectedQuestionType={selectedType}
        />
      ) : (
        <div className="text-center text-purple-600 font-medium animate-pulse w-full py-8">
          📚 题库加载中，请稍候...
        </div>
      )}
    </main>
  )
}
