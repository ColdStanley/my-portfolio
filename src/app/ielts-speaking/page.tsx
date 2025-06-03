'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const questionBank = {
  'Part 1': ['What is your full name?', 'Where are you from?', 'Do you enjoy your job?'],
  'Part 2': ['Describe a trip you enjoyed recently.', 'Talk about your favorite teacher.', 'Describe a memorable gift you received.'],
  'Part 3': ['Why do people like to travel?', 'What is the role of education in society?', 'How do advertisements affect consumer behavior?']
}

export default function IELTS7Page() {
  const [selectedPart, setSelectedPart] = useState<'Part 1' | 'Part 2' | 'Part 3'>('Part 1')
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState({
    band5: '', comment5: '',
    band6: '', comment6: '',
    band7: '', comment7: ''
  })
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!question) return
    setLoading(true)

    try {
      const res = await fetch('https://fastapi-gemini-api-ielts.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part: selectedPart, question })
      })

      const data = await res.json()

      setAnswers({
        band5: data.band5 || '',
        comment5: data.comment5 || '',
        band6: data.band6 || '',
        comment6: data.comment6 || '',
        band7: data.band7 || '',
        comment7: data.comment7 || ''
      })

    } catch (err) {
      console.error('❌ Gemini fetch failed:', err)
      alert('生成失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center gap-10 p-6 max-w-7xl mx-auto font-sans text-gray-800">
      {/* 顶部居中 Logo + 标题 */}
      <div className="flex flex-row items-center justify-center gap-4 mt-6 mb-2">
        <h1 className="text-3xl font-extrabold text-purple-600">IELTS Speaking</h1>
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Image src="/images/IELTS7.png" alt="IELTS7" width={60} height={60} />
        </motion.div>
      </div>

      {/* 主体布局 */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* 左侧题库区域 */}
        <div className="w-full md:w-1/3 space-y-6">
          {/* Part 按钮 */}
          <div className="flex justify-between px-4 gap-3 items-center">
            {(['Part 1', 'Part 2', 'Part 3'] as const).map((p) => (
              <motion.button
                key={p}
                onClick={() => setSelectedPart(p)}
                className={`w-[120px] h-[40px] px-1 text-base rounded-xl border shadow font-semibold leading-none transition ${
                  selectedPart === p
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {p}
              </motion.button>
            ))}
          </div>

          {/* 题目列表 */}
          <ul className="space-y-2 px-4">
            {questionBank[selectedPart].map((q, idx) => (
              <li
                key={idx}
                onClick={() => setQuestion(q)}
                className="cursor-pointer p-2 rounded-xl bg-gray-100 hover:bg-purple-100 transition"
              >
                {q}
              </li>
            ))}
          </ul>
        </div>

        {/* 右侧答案区域 */}
        <div className="w-full md:w-2/3 flex flex-col justify-start gap-6">
          {/* 输入框 + 按钮 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                className="border border-gray-300 px-4 py-2 rounded-xl w-full max-w-[81%] focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <motion.button
                onClick={handleClick}
                className="bg-purple-600 text-white px-5 py-2 rounded-xl shadow hover:bg-purple-700 focus:outline-none disabled:opacity-50"
                disabled={!question || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? '生成中...' : '生成参考答案'}
              </motion.button>
            </div>
            {loading && (
              <p className="text-sm text-gray-500 mt-1">⏳ 正在生成答案，请稍等...</p>
            )}
          </div>

          {/* 答案显示区域 */}
          {[5, 6, 7].map((score) => (
            <div key={score}>
              <h3 className="text-lg font-bold text-purple-600 mb-3">{score}分</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">
                    {score === 5 ? '参考答案' : '推荐答案'}
                  </p>
                  <div className="min-h-[200px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
                    {answers[`band${score}` as keyof typeof answers] || '⚠️ 内容生成失败，请重试'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">注释</p>
                  <div className="min-h-[200px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
                    {answers[`comment${score}` as keyof typeof answers] || '⚠️ 注释生成失败，请重试'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
