'use client'

import { useEffect, useState } from 'react'
import { useJdInputStore } from '../store/useJdInputStore'
import { useJobAppInputStore } from '../store/useJobAppInputStore'
import { useJobAppStore } from '../store/useJobAppStore'
import { matchJDWithVector, VectorMatchResult } from '../utils/deepseekVectorMatcher'
import { useAuthStore } from '@/store/useAuthStore'
import { highlightMatch } from '../utils/highlightMatcher'
import MatchTypeFilter from './MatchTypeFilter' // ✅ 新增

export default function RuleBasedMatchingPanel() {
  const jdText = useJdInputStore((s) => s.jdText)
  const { getSelectedData } = useJobAppInputStore()
  const {
    selectedWorkIndices,
    selectedProjectIndices,
    selectedSkillIndices,
    selectedEducationIndices,
    selectedAwardIndices,
  } = useJobAppStore()

  const {
    selectedWork,
    selectedProjects,
    selectedSkills,
    selectedEducation,
    selectedAwards,
  } = getSelectedData(
    selectedWorkIndices,
    selectedProjectIndices,
    selectedSkillIndices,
    selectedEducationIndices,
    selectedAwardIndices
  )

  const [result, setResult] = useState<VectorMatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedType, setSelectedType] = useState<'all' | 'work' | 'project' | 'skill' | 'education' | 'award'>('all') // ✅ 新增

  useEffect(() => {
    const timeout = setTimeout(() => setFadeIn(true), 50)
    return () => clearTimeout(timeout)
  }, [])

  const handleVectorMatch = async () => {
    setLoading(true)
    setError(null)

    try {
      const userId = useAuthStore.getState().user?.id
      const res = await matchJDWithVector(jdText, 20, userId)
      setResult(res)
    } catch (err) {
      setError('匹配分析失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      } max-w-3xl mx-auto px-4 py-10 space-y-8`}
    >
      <h2 className="text-xl font-bold text-gray-800">🧠 Matching Score (Vector-Based)</h2>

      <div className="flex justify-end">
        <button
          onClick={handleVectorMatch}
          className="px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
        >
          Start Matching Analysis
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm">正在分析中，请稍候...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {result && (
        <div className="text-gray-700 text-sm space-y-4">
          <p>
            <strong>Average Similarity Score:</strong>{' '}
            <span className="text-purple-700 font-semibold">{(result.overallScore * 100).toFixed(2)}%</span>
          </p>

          <p>
            <strong>Top Matches:</strong>
          </p>

          <MatchTypeFilter selectedType={selectedType} onSelect={setSelectedType} /> {/* ✅ 新增 */}

          <ul className="flex flex-col gap-2">
            {(selectedType === 'all' ? result.matches : result.matches.filter((m) => m.contentType === selectedType)).map((match, idx) => (
              <li
                key={idx}
                className="border border-gray-200 rounded-lg px-4 py-2 shadow-sm bg-white"
              >
                <div className="text-xs text-gray-500 mb-1">
                  {match.contentType.toUpperCase()} · Similarity:{' '}
                  <span className="text-purple-700 font-medium">
                    {(match.similarity * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="text-sm text-gray-800">
                  {highlightMatch(match.content, jdText)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
