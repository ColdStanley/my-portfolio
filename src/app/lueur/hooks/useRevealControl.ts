'use client'

import { useState } from 'react'
import { ParsedLueurItem, HighlightWord } from '../types'

export default function useRevealControl(item: ParsedLueurItem | null) {
  const [currentParagraph, setCurrentParagraph] = useState(-1)
  const [currentWord, setCurrentWord] = useState(-1)

  if (!item) {
    return {
      currentParagraph,
      currentWord,
      advanceStage: () => {},
      getWordsInParagraph: () => [],
    }
  }

  // 获取当前段落中出现的高亮词数组
  const getWordsInParagraph = (index: number): HighlightWord[] => {
    const paragraphText = item.paragraphs[index]
    return item.highlightData.filter((h) => paragraphText.includes(h.word))
  }

  // 点击推进逻辑
  const advanceStage = () => {
    if (currentParagraph === -1) {
      setCurrentParagraph(0)
    } else if (currentWord + 1 < getWordsInParagraph(currentParagraph).length) {
      setCurrentWord((prev) => prev + 1)
    } else if (currentParagraph + 1 < item.paragraphs.length) {
      setCurrentParagraph((prev) => prev + 1)
      setCurrentWord(-1)
    }
  }

  return {
    currentParagraph,
    currentWord,
    advanceStage,
    getWordsInParagraph,
  }
}
