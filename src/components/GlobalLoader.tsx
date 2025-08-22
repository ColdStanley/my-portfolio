'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function GlobalLoader() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    // 监听路由变化
    const handleRouteChange = () => {
      handleStart()
      // 模拟加载时间，实际项目中这会在页面加载完成时自动触发
      setTimeout(handleComplete, 300)
    }

    // 这里我们使用一个简化的方法来检测路由变化
    // 在真实项目中，Next.js 13+ 的 app router 有不同的处理方式
    let currentPath = window.location.pathname
    const checkRouteChange = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        handleRouteChange()
      }
    }

    const interval = setInterval(checkRouteChange, 100)
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center"
        >
          <div className="text-center space-y-4">
            {/* Loading spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"
            />
            
            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="text-gray-600 font-medium"
            >
              Loading...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}