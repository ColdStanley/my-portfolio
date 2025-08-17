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
    <div className="fixed bottom-16 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-200 z-30">
      <div className="grid grid-cols-3 h-12">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSubTabChange(tab.id)}
            className={`flex items-center justify-center text-sm font-medium transition-colors ${
              activeSubTab === tab.id
                ? 'text-purple-600 bg-purple-100 border-b-2 border-purple-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}