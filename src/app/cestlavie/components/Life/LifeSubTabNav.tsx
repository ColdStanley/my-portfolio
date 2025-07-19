'use client'

const lifeTabs = [
  { key: 'strategy', label: '🎯', title: 'Strategy' },
  { key: 'plan', label: '📋', title: 'Plan' },
  { key: 'task', label: '✅', title: 'Task' },
  { key: 'tbd', label: '🔮', title: 'TBD' },
]

export default function LifeSubTabNav({ activeTab, setActiveTab }) {
  return (
    <>
      {/* Desktop navigation - fixed on right */}
      <div className="hidden md:flex fixed top-24 right-4 z-50 flex-col space-y-3">
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

      {/* Mobile navigation - vertical at top-right, below main menu */}
      <div className="md:hidden fixed top-36 right-4 z-30 flex flex-col space-y-2">
        {lifeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            title={tab.title}
            className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center text-lg transition-all ${
              activeTab === tab.key 
                ? 'bg-purple-600 text-white scale-110' 
                : 'bg-white text-gray-600 hover:bg-purple-100 hover:scale-105'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  )
}