'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TutorSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16"
    >
      <section className="bg-white rounded-2xl shadow-lg p-10 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-purple-700 mb-6">Knowledge</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          I’ve helped students from diverse backgrounds master tools like Excel, Python, and data analytics. Whether
          it’s 1-on-1 coaching or online classes, I focus on clarity, hands-on practice, and building confidence.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Teaching is not just about knowledge transfer, it’s about empowering people to solve real-world problems on
          their own.
        </p>
        <Link
          href="/tutor"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition hover:scale-105 duration-200 shadow-sm"
        >
          Learn more
        </Link>
      </section>
    </motion.section>
  )
}
