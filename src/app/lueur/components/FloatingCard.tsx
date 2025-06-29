'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface FloatingCardProps {
  text: string
  isSelected: boolean
  isError: boolean
  onClick: () => void
  type: 'word' | 'note'
}

export default function FloatingCard({
  text,
  isSelected,
  isError,
  onClick,
  type,
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <motion.div
        animate={{ y: [0, -4, 0, 4, 0] }}
        transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        whileHover={{ scale: 1.03 }}
        className={`
          px-4 py-3 rounded-xl shadow-md border cursor-pointer pointer-events-auto text-center
          transition duration-300 ease-in-out transform
          flex justify-center items-center
          ${type === 'word' ? 'w-[160px] bg-white text-purple-700' : 'w-[280px] bg-white text-gray-800'}
          ${isSelected ? (type === 'word' ? 'border-purple-500 scale-105' : 'border-green-500 scale-105') : 'border-gray-100'}
          ${isError ? 'animate-shake' : ''}
        `}
      >
        {text}
      </motion.div>
    </motion.div>
  )
}
