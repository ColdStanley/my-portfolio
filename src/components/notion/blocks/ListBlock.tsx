// ✅ ListBlock.tsx - 支持 bulleted_list_item 渲染
import React from 'react'

export default function ListBlock({ block }: { block: any }) {
  const text = block.bulleted_list_item.rich_text

  return (
    <li className="list-disc ml-6 text-gray-700 dark:text-gray-200 leading-relaxed">
      {text.map((t: any, i: number) => (
        <span key={i}>{t.plain_text}</span>
      ))}
    </li>
  )
}
