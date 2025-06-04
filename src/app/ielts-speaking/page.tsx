"use client"

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
export const dynamic = "force-dynamic"

const questionBank = {
  'Part 1': [
    'What is your favorite season of the year?',
    'Do you enjoy reading books?',
    'What kind of TV programs do you watch?',
    'Do you use social media a lot?',
    'Do you live in a house or an apartment?',
    'How do you usually get around your city?',
    'Do you like your hometown? Why or why not?',
    'What is your favorite food?',
    'Do you prefer coffee or tea?'
  ],
  'Part 2': [
    'Describe a piece of technology you find useful',
    'Describe a place in your hometown that you often visit',
    'Describe a sportsperson you respect',
    'Describe a building you like and find interesting',
    'Describe a skill you learned that took a long time',
    'Describe a period of time you worked hard to achieve something',
    'Describe an event that changed your opinion about something',
    'Describe a quiet place where you like to spend time',
    'Describe a goal you would like to achieve in the future'
  ],
  'Part 3': [
    'How can governments encourage people to protect the environment',
    'What are the effects of advertising on consumer behavior',
    'How important is teamwork in the workplace',
    'What are the main challenges in balancing work and family life',
    'How does social media impact the way people interact',
    'Why do some people prefer online shopping over traditional shopping',
    'What makes a good leader in your opinion',
    'How do public transport systems affect urban life',
    'Why do some people avoid taking risks in life'
  ]
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
      const res = await fetch('https://ielts-gemini.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part: selectedPart, question })
      })
      const data = await res.json()

      setAnswers({
        band5: data.band5 || '由于请求人数过多，请再次提交',
        comment5: data.comment5 || '由于请求人数过多，请再次提交',
        band6: data.band6 || '由于请求人数过多，请再次提交',
        comment6: data.comment6 || '由于请求人数过多，请再次提交',
        band7: data.band7 || '由于请求人数过多，请再次提交',
        comment7: data.comment7 || '由于请求人数过多，请再次提交'
      })
    } catch (err) {
      console.error('❌ Fetch failed:', err)
      alert('生成失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const displayQuestions = questionBank[selectedPart].slice(0, 8)

  return (
    <main className="flex flex-col items-center justify-center gap-8 p-6 max-w-7xl mx-auto font-sans text-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start w-full">
        <div className="flex flex-row items-center gap-3">
          <h1 className="text-3xl font-extrabold text-purple-600">IELTS Speaking</h1>
          <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Image src="/images/IELTS7.png" alt="IELTS7" width={60} height={60} />
          </motion.div>
        </div>
        <div className="text-center text-gray-600">
          <p className="text-base italic">“Practice makes perfect.”<br />熟能生巧。</p>
        </div>


        <div className="flex items-start gap-3 mt-2">
  <div className="text-sm text-gray-500 leading-relaxed space-y-1">
    <p>🧑‍💻 一人独立开发，咖啡续命，小猫陪伴。</p>
    <p>🪙 A- 给作者买杯咖啡6美金（35元）</p>
    <p>🍖 B- 给小猫买袋猫粮10美金（60元）</p>
    <p>📮 欢迎发邮件给我提吐槽bug<br/>stanleytonight@hotmail.com</p>
    <p>😺 喵～</p>
  </div>
  <video src="/images/cat.mp4" autoPlay muted loop className="rounded-xl" style={{ maxWidth: '120px', height: 'auto' }} />
</div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-center">
        <p className="text-lg font-semibold text-gray-700 md:text-left text-center">第一步：选择 Part 1, Part 2, or Part 3</p>
        <select
          value={selectedPart}
          onChange={(e) => setSelectedPart(e.target.value as 'Part 1' | 'Part 2' | 'Part 3')}
          className="w-full p-2 rounded-xl border border-purple-500 shadow focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer bg-white text-gray-800 hover:shadow-lg transition"
        >
          <option value="Part 1">Part 1</option>
          <option value="Part 2">Part 2</option>
          <option value="Part 3">Part 3</option>
        </select>
        <p className="text-lg font-semibold text-gray-700 md:text-left text-center md:pl-4">第二步：点击左侧题目</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">
        <div className="space-y-2">
          {displayQuestions.slice(0, 4).map((q, i) => (
            <div key={i} onClick={() => setQuestion(q)} className="cursor-pointer bg-gray-100 hover:bg-purple-100 transition p-3 h-24 rounded-xl text-sm flex items-center">
              {q}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {displayQuestions.slice(4, 8).map((q, i) => (
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
            className="w-full h-96 border border-purple-300 px-4 py-3 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-800"
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

      {[5, 6, 7].map((score) => (
        <div key={score} className="w-full">
          <h3 className="text-lg font-bold text-purple-600 mb-3">{score}分</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-600">{score === 5 ? '参考答案' : '推荐答案'}</p>
              <div className="min-h-[200px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
                {answers[`band${score}` as keyof typeof answers]}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-600">注释</p>
              <div className="min-h-[200px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
                {answers[`comment${score}` as keyof typeof answers]}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-600">词汇</p>
              <div className="min-h-[200px] bg-white border border-purple-300 rounded-xl p-4 text-sm text-gray-400 italic">
                词汇功能开发中...
              </div>
            </div>
          </div>
        </div>
      ))}
    </main>
  )
}
