'use client'

import { useState } from 'react'

export default function IELTSSpeakingPage() {
  const [selectedPart, setSelectedPart] = useState<'Part 1' | 'Part 2' | 'Part 3' | null>(null)
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState({ band5: '', band6: '', band7: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedPart || !question.trim()) return
    setLoading(true)
    setAnswers({ band5: '', band6: '', band7: '' })

    try {
      const res = await fetch('/api/gemini/ielts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part: selectedPart, question })
      })
      const data = await res.json()
      setAnswers(data)
    } catch (err) {
      console.error('Failed to fetch answers:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">IELTS Speaking - {question || '请输入题目'}</h1>

      <div className="flex gap-4 mb-4">
        {['Part 1', 'Part 2', 'Part 3'].map((part) => (
          <button
            key={part}
            className={`rounded-full px-6 py-2 text-lg shadow-inner border ${selectedPart === part ? 'bg-black text-white' : 'bg-white text-black'}`}
            onClick={() => setSelectedPart(part as 'Part 1' | 'Part 2' | 'Part 3')}
          >
            {part}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="输入雅思口语题目"
          className="border px-4 py-2 rounded w-full"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          className="rounded-full px-6 py-2 bg-black text-white shadow"
          onClick={handleSubmit}
          disabled={!selectedPart || !question.trim() || loading}
        >
          {loading ? '生成中...' : '提交'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['五分版', '六分版', '七分版'].map((label, i) => (
          <div key={i} className="rounded-xl border p-4 min-h-[150px] border-purple-300">
            <h3 className="font-semibold mb-2 text-center">{label}</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-800">
              {answers[`band${i + 5}` as 'band5' | 'band6' | 'band7'] || '暂无内容'}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
