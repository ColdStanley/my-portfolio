// hooks/useHighlightManager.ts
'use client'

import { useState } from 'react'

export default function useHighlightManager(allWords: string[]) {
  const [manualHighlights, setManualHighlights] = useState<Set<string>>(new Set())
  const [forceHighlightAll, setForceHighlightAll] = useState(false)

  // 手动添加高亮词
  const handleManualClick = (word: string) => {
    setManualHighlights((prev) => new Set(prev).add(word))
  }

  // 一键切换全部高亮
  const toggleHighlightAll = () => {
    if (forceHighlightAll) {
      setManualHighlights(new Set())
      setForceHighlightAll(false)
    } else {
      setManualHighlights(new Set(allWords))
      setForceHighlightAll(true)
    }
  }

  return {
    manualHighlights,
    forceHighlightAll,
    handleManualClick,
    toggleHighlightAll,
  }
}
