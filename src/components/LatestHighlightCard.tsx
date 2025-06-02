'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

function HighlightCard({
  title,
  icon,
  description,
}: {
  title: string
  icon?: string
  description?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 shadow-sm transition-all duration-300 flex flex-col justify-center h-[60px]"
    >
      <div className="flex items-start gap-2">
        <div className="text-base mt-0.5">{icon}</div>
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function LatestSection() {
  return (
    <aside className="w-full lg:w-1/3 pl-4 border-l border-gray-200 dark:border-gray-700 flex flex-col justify-between h-full">
      {/* 顶部图 + 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-6 h-6 relative"
          animate={{
            rotate: [-2, 2, -2, 0],
            transition: {
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <Image src="/images/latest-banner.png" alt="latest" fill className="object-contain" />
        </motion.div>
        <span className="text-base font-semibold text-gray-700 dark:text-gray-300 tracking-wide">
          Latest Highlights
        </span>
      </div>

      {/* 卡片区域：2列5行 */}
      <div className="grid grid-cols-2 grid-rows-5 gap-3 pr-1 h-full">
        <HighlightCard title="AI Launch" icon="🚀" description="New model online" />
        <HighlightCard title="500K Views" icon="📈" description="Milestone hit today" />
        <HighlightCard title="Excel Upgrade" icon="📊" description="Solver mode added" />
        <HighlightCard title="Lo-Fi Mix" icon="🎧" description="Study sounds live" />
        <HighlightCard title="French Class" icon="🇫🇷" description="Basics uploaded now" />
        <HighlightCard title="Visual Style" icon="🎨" description="Typography refreshed" />
        <HighlightCard title="1K+ Subs" icon="📬" description="Newsletter growth" />
        <HighlightCard title="Log + Music" icon="📓" description="Study sync ready" />
        <HighlightCard title="Tech Blog" icon="🖥️" description="Weekly articles live" />
        <HighlightCard title="Q2 Goals" icon="🎯" description="Updated task map" />
      </div>
    </aside>
  )
}
