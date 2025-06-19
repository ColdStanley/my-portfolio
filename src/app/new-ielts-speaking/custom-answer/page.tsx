'use client'

import { useState } from 'react'
import NewQuestionKeywordSelector from './components/NewQuestionKeywordSelector'
import NewKeywordAndInput from './components/NewKeywordAndInput'
import NewAnswerDisplayCustom from './components/NewAnswerDisplayCustom'
import NewIELTSCustomHeader from './components/NewIELTSCustomHeader'

export default function CustomAnswerPage() {
  const [part, setPart] = useState<'Part 1' | 'Part 2' | 'Part 3'>('Part 1')
  const [questionText, setQuestionText] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [userInput, setUserInput] = useState('')
  const [answers, setAnswers] = useState<{
    band6: string
    band7: string
    band8: string
  } | null>(null)

  const handleQuestionConfirm = (
    generatedKeywords: string[],
    text: string,
    partFromSelector: 'Part 1' | 'Part 2' | 'Part 3'
  ) => {
    setQuestionText(text)
    setKeywords(generatedKeywords)
    setPart(partFromSelector)
    setAnswers(null)
  }

  const handleGenerateAnswers = async (prompt: string) => {
    try {
      const res = await fetch('/api/new-ielts-speaking/custom-answer-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      setAnswers({
        band6: data.band6,
        band7: data.band7,
        band8: data.band8,
      })
    } catch (err) {
      console.error('生成答案失败', err)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 text-base">
      {/* 顶部介绍模块 */}
      <NewIELTSCustomHeader />

      {/* 模块一：题目选择与关键词生成 */}
      <NewQuestionKeywordSelector
        part="Part 1"
        onKeywordsReady={handleQuestionConfirm}
      />

      {/* 模块二：关键词展示 + 用户输入 */}
      {keywords.length > 0 ? (
        <NewKeywordAndInput
          keywords={keywords}
          onSubmit={handleGenerateAnswers}
          questionText={questionText}
          part={part}
          userInput={userInput}
        />
      ) : (
        <div className="mt-10 p-4 border border-dashed rounded-xl bg-purple-50 text-purple-800 text-sm sm:text-base leading-relaxed">
          <p>👋 先从一题你感兴趣的口语题目开始吧～</p>
          <p className="mt-2">
            点击上方“确认”后，我们将帮你梳理关键词，为你量身打造 3 个不同层次的参考回答。
          </p>
        </div>
      )}

      {/* 模块三：答案展示 */}
      {answers && <NewAnswerDisplayCustom answers={answers} />}
    </section>
  )
}
