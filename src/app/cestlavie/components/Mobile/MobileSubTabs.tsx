'use client'

interface MobileSubTabsProps {
  activeSubTab: string
  onSubTabChange: (tab: string) => void
  show: boolean
}

export default function MobileSubTabs({ activeSubTab, onSubTabChange, show }: MobileSubTabsProps) {
  if (!show) return null

  const subTabs = [
    { id: 'task', label: 'Task' },
    { id: 'plan', label: 'Plan' },
    { id: 'strategy', label: 'Strategy' }
  ]

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 z-30">
      <div className="grid grid-cols-3 h-12">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSubTabChange(tab.id)}
            className={`flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              activeSubTab === tab.id
                ? 'text-purple-600 bg-purple-100 rounded-xl m-1 shadow-md'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-xl m-1'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}