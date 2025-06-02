// ✅ NumberedListBlock.tsx - 渲染有序列表项
import React from 'react'

export default function NumberedListBlock({ block }: { block: any }) {
  const text = block.numbered_list_item?.rich_text || []

  return (
    <li className="list-decimal ml-6 text-gray-700 dark:text-gray-200 leading-relaxed">
      {text.map((t: any, i: number) => (
        <span key={i}>{t.plain_text}</span>
      ))}
    </li>
  )
}
