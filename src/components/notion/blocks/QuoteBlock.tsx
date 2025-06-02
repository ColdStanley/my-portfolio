// ✅ QuoteBlock.tsx - 引用块渲染样式（左侧竖线 + 斜体）
import React from 'react'

export default function QuoteBlock({ block }: { block: any }) {
  const text = block.quote?.rich_text || []

  return (
    <blockquote className="border-l-4 border-purple-400 pl-4 italic text-gray-700 dark:text-gray-300 my-4">
      {text.map((t: any, i: number) => (
        <span key={i}>{t.plain_text}</span>
      ))}
    </blockquote>
  )
}
