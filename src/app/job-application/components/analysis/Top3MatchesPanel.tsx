'use client'

import React, { useEffect, useState } from 'react'
import { MatchDetail } from '../../utils/deepseekVectorMatcher'

interface Props {
  topMatches?: MatchDetail[]
}

export default function Top3MatchesPanel({ topMatches }: Props) {
  if (!topMatches || topMatches.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">
        Curious about your top 3 strongest alignments with the job description?
      </h3>

      <div className="space-y-4">
        {topMatches.slice(0, 3).map((match, idx) => (
          <AnimatedMatchCard key={idx} match={match} />
        ))}
      </div>
    </div>
  )
}

function AnimatedMatchCard({ match }: { match: MatchDetail }) {
  const finalPercent = Number((match.similarity * 100).toFixed(1))
  const [displayedPercent, setDisplayedPercent] = useState(0)
  const [animatedOffset, setAnimatedOffset] = useState(283)

  useEffect(() => {
    let frame: number
    const duration = 1000
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = finalPercent * eased
      setDisplayedPercent(Number(current.toFixed(1)))
      setAnimatedOffset(283 - 283 * (match.similarity * eased))

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [finalPercent, match.similarity])

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-6">
      {/* 左侧：圆形图 */}
      <div className="w-full sm:w-32 flex flex-col items-center justify-center shrink-0">
        <div className="relative w-20 h-20">
          <svg className="transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#9333ea"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset={animatedOffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-purple-700">
              {displayedPercent}%
            </span>
          </div>
        </div>
        <div className="text-xs font-medium text-gray-500 mt-2 uppercase">
          {match.contentType}
        </div>
      </div>

      {/* 中间：简历内容（换行优化） */}
      <div className="flex-1 text-sm text-gray-800">
        <div className="font-semibold mb-1">Matched Resume Content</div>
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
          {match.content.replace(/;\s*/g, ';\n')}
        </pre>
      </div>

      {/* 右侧：JD 内容 */}
      <div className="flex-1 text-sm text-gray-600 italic">
        <div className="font-semibold mb-1">From Job Description</div>
        <p>{match.matchedJD}</p>
      </div>
    </div>
  )
}
