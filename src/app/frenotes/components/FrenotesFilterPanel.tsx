import React from 'react'
import { FrenotesItem } from '../types/frenotes'

interface FrenotesFilterPanelProps {
  allItems: FrenotesItem[]
  selectedMothertongue: string | null
  selectedTopic: string | null
  selectedDifficulty: string | null
  onSelectMothertongue: (lang: string | null) => void
  onSelectTopic: (topic: string | null) => void
  onSelectDifficulty: (diff: string | null) => void
}

export default function FrenotesFilterPanel({
  allItems,
  selectedMothertongue,
  selectedTopic,
  selectedDifficulty,
  onSelectMothertongue,
  onSelectTopic,
  onSelectDifficulty
}: FrenotesFilterPanelProps) {
  const allMothertongues = Array.from(new Set(allItems.map(i => i.mothertongue).filter(Boolean)))
  const allTopics = Array.from(new Set(allItems.map(i => i.topic).filter(Boolean)))
  const allDifficulties = Array.from(new Set(allItems.map(i => i.difficulty).filter(Boolean)))

  const baseBtnClass = `
    text-center px-4 py-1.5 rounded-full border text-sm font-medium
    transition-all duration-200 ease-in-out tracking-wide
  `
  const selectedClass = `
    bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 hover:shadow-md border-transparent
  `
  const unselectedClass = `
    bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-105 hover:shadow-sm border-gray-200
  `

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
    <div className="mt-6 mb-6 flex flex-col gap-4 text-sm text-gray-700">
      {/* Native Language */}
      <div className="flex items-start gap-4 flex-wrap">
        <span className="w-[140px] text-base font-semibold text-gray-800 shrink-0">
          Native Language:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            className={`${baseBtnClass} ${selectedMothertongue === null ? selectedClass : unselectedClass}`}
            onClick={() => onSelectMothertongue(null)}
          >
            All
          </button>
          {allMothertongues.map(lang => (
            <button
              key={lang}
              className={`${baseBtnClass} ${selectedMothertongue === lang ? selectedClass : unselectedClass}`}
              onClick={() => onSelectMothertongue(lang!)}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div className="flex items-start gap-4 flex-wrap">
        <span className="w-[140px] text-base font-semibold text-gray-800 shrink-0">
          Topic:
        </span>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Difficulty */}
      <div className="flex items-start gap-4 flex-wrap">
        <span className="w-[140px] text-base font-semibold text-gray-800 shrink-0">
          Difficulty:
        </span>
        <div className="flex flex-wrap gap-2">
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
    </div>
  )
}
