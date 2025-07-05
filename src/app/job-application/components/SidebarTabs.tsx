'use client'

import { useJobAppStore } from '../store/useJobAppStore'
import { useState } from 'react'

const tabs = [
  { key: 'summary', label: '🧾 Summary Overview' },
  { key: 'jd', label: '📄 Job Description Input' },
  { key: 'match', label: '🧠 Matching Analysis' },
  { key: 'output', label: '📄 Final Output' },
] as const

const personalInfoSubTabs = [
  { key: 'experience', label: '🛠 Experience / Projects / Skills' },
  { key: 'basic', label: '🎓 Personal / Education / Awards' },
] as const

export default function SidebarTabs() {
  const currentTab = useJobAppStore((s) => s.currentTab)
  const setTab = useJobAppStore((s) => s.setTab)
  const [fadeClass, setFadeClass] = useState('opacity-100')

  const handleTabChange = (
    tab: typeof tabs[number]['key'] | typeof personalInfoSubTabs[number]['key']
  ) => {
    setFadeClass('opacity-0')
    setTimeout(() => {
      setTab(tab)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setFadeClass('opacity-100')
    }, 200)
  }

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-gray-50 border-r border-gray-200 p-6 pt-[64px] flex flex-col">
      {/* Project Title */}
      <div className="mt-10 text-2xl font-extrabold text-purple-700 text-center mb-6">
        Job Assistant
      </div>

      {/* Main Tabs */}
      <div className="flex flex-col gap-2 mt-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`text-sm font-semibold rounded-md px-4 py-2 text-left transition-all
              ${
                currentTab === tab.key
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
              }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Section title (not clickable) */}
        <div className="mt-6 mb-1 text-xs font-bold text-gray-500 pl-2 select-none">
          🧑‍💼 Personal Info Entry
        </div>

        {/* Sub Tabs */}
        {personalInfoSubTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`text-sm font-semibold rounded-md px-4 py-2 text-left transition-all
              ${
                currentTab === tab.key
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-purple-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Local fade style for external use */}
      <style jsx>{`
        .fade-container {
          transition: opacity 0.3s ease-in-out;
        }
        .opacity-0 {
          opacity: 0;
        }
        .opacity-100 {
          opacity: 1;
        }
      `}</style>
    </aside>
  )
}
