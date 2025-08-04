'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Explanation {
  word: string
  note: string
}

export default function ExplanationPanel() {
  const [list, setList] = useState<Explanation[]>([])

  // 提供给外部调用的添加函数（自动去重）
  useEffect(() => {
    (window as any).addExplanation = (entry: Explanation) => {
      setList(prev => {
        if (prev.some(item => item.word === entry.word)) return prev
        return [...prev, entry]
      })
    }
  }, [])

  if (list.length === 0) return null

  return (
    <div className="w-[35%] p-4 bg-white/80 backdrop-blur-sm z-10">
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max"
        style={{ gridAutoFlow: 'dense' }}
      >
        {list.map(({ word, note }, idx) => (
          <motion.div
            key={word + idx}
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut',
              delay: idx * 0.08,
            }}
            className="rounded-2xl bg-white shadow-md border border-gray-100 p-4 break-inside-avoid"
          >
            <h3 className="text-purple-700 font-semibold mb-2">🧠 {word}</h3>
            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
              {note}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
