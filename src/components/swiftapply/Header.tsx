'use client'

import { useState } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import ConfirmDialog from './ConfirmDialog'

export default function Header() {
  const { openSettings, clearAll } = useSwiftApplyStore()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleClearAll = () => {
    setShowClearConfirm(true)
  }

  const confirmClearAll = () => {
    clearAll()
  }

  const handleGenerateCV = () => {
    const { personalInfo, templates, jobTitle, jobDescription, startAIGeneration } = useSwiftApplyStore.getState()

    if (!personalInfo) {
      alert('Please configure your personal information first')
      return
    }

    if (!jobTitle.trim()) {
      alert('Please enter a job title first')
      return
    }

    if (!jobDescription.trim()) {
      alert('Please enter a job description first')
      return
    }

    if (templates.length === 0) {
      alert('Please create at least one experience template')
      return
    }

    // Start AI generation
    startAIGeneration()
  }

  return (
    <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm0 6h6v2H7v-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            SwiftApply
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Clear All */}
          <button
            onClick={handleClearAll}
            className="hidden sm:block px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear all data"
          >
            Clear All
          </button>
          {/* Mobile Clear All */}
          <button
            onClick={handleClearAll}
            className="sm:hidden p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear all data"
            aria-label="Clear all data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Generate CV Button (AI Enabled) - Desktop */}
          <button
            onClick={handleGenerateCV}
            className="hidden sm:block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            title="Generate AI-powered resume"
          >
            Generate CV
          </button>

          {/* Generate CV Button (AI Enabled) - Mobile */}
          <button
            onClick={handleGenerateCV}
            className="sm:hidden p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="Generate AI-powered resume"
            aria-label="Generate AI-powered resume"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => openSettings()}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Settings"
            aria-label="Open Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClearAll}
        title="Clear All Data"
        message="This will permanently delete all your personal information, experience templates, and job description. This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
      />
    </header>
  )
}