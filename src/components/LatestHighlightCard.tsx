'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface HighlightItem {
  title: string
  description?: string
  slug?: string
  category?: string
  section?: string
  status?: string
  order?: number
  tag?: string[]
  visibleOnSite?: boolean
}

export default function LatestSection() {
  const [data, setData] = useState<HighlightItem[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/notion?pageId=home-latest')
      .then(async (res) => {
        if (!res.ok) throw new Error('Fetch failed')
        return await res.json()
      })
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          const filtered = res.data
            .filter((item: any) => item?.status === 'Published' && item?.visibleOnSite === true)
            .sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))
          setData(filtered)
        } else {
          setData([])
        }
      })
      .catch((err) => {
        console.error('Failed to load highlights', err)
        setData([])
      })
  }, [])

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
