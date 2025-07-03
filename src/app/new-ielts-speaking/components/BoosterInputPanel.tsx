'use client'

import { useBoosterStore } from '@/app/new-ielts-speaking/store/boosterStore'
import { buildBoosterPrompt } from '@/utils/SpeakingBoosterPromptBuilder'
import { generateBoosterPlanSpeaking } from '@/utils/generateBoosterPlanSpeaking'
import { useState } from 'react'

const SCORE_OPTIONS = ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0']

export default function BoosterInputPanel() {
  const curr = useBoosterStore((s) => s.currentScore) || ''
  const target = useBoosterStore((s) => s.targetScore) || ''
  const setScores = useBoosterStore((s) => s.setScores)
  const setGoal = useBoosterStore((s) => s.setGoal)
  const setKeyPoints = useBoosterStore((s) => s.setKeyPoints)
  const setPlan = useBoosterStore((s) => s.setPlan)

  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!curr || !target || isLoading) return
    setIsLoading(true)
    setScores(curr, target)

    const prompt = buildBoosterPrompt({ currentScore: parseFloat(curr), targetScore: parseFloat(target) })

    try {
      const res = await fetch('/api/new-ielts-speaking/booster-plan-ieltsspeaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      const { goal, key_points, steps } = data

      setGoal(goal)
      setKeyPoints(key_points)

      if (!steps || !Array.isArray(steps)) {
        console.error('❌ 大模型返回的 steps 无效:', steps)
        return
      }

      const generatedPlan = await generateBoosterPlanSpeaking(steps)
      setPlan(generatedPlan)
    } catch (err) {
      console.error('💥 学习计划生成失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="col-span-12 md:col-start-4 md:col-span-6 w-full mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* 左侧标签 */}
        <div className="sm:w-28 text-sm font-semibold text-purple-700 pt-1 whitespace-nowrap">
          🎯 输入分数
        </div>

        {/* 右侧输入区域 */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-1">
          {/* 当前分数 */}
          <select
            className="w-full sm:w-32 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            value={curr}
            onChange={(e) => setScores(e.target.value, target)}
          >
            <option value="">当前分数</option>
            {SCORE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* 目标分数 */}
          <select
            className="w-full sm:w-32 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            value={target}
            onChange={(e) => setScores(curr, e.target.value)}
          >
            <option value="">目标分数</option>
            {SCORE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full sm:w-32 bg-purple-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-purple-700 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? '生成中...' : '生成学习计划'}
          </button>
        </div>
      </div>
    </div>
  )
}
