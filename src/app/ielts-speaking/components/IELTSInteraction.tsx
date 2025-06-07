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
      const res = await fetch(`/api/ielts-speaking-questions?part=${part}`)
      const data = await res.json()
      console.log('[调试] raw questions data from API:', data.questions)

      const safeQuestions = Array.isArray(data.questions) ? data.questions : []
      const shuffle = (array: string[]) => [...array].sort(() => Math.random() - 0.5)
      const count = part === 'Part 2' ? 6 : 8
      const shuffled = shuffle(safeQuestions).slice(0, count)
console.log('[调试] shuffled and sliced:', shuffled)
setQuestions(shuffled)
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
        body: JSON.stringify({
          part: selectedPart,
          question,
          band: '5'
        })
      })

      const data = await res.json()
      console.log('[Debug] Gemini 原始返回数据:', data)

      const fallback = '内容生成失败，请重试'
      setAnswers((prev) => ({
        ...prev,
        band5: data.band5 || fallback,
        comment5: data.comment5 || fallback,
        vocab5: data.vocab5 || fallback
      }))
    } catch (err) {
      console.error('❌ Gemini 请求失败:', err)
      alert('服务器错误，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (band: number) => {
    if (!question) return
    setLoading(true)

    try {
      const res = await fetch('https://ielts-gemini.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: selectedPart,
          question,
          band: band.toString()
        })
      })

      const data = await res.json()
      console.log('[Debug] Gemini 返回数据:', data)

      const fallback = '内容生成失败，请重试'

      if (band === 6) {
        setAnswers((prev) => ({
          ...prev,
          band6: data.band6 || fallback,
          comment6: data.comment6 || fallback,
          vocab6: data.vocab6 || fallback
        }))
      } else if (band === 7) {
        setAnswers((prev) => ({
          ...prev,
          band7: data.band7 || fallback,
          comment7: data.comment7 || fallback,
          vocab7: data.vocab7 || fallback
        }))
      }
    } catch (err) {
      console.error('❌ Gemini 请求失败:', err)
      alert('服务器错误，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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

      <AnswerSection
        answers={answers}
        resultRef={resultRef}
        question={question}
        loading={loading}
        onGenerate={(band) => {
          if (band === 5) {
            handleClick()
          } else {
            handleGenerate(band)
          }
        }}
      />
    </>
  )
}
