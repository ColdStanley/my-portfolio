'use client'

import React from 'react'

export type AnalysisMode = 'mark' | 'simple' | 'deep' | 'grammar'

interface AnalysisModeTagProps {
  mode: AnalysisMode
  className?: string
}

interface ModeConfig {
  label: string
  bgColor: string
  textColor: string
  icon: string
}

const MODE_CONFIGS: Record<AnalysisMode, ModeConfig> = {
  mark: {
    label: 'Mark',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    icon: ''
  },
  simple: {
    label: 'Simple',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800', 
    icon: ''
  },
  deep: {
    label: 'Deep',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: ''
  },
  grammar: {
    label: 'Grammar',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: ''
  }
}

export default function AnalysisModeTag({ mode, className = '' }: AnalysisModeTagProps) {
  const config = MODE_CONFIGS[mode]
  
  if (!config) {
    // Fallback for legacy data without analysis_mode
    return (
      <span className={`px-3 py-1.5 text-xs bg-purple-100 text-purple-800 rounded-full font-semibold ${className}`}>
        Word
      </span>
    )
  }

  return (
    <span className={`px-3 py-1.5 text-xs ${config.bgColor} ${config.textColor} rounded-full font-semibold ${className}`}>
      {config.label}
    </span>
  )
}