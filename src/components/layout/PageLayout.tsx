'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageLayoutProps {
  title: string
  subtitle?: string
  description?: string
  children: ReactNode
  className?: string
  showComingSoon?: boolean
}

export default function PageLayout({
  title,
  subtitle,
  description,
  children,
  className = '',
  showComingSoon = true
}: PageLayoutProps) {
  return (
    <main className={`min-h-screen pt-28 pb-20 px-6 md:px-12 bg-gray-50 dark:bg-background ${className}`}>
      {/* 页面标题区域 */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14 max-w-4xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-purple-700 dark:text-purple-300 mb-6 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed px-2">
            {description}
          </p>
        )}
      </motion.section>

      {/* 主体内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 max-w-7xl mx-auto">
        {/* 左侧：主要内容 */}
        <div className="w-full">
          {children}
        </div>

        {/* 右侧：侧边栏 */}
        {showComingSoon && (
          <aside className="hidden lg:block">
            <ComingSoonSidebar />
          </aside>
        )}
      </div>
    </main>
  )
}

// 简化的侧边栏组件
function ComingSoonSidebar() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Coming Soon
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        More exciting features and content are on the way. Stay tuned!
      </p>
    </div>
  )
}

// 预设的页面标题组件
interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  emoji?: string
}

export function PageHeader({ title, subtitle, description, emoji }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-4">
        {emoji && <span className="mr-3">{emoji}</span>}
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
          {subtitle}
        </p>
      )}
      {description && (
        <p className="text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </motion.div>
  )
}