'use client'
import { motion } from 'framer-motion'

export default function FloatingBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* 渐变圆圈 1 */}
      <motion.div
        className="absolute top-[20%] left-[10%] w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"
        animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 渐变圆圈 2 */}
      <motion.div
        className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-purple-100 rounded-full blur-2xl opacity-20"
        animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
