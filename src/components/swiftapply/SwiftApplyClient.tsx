'use client'

import { useEffect } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import Header from '@/components/swiftapply/Header'
import JDEditor from '@/components/swiftapply/JDEditor'
import ResumePreview from '@/components/swiftapply/ResumePreview'
import SettingsModal from '@/components/swiftapply/SettingsModal'
import AIProgressPanel from '@/components/swiftapply/AIProgressPanel'
import AIReviewModal from '@/components/swiftapply/AIReviewModal'

export default function SwiftApplyClient() {
  const {
    personalInfo,
    isSettingsOpen,
    openSettings,
    initializeFromStorage
  } = useSwiftApplyStore()

  // Initialize data from localStorage on mount
  useEffect(() => {
    initializeFromStorage()
  }, [initializeFromStorage])

  // Auto-open settings if no personal info
  useEffect(() => {
    if (!personalInfo && !isSettingsOpen) {
      openSettings(1)
    }
  }, [personalInfo, isSettingsOpen, openSettings])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      <Header />

      <main className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] gap-6 p-4 lg:p-6">
        {/* Left Panel - JD Editor (40% desktop, full width mobile) */}
        <div className="w-full lg:w-2/5 flex flex-col">
          <JDEditor />
        </div>

        {/* Right Panel - Resume Preview (60% desktop, full width mobile) */}
        <div className="w-full lg:w-3/5 flex flex-col">
          <ResumePreview />
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal />}

      {/* AI Progress Panel */}
      <AIProgressPanel />

      {/* AI Review Modal */}
      <AIReviewModal />
    </div>
  )
}