'use client'

import Link from 'next/link'

interface Props {
  currentTab: 'main' | 'custom' | 'plan'
  onTabChange: (tab: 'main' | 'custom' | 'plan') => void
}

export default function SideNavigation({ currentTab, onTabChange }: Props) {
  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-gray-50 border-r border-gray-200 p-6 pt-[64px] flex flex-col">
      {/* 标题：再下移 + 居中 */}
      <div className="mt-10 text-2xl font-extrabold text-purple-700 text-center mb-6">
        IELTS Speaking
      </div>

      {/* Tab 区域：整体再往下推一些 */}
      <div className="flex flex-col gap-2 mt-8">
        <button
          onClick={() => onTabChange('main')}
          className={`text-sm font-semibold rounded-md px-4 py-2 text-left transition-all
            ${currentTab === 'main'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-purple-50'
            }`}
        >
          📘 学习题库
        </button>

        <button
          onClick={() => onTabChange('custom')}
          className={`text-sm font-semibold rounded-md px-4 py-2 text-left transition-all
            ${currentTab === 'custom'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-purple-50'
            }`}
        >
          🧠 口语私人定制
        </button>

        <button
          onClick={() => onTabChange('plan')}
          className={`text-sm font-semibold rounded-md px-4 py-2 text-left transition-all
            ${currentTab === 'plan'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-purple-50'
            }`}
        >
          📅 提分计划制定
        </button>
      </div>
    </aside>
  )
}
