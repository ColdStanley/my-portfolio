'use client'

// 分割线组件
export function DividerBlock() {
  return <hr className="my-4 border-gray-200 dark:border-gray-700" />
}

// 段落组件
export function ParagraphBlock({ block }: { block: any }) {
  const text = block.paragraph?.rich_text?.map((t: any) => t.plain_text).join('') || ''
  if (!text.trim()) return null
  
  return (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
      {text}
    </p>
  )
}

// 引用块组件
export function QuoteBlock({ block }: { block: any }) {
  const text = block.quote?.rich_text?.map((t: any) => t.plain_text).join('') || ''
  if (!text.trim()) return null
  
  return (
    <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-50 dark:bg-purple-900/20 italic text-gray-700 dark:text-gray-300">
      {text}
    </blockquote>
  )
}

// 列表组件
export function ListBlock({ block }: { block: any }) {
  const text = block.bulleted_list_item?.rich_text?.map((t: any) => t.plain_text).join('') || ''
  if (!text.trim()) return null
  
  return (
    <li className="ml-4 mb-2 text-gray-700 dark:text-gray-300 leading-relaxed list-disc">
      {text}
    </li>
  )
}

// 有序列表组件
export function NumberedListBlock({ block }: { block: any }) {
  const text = block.numbered_list_item?.rich_text?.map((t: any) => t.plain_text).join('') || ''
  if (!text.trim()) return null
  
  return (
    <li className="ml-4 mb-2 text-gray-700 dark:text-gray-300 leading-relaxed list-decimal">
      {text}
    </li>
  )
}

// 标注块组件
export function CalloutBlock({ block }: { block: any }) {
  const text = block.callout?.rich_text?.map((t: any) => t.plain_text).join('') || ''
  const emoji = block.callout?.icon?.emoji || "💡"
  
  if (!text.trim()) return null
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg my-4 border-l-4 border-blue-500">
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{emoji}</span>
        <div className="flex-1">{text}</div>
      </div>
    </div>
  )
}