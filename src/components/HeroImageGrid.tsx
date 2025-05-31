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
      transition={{ duration: 0.06, ease: 'linear' }}
      className="max-w-7xl mx-auto px-6 mb-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {heroCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.2 }}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl shadow-md overflow-hidden border border-gray-200 flex flex-col cursor-pointer transition-transform"
          >
            {/* Image 80% height */}
            <div className="relative h-48 w-full bg-white">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            {/* Caption 20% height */}
            <div className="bg-white p-4 text-sm text-gray-700 font-medium h-20 flex items-center justify-center text-center">
              {card.caption}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
