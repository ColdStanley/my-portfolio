'use client'

import React from 'react'

type MatchType = 'all' | 'work' | 'project' | 'skill' | 'education' | 'award'

interface Props {
  selectedType: MatchType
  onSelect: (type: MatchType) => void
}

const TYPES: { label: string; value: MatchType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Work', value: 'work' },
  { label: 'Project', value: 'project' },
  { label: 'Skill', value: 'skill' },
  { label: 'Education', value: 'education' },
  { label: 'Award', value: 'award' },
]

export default function MatchTypeFilter({ selectedType, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {TYPES.map((type) => (
        <button
          key={type.value}
          onClick={() => onSelect(type.value)}
          className={`px-3 py-1 rounded-full border text-gray-700 transition ${
            selectedType === type.value
              ? 'bg-purple-600 text-white border-transparent'
              : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  )
}
