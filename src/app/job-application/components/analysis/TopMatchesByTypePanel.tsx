'use client'

import React from 'react'
import { highlightMatch } from '../../utils/highlightMatcher'

export interface MatchItem {
  content: string
  similarity: number
  contentType: string // 'work' | 'project' | 'education' | 'skill' | 'award'
}

interface Props {
  matches: MatchItem[]
  jdText: string
}

const TYPE_LABELS: Record<string, string> = {
  work: '💼 Work Experience',
  project: '📁 Projects',
  education: '🎓 Education',
  skill: '🛠 Skills',
  award: '🏅 Awards',
}

export default function TopMatchesByTypePanel({ matches, jdText }: Props) {
  const grouped = matches.reduce<Record<string, MatchItem[]>>((acc, item) => {
    if (!acc[item.contentType]) acc[item.contentType] = []
    acc[item.contentType].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">🧩 Top Matches by Category</h3>

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-600">{TYPE_LABELS[type] || type}</h4>

          <div className="space-y-3">
            {items
              .sort((a, b) => b.similarity - a.similarity)
              .slice(0, 3)
              .map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-sm text-gray-800"
                >
                  <div className="text-xs text-gray-500 mb-2">
                    Similarity:{' '}
                    <span className="text-purple-600 font-medium">
                      {(item.similarity * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {highlightMatch(item.content, jdText)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
