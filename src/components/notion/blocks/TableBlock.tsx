// ✅ TableBlock.tsx - Notion table 占位符（待后续支持真实渲染）
import React from 'react'

export default function TableBlock({ block }: { block: any }) {
  return (
    <div className="my-6 border border-gray-300 dark:border-gray-600 shadow-sm rounded-xl overflow-auto">
      <div className="text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-t-xl">
        🧾 Table block (not yet rendered)
      </div>
      <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
        <em>Rendering full Notion tables is not supported yet, but you can implement it via nested block reading.</em>
      </div>
    </div>
  )
}
