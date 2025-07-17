'use client'

import { useTab } from '../context/TabContext'

export default function MobileTabNavigation() {
  const { activeTab, setActiveTab } = useTab()

  return (
    <div className="md:hidden fixed top-16 right-4 z-30 flex flex-col gap-2">
      {[
        { key: 'main', label: '📚 题库' },
        { key: 'custom', label: '✨ 定制' },
        { key: 'plan', label: '📅 计划' },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key as 'main' | 'custom' | 'plan')}
          className={`px-4 py-2 rounded-full text-sm font-medium shadow transition-all ${
            activeTab === key
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}