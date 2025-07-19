// ✅ HeadingBlock.tsx - 渲染 h1 或 h2 标题（自动判断）
import React from 'react'

export default function HeadingBlock({ block }: { block: any }) {
  const { type } = block
  const text = block[type].rich_text[0]?.plain_text || ''

  if (type === 'heading_1') {
    return (
      <h1 className="text-3xl md:text-4xl font-bold my-6 text-gray-900 dark:text-white">
        {text}
      </h1>
    )
  }

  if (type === 'heading_2') {
    return (
      <h2 className="text-2xl font-semibold my-4 text-gray-800 dark:text-gray-100">
        {text}
      </h2>
    )
  }

  if (type === 'heading_3') {
    return (
      <h3 className="text-xl font-medium my-3 text-gray-800 dark:text-gray-100">
        {text}
      </h3>
    )
  }

  return null
}
