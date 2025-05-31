'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function IntroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16"
    >
      <section className="bg-white rounded-2xl shadow-lg p-10 max-w-7xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold text-purple-700 mb-4">
          Hello, I’m Stanley!
        </h1>
        <p className="text-lg text-gray-800 mb-3 leading-relaxed">
          I’m a content creator, data analyst, and Python tutor based in Canada.
        </p>
        <p className="text-md text-gray-600 mb-6 leading-relaxed">
          This is my personal website where I share my work and journey.
        </p>
        <Link
          href="/about"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 hover:scale-105 transition-all duration-200 shadow-sm"
        >
          Learn more
        </Link>
      </section>
    </motion.section>
  )
}
