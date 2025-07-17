'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useNotionHighlights } from '@/hooks/useNotionData'
import { HighlightItem } from '@/types/common'

interface LatestSectionProps {
  initialHighlights?: HighlightItem[]
}

export default function LatestSection({ initialHighlights = [] }: LatestSectionProps) {
  const router = useRouter()
  
  // 如果有初始数据，使用它，否则客户端加载（向后兼容）
  const { highlights: clientHighlights, loading, error } = useNotionHighlights(initialHighlights.length > 0)
  
  // 使用初始数据或客户端加载的数据
  const data = initialHighlights.length > 0 ? initialHighlights : clientHighlights

  // 只有在没有初始数据时才显示加载状态
  if (initialHighlights.length === 0 && loading) {
    return (
      <section className="w-full flex flex-col gap-6">
        <div className="text-center text-gray-500">Loading latest highlights...</div>
      </section>
    )
  }

  if (initialHighlights.length === 0 && error) {
    return (
      <section className="w-full flex flex-col gap-6">
        <div className="text-center text-red-500">Failed to load highlights: {error}</div>
      </section>
    )
  }

  const leftCards = data.slice(0, 2)
  const rightCards = data.slice(2)

  return (
    <section className="w-full flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row w-full gap-6 items-start">
        {/* 左侧：2个卡片并排，固定长方形高度 */}
        <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
          {leftCards.map((item, index) => {
            const isActive = !item.description?.includes('Coming soon')
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (item.slug?.startsWith('/')) {
                    router.push(item.slug)
                  } else if (item.slug && item.category) {
                    router.push(`/${item.category}/${item.slug}?id=home-latest`)
                  }
                }}
                className="relative cursor-pointer bg-white dark:bg-card dark:text-foreground rounded-2xl shadow-md border border-gray-100 dark:border-border 
                           hover:shadow-purple-300 dark:hover:shadow-purple-700 
                           hover:border-purple-400 active:scale-[0.98] active:shadow-inner 
                           transition-all duration-300 ease-in-out overflow-hidden p-6 min-h-[150px] max-h-[200px] flex flex-col justify-center items-center"
              >
                {isActive && (
                  <div className="absolute top-2 right-2 text-[10px] font-medium text-white bg-purple-600 px-1.5 py-0.5 rounded shadow">
                    LIVE
                  </div>
                )}
                <motion.div
                  animate={
                    isActive
                      ? {
                          scale: [1, 1.05, 1],
                          transition: {
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        }
                      : undefined
                  }
                >
                  <div className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2 text-center">
                    {item.title || 'Untitled'}
                  </div>
                </motion.div>
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {item.description || 'No description'}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 右侧：2行×2列，卡片高度=66px + gap对齐左侧 */}
        <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
          {rightCards.map((item, index) => {
            const isActive = !item.description?.includes('Coming soon')
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (item.slug?.startsWith('/')) {
                    router.push(item.slug)
                  } else if (item.slug && item.category) {
                    router.push(`/${item.category}/${item.slug}?id=home-latest`)
                  }
                }}
                className="relative cursor-pointer bg-white dark:bg-card dark:text-foreground rounded-2xl shadow-md border border-gray-100 dark:border-border 
                           hover:shadow-purple-300 dark:hover:shadow-purple-700 
                           hover:border-purple-400 active:scale-[0.98] active:shadow-inner 
                           transition-all duration-300 ease-in-out overflow-hidden p-3 min-h-[66px] max-h-[66px]"
              >
                {isActive && (
                  <div className="absolute top-2 right-2 text-[10px] font-medium text-white bg-purple-600 px-1.5 py-0.5 rounded shadow">
                    LIVE
                  </div>
                )}
                <motion.div
                  animate={
                    isActive
                      ? {
                          scale: [1, 1.05, 1],
                          transition: {
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        }
                      : undefined
                  }
                >
                  <div className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1 truncate">
                    {item.title || 'Untitled'}
                  </div>
                </motion.div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {item.description || 'No description'}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
