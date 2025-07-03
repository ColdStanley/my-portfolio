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
      {/* 左侧固定导航栏 */}
      <SideNavigation currentTab={tabKey} onTabChange={setTabKey} />

      {/* 右侧主内容区域，靠右偏移，避免被遮挡 */}
      <main className="ml-64 flex-1 flex flex-col justify-start gap-8 p-6 max-w-7xl mx-auto scroll-smooth">
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