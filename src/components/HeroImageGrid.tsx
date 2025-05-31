'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const heroCards = [
  {
    title: 'Technology',
    image: '/images/tech-banner.png',
    caption: 'Explore Tech Journey',
  },
  {
    title: 'Tutor',
    image: '/images/tutor-banner.png',
    caption: 'Knowledge Sharing, and Beyond',
  },
  {
    title: 'Life',
    image: '/images/life-banner.png',
    caption: 'Work Life Balance, and Beyond',
  },
]

export default function HeroImageGrid() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="fixed top-16 z-40 w-full bg-white px-6 pt-4 pb-6 shadow-md border-b border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {heroCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl shadow-md overflow-hidden border border-gray-200 flex flex-col cursor-pointer transition-transform"
          >
            {/* Image 80% height */}
            <div className="relative h-[200px] w-full bg-white">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            {/* Caption 20% height */}
            <div className="bg-white px-4 py-2 text-sm text-gray-700 font-medium min-h-[80px] flex items-center justify-center text-center">
              {card.caption}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
