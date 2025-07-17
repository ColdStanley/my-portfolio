'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTab } from '../context/TabContext'
import IELTSSpeakingQuestionBank from './IELTSSpeakingQuestionBank'
import IELTSSpeakingCustomPractice from './IELTSSpeakingCustomPractice'
import IELTSSpeakingStudyPlan from './IELTSSpeakingStudyPlan'

export default function TabContent() {
  const { activeTab } = useTab()

  return (
    <AnimatePresence mode="wait">
      {activeTab === 'main' && (
        <motion.div
          key="main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <IELTSSpeakingQuestionBank />
        </motion.div>
      )}

      {activeTab === 'custom' && (
        <motion.div
          key="custom"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <IELTSSpeakingCustomPractice />
        </motion.div>
      )}

      {activeTab === 'plan' && (
        <motion.div
          key="plan"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <IELTSSpeakingStudyPlan />
        </motion.div>
      )}
    </AnimatePresence>
  )
}