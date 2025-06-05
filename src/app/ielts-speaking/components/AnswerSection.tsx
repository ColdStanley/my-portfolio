'use client'

import { useState } from 'react'

interface Props {
  answers: Record<string, string>
  onGenerate: (band: number) => void
  resultRef: React.RefObject<HTMLDivElement>
}

export default function AnswerSection({ answers, onGenerate, resultRef }: Props) {
  const bandDisplay = (score: number) => {
    const answer = answers[`band${score}`] || ''
    const comment = answers[`comment${score}`] || ''
    const vocab = answers[`vocab${score}`] || ''

    // 全部为空则默认显示提示
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {[5, 6, 7].map((score) => (
          <div key={score} className="space-y-2">
            <h3 className="text-lg font-bold text-purple-600">{score}分 评分段答案</h3>
            <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
              {bandDisplay(score)}
            </div>
            <button
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              onClick={() => onGenerate(score)}
            >
              生成{score}分版
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
