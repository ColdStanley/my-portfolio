'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import IELTSHeader from './components/IELTSHeader'
import ReadingSelector from './components/ReadingSelector'
import ReadingQuestionPanel from './components/ReadingQuestionPanel'

interface Question {
  QuestionID: string
  QuestionText: string
  Passage: string
  QuestionType: string
  Answer: string
  AnswerSentence: string
  AnswerContext?: string
  Vocabulary?: string
  Phrases?: string
  Book?: string
  Test?: string
}

export default function IELTSReadingPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedBook, setSelectedBook] = useState('')
  const [selectedTest, setSelectedTest] = useState('')
  const [selectedPassage, setSelectedPassage] = useState('')
  const [selectedQuestionType, setSelectedQuestionType] = useState('')

  // 用于通知子组件“筛选项已变更”，触发答题状态重置
  const [resetSignal, setResetSignal] = useState(0)

  useEffect(() => {
    fetch('/api/ielts-reading-questions')
      .then((res) => res.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setQuestions(res.data)
        } else {
          setQuestions([])
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const availableTypes = Array.from(new Set(
      questions
        .filter(q =>
          (!selectedBook || q.Book === selectedBook) &&
          (!selectedTest || q.Test === selectedTest) &&
          (!selectedPassage || q.Passage === selectedPassage)
        )
        .map(q => q.QuestionType)
        .filter(Boolean)
    ))

    if (selectedQuestionType && !availableTypes.includes(selectedQuestionType)) {
      setSelectedQuestionType('') // 自动清空
      handleFilterChange()        // 通知子组件更新
    }
  }, [selectedBook, selectedTest, selectedPassage])

  const filtered = questions.filter((q) => {
    return (
      (!selectedBook || q.Book === selectedBook) &&
      (!selectedTest || q.Test === selectedTest) &&
      (!selectedPassage || q.Passage === selectedPassage) &&
      (!selectedQuestionType || q.QuestionType === selectedQuestionType)
    )
  })

  const hasSelection = selectedBook || selectedTest || selectedPassage || selectedQuestionType

  // 筛选项变更时触发，通知子组件重置
  const handleFilterChange = () => {
    setResetSignal((prev) => prev + 1) // 每次变化 +1，子组件监听变化
  }

  return (
    <main className="flex flex-col items-start justify-start w-full px-4 md:px-8 py-6 space-y-8">
      {/* 顶部标题区域 */}
      <IELTSHeader />

      {/* 选择区 */}
      <ReadingSelector
        selectedBook={selectedBook}
        setSelectedBook={(v) => {
          setSelectedBook(v)
          handleFilterChange()
        }}
        selectedTest={selectedTest}
        setSelectedTest={(v) => {
          setSelectedTest(v)
          handleFilterChange()
        }}
        selectedPassage={selectedPassage}
        setSelectedPassage={(v) => {
          setSelectedPassage(v)
          handleFilterChange()
        }}
        selectedQuestionType={selectedQuestionType}
        setSelectedQuestionType={(v) => {
          setSelectedQuestionType(v)
          handleFilterChange()
        }}
        questionData={questions}
      />

      {/* 主内容区域 */}
      {!loading ? (
        hasSelection ? (
          filtered.length > 0 ? (
            <ReadingQuestionPanel
              questionData={filtered}
              selectedPassage={selectedPassage}
              selectedQuestionType={selectedQuestionType}
              selectedBook={selectedBook}
              selectedTest={selectedTest}
              resetSignal={resetSignal} // 新增：传递重置信号
            />
          ) : (
            <motion.div
              className="text-center text-gray-500 w-full py-12 text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              题目更新中，请稍后再试。
            </motion.div>
          )
        ) : (
          <motion.div
            className="text-center text-gray-600 w-full py-12 text-lg max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            请选择剑桥雅思编号，或者 Test、Passage、题型。<br />
            完全由你掌控。
          </motion.div>
        )
      ) : (
        <div className="text-center text-purple-500 font-medium animate-pulse w-full py-8">
          题库加载中，请稍候...
        </div>
      )}
    </main>
  )
}
