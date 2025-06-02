// ✅ ToggleBlock.tsx - 支持嵌套内容渲染
import React from 'react'
import RenderBlock from '../RenderBlock'

export default function ToggleBlock({ block }: { block: any }) {
  const text = block.toggle?.rich_text || []
  const children = block.children || []  // ⚠️ Notion children from API

  return (
    <details className="notion-toggle bg-gray-100 dark:bg-gray-800 rounded-md px-4 py-2">
      <summary className="cursor-pointer font-semibold text-gray-800 dark:text-gray-200">
        {text.map((t: any, i: number) => (
          <span key={i}>{t.plain_text}</span>
        ))}
      </summary>

      <div className="mt-2 pl-4">
        <RenderBlock blocks={children} />
      </div>
    </details>
  )
}
