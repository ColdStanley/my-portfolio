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

      {/* 移动端覆盖层侧边栏 */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
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
    </>
  )
}