// ✅ ParagraphBlock.tsx - 通用段落渲染组件
import React from 'react'

export default function ParagraphBlock({ block }: { block: any }) {
  const text = block.paragraph.rich_text

  return (
    <p className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200 text-[17px]">
      {text.map((t: any, i: number) => (
        <span key={i}>{t.plain_text}</span>
      ))}
    </p>
  )
}
