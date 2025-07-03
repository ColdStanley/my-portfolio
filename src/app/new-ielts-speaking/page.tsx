'use client'

import { useEffect, useState } from 'react'
import SideNavigation from './components/SideNavigation'
import SpeakingQuestionBankView from './components/SpeakingQuestionBankView'
import SpeakingCustomAnswerView from './components/SpeakingCustomAnswerView'
import SpeakingBoosterPlanView from './components/SpeakingBoosterPlanView'
import { Toaster } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'

export default function NewIELTSSpeakingPage() {
  const [tabKey, setTabKey] = useState<'main' | 'custom' | 'plan'>('main')

  return (
    <div className="flex min-h-screen font-sans text-gray-800 relative">
      {/* 左侧固定导航栏（仅桌面端） */}
      <div className="hidden md:block">
        <SideNavigation currentTab={tabKey} onTabChange={setTabKey} />
      </div>

      {/* 移动端右上角竖排按钮（在 NavBar 下方） */}
      <div className="md:hidden fixed top-[64px] right-4 z-30 flex flex-col gap-2">
        {[
          { key: 'main', label: '📚 题库' },
          { key: 'custom', label: '✨ 定制' },
          { key: 'plan', label: '📅 计划' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTabKey(key as 'main' | 'custom' | 'plan')}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow transition-all ${
              tabKey === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 右侧主内容区域 */}
      <main className="ml-0 md:ml-64 flex-1 flex flex-col justify-start gap-8 p-6 max-w-7xl mx-auto scroll-smooth pt-[64px] md:pt-0">
        <Toaster />

        <AnimatePresence mode="wait">
          {tabKey === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SpeakingQuestionBankView />
            </motion.div>
          )}

          {tabKey === 'custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SpeakingCustomAnswerView />
            </motion.div>
          )}

          {tabKey === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SpeakingBoosterPlanView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
