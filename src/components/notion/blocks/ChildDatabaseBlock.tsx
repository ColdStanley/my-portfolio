// ✅ ChildDatabaseBlock.tsx - 数据库引用占位组件
import React from 'react'

export default function ChildDatabaseBlock({ block }: { block: any }) {
  const title = block.child_database?.title || 'Inline Database'

  return (
    <div className="my-6 border border-purple-300 dark:border-purple-700 shadow-sm rounded-xl overflow-auto">
      <div className="text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-4 py-2 rounded-t-xl">
        📊 {title}
      </div>
      <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
        <em>To display the table content, it must be parsed via Notion API server-side.</em>
      </div>
    </div>
  )
}
