'use client'

import { useState } from 'react'
import { useIELTSStepStore } from './store/useIELTSStepStore'
import DashboardTab from './components/DashboardTab'
import LearningTab from './components/LearningTab'

export default function IELTSSpeakingStepByStepPage() {
  const { activeTab, setActiveTab, activePart, setActivePart, isPracticeExpanded, togglePracticeExpanded } = useIELTSStepStore()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <div className="flex">
        {/* Left Sidebar Navigation */}
        <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white/95 backdrop-blur-md shadow-xl shadow-purple-500/10 z-40 md:block hidden">
          <div className="p-6">
            {/* Level 1: Main Sections */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">IELTS Speaking</h2>
              
              <button
                onClick={handlePracticeClick}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                  activeTab === 'learning'
                    ? 'bg-purple-500 text-white hover:-translate-y-0.5'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Practice
                  </div>
                  <button
                    onClick={handlePracticeToggle}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${isPracticeExpanded ? 'rotate-90' : ''}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </button>

              {/* Level 2: Parts (only show when Practice is expanded) */}
              {isPracticeExpanded && (
                <div className="ml-6 space-y-1 mt-2">
                  {parts.map((part) => (
                    <button
                      key={part.id}
                      onClick={() => setActivePart(part.id)}
                      className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-out text-left ${
                        activePart === part.id
                          ? 'bg-gray-100 text-gray-800 hover:-translate-y-0.5'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:-translate-y-0.5'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{part.label}</div>
                        <div className="text-xs opacity-60">{part.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-out mt-3 ${
                  activeTab === 'dashboard'
                    ? 'bg-gray-100 text-gray-800 hover:-translate-y-0.5'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  Results
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64 ml-0">
          <div className="min-h-screen bg-white/90 shadow-xl shadow-purple-500/10 pt-16">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'learning' && <LearningTab />}
          </div>
        </div>
      </div>
    </div>
  )
}