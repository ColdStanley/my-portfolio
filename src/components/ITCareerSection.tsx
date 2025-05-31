'use client'

import { motion } from 'framer-motion'

export default function ITCareerSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16"
    >
      <section className="bg-white rounded-2xl shadow-lg p-10 max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-purple-700 mb-6">My Journey in Tech</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          I've worked across a wide range of products, including hardware, software,
          full-stack solutions, big data platforms, artificial intelligence, and consulting services.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          My career spans American, Japanese, and Singaporean companies,
          from tech giants to fast-growing unicorn startups.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Starting as a hands-on engineer, I grew into regional and industry-specific
          leadership roles.
        </p>
        <a
          href="/tech-career"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition hover:scale-105 duration-200 shadow-sm"
        >
          Learn more
        </a>
      </section>
    </motion.section>
  )
}
