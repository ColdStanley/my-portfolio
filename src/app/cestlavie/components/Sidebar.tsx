'use client'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void
}

const tabs = [
  { key: 'life', label: 'Life', icon: '🌱' },
  { key: 'career', label: 'Career', icon: '💼' },
  { key: 'study', label: 'Study', icon: '📚' },
]

export default function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey)
    // 移动端点击后关闭菜单
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }

  return (
    <>
      {/* 桌面端侧边栏 - 保持原样 */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 h-full flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-purple-600">C'est la vie!</h1>
        </div>
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 transform ${
                  activeTab === tab.key
                    ? 'bg-purple-100 text-purple-700 font-medium scale-105 shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:scale-102'
                }`}
              >
                <span className="text-xl transition-transform duration-300">{tab.icon}</span>
                <span className="transition-all duration-300">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* 移动端右上角下拉菜单 */}
      <div className={`md:hidden fixed top-16 right-4 bg-white shadow-xl z-40 rounded-lg border border-gray-200 transform transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
      }`}>
        <nav className="p-2">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 min-w-[160px] ${
                  activeTab === tab.key
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}