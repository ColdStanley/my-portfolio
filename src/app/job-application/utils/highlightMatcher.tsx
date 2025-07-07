'use client'

import React from 'react'

/**
 * Highlight words from `text` that also appear in `jdText`, excluding stop words.
 */

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is',
  'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there',
  'these', 'they', 'this', 'to', 'was', 'will', 'with', 'you', 'your', 'we', 'i', 'he', 'she',
  'his', 'her', 'our', 'who', 'what', 'which', 'from', 'so', 'do', 'did', 'does', 'have', 'has', 'had'
])

export function highlightMatch(text: string, jdText: string): React.ReactElement {
  if (!jdText) return <>{text}</>

  // 取出 JD 中所有有效单词，统一为小写（≥2 字母，非 stop word）
  const jdWords = new Set(
    (jdText.toLowerCase().match(/\b\w{2,}\b/g) || []).filter(
      (word) => !stopWords.has(word)
    )
  )

  // 拆分目标文本为 word / non-word 部分
  const parts = text.split(/(\b\w+\b)/)

  return (
    <>
      {parts.map((part, idx) =>
        /^\w+$/.test(part) && jdWords.has(part.toLowerCase()) ? (
          <span
            key={idx}
            className="bg-purple-100 text-purple-700 font-medium px-1 rounded-md"
          >
            {part}
          </span>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  )
}
