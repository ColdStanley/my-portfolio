'use client'

interface MobileBottomTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function MobileBottomTabs({ activeTab, onTabChange }: MobileBottomTabsProps) {
  const tabs = [
    { id: 'life', label: 'Life', icon: '🌱' },
    { id: 'career', label: 'Career', icon: '💼' },
    { id: 'study', label: 'Study', icon: '📚' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-purple-200 z-40">
      <div className="grid grid-cols-3 h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      {/* Safe area padding for iPhone */}
      <div className="h-safe-bottom"></div>
    </div>
  )
}