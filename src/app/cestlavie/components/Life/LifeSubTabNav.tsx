'use client'

const lifeTabs = [
  { key: 'strategy', label: '🎯', title: 'Strategy' },
  { key: 'plan', label: '📋', title: 'Plan' },
  { key: 'task', label: '✅', title: 'Task' },
  { key: 'tbd', label: '🔮', title: 'TBD' },
]

interface LifeSubTabNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onConfigClick?: () => void
}

export default function LifeSubTabNav({ activeTab, setActiveTab, onConfigClick }: LifeSubTabNavProps) {
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
        
        {/* Notion配置按钮 */}
        {onConfigClick && (
          <button
            onClick={onConfigClick}
            title="Configuration"
            className="w-10 h-10 rounded-full shadow bg-yellow-100 text-yellow-600 hover:bg-yellow-200 flex items-center justify-center text-lg transition-all"
          >
            ⚙️
          </button>
        )}
      </div>

      {/* Mobile navigation - 悬浮紧凑设计 */}
      <div className="md:hidden fixed top-48 right-4 z-30 flex flex-col space-y-1.5">
        {lifeTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            title={tab.title}
            className={`w-9 h-9 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center text-base transition-all ${
              activeTab === tab.key 
                ? 'bg-purple-600/90 text-white scale-110 shadow-purple-300' 
                : 'bg-white/90 text-gray-600 hover:bg-purple-100/90 hover:scale-105'
            }`}
          >
            {tab.label}
          </button>
        ))}
        
        {/* Mobile配置按钮 */}
        {onConfigClick && (
          <button
            onClick={onConfigClick}
            title="Configuration"
            className="w-9 h-9 rounded-full shadow-lg backdrop-blur-sm bg-yellow-100/90 text-yellow-600 hover:bg-yellow-200/90 hover:scale-105 flex items-center justify-center text-sm transition-all"
          >
            ⚙️
          </button>
        )}
      </div>
    </>
  )
}