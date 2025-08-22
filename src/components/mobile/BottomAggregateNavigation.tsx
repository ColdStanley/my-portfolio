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

  // Calculate fixed positions for main buttons (smaller size)
  const getMainButtonPosition = (index: number) => {
    const baseBottom = 24 // 6 * 4px = 24px (bottom-6)
    const buttonHeight = 48 // 12 * 4px = 48px (w-12 h-12)
    const gap = 12 // 3 * 4px = 12px (gap-3)
    return baseBottom + index * (buttonHeight + gap)
  }

  return (
    <div className={`md:hidden aggregate-navigation ${className}`}>
      {/* Main Tab Buttons - Fixed Individual Positions */}
      {mainTabs.map((tab, index) => (
        <div key={tab.key}>
          {/* Sub-tab expansion - Absolute positioned relative to main button */}
          <AnimatePresence>
            {expandedTab === tab.key && tab.subTabs && (
              <motion.div
                initial={{ 
                  opacity: 0, 
                  x: 20
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0
                }}
                exit={{ 
                  opacity: 0, 
                  x: 10
                }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="fixed z-50 flex items-center justify-end gap-2"
                style={{
                  bottom: `${getMainButtonPosition(index) + 6}px`, // Vertically center align with main button (48px/2 - 36px/2 = 6px offset)
                  right: '80px', // 24px (right-6) + 48px (button width) + 8px (gap)
                  height: '36px' // Match sub-button height for perfect alignment
                }}
              >
                {tab.subTabs.map((subTab, subIndex) => (
                  <motion.button
                    key={subTab.key}
                    initial={{ 
                      opacity: 0, 
                      x: 15
                    }}
                    animate={{ 
                      opacity: 1, 
                      x: 0
                    }}
                    exit={{
                      opacity: 0,
                      x: 10
                    }}
                    transition={{ 
                      duration: 0.3, 
                      delay: subIndex * 0.05,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -1,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 }
                    }}
                    onClick={() => handleSubTabClick(subTab.key)}
                    className={`h-9 px-3 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                      activeSubTab === subTab.key
                        ? 'text-purple-700 border-purple-200 shadow-purple-100'
                        : 'text-gray-700 hover:text-purple-600 hover:border-purple-200'
                    }`}
                  >
                    {subTab.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Tab Button - Fixed Position */}
          <motion.button
            onClick={() => handleMainTabClick(tab)}
            whileTap={{ 
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
            whileHover={{
              scale: expandedTab === tab.key ? 1.15 : 1.05,
              transition: { duration: 0.2 }
            }}
            animate={{
              scale: expandedTab === tab.key ? 1.1 : 1,
              rotateZ: expandedTab === tab.key ? 5 : 0,
              boxShadow: expandedTab === tab.key 
                ? '0 0 25px rgba(139, 92, 246, 0.5), 0 12px 40px rgba(139, 92, 246, 0.15), 0 4px 20px rgba(0, 0, 0, 0.1)'
                : '0 6px 25px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.06)',
            }}
            transition={{ 
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
              type: "spring",
              damping: 15,
              stiffness: 200
            }}
            className={`fixed w-12 h-12 rounded-full font-medium flex items-center justify-center text-xs z-50 transition-all duration-300 ${
              activeMainTab === tab.key || expandedTab === tab.key
                ? 'bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-600 text-white border-2 border-white/20'
                : 'bg-white/95 backdrop-blur-md text-gray-700 border border-gray-200/80 hover:bg-white hover:text-purple-600 hover:border-purple-300'
            }`}
            style={{
              bottom: `${getMainButtonPosition(index)}px`,
              right: '24px', // right-6
              transformStyle: 'preserve-3d'
            }}
          >
            <motion.span
              animate={{
                rotateZ: expandedTab === tab.key ? -5 : 0,
              }}
              transition={{ 
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {tab.label}
            </motion.span>
          </motion.button>
        </div>
      ))}
    </div>
  )
}