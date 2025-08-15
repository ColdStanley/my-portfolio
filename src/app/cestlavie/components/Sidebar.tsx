'use client'

import { useState, useEffect } from 'react'

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  plan: string[]
  priority_quadrant: string
  note: string
  actual_start?: string
  actual_end?: string
  budget_time: number
  actual_time: number
  quality_rating?: number
  next?: string
  is_plan_critical?: boolean
}

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void
  onConfigClick?: () => void
  tasks?: TaskRecord[]
}

const tabs = [
  { key: 'life', label: 'Life', icon: '🌱' },
  { key: 'career', label: 'Career', icon: '💼' },
  { key: 'study', label: 'Study', icon: '📚' },
]

export default function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen, tasks = [] }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isHoverOpen, setIsHoverOpen] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey)
    // 移动端点击后关闭菜单
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false)
    }
  }

  // Notion-style handlers
  const handleClick = () => {
    setSidebarOpen(true)
    setIsHoverOpen(false)
  }

  const handleHoverEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setSidebarOpen(true)
    setIsHoverOpen(true)
  }

  const handleHoverLeave = () => {
    const timeout = setTimeout(() => {
      if (isHoverOpen) {
        setSidebarOpen(false)
        setIsHoverOpen(false)
      }
    }, 500)
    setHoverTimeout(timeout)
  }

  const handleClickOutside = () => {
    setSidebarOpen(false)
    setIsHoverOpen(false)
  }

  const handleSidebarHover = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
  }

  // ESC key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClickOutside()
      }
    }
    if (sidebarOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  return (
    <>
      {/* Left Edge Hover Zone for Notion-style trigger */}
      <div 
        className="hidden md:block fixed top-0 left-0 w-8 h-full z-40"
        onMouseEnter={handleHoverEnter}
        onMouseLeave={handleHoverLeave}
      />
      
      {/* Hamburger Menu Button */}
      <button
        onClick={handleClick}
        onMouseEnter={handleHoverEnter}
        onMouseLeave={handleHoverLeave}
        className="hidden md:block fixed top-20 left-4 z-50 p-2 bg-white hover:bg-gray-50 active:bg-gray-100 active:scale-95 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 transform hover:shadow-md"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Click Outside Overlay */}
      {sidebarOpen && (
        <div 
          className="hidden md:block fixed inset-0 z-30"
          onClick={handleClickOutside}
        />
      )}

      {/* Desktop Sidebar - Notion Style Drawer */}
      <div 
        className={`hidden md:block fixed top-32 left-4 w-64 h-[calc(100vh-12rem)] bg-white border border-gray-200 rounded-xl shadow-lg z-50 transform transition-all duration-400 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-lg'
        }`}
        style={{
          transitionTimingFunction: sidebarOpen 
            ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
            : 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
        onMouseEnter={handleSidebarHover}
        onMouseLeave={handleHoverLeave}
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-800">C'est la vie!</h2>
          <button onClick={handleClickOutside} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Navigation Content */}
        <div className="p-3">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-md flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 移动端右上角下拉菜单 - 保持原样 */}
      <div className={`md:hidden fixed top-32 right-4 bg-white shadow-2xl z-40 rounded-xl border border-gray-200 backdrop-blur-sm bg-white/95 transform transition-all duration-300 ease-in-out ${
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