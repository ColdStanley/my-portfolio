'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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

interface Props {
  questionData: Question[]
  selectedPassage: string
  selectedQuestionType: string
}

export default function ReadingQuestionPanel({ questionData, selectedPassage, selectedQuestionType }: Props) {
  const [timer, setTimer] = useState<number>(0)
  const [remaining, setRemaining] = useState<number>(0)
  const [started, setStarted] = useState(false)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showAnswers, setShowAnswers] = useState(false)
  const [showWords, setShowWords] = useState(false)
  const [showPhrases, setShowPhrases] = useState(false)

  const filtered = questionData.filter(q => {
    return (!selectedPassage || q.Passage === selectedPassage) && (!selectedQuestionType || q.题型 === selectedQuestionType)
  })

  const handleStart = () => {
    const total = filtered.length * 75
    setTimer(total)
    setRemaining(total)
    setStarted(true)
    setShowAnswers(false)
    setShowWords(false)
    setShowPhrases(false)
  }

  const handleSubmit = () => {
    setShowAnswers(true)
  }

  useEffect(() => {
    if (!started || remaining <= 0) return
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [started, remaining])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        {!started && (
          <button onClick={handleStart} className="px-5 py-2 rounded-xl bg-purple-600 text-white shadow hover:bg-purple-700 transition">
            开始答题
          </button>
        )}

        {started && remaining > 0 && (
          <div className="text-lg font-semibold text-purple-600">倒计时：{formatTime(remaining)}</div>
        )}

        {started && !showAnswers && (
          <button onClick={handleSubmit} className="px-5 py-2 rounded-xl bg-green-600 text-white shadow hover:bg-green-700 transition">
            提交
          </button>
        )}

        {showAnswers && (
          <div className="flex gap-4">
            <button onClick={() => setShowWords(prev => !prev)} className="px-4 py-1 rounded-xl bg-yellow-400 text-black shadow hover:bg-yellow-500 transition">
              单词
            </button>
            <button onClick={() => setShowPhrases(prev => !prev)} className="px-4 py-1 rounded-xl bg-blue-400 text-white shadow hover:bg-blue-500 transition">
              词组
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {filtered.map((q, i) => (
          <div key={i} className="border border-purple-200 rounded-xl shadow-md p-4 space-y-2">
            <div className="text-sm font-medium text-gray-700">题号 {q.题号}</div>
            <div className="text-base font-semibold text-purple-700">{q.题目}</div>
            <textarea
              rows={2}
              className="w-full mt-2 p-2 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              placeholder="请输入你的答案"
              value={userAnswers[q.题号] || ''}
              onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.题号]: e.target.value }))}
              disabled={showAnswers}
            />
            {showAnswers && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-1 text-sm text-gray-600"
                >
                  <div>✅ 正确答案：<span className="font-semibold text-green-600">{q.答案}</span></div>
                  <div>📖 答案句：{q.答案句}</div>
                  {showWords && q.单词 && (
                    <div>🔤 单词：{q.单词}</div>
                  )}
                  {showPhrases && q.词组 && (
                    <div>🧩 词组：{q.词组}</div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
