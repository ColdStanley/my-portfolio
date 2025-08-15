'use client'

import { useState, useEffect } from 'react'
import { useIELTSStepStore } from './store/useIELTSStepStore'
import DashboardTab from './components/DashboardTab'
import LearningTab from './components/LearningTab'

export default function IELTSSpeakingStepByStepPage() {
  const { activeTab, setActiveTab, activePart, setActivePart, isPracticeExpanded, togglePracticeExpanded } = useIELTSStepStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isHoverOpen, setIsHoverOpen] = useState(false) // 区分hover和click开启
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)

  const parts = [
    { id: 'part1' as const, label: 'Part 1', title: 'Personal Questions' },
    { id: 'part2' as const, label: 'Part 2', title: 'Individual Long Turn' },
    { id: 'part3' as const, label: 'Part 3', title: 'Two-way Discussion' }
  ]

  const handlePracticeClick = () => {
    setActiveTab('learning')
    if (!isPracticeExpanded) {
      togglePracticeExpanded()
    }
  }

  const handlePracticeToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    togglePracticeExpanded()
  }

  // Click handler - only opens, never closes
  const handleClick = () => {
    setSidebarOpen(true)
    setIsHoverOpen(false) // Click mode
  }

  // Hover handlers for Notion-style auto expand (no backdrop)
  const handleHoverEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setSidebarOpen(true)
    setIsHoverOpen(true) // Hover mode
  }

  const handleHoverLeave = () => {
    const timeout = setTimeout(() => {
      if (isHoverOpen) { // Only auto-close if opened by hover
        setSidebarOpen(false)
        setIsHoverOpen(false)
      }
    }, 500) // 500ms delay before closing for better UX
    setHoverTimeout(timeout)
  }

  // Handle click outside to close sidebar
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Left Edge Hover Zone for Notion-style trigger */}
      <div 
        className="fixed top-0 left-0 w-8 h-full z-40"
        onMouseEnter={() => {
          console.log('Left edge hover triggered')
          handleHoverEnter()
        }}
        onMouseLeave={handleHoverLeave}
      />
      
      {/* Hamburger Menu Button */}
      <button
        onClick={handleClick}
        onMouseEnter={handleHoverEnter}
        onMouseLeave={handleHoverLeave}
        className="fixed top-20 left-4 z-50 p-2 bg-white hover:bg-gray-50 active:bg-gray-100 active:scale-95 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 transform hover:shadow-md"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Click outside overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30"
          onClick={handleClickOutside}
        />
      )}


      <div className="flex">
        {/* Left Sidebar Navigation - Notion Style Drawer */}
        <div 
          className={`fixed top-32 left-4 w-64 h-[calc(100vh-12rem)] bg-white border border-gray-200 rounded-xl shadow-lg z-50 transform transition-all duration-400 ${
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
          {/* Close Button */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-800">IELTS Speaking</h2>
            <button
              onClick={handleClickOutside}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-3">
            <div className="space-y-1">
              <div className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-md flex items-center justify-between ${
                  activeTab === 'learning'
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}>
                <button
                  onClick={handlePracticeClick}
                  className="flex items-center gap-2 flex-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Practice
                </button>
                <button
                  onClick={handlePracticeToggle}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <svg 
                    className={`w-3 h-3 transition-transform duration-200 ${isPracticeExpanded ? 'rotate-90' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Level 2: Parts */}
              {isPracticeExpanded && (
                <div className="pl-6 space-y-1">
                  {parts.map((part) => (
                    <button
                      key={part.id}
                      onClick={() => setActivePart(part.id)}
                      className={`w-full px-2 py-1.5 text-left text-sm transition-colors rounded-md ${
                        activePart === part.id
                          ? 'bg-gray-100 text-gray-800'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <div className="text-xs font-medium">{part.label}</div>
                      <div className="text-xs text-gray-500">{part.title}</div>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full px-3 py-2 text-left text-sm transition-colors rounded-md flex items-center gap-2 ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Results
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="min-h-screen bg-white/90 shadow-xl shadow-purple-500/10 pt-16">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'learning' && <LearningTab />}
          </div>
        </div>
      </div>
    </div>
  )
}