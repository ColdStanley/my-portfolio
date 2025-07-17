'use client'

import { useTab } from '../context/TabContext'

const tabs = [
  { key: 'main', label: 'Question Bank' },
  { key: 'custom', label: 'Custom Practice' },
  { key: 'plan', label: 'Study Plan' },
]

export default function SideNavigation() {
  const { activeTab, setActiveTab } = useTab()
  return (
    <div className="fixed left-0 top-14 w-56 bg-white border-r border-gray-200 h-[calc(100vh-3.5rem)] flex flex-col z-10">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-purple-600">IELTS Speaking</h1>
      </div>
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'main' | 'custom' | 'plan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 transform ${
                activeTab === tab.key
                  ? 'bg-purple-100 text-purple-700 font-medium scale-105 shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:scale-102'
              }`}
            >
              <span className="transition-all duration-300">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
