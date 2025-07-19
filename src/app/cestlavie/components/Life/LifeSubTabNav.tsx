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

      {/* Mobile navigation - horizontal at top */}
      <div className="md:hidden flex justify-center space-x-2 mb-4 bg-white p-3 rounded-lg shadow-sm border border-purple-200">
        {lifeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg">{tab.label}</span>
              <span className="text-xs">{tab.title}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}