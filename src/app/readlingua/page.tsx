'use client'

import { useState } from 'react'
import { useReadLinguaStore } from './store/useReadLinguaStore'
import DashboardTab from './components/DashboardTab'
import LearningTab from './components/LearningTab'

export default function ReadLinguaPage() {
  const { activeTab, setActiveTab } = useReadLinguaStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Desktop Tab Navigation - Fixed at top */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-3 py-3 sm:px-6 sm:py-4 text-center font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base rounded-l-xl ${
                activeTab === 'dashboard'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Articles</span>
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex-1 px-3 py-3 sm:px-6 sm:py-4 text-center font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base rounded-r-xl ${
                activeTab === 'learning'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span className="hidden sm:inline">Learning</span>
              <span className="sm:hidden">History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200"
        style={{
          boxShadow: '0 -4px 20px rgba(139, 92, 246, 0.15), 0 -2px 10px rgba(0, 0, 0, 0.1)'
        }}>
        <div className="flex">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 px-4 py-3 flex flex-col items-center gap-1 transition-all ${
              activeTab === 'dashboard'
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-purple-500'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            <span className="text-xs font-medium">Articles</span>
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`flex-1 px-4 py-3 flex flex-col items-center gap-1 transition-all ${
              activeTab === 'learning'
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-purple-500'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-xs font-medium">History</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="pb-20 md:pb-0">
        {activeTab === 'dashboard' && (
          <div className="md:max-w-7xl md:mx-auto md:px-4">
            <DashboardTab />
          </div>
        )}
        {activeTab === 'learning' && <LearningTab />}
      </div>
    </div>
  )
}