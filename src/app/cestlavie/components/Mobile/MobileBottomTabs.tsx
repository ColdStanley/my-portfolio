'use client'

interface MobileBottomTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function MobileBottomTabs({ activeTab, onTabChange }: MobileBottomTabsProps) {
  const tabs = [
    { id: 'life', label: 'Life' },
    { id: 'career', label: 'Career' },
    { id: 'study', label: 'Study' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-purple-200 z-40">
      <div className="grid grid-cols-3 h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center transition-colors ${
              activeTab === tab.id
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      {/* Safe area padding for iPhone */}
      <div className="h-safe-bottom"></div>
    </div>
  )
}