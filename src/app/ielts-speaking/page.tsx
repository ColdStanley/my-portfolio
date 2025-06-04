'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

export default function IELTS7Page() {
  const [selectedPart, setSelectedPart] = useState<'Part 1' | 'Part 2' | 'Part 3'>('Part 1')
  const [question, setQuestion] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState({
    band5: '', comment5: '',
    band6: '', comment6: '',
    band7: '', comment7: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/ielts-questions?part=${selectedPart}`)
        const data = await res.json()
        const safeQuestions = Array.isArray(data.questions) ? data.questions : []
        const shuffle = (array: string[]) => [...array].sort(() => Math.random() - 0.5)
        setQuestions(shuffle(safeQuestions).slice(0, 8))
      } catch (err) {
        console.error('❌ Failed to fetch questions:', err)
      }
    }
    fetchQuestions()
  }, [selectedPart])

  const handleClick = async () => {
    if (!question) return
    setLoading(true)

    try {
      const res = await fetch('https://ielts-gemini.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part: selectedPart, question })
      })

      if (!res.ok) {
        const errorData = await res.json()
        const msg = errorData?.error || '服务器出错，请稍后再试'
        alert(msg)
        return
      }

      const data = await res.json()
      console.log('返回结果是：', data)

      const fallback = '内容生成失败，请重试'

      setAnswers({
        band5: data.band5 || fallback,
        comment5: data.comment5 || fallback,
        band6: data.band6 || fallback,
        comment6: data.comment6 || fallback,
        band7: data.band7 || fallback,
        comment7: data.comment7 || fallback
      })
    } catch (err) {
      console.error('❌ Fetch failed:', err)
      alert('网络错误或服务器未响应')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center gap-8 p-6 max-w-7xl mx-auto font-sans text-gray-800">
      {/* Top Section: 3 Independent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Left Card */}
        <div className="bg-white shadow rounded-xl p-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-3">
              <h1 className="text-4xl font-extrabold text-purple-600">IELTS Speaking</h1>
              <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Image src="/images/IELTS7.png" alt="IELTS7" width={60} height={60} />
              </motion.div>
            </div>
            <p className="text-xs text-gray-500 pl-1 leading-snug">
              "We are what we repeatedly do. <br />
              我们由我们反复做的事情塑造而成。<br />
              Excellence, then, is not an act, but a habit."<br />
              卓越并非一时之举，而是一种习惯<br />
              —— Aristotle<br />
              亚里士多德
            </p>
          </div>
        </div>

        {/* Center Card */}
        <div className="bg-white shadow rounded-xl p-4 text-center text-gray-700 flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-gray-500 leading-relaxed space-y-1">
            <p>🧑‍💻 一人独立开发，咖啡续命，小猫陪伴。</p>
            <p>🪙 A- 给作者买杯咖啡 7 加元/35元</p>
            <p>🍖 B- 给小猫买袋猫粮 14 加元/70元</p>
            <p>😺 喵～</p>
          </div>
          <div className="flex gap-4 pt-2">
            <Image src="/images/wechat35.png" alt="wechat35" width={90} height={90} />
            <Image src="/images/wechat70.png" alt="wechat70" width={90} height={90} />
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-white shadow rounded-xl p-4 flex items-center justify-center">
          <video
  src="/images/cat.mp4"
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  className="rounded-xl w-full h-auto object-cover"
/>

        </div>
      </div>

      {/* Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-center mt-6">
        <p className="text-base font-semibold text-gray-700 md:text-left text-center">第一步：选择 Part 1, Part 2, or Part 3</p>
        <select
          value={selectedPart}
          onChange={(e) => setSelectedPart(e.target.value as 'Part 1' | 'Part 2' | 'Part 3')}
          className="w-full p-2 rounded-xl border border-purple-500 shadow focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer bg-white text-gray-800 hover:shadow-lg transition"
        >
          <option value="Part 1">Part 1</option>
          <option value="Part 2">Part 2</option>
          <option value="Part 3">Part 3</option>
        </select>
        <p className="text-base font-semibold text-gray-700 md:text-left text-center md:pl-4">第二步：点击左侧题目</p>
      </div>

      {/* Question List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
        <div className="space-y-2">
          {questions.slice(0, 4).map((q, i) => (
            <div key={i} onClick={() => setQuestion(q)} className="cursor-pointer bg-gray-100 hover:bg-purple-100 transition p-3 h-24 rounded-xl text-sm flex items-center">
              {q}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {questions.slice(4, 8).map((q, i) => (
            <div key={i + 4} onClick={() => setQuestion(q)} className="cursor-pointer bg-gray-100 hover:bg-purple-100 transition p-3 h-24 rounded-xl text-sm flex items-center">
              {q}
            </div>
          ))}
        </div>

        <div className="flex flex-col h-full justify-between">
          <textarea
            readOnly
            placeholder="点击左侧，进行题目选择"
            value={question}
            className="w-full h-90 border border-purple-300 px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800"
          />
          <div className="flex justify-between items-end pt-2">
            <p className="text-base font-medium text-gray-700">第三步：确认题目请提交</p>
            <motion.button
              onClick={handleClick}
              className="bg-purple-600 text-white px-6 py-2 rounded-xl shadow hover:bg-purple-700 focus:outline-none disabled:opacity-60"
              disabled={!question || loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? '生成中...' : '提交'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Answer Display: 2-column grid */}
      {[5, 6, 7].map((score) => (
        <div key={score} className="w-full">
          <h3 className="text-lg font-bold text-purple-600 mb-3">{score}分</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-600">{score === 5 ? '参考答案' : '推荐答案'}</p>
              <div className="min-h-[200px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
                {answers[`band${score}` as keyof typeof answers]}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-600">说明</p>
              <div className="min-h-[200px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
                {answers[`comment${score}` as keyof typeof answers]}
              </div>
            </div>
          </div>
        </div>
      ))}
    </main>
  )
}
