'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

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

  const filtered = questionData
    .filter(q => (!selectedPassage || q.Passage === selectedPassage) && (!selectedQuestionType || q.QuestionType === selectedQuestionType))
    .sort((a, b) => {
      const aNum = parseInt(a.QuestionID.replace(/\D/g, ''))
      const bNum = parseInt(b.QuestionID.replace(/\D/g, ''))
      return aNum - bNum
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
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium tracking-wide shadow-md hover:shadow-lg transition"
          >
            开始答题
          </motion.button>
        )}

        {started && remaining > 0 && (
          <div className="text-lg font-semibold text-purple-600">倒计时：{formatTime(remaining)}</div>
        )}

        {started && !showAnswers && (
          <motion.button
            onClick={handleSubmit}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium tracking-wide shadow-md hover:shadow-lg transition"
          >
            提交
          </motion.button>
        )}

        {showAnswers && (
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <motion.button
              onClick={() => setShowWords(prev => !prev)}
              whileHover={{ scale: 1.05 }}
              className="px-5 py-1 rounded-2xl bg-purple-100 text-purple-700 font-medium tracking-wide shadow-sm hover:bg-purple-200 hover:text-purple-800 transition"
            >
              单词
            </motion.button>
            <motion.button
              onClick={() => setShowPhrases(prev => !prev)}
              whileHover={{ scale: 1.05 }}
              className="px-5 py-1 rounded-2xl bg-purple-100 text-purple-700 font-medium tracking-wide shadow-sm hover:bg-purple-200 hover:text-purple-800 transition"
            >
              词组
            </motion.button>
          </motion.div>
        )}
      </div>

      <div className="space-y-6">
        {filtered.map((q, i) => (
          <div key={i} className={`border border-purple-200 rounded-2xl shadow-md p-4 space-y-2 bg-white ${i % 2 === 1 ? 'bg-purple-50' : ''}`}>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="text-sm font-medium text-gray-700">
              题号 {q.QuestionID}
            </motion.div>

            {q.AnswerContext && (
              <motion.div className="text-sm text-gray-500" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                {q.AnswerContext}
              </motion.div>
            )}

            <motion.div className="text-base font-semibold text-purple-700 hover:text-purple-800 transition" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              {q.QuestionText}
            </motion.div>

            <textarea
              rows={2}
              className="w-full mt-2 p-2 border rounded-2xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm font-medium tracking-wide"
              placeholder={started ? "请输入你的答案" : "请先点击“开始答题”"}
              value={userAnswers[q.QuestionID] || ''}
              onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.QuestionID]: e.target.value }))}
              disabled={!started || showAnswers}
            />

            {showAnswers && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }} className="mt-2 space-y-3 text-sm text-gray-600">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                    ✅ 正确答案：<span className="font-semibold text-green-600">{q.Answer}</span>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    📖 答案句：{q.AnswerSentence}
                  </motion.div>

                  {showWords && q.Vocabulary && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
                      <p className="font-medium text-purple-600">🔤 单词：</p>
                      <ul className="list-decimal list-inside space-y-1 text-gray-700">
                        {q.Vocabulary.split(/\n|(?=\d+\.)/).filter(Boolean).map((item, idx) => (
                          <li key={idx}>{item.trim()}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {showPhrases && q.Phrases && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
                      <p className="font-medium text-purple-600">🧩 词组：</p>
                      <ul className="list-decimal list-inside space-y-1 text-gray-700">
                        {q.Phrases.split(/\n|(?=\d+\.)/).filter(Boolean).map((item, idx) => (
                          <li key={idx}>{item.trim()}</li>
                        ))}
                      </ul>
                    </motion.div>
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
