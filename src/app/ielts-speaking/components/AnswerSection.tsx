'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Props {
  answers: Record<string, string>
  onGenerate: (band: number) => void
  resultRef: React.RefObject<HTMLDivElement>
  question: string
  loading: boolean
}

export default function AnswerSection({
  answers,
  onGenerate,
  resultRef,
  question,
  loading
}: Props) {
  const [activeBand, setActiveBand] = useState<number | null>(null)

  const getDisplayText = (score: number) => {
    const isThisLoading = loading && activeBand === score

    if (isThisLoading) {
      return <span className="text-purple-400">🪄 给思绪一点留白，答案会更清晰...</span>
    }

    const answer = answers[`band${score}`] || ''
    const comment = answers[`comment${score}`] || ''
    const vocab = answers[`vocab${score}`] || ''

    if (!answer && !comment && !vocab) {
      return <span className="text-gray-400">点击上方按钮 🖱️</span>
    }

    const isFallback = answer.includes('内容生成失败')

    if (isFallback) {
      return (
        <span className="text-red-500">
          语言的迷雾暂时遮蔽了意义，再试一次，让风吹散它。内容生成失败，请重试。
        </span>
      )
    }

    return `
【参考答案】
${answer}

【说明】
${comment}

【Vocabulary Highlights】
${vocab}
    `.trim()
  }

  const sharedButtonStyle =
    'w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 text-purple-700 hover:from-purple-200 hover:to-purple-300 hover:shadow-lg shadow transition-all text-center font-semibold transform active:scale-95 duration-300'

  const getButtonText = (band: number) => {
    if (loading && activeBand === band) return '🪄 魔法时间，灵魂正在追赶脚步 👣'

    switch (band) {
      case 5:
        return '🌱 5分 - 点亮起点'
      case 6:
        return '🚀 6分 - 突破瓶颈'
      case 7:
        return '🦉 7分 - 驾驭语言'
      default:
        return '生成'
    }
  }

  const handleClick = (band: number) => {
    setActiveBand(band)
    onGenerate(band)
  }

  return (
    <>
      <div ref={resultRef} className="w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-6">
        {[5, 6, 7].map((band) => (
          <div key={band} className="space-y-2">
            <button
              className={sharedButtonStyle}
              onClick={() => handleClick(band)}
              disabled={!question || loading}
            >
              {getButtonText(band)}
            </button>
            <div className="min-h-[300px] bg-white border border-purple-300 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-800">
              {getDisplayText(band)}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
