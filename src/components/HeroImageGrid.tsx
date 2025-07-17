'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const phrases = [
  { less: 'Less scrolling', more: 'More creating' },
  { less: 'Less waiting', more: 'More starting' },
  { less: 'Less overthinking', more: 'More doing' },
  { less: 'Less distraction', more: 'More clarity' },
]

export default function HeroImageGrid() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="w-full flex justify-center items-center h-[160px] sm:h-[180px] px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center text-center text-2xl sm:text-5xl font-semibold text-purple-600 gap-1 sm:gap-6"
        >
          <span>
            Less <span className="font-bold">{phrases[index].less.split(' ')[1]}</span>
          </span>
          <span className="hidden sm:inline">→</span>
          <span>
            More <span className="font-bold">{phrases[index].more.split(' ')[1]}</span>
          </span>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
