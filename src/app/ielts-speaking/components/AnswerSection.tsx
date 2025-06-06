'use client'

import { useState } from 'react'

interface Props {
  answers: Record<string, string>
  onGenerate: (band: number) => void
  resultRef: React.RefObject<HTMLDivElement>
  question: string
  loading: boolean
}

export default function AnswerSection({ answers, onGenerate, resultRef, question, loading }: Props) {
  const bandDisplay = (score: number) => {
    const answer = answers[`band${score}`] || ''
    const comment = answers[`comment${score}`] || ''
    const vocab = answers[`vocab${score}`] || ''

    if (!answer && !comment && !vocab) return '尚未生成内容，请点击下方按钮生成。'

    return `
【参考答案】
${answer}

【说明】
${comment}

【Vocabulary Highlights】
${vocab}
    `.trim()
  }

  return (
    <>
      <div ref={resultRef} className="w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-6">
        {/* 5分列 */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-purple-600">5分 评分段答案</h3>
          <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
            {bandDisplay(5)}
          </div>
          <button
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            onClick={() => onGenerate(5)}
            disabled={!question || loading}
          >
            {loading ? '生成中...' : '生成5分版'}
          </button>
        </div>

        {/* 6分列 */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-purple-600">6分 评分段答案</h3>
          <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
            {bandDisplay(6)}
          </div>
          <button
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            onClick={() => onGenerate(6)}
          >
            生成6分版
          </button>
        </div>

        {/* 7分列 */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-purple-600">7分 评分段答案</h3>
          <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
            {bandDisplay(7)}
          </div>
          <button
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            onClick={() => onGenerate(7)}
          >
            生成7分版
          </button>
        </div>
      </div>
    </>
  )
}
