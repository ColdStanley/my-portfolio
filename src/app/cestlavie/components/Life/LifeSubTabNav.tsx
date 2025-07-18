'use client'

const lifeTabs = [
  { key: 'strategy', label: '🎯', title: 'Strategy' },
  { key: 'plan', label: '📋', title: 'Plan' },
  { key: 'task', label: '✅', title: 'Task' },
  { key: 'tbd', label: '🔮', title: 'TBD' },
]

export default function LifeSubTabNav({ activeTab, setActiveTab }) {
  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col space-y-3">
      {lifeTabs.map((tab) => (
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