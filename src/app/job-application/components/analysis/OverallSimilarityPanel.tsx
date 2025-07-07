'use client'

import React, { useEffect, useState } from 'react'

interface Props {
  resumeCentroidSimilarity: number // 0 ~ 1
}

export default function OverallSimilarityPanel({ resumeCentroidSimilarity }: Props) {
  const finalPercent = Number((resumeCentroidSimilarity * 100).toFixed(1))
  const [displayedPercent, setDisplayedPercent] = useState(0)
  const [animatedOffset, setAnimatedOffset] = useState(283) // full circle

  // 数字递增动画
  useEffect(() => {
    let frame: number
    const duration = 1200
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      const current = finalPercent * eased
      setDisplayedPercent(Number(current.toFixed(1)))

      const offset = 283 - 283 * (resumeCentroidSimilarity * eased)
      setAnimatedOffset(offset)

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [finalPercent, resumeCentroidSimilarity])

  let summaryText = ''
  let summaryLabel = ''
  if (resumeCentroidSimilarity >= 0.85) {
    summaryLabel = 'Excellent alignment'
    summaryText = `${summaryLabel} – your resume closely matches this job!`
  } else if (resumeCentroidSimilarity >= 0.65) {
    summaryLabel = 'Good match'
    summaryText = `${summaryLabel} – you’re mostly aligned with this role.`
  } else if (resumeCentroidSimilarity >= 0.45) {
    summaryLabel = 'Partial fit'
    summaryText = `${summaryLabel} – consider improving coverage of key areas.`
  } else {
    summaryLabel = 'Low alignment'
    summaryText = `${summaryLabel} – resume and JD appear significantly different.`
  }

  return (
    <div className="space-y-2">
      {/* 外部标题 */}
      <h3 className="text-lg font-semibold text-gray-800">
        Is your resume a strong match for this role? See the overall alignment score.
      </h3>

      {/* 白底卡片区域 */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex w-full items-center">
          {/* Left - Circular Score Ring */}
          <div className="w-1/3 flex justify-center">
            <div className="relative w-28 h-28">
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
                <span className="text-xl font-bold text-purple-700">
                  {displayedPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Right - Summary + Explanation */}
          <div className="w-2/3 pl-6 flex flex-col justify-center space-y-4 text-sm text-gray-700">
            {/* Summary sentence */}
            <p className="text-base font-semibold text-purple-700">{summaryText}</p>

            {/* Explanation section */}
            <p>
              <span className="font-semibold text-gray-800">Score bands:</span>{' '}
              ≥85% excellent · 65–84% good · 45–64% partial · &lt;45% low
            </p>
            <p>
              <span className="font-semibold text-gray-800">Based on:</span>{' '}
              selected resume items: work, projects, skills, education, awards
            </p>
            <p>
              <span className="font-semibold text-gray-800">Computed via:</span>{' '}
              vector embeddings + semantic similarity to JD
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
