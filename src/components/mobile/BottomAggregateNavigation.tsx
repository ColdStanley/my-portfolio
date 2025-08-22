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

  // Calculate fixed positions for main buttons
  const getMainButtonPosition = (index: number) => {
    const baseBottom = 24 // 6 * 4px = 24px (bottom-6)
    const buttonHeight = 56 // 14 * 4px = 56px (w-14 h-14)
    const gap = 16 // 4 * 4px = 16px (gap-4)
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
                  scale: 0.8, 
                  x: 30,
                  filter: 'blur(8px)'
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  x: 0,
                  filter: 'blur(0px)'
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9, 
                  x: 15,
                  filter: 'blur(4px)'
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.16, 1, 0.3, 1] // More sophisticated easing
                }}
                className="fixed z-50 flex items-center justify-end gap-3"
                style={{
                  bottom: `${getMainButtonPosition(index) + 7}px`, // Vertically center align with main button (56px/2 - 40px/2 = 8px offset)
                  right: '88px', // 24px (right-6) + 56px (button width) + 8px (gap)
                  height: '40px' // Match sub-button height for perfect alignment
                }}
              >
                {tab.subTabs.map((subTab, subIndex) => (
                  <motion.button
                    key={subTab.key}
                    initial={{ 
                      opacity: 0, 
                      scale: 0.6, 
                      x: 25,
                      y: 10,
                      rotateY: 45,
                      filter: 'blur(6px)'
                    }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      x: 0,
                      y: 0,
                      rotateY: 0,
                      filter: 'blur(0px)'
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      x: 15,
                      y: 5,
                      rotateY: 20,
                      filter: 'blur(3px)'
                    }}
                    transition={{ 
                      duration: 0.4, 
                      delay: subIndex * 0.08, // Slightly longer stagger for smoother effect
                      ease: [0.16, 1, 0.3, 1],
                      type: "spring",
                      damping: 20,
                      stiffness: 300
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -2,
                      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{
                      scale: 0.95,
                      y: 0,
                      transition: { duration: 0.1 }
                    }}
                    onClick={() => handleSubTabClick(subTab.key)}
                    className={`h-10 px-4 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
                      activeSubTab === subTab.key
                        ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-2 border-purple-600 shadow-lg'
                        : 'bg-white/95 backdrop-blur-md text-gray-700 border border-gray-200/60 shadow-md hover:bg-white hover:border-purple-300 hover:text-purple-600'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d'
                    }}
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
            className={`fixed w-14 h-14 rounded-full font-medium flex items-center justify-center text-sm z-50 transition-all duration-300 ${
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