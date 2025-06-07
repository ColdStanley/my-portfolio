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
  selectedBook: string
  selectedTest: string
  resetSignal: number
}

export default function ReadingQuestionPanel({ questionData, selectedPassage, selectedQuestionType, selectedBook, selectedTest, resetSignal }: Props) {
  const [timer, setTimer] = useState<number>(0)
  const [remaining, setRemaining] = useState<number>(0)
  const [started, setStarted] = useState(false)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showAnswers, setShowAnswers] = useState(false)
  const [showWords, setShowWords] = useState(false)
  const [showPhrases, setShowPhrases] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const filtered = questionData
    .filter(q =>
      (!selectedBook || q.Book === selectedBook) &&
      (!selectedTest || q.Test === selectedTest) &&
      (!selectedPassage || q.Passage === selectedPassage) &&
      (!selectedQuestionType || q.QuestionType === selectedQuestionType))
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
    setTimeUp(false)
  }

  const handleSubmit = () => {
    setShowAnswers(true)
    setStarted(false)
    if (intervalId) clearInterval(intervalId)
    setRemaining(0)
  }

  useEffect(() => {
    if (!started || remaining <= 0) return
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id)
          setTimeUp(true)
          setStarted(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setIntervalId(id)
    return () => clearInterval(id)
  }, [started])

  useEffect(() => {
    const total = filtered.length * 75
    setStarted(false)
    setRemaining(0)
    setTimer(0)
    setUserAnswers({})
    setShowAnswers(false)
    setShowWords(false)
    setShowPhrases(false)
    setTimeUp(false)
    if (intervalId) clearInterval(intervalId)
  }, [resetSignal])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-start">
        {!started && !showAnswers && (
          <motion.button
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium tracking-wide shadow-md hover:shadow-lg transition"
          >
            开始答题
          </motion.button>
        )}

        {!started && showAnswers && (
          <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 text-white font-medium tracking-wide shadow-md">
            请重新选择题目
          </div>
        )}

        {showAnswers && (
          <motion.button
            onClick={() => setShowWords(prev => !prev)}
            whileHover={{ scale: 1.05 }}
            className="px-5 py-1 rounded-2xl bg-purple-100 text-purple-700 font-medium tracking-wide shadow-sm hover:bg-purple-200 hover:text-purple-800 transition"
          >
            学习单词
          </motion.button>
        )}

        {showAnswers && (
          <motion.button
            onClick={() => setShowPhrases(prev => !prev)}
            whileHover={{ scale: 1.05 }}
            className="px-5 py-1 rounded-2xl bg-purple-100 text-purple-700 font-medium tracking-wide shadow-sm hover:bg-purple-200 hover:text-purple-800 transition"
          >
            学习词组
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

        {timeUp && !showAnswers && (
          <div className="text-sm text-gray-500 italic">
            时间到，请提交。最后的音符已经落下，请让你的乐章在此刻完美终场。
          </div>
        )}
      </div>

      <div className="space-y-6">
        {filtered.map((q, i) => {
          const userInput = (userAnswers[q.QuestionID] || '').trim().toLowerCase()
          const correctAnswer = q.Answer.trim().toLowerCase()
          const isCorrect = userInput === correctAnswer

          return (
            <div key={i} className={`border border-purple-200 rounded-2xl shadow-md p-4 space-y-2 bg-white ${i % 2 === 1 ? 'bg-purple-50' : ''}`}>
              <div className="text-sm font-medium text-gray-700">题号 {q.QuestionID}</div>

              {q.AnswerContext && (
                <div className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                  {q.AnswerContext}
                </div>
              )}

              <div className="text-base font-semibold text-purple-700 whitespace-pre-line">
                {q.QuestionText}
              </div>

              <textarea
                rows={2}
                className="w-full mt-2 p-2 border rounded-2xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                placeholder={started ? '请输入你的答案' : '请先点击“开始答题”'}
                value={userAnswers[q.QuestionID] || ''}
                onChange={(e) => setUserAnswers(prev => ({ ...prev, [q.QuestionID]: e.target.value }))}
                disabled={!started || showAnswers || timeUp}
              />

              {showAnswers && (
                <div className="mt-2 space-y-2 text-sm text-gray-700">
                  <div className="text-purple-600 italic">
                    {isCorrect
                      ? '答对了，每一次正确的选择，都在塑造更清晰的你。'
                      : '答错了，这个答案很有创意，但出题人不是这么想的。'}
                  </div>

                  <div className="text-purple-700">
                    正确答案：<span className="font-semibold">{q.Answer}</span>
                  </div>

                  <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                    📖 答案句：{q.AnswerSentence}
                  </div>

                  {showWords && q.Vocabulary && (
                    <div>
                      <div className="font-medium text-purple-800">🔤 单词：</div>
                      <div className="whitespace-pre-line">{q.Vocabulary}</div>
                    </div>
                  )}

                  {showPhrases && q.Phrases && (
                    <div>
                      <div className="font-medium text-purple-800">🧩 词组：</div>
                      <div className="whitespace-pre-line">{q.Phrases}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
