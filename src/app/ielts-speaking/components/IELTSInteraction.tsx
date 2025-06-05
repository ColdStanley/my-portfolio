'use client'

import { useEffect, useRef, useState } from 'react'
import QuestionSelector from './QuestionSelector'
import AnswerSection from './AnswerSection'


export default function IELTSInteraction() {
  const [selectedPart, setSelectedPart] = useState<'Part 1' | 'Part 2' | 'Part 3'>('Part 1')
  const [question, setQuestion] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState({
    band5: '', comment5: '', vocab5: '',
    band6: '', comment6: '', vocab6: '',
    band7: '', comment7: '', vocab7: ''
  })
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const fetchQuestions = async (part: 'Part 1' | 'Part 2' | 'Part 3') => {
    try {
      const res = await fetch(`/api/ielts-questions?part=${part}`)
      const data = await res.json()
      const safeQuestions = Array.isArray(data.questions) ? data.questions : []
      const shuffle = (array: string[]) => [...array].sort(() => Math.random() - 0.5)
      const count = part === 'Part 2' ? 6 : 8
      setQuestions(shuffle(safeQuestions).slice(0, count))
      setQuestion('')
    } catch (err) {
      console.error('❌ Failed to fetch questions:', err)
    }
  }

  useEffect(() => {
    fetchQuestions(selectedPart)
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

      const raw = await res.text()
      let data = {}
      try {
        data = JSON.parse(raw)
      } catch (e) {
        alert("服务器返回了非 JSON 格式，可能是报错页面")
        return
      }

      const fallback = '内容生成失败，请重试'
      setAnswers({
        band5: data.band5 || fallback,
        comment5: data.comment5 || fallback,
        vocab5: data.vocab5 || fallback,
        band6: data.band6 || fallback,
        comment6: data.comment6 || fallback,
        vocab6: data.vocab6 || fallback,
        band7: data.band7 || fallback,
        comment7: data.comment7 || fallback,
        vocab7: data.vocab7 || fallback
      })

      if (window.innerWidth < 768) {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      }

    } catch (err) {
      alert('网络错误或服务器未响应')
    } finally {
      setLoading(false)
    }
  }

 

  return (
    <>
      {/* 下拉选择 + 刷新 */}
      <QuestionSelector
  selectedPart={selectedPart}
  setSelectedPart={setSelectedPart}
  question={question}
  setQuestion={setQuestion}
  questions={questions}
  setQuestions={setQuestions}
  scrollRef={scrollRef}
  handleClick={handleClick}
  loading={loading}
  fetchQuestions={fetchQuestions}
/>

     

      {/* 结果区域 */}
      <AnswerSection answers={answers} resultRef={resultRef} />

    </>
  )
}
