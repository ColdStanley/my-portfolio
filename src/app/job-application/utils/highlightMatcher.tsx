import React from 'react'

/**
 * 高亮 JD 中也出现的关键词
 */
export function highlightMatch(text: string, jdText: string): JSX.Element {
  if (!jdText) return <>{text}</>

  // 提取 JD 中所有小写单词（长度 ≥2）
  const jdWords = new Set(
    jdText
      .toLowerCase()
      .match(/\b\w{2,}\b/g) || [] // 防止 null
  )

  // 拆分 text 为：单词 + 非单词
  const parts = text.split(/(\b\w+\b)/)

  return (
    <>
      {parts.map((part, idx) => (
        /^\w+$/.test(part) && jdWords.has(part.toLowerCase()) ? (
          <span key={idx} className="bg-yellow-200 font-semibold">{part}</span>
        ) : (
          <span key={idx}>{part}</span>
        )
      ))}
    </>
  )
}
