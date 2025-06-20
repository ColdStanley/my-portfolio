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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12 text-base">
      {/* 顶部介绍模块 */}
      <NewIELTSCustomHeader />

      {/* 模块一：题目选择与关键词生成 */}
      <NewQuestionKeywordSelector
        part="Part 1"
        onKeywordsReady={handleQuestionConfirm}
      />

      {/* 模块二：关键词展示 + 用户输入 */}
      {keywords.length > 0 ? (
        <>
          <NewKeywordAndInput
            keywords={keywords}
            onSubmit={handleGenerateAnswers}
            questionText={questionText}
            part={part}
            userInput={userInput}
          />

          {/* ✅ 状态提示：关键词已更新但答案还未生成 */}
          {answers === null && (
            <div className="mt-4 text-sm text-gray-500 italic px-2">
              我们将为你重新生成参考答案，请稍候...
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 p-6 sm:p-8 border border-dashed rounded-2xl bg-purple-50/70 text-purple-900 text-base leading-relaxed shadow-sm transition">
          <p className="font-medium">先从一道你感兴趣的雅思口语题目开始吧～</p>
          <p className="mt-2 text-sm text-purple-700">
            点击上方 <span className="font-semibold">确认生成关键词</span> 后，我们将为你智能梳理关键词，并定制 Band 6 / 7 / 8 的高分参考答案。
          </p>
        </div>
      )}

      {/* 模块三：答案展示 */}
      {answers && (
        <>
          <NewAnswerDisplayCustom answers={answers} />

          {/* ✅ 本轮完成提示 */}
          <div className="mt-6 text-sm text-gray-700 leading-relaxed bg-purple-50 p-4 rounded-xl shadow-inner border border-purple-200">
            <p className="font-semibold text-purple-700 mb-1">本轮定制已完成</p>
            <p>我们刚刚为你生成的答案，是结合你个人输入与关键词定制的。这将有助于你在考场中表达得更加真实、自然、自信。</p>
            <p className="mt-1">建议你认真阅读并理解每个答案，用你自己的方式复述出来。准备好后，点击上方重新选择题目，开启下一轮练习。</p>
          </div>
        </>
      )}
    </section>
  )
}
