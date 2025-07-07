'use client'

import { MatchResult } from '@/app/job-application/utils/matchJDWithResumeSentences'

interface Props {
  matches: MatchResult[]
}

const TYPE_LABELS: Record<string, string> = {
  work: '💼 Work',
  project: '📁 Project',
  education: '🎓 Education',
  skill: '🛠 Skill',
  award: '🏅 Award',
}

function getPurpleColor(score: number) {
  const lightness = 88 - score * 55
  return `hsl(270, 90%, ${lightness}%)`
}

export default function SentenceHighlightViewer({ matches }: Props) {
  if (!matches || matches.length === 0) return null

  const sortedMatches = [...matches].sort((a, b) => b.similarity - a.similarity)

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Want to see sentence-by-sentence matching with the job post?</h3>

      {/* 三列提示标签 */}
      <div className="flex items-center gap-6 text-sm font-medium text-gray-500 px-1">
        <div className="flex-1 text-left">Resume Sentence</div>
        <div className="w-24 text-center">Similarity</div>
        <div className="flex-1 text-left">Job Description Sentence</div>
      </div>

      <div className="space-y-4">
        {sortedMatches.map((item, idx) => {
          const percent = Math.round(item.similarity * 100)
          const fillColor = getPurpleColor(item.similarity)

          // ✅ 过滤掉匹配度过低 + 内容过短的项
          if (
            item.similarity < 0.4 ||
            item.bestMatch.trim().split(/\s+/).length < 5 ||
            item.jdSentence.trim().split(/\s+/).length < 5
          )
            return null

          return (
            <div key={idx} className="relative flex items-stretch gap-6">
              {/* Left: Resume Sentence */}
              <div className="flex-1 bg-white rounded-xl p-4 shadow-sm text-sm text-gray-800 border border-gray-100 relative flex items-center">
                <p className="font-medium leading-relaxed">{item.bestMatch}</p>

                {item.contentType && (
                  <div className="absolute bottom-1 right-3 text-[12px] text-purple-600 font-semibold opacity-80">
                    {TYPE_LABELS[item.contentType] || item.contentType}
                  </div>
                )}
              </div>

              {/* Middle: Similarity Circle */}
              <div className="w-24 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${fillColor} 0% ${percent}%, #f3f4f6 ${percent}% 100%)`,
                      boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                      animation: 'pulse 3s ease-in-out infinite',
                    }}
                  />
                  <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                    <span className="text-[13px] font-semibold font-mono text-gray-800">
                      {percent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: JD Sentence */}
              <div className="flex-1 bg-white rounded-xl p-4 shadow-sm text-sm text-gray-800 border border-gray-100 flex items-center">
                <p className="font-medium leading-relaxed">{item.jdSentence}</p>
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.1);
          }
          100% {
            filter: brightness(1);
          }
        }
      `}</style>
    </div>
  )
}
