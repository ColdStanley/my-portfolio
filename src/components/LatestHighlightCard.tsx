'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Tooltip } from 'react-tooltip'

interface HighlightItem {
  title: string
  description?: string
  slug?: string
  category?: string
  tag?: string[]
}

function HighlightCard({ item, index }: { item: HighlightItem; index: number }) {
  const router = useRouter()

  const icon = '✨'
  const bgColor = index % 3 === 0
    ? 'bg-purple-50 dark:bg-purple-900'
    : index % 3 === 1
    ? 'bg-blue-50 dark:bg-blue-900'
    : 'bg-yellow-50 dark:bg-yellow-900'

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        if (item.slug?.startsWith('/')) {
          router.push(item.slug) // ✅ 绝对路径 slug
        } else if (item.slug && item.category) {
          router.push(`/${item.category}/${item.slug}?id=home-latest`) // ✅ 原有逻辑
        }
      }}
      className={`relative rounded-xl border border-dashed border-gray-300 dark:border-gray-600 
                 ${bgColor} px-3 py-2 shadow-sm transition-all duration-300 
                 flex flex-col justify-center h-[60px] cursor-pointer group`}
      data-tooltip-id={`tip-${index}`}
      data-tooltip-content={item.description || ''}
    >
      <div className="flex items-start gap-2">
        <div className="text-base mt-0.5">{icon}</div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug truncate">
            {item.title || 'Untitled'}
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5 truncate">
            {item.description || 'No description'}
          </p>
        </div>
      </div>
      <Tooltip id={`tip-${index}`} />
    </motion.div>
  )
}

export default function LatestSection() {
  const [data, setData] = useState<HighlightItem[]>([])

  useEffect(() => {
    fetch('/api/notion/page?pageId=home-latest')
      .then((res) => res.json())
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) setData(res.data)
        else setData([])
      })
      .catch((err) => {
        console.error('Failed to load highlights', err)
        setData([])
      })
  }, [])

  return (
    <aside className="w-full lg:w-1/3 pl-4 border-l border-gray-200 dark:border-gray-700 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-4 min-h-[28px]">
        <motion.div
          className="w-6 h-6 relative"
          animate={{
            rotate: [-2, 2, -2, 0],
            transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <Image src="/images/latest-banner.png" alt="latest" fill className="object-contain" />
        </motion.div>
        <span className="text-[17px] font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
          Latest Highlights
        </span>
      </div>

      <div className="grid grid-cols-2 grid-rows-5 gap-3 pr-1 min-h-[340px]">
        {data.map((item, i) => (
          <HighlightCard key={i} item={item} index={i} />
        ))}
      </div>
    </aside>
  )
}
