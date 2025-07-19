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

      {/* Mobile navigation - compact horizontal at top */}
      <div className="md:hidden flex justify-center space-x-1 mb-3 bg-white p-2 rounded-lg shadow-sm border border-purple-200">
        {lifeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            title={tab.title}
            className={`flex-1 px-2 py-2 rounded-md text-xl font-medium transition-all min-h-[44px] flex items-center justify-center ${
              activeTab === tab.key 
                ? 'bg-purple-600 text-white shadow-sm scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:scale-102'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  )
}