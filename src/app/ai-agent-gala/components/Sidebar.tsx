'use client'

import { useState, useEffect } from 'react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const tabs = [
  { key: 'option1', label: 'Test Lab' },
  { key: 'option2', label: 'IELTS Speaking' },
  { key: 'option3', label: 'JD2CV 2.0' },
  { key: 'option4', label: 'Paragraphe Magique' },
]

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [isHoverOpen, setIsHoverOpen] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey)
  }

  // Notion-style handlers
  const handleClick = () => {
    // 清除任何现有的定时器
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setSidebarOpen(true)
    setIsHoverOpen(false) // 点击模式，不会自动关闭
  }

  const handleHoverEnter = () => {
    // 清除任何现有的定时器
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setSidebarOpen(true)
    setIsHoverOpen(true)
  }

  const handleHoverLeave = () => {
    // 不自动关闭，用户主动控制
  }

  const handleClickOutside = () => {
    // 清除定时器并关闭
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setSidebarOpen(false)
    setIsHoverOpen(false)
  }

  const handleSidebarEnter = () => {
    // 鼠标进入侧边栏，立即清除关闭定时器
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
  }

  const handleSidebarLeave = () => {
    // 不自动关闭，用户主动控制
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
        className="hidden md:block fixed top-0 left-0 w-12 h-full z-40"
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
          className="hidden md:block fixed inset-0 z-[60]"
          onClick={handleClickOutside}
        />
      )}

      {/* Desktop Sidebar - Notion Style Drawer */}
      <div 
        className={`hidden md:block fixed top-32 left-4 w-64 h-[calc(100vh-12rem)] bg-white border border-gray-200 rounded-xl shadow-lg z-[70] transform transition-all duration-400 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-lg'
        }`}
        style={{
          transitionTimingFunction: sidebarOpen 
            ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
            : 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-800">AI Agent Gala</h2>
          <button onClick={handleClickOutside} className="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Navigation Content */}
        <div className="p-3 flex flex-col h-full">
          <div className="space-y-1 flex-1">
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
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}