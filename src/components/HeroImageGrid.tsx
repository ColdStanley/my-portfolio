'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const phrases = [
  { less: 'Less scrolling', more: 'More creating' },
  { less: 'Less waiting', more: 'More starting' },
  { less: 'Less overthinking', more: 'More doing' },
  { less: 'Less distraction', more: 'More clarity' },
]

export default function HeroTextBanner() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="w-full flex justify-center items-center h-[160px] sm:h-[180px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-center text-3xl sm:text-5xl font-semibold text-purple-600"
        >
          <span className="mr-6">
            Less <span className="font-bold">{phrases[index].less.split(' ')[1]}</span>
          </span>
          →
          <span className="ml-6">
            More <span className="font-bold">{phrases[index].more.split(' ')[1]}</span>
          </span>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
