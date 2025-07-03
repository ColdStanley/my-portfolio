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
    <div className="flex min-h-screen font-sans text-gray-800">
      {/* 左侧固定导航栏（仅桌面端显示） */}
      <div className="hidden md:block">
        <SideNavigation currentTab={tabKey} onTabChange={setTabKey} />
      </div>

      {/* 移动端顶部 tab 切换按钮 */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-2 flex justify-around gap-2">
        {[
          { key: 'main', label: '📚 题库' },
          { key: 'custom', label: '✨ 定制' },
          { key: 'plan', label: '📅 计划' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTabKey(key as 'main' | 'custom' | 'plan')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              tabKey === key
                ? 'bg-purple-600 text-white shadow'
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
