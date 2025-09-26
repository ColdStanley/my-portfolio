'use client'

import { useEffect, useRef, useState } from 'react'
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
    initializeFromStorage,
    hasStoredData,
    ai: { isGenerating, generatedContent, showProgressPanel }
  } = useSwiftApplyStore()

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Initialize data from localStorage on mount
  useEffect(() => {
    initializeFromStorage()
  }, [initializeFromStorage])

  // Auto-open settings only if no stored data (first-time users)
  useEffect(() => {
    if (!hasStoredData() && !isSettingsOpen) {
      openSettings(1)
    }
  }, [hasStoredData, isSettingsOpen, openSettings])

  // Handle scroll state for navigation arrows
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }

  // Initialize scroll state
  useEffect(() => {
    const timeoutId = setTimeout(updateScrollState, 100)
    return () => clearTimeout(timeoutId)
  }, [isGenerating, generatedContent, showProgressPanel])

  const scrollTo = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Horizontal Navigation Arrows */}
      {(canScrollLeft || canScrollRight) && (
        <>
          {canScrollLeft && (
            <button
              onClick={() => scrollTo('left')}
              className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-text-secondary hover:text-primary border border-neutral-dark"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scrollTo('right')}
              className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-text-secondary hover:text-primary border border-neutral-dark"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </>
      )}

      <main
        ref={scrollContainerRef}
        onScroll={updateScrollState}
        className="overflow-x-auto overflow-y-hidden h-[calc(100vh-4rem)] p-4 lg:p-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          main::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div className="flex gap-6 h-full min-w-full">
          {/* Panel 1 - JD Editor */}
          <div className="w-[400px] lg:w-[500px] flex-shrink-0 flex flex-col">
            <JDEditor />
          </div>

          {/* Panel 2 - AI Progress Panel (visible during processing and after completion) */}
          {(isGenerating || showProgressPanel || generatedContent) && (
            <div className="w-[400px] lg:w-[500px] flex-shrink-0 flex flex-col">
              <AIProgressPanel />
            </div>
          )}

          {/* Panel 3 - AI Review Panel (visible when AI is complete for editing and download) */}
          {generatedContent && (
            <div className="w-[600px] lg:w-[700px] flex-shrink-0 flex flex-col">
              <AIReviewModal />
            </div>
          )}

          {/* Panel 4 - Resume Preview */}
          <div className="w-[500px] lg:w-[600px] flex-shrink-0 flex flex-col">
            <ResumePreview />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal />}
    </div>
  )
}