'use client'

import { useState } from 'react'

interface Props {
  answers: Record<string, string>
  onGenerate: (band: number) => void
  resultRef: React.RefObject<HTMLDivElement>
}

export default function AnswerSection({ answers, onGenerate, resultRef }: Props) {
  const [loading6, setLoading6] = useState(false)
  const [loading7, setLoading7] = useState(false)

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

  // ✅ 包装 onGenerate 以支持 loading 控制
  const handleGenerate = async (band: number) => {
    if (band === 6) {
      setLoading6(true)
      await onGenerate(6)
      setLoading6(false)
    } else if (band === 7) {
      setLoading7(true)
      await onGenerate(7)
      setLoading7(false)
    }
  }

  return (
    <>
      <div ref={resultRef} className="w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* 5分列 */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-purple-600">5分 评分段答案</h3>
          <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
            {bandDisplay(5)}
          </div>
        </div>

        {/* 6分列 */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-purple-600">6分 评分段答案</h3>
          <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
            {bandDisplay(6)}
          </div>
          <button
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleGenerate(6)}
            disabled={loading6}
          >
            {loading6 ? '生成中…' : '生成6分版'}
          </button>
        </div>

        {/* 7分列 */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-purple-600">7分 评分段答案</h3>
          <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
            {bandDisplay(7)}
          </div>
          <button
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleGenerate(7)}
            disabled={loading7}
          >
            {loading7 ? '生成中…' : '生成7分版'}
          </button>
        </div>
      </div>
    </>
  )
}
