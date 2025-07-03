'use client'

import { useBoosterStore } from '@/app/new-ielts-speaking/store/boosterStore'

export default function BoosterSpeakingGoalPanel() {
  const goal = useBoosterStore(state => state.goal)

  return (
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
  )
}
