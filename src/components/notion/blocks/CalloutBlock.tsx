// ✅ CalloutBlock.tsx - 渲染 Callout 高亮块
import React from 'react'

export default function CalloutBlock({ block }: { block: any }) {
  const text = block.callout?.rich_text || []

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 px-4 py-3 rounded-md text-sm text-yellow-900 dark:text-yellow-100">
      {text.map((t: any, i: number) => (
        <span key={i}>{t.plain_text}</span>
      ))}
    </div>
  )
}
