'use client'

import { useState } from 'react'
import { useBoosterStore } from '@/app/new-ielts-speaking/store/boosterStore'
import { buildBoosterPrompt } from '@/utils/SpeakingBoosterPromptBuilder'
import { generateBoosterPlanSpeaking } from '@/utils/generateBoosterPlanSpeaking'

const SCORE_OPTIONS = ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0']

export default function IELTSSpeakingStudyPlan() {
  // Store state
  const curr = useBoosterStore((s) => s.currentScore) || ''
  const target = useBoosterStore((s) => s.targetScore) || ''
  const goal = useBoosterStore((s) => s.goal)
  const keyPoints = useBoosterStore((s) => s.keyPoints)
  const plan = useBoosterStore((s) => s.plan)
  
  const setScores = useBoosterStore((s) => s.setScores)
  const setGoal = useBoosterStore((s) => s.setGoal)
  const setKeyPoints = useBoosterStore((s) => s.setKeyPoints)
  const setPlan = useBoosterStore((s) => s.setPlan)

  // Local state
  const [isLoading, setIsLoading] = useState(false)

  // Handle generate plan
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

  // Render description with links
  function renderDescriptionWithLink(description: string, link: string) {
    const keywords = ['学习题库', '定制答案', '范文讲解']
    if (!link) return <span>{description}</span>

    const parts: (string | JSX.Element)[] = [description]
    keywords.forEach((kw) => {
      for (let i = 0; i < parts.length; i++) {
        if (typeof parts[i] === 'string' && parts[i].includes(kw)) {
          const [before, after] = (parts[i] as string).split(kw, 2)
          parts.splice(i, 1, before, (
            <a key={kw + i} href={link} className="text-purple-600 underline font-semibold">
              {kw}
            </a>
          ), after)
          break
        }
      }
    })

    return <>{parts}</>
  }

  return (
    <div className="space-y-12 text-base">
      {/* Input Panel */}
      <div className="col-span-12 md:col-start-1 md:col-span-10 w-full mb-8">
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

      {/* Goal Panel */}
      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          {/* 左侧提示词标签 */}
          <div className="sm:w-28 text-sm font-semibold text-purple-700 pt-1 whitespace-nowrap">
            目标/Target
          </div>

          {/* 右侧卡片区域 */}
          <div className="flex-1 border border-gray-200 rounded-lg shadow bg-white p-4 pt-5">
            {goal ? (
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">{goal}</p>
            ) : (
              <p className="text-gray-500 text-sm">
                点击上方按钮后，将在此生成你的个性化提升目标。
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Key Points Panel */}
      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          {/* 左侧提示词标签 */}
          <div className="sm:w-28 text-sm font-semibold text-purple-700 pt-1 whitespace-nowrap">
            能力/Capabilities
          </div>

          {/* 右侧卡片区域 */}
          <div className="flex-1 border border-gray-200 rounded-lg shadow bg-white p-4 pt-5">
            {keyPoints && keyPoints.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-800">
                {keyPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">
                点击上方按钮后，将在此生成你的重点知识点内容。
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Plan Card List */}
      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
          {/* 左侧提示词标签 */}
          <div className="sm:w-28 text-sm font-semibold text-purple-700 pt-1 whitespace-nowrap">
            步骤/Steps
          </div>

          {/* 右侧卡片区域 */}
          <div className="flex-1 border border-gray-200 rounded-lg shadow bg-white p-4 pt-5 min-h-[200px] flex items-center">
            {plan && plan.length > 0 ? (
              <div className="text-gray-800 space-y-6 w-full">
                {plan.map((task) => (
                  <p key={task.id}>
                    <strong>{task.title}</strong><br />
                    {renderDescriptionWithLink(task.description, task.link)}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                点击上方按钮后，将在此生成你的专属每日学习计划。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}