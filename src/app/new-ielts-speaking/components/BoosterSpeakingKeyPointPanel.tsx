'use client'

import { useBoosterStore } from '@/app/new-ielts-speaking/store/boosterStore'

export default function BoosterSpeakingKeyPointPanel() {
  const keyPoints = useBoosterStore(state => state.keyPoints)

  return (
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
  )
}
