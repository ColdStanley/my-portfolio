'use client'

const otherTabs = [
  { key: 'notion', label: '📊', title: 'JD Tracker' },
  { key: 'cv-modules', label: '🧩', title: 'CV Module Vault' },
  { key: 'user-matcher', label: '👤', title: 'Job Matcher' },
  { key: 'figma-builder', label: '🎨', title: 'FigmaBuilder' },
]

export default function ResumeSubTabNav({ activeTab, setActiveTab }) {
  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col space-y-3">
      {otherTabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          title={tab.title}
          className={`w-10 h-10 rounded-full shadow flex items-center justify-center text-xl transition-all ${
            activeTab === tab.key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
