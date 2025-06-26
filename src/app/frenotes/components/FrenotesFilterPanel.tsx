import React from 'react'
import { FrenotesItem } from '../types/frenotes'

interface FrenotesFilterPanelProps {
  allItems: FrenotesItem[]
  selectedTopic: string | null
  selectedDifficulty: string | null
  onSelectTopic: (topic: string | null) => void
  onSelectDifficulty: (diff: string | null) => void
}

export default function FrenotesFilterPanel({
  allItems,
  selectedTopic,
  selectedDifficulty,
  onSelectTopic,
  onSelectDifficulty
}: FrenotesFilterPanelProps) {
  const allTopics = Array.from(new Set(allItems.map(i => i.topic).filter(Boolean)))
  const allDifficulties = Array.from(new Set(allItems.map(i => i.difficulty).filter(Boolean)))

  const baseBtnClass = `
    min-w-[124px] text-center px-4 py-1.5 rounded-full border text-sm font-medium
    transition-all duration-200 ease-in-out tracking-wide
  `
  const selectedClass = `
    bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 hover:shadow-md border-transparent
  `
  const unselectedClass = `
    bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-105 hover:shadow-sm border-gray-200
  `

  // ✅ 显示英法双语（示例映射，可自行扩展）
  const bilingualLabel = (value: string): string => {
    const map: Record<string, string> = {
      health: 'Health / Santé',
      politics: 'Politics / Politique',
      education: 'Education / Éducation',
      medium: 'Medium / Moyen',
      hard: 'Hard / Difficile',
    }
    return map[value] || value.charAt(0).toUpperCase() + value.slice(1)
  }

  return (
    <div className="flex flex-col gap-4 mt-6 mb-6 text-sm text-gray-700">
      {/* Topic Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-gray-800 min-w-[80px]">Topic:</span>
        <button
          className={`${baseBtnClass} ${selectedTopic === null ? selectedClass : unselectedClass}`}
          onClick={() => onSelectTopic(null)}
        >
          All
        </button>
        {allTopics.map(topic => (
          <button
            key={topic}
            className={`${baseBtnClass} ${selectedTopic === topic ? selectedClass : unselectedClass}`}
            onClick={() => onSelectTopic(topic!)}
          >
            {bilingualLabel(topic)}
          </button>
        ))}
      </div>

      {/* Difficulty Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-gray-800 min-w-[80px]">Difficulty:</span>
        <button
          className={`${baseBtnClass} ${selectedDifficulty === null ? selectedClass : unselectedClass}`}
          onClick={() => onSelectDifficulty(null)}
        >
          All
        </button>
        {allDifficulties.map(diff => (
          <button
            key={diff}
            className={`${baseBtnClass} ${selectedDifficulty === diff ? selectedClass : unselectedClass}`}
            onClick={() => onSelectDifficulty(diff!)}
          >
            {bilingualLabel(diff)}
          </button>
        ))}
      </div>
    </div>
  )
}
