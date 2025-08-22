'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SubTabItem {
  key: string
  label: string
}

interface MainTabItem {
  key: string
  label: string
  subTabs?: SubTabItem[]
}

interface BottomAggregateNavigationProps {
  mainTabs: MainTabItem[]
  activeMainTab: string
  activeSubTab?: string
  onMainTabChange: (tab: string) => void
  onSubTabChange: (tab: string) => void
  className?: string
}

export default function BottomAggregateNavigation({
  mainTabs,
  activeMainTab,
  activeSubTab,
  onMainTabChange,
  onSubTabChange,
  className = ''
}: BottomAggregateNavigationProps) {
  const [expandedTab, setExpandedTab] = useState<string | null>(null)

  // Close expanded tab when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.aggregate-navigation')) {
        setExpandedTab(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMainTabClick = (tab: MainTabItem) => {
    if (tab.subTabs && tab.subTabs.length > 0) {
      // Toggle expansion for tabs with sub-tabs
      if (expandedTab === tab.key) {
        setExpandedTab(null)
      } else {
        setExpandedTab(tab.key)
        // Activate the main tab and first sub-tab
        onMainTabChange(tab.key)
        onSubTabChange(tab.subTabs[0].key)
      }
    } else {
      // Direct navigation for tabs without sub-tabs
      setExpandedTab(null)
      onMainTabChange(tab.key)
    }
  }

  const handleSubTabClick = (subTabKey: string) => {
    onSubTabChange(subTabKey)
    setExpandedTab(null) // Close after selection
  }

  return (
    <div className={`md:hidden aggregate-navigation ${className}`}>
      {/* Main Tab Buttons - Vertical Stack */}
      <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-4 z-50">
        {mainTabs.map((tab, index) => (
          <div key={tab.key} className="relative flex items-center gap-3">
            {/* Sub-tab expansion to the left */}
            <AnimatePresence>
              {expandedTab === tab.key && tab.subTabs && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: [0.34, 1.56, 0.64, 1] 
                  }}
                  className="flex items-center gap-2"
                >
                  {tab.subTabs.map((subTab, subIndex) => (
                    <motion.button
                      key={subTab.key}
                      initial={{ opacity: 0, scale: 0, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: subIndex * 0.05,
                        ease: [0.34, 1.56, 0.64, 1] 
                      }}
                      onClick={() => handleSubTabClick(subTab.key)}
                      className={`h-10 px-4 rounded-lg font-medium transition-all duration-200 whitespace-nowrap shadow-lg ${
                        activeSubTab === subTab.key
                          ? 'bg-purple-50 text-purple-700 border-2 border-purple-600'
                          : 'bg-white/90 backdrop-blur-md text-gray-700 border border-gray-200 hover:bg-white hover:shadow-xl'
                      }`}
                    >
                      {subTab.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Tab Button */}
            <motion.button
              onClick={() => handleMainTabClick(tab)}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: expandedTab === tab.key ? 1.1 : 1,
                boxShadow: expandedTab === tab.key 
                  ? '0 0 20px rgba(139, 92, 246, 0.4), 0 8px 32px rgba(0, 0, 0, 0.12)'
                  : '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
              transition={{ duration: 0.2 }}
              className={`w-14 h-14 rounded-full font-medium transition-all duration-200 flex items-center justify-center text-sm ${
                activeMainTab === tab.key || expandedTab === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'bg-white/90 backdrop-blur-md text-gray-700 border border-gray-200 hover:bg-white'
              }`}
            >
              {tab.label}
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  )
}