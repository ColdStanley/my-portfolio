'use client'

import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { theme } from '@/styles/theme.config'
import { ANIMATIONS } from './utils/animations'
import { useArticleStore } from './store/useArticleStore'
import ArticleInput from './components/ArticleInput'
import ArticleReader from './components/ArticleReader'
import QueryHistory from './components/QueryHistory'
import AIResponseModal from './components/AIResponseModal'
import SettingsTooltip from './components/SettingsTooltip'
import ArticleHistoryModal from './components/ArticleHistoryModal'
import QuizTabs from './components/quiz/QuizTabs'

export default function Article2LearnPage() {
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const hideTooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openSettingsTooltip = () => {
    if (hideTooltipTimeoutRef.current) {
      clearTimeout(hideTooltipTimeoutRef.current)
      hideTooltipTimeoutRef.current = null
    }
    setShowSettingsTooltip(true)
  }

  const scheduleCloseSettingsTooltip = () => {
    if (hideTooltipTimeoutRef.current) {
      clearTimeout(hideTooltipTimeoutRef.current)
    }
    hideTooltipTimeoutRef.current = setTimeout(() => {
      setShowSettingsTooltip(false)
      hideTooltipTimeoutRef.current = null
    }, 200)
  }

  const closeSettingsTooltipImmediately = () => {
    if (hideTooltipTimeoutRef.current) {
      clearTimeout(hideTooltipTimeoutRef.current)
      hideTooltipTimeoutRef.current = null
    }
    setShowSettingsTooltip(false)
  }

  const {
    activeTab,
    setActiveTab,
    isLearningMode,
    showSettingsTooltip,
    setShowSettingsTooltip,
  } = useArticleStore()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100/50">
      {/* 超远景装饰元素 */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-neutral-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-neutral-100/30 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] backdrop-blur-sm" style={{ borderColor: theme.neutralDark }}>
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo/Title */}
          <h1 className="text-xl font-semibold" style={{ color: theme.primary }}>
            Article2Learn
          </h1>

          {/* Settings Button */}
          <div className="relative">
            <button
              ref={settingsButtonRef}
              onMouseEnter={openSettingsTooltip}
              onMouseLeave={scheduleCloseSettingsTooltip}
              className="h-10 w-10 rounded-lg border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              style={{
                borderColor: theme.neutralDark,
                color: theme.primary,
              }}
              aria-label="Settings"
            >
              <svg
                className="mx-auto h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            <SettingsTooltip
              show={showSettingsTooltip}
              onClose={closeSettingsTooltipImmediately}
              buttonRef={settingsButtonRef.current}
              onMouseEnter={openSettingsTooltip}
              onMouseLeave={scheduleCloseSettingsTooltip}
            />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-[73px] z-10 border-b bg-white" style={{ borderColor: theme.neutralDark }}>
        <div className="px-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('article')}
              className={`rounded-t-lg border-b-2 px-4 py-4 text-sm font-medium transition-all duration-300 ease-out ${
                activeTab === 'article' ? 'shadow-[0_-2px_8px_rgba(0,0,0,0.04)]' : 'hover:bg-neutral-50/50'
              }`}
              style={{
                borderColor: activeTab === 'article' ? theme.primary : 'transparent',
                color: activeTab === 'article' ? theme.primary : theme.textSecondary,
                backgroundColor: activeTab === 'article' ? 'rgb(249, 250, 251)' : 'transparent',
              }}
            >
              Article
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-t-lg border-b-2 px-4 py-4 text-sm font-medium transition-all duration-300 ease-out ${
                activeTab === 'history' ? 'shadow-[0_-2px_8px_rgba(0,0,0,0.04)]' : 'hover:bg-neutral-50/50'
              }`}
              style={{
                borderColor: activeTab === 'history' ? theme.primary : 'transparent',
                color: activeTab === 'history' ? theme.primary : theme.textSecondary,
                backgroundColor: activeTab === 'history' ? 'rgb(249, 250, 251)' : 'transparent',
              }}
            >
              History
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`rounded-t-lg border-b-2 px-4 py-4 text-sm font-medium transition-all duration-300 ease-out ${
                activeTab === 'quiz' ? 'shadow-[0_-2px_8px_rgba(0,0,0,0.04)]' : 'hover:bg-neutral-50/50'
              }`}
              style={{
                borderColor: activeTab === 'quiz' ? theme.primary : 'transparent',
                color: activeTab === 'quiz' ? theme.primary : theme.textSecondary,
                backgroundColor: activeTab === 'quiz' ? 'rgb(249, 250, 251)' : 'transparent',
              }}
            >
              Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[calc(100vh-130px)]">
        <AnimatePresence mode="wait">
          {activeTab === 'article' && (
            <AnimatePresence mode="wait" key="article-tab">
              {isLearningMode ? <ArticleReader key="reader" /> : <ArticleInput key="input" />}
            </AnimatePresence>
          )}

          {activeTab === 'history' && (
            <motion.div key="history-tab" {...ANIMATIONS.contentSwitch}>
              <QueryHistory />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz-tab"
              {...ANIMATIONS.contentSwitch}
              className="h-[calc(100vh-130px)]"
            >
              <QuizTabs />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AIResponseModal />
      <ArticleHistoryModal />
    </div>
  )
}
