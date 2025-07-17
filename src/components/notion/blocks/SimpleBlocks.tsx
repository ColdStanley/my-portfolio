'use client'

import { ReactNode } from 'react'

// 分割线组件
export function DividerBlock() {
  return <hr className="my-4 border-gray-200 dark:border-gray-700" />
}

// 段落组件
export function ParagraphBlock({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </p>
  )
}

// 引用块组件
export function QuoteBlock({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-50 dark:bg-purple-900/20 italic text-gray-700 dark:text-gray-300">
      {children}
    </blockquote>
  )
}

// 列表组件
export function ListBlock({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">
      {children}
    </ul>
  )
}

// 有序列表组件
export function NumberedListBlock({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300 space-y-1">
      {children}
    </ol>
  )
}

// 标注块组件
interface CalloutBlockProps {
  children: ReactNode
  emoji?: string
  backgroundColor?: string
  textColor?: string
}

export function CalloutBlock({ 
  children, 
  emoji = "💡", 
  backgroundColor = "bg-blue-50 dark:bg-blue-900/20",
  textColor = "text-blue-800 dark:text-blue-200"
}: CalloutBlockProps) {
  return (
    <div className={`${backgroundColor} ${textColor} p-4 rounded-lg my-4 border-l-4 border-blue-500`}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{emoji}</span>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}