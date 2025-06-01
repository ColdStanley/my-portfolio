'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const heroCards = [
  {
    title: 'Technology Exploration',
    image: '/images/tech-banner.png',
    caption: 'Through Real Projects',
    imageFirst: true,
  },
  {
    title: 'Knowledge Sharing',
    image: '/images/knowledge-banner.png',
    caption: 'Curated by Theme',
    imageFirst: false,
  },
  {
    title: 'Enjoying Life',
    image: '/images/life-banner.png',
    caption: 'In Photos & Beyond',
    imageFirst: true,
  },
]

// 分类颜色映射
const categoryColors: Record<string, string> = {
  Technology: 'bg-blue-100 text-blue-800',
  Tutor: 'bg-purple-100 text-purple-800',
  Life: 'bg-green-100 text-green-800',
}

export default function HeroImageGrid() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative w-full bg-white px-6 pt-24 pb-2"
    >
      {/* 分行交错布局 */}
      <div className="space-y-8">
        {heroCards.map((card, index) => {
          const badgeClass = categoryColors[card.category] || 'bg-gray-100 text-gray-800'

          const imageElement = (
            <motion.div
              key={`img-${index}`}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="md:col-span-2 rounded-2xl shadow-md overflow-hidden border border-gray-200 transition-transform group"
            >
              <div className="relative h-[200px] w-full bg-white">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-contain p-4 transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>
            </motion.div>
          )

          const textElement = (
            <motion.div
              key={`txt-${index}`}
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="md:col-span-1 text-gray-800 text-center px-4 py-4"
            >
              <div className={`inline-block mb-2 text-xs font-semibold px-2 py-1 rounded-full ${badgeClass}`}>
                {card.category}
              </div>
              <h2 className="text-xl font-bold mb-1">{card.title}</h2>
              <p className="text-sm text-gray-600">{card.caption}</p>
            </motion.div>
          )

          return (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 items-center gap-4"
            >
              {card.imageFirst ? (
                <>
                  {imageElement}
                  {textElement}
                </>
              ) : (
                <>
                  {textElement}
                  {imageElement}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* 向下箭头按钮 */}
      <div className="w-full flex justify-center mt-4 mb-2">
        <button
          onClick={() => {
            const section = document.getElementById('home-cards');
            section?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-3xl text-purple-600 hover:text-purple-800 animate-bounce transition-all"
        >
          ↓
        </button>
      </div>
    </motion.section>
  )
}
