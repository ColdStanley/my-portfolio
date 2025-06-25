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

  return (
    <section className="w-full flex flex-col gap-6">
      {/* 标题栏 */}
      <div className="flex items-center gap-2">
        <motion.div
          className="w-6 h-6 relative"
          animate={{
            rotate: [-2, 2, -2, 0],
            transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <Image
            src="/images/latest-banner.png"
            alt="latest"
            fill
            sizes="24px"
            className="object-contain"
          />
        </motion.div>
        <span className="text-[17px] font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
          Latest Highlights
        </span>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.slice(0, 8).map((item, index) => {
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
                         transition-all duration-300 ease-in-out overflow-hidden p-5"
            >
              {/* LIVE 角标 */}
              {isActive && (
                <div className="absolute top-2 right-2 text-[10px] font-medium text-white bg-purple-600 px-1.5 py-0.5 rounded shadow">
                  LIVE
                </div>
              )}

              {/* 标题区 */}
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

              {/* 描述区 */}
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {item.description || 'No description'}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
