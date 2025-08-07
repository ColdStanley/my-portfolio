'use client'

import { useState } from 'react'
import { useReadLinguaStore } from './store/useReadLinguaStore'
import DashboardTab from './components/DashboardTab'
import LearningTab from './components/LearningTab'

export default function ReadLinguaPage() {
  const { activeTab, setActiveTab } = useReadLinguaStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Tab Navigation - Fixed at top for all tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-6 py-4 text-center font-medium whitespace-nowrap rounded-l-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex-1 px-6 py-4 text-center font-medium whitespace-nowrap rounded-r-xl transition-all ${
                activeTab === 'learning'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Learning
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="max-w-7xl mx-auto px-4">
          <DashboardTab />
        </div>
      )}
      {activeTab === 'learning' && <LearningTab />}
    </div>
  )
}