'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const heroSections = [
  {
    title: 'Technology',
    subtitle: 'Through Real Projects',
    image: '/images/tech-banner.png',
    link: '/technology',
    colorClass: 'text-violet-500',
  },
  {
    title: 'Knowledge',
    subtitle: 'Curated by Theme',
    image: '/images/knowledge-banner.png',
    link: '/knowledge',
    colorClass: 'text-sky-500',
  },
  {
    title: 'Life',
    subtitle: 'Moments and Reflections',
    image: '/images/life-banner.png',
    link: '/life',
    colorClass: 'text-amber-500',
  },
]

const floatKeyword = {
  animate: (delay = 0) => ({
    x: [-2, 2, -2, 0],
    y: [0, -2, 2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    },
  }),
}

const floatImage = {
  animate: {
    y: [0, -3, 3, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export default function HeroImageGrid() {
  const router = useRouter()

  return (
    <section className="relative w-full px-4 md:px-8 pt-6 pb-4">
      {/* 顶部标题区域 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-medium text-gray-900 leading-snug">
          <span className="text-gray-700">Explore</span>{' '}
          <motion.span
            className="inline-block italic font-[Playfair_Display] text-violet-500"
            animate={floatKeyword.animate(0)}
          >
            Technology
          </motion.span>
          ,{' '}
          <motion.span
            className="inline-block italic font-[Playfair_Display] text-sky-500"
            animate={floatKeyword.animate(0.4)}
          >
            Knowledge
          </motion.span>{' '}
          <span className="text-gray-700">and</span>{' '}
          <motion.span
            className="inline-block italic font-[Playfair_Display] text-amber-500"
            animate={floatKeyword.animate(0.8)}
          >
            Life
          </motion.span>{' '}
          <span className="text-black font-semibold inline-flex items-center">
            with Music <span className="inline-block animate-bounce ml-1">🎧</span>
          </span>
        </h1>
        <p className="text-lg text-black mt-2">
          Dive into curated content across categories, powered by real stories and creativity.
        </p>
      </div>

      {/* 三栏卡片区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {heroSections.map((section, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer rounded-2xl overflow-hidden shadow-md bg-white transition-all duration-300"
            onClick={() => router.push(section.link)}
          >
            <motion.div
              className="w-full h-48 relative bg-white"
              animate={floatImage.animate}
            >
              <Image
                src={section.image}
                alt={section.title}
                fill
                className="object-contain p-4"
              />
            </motion.div>
            <div className="p-4 text-center">
              <h2 className={`text-xl font-semibold ${section.colorClass}`}>{section.title}</h2>
              <p className="text-sm text-black mt-1">{section.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 向下滚动引导箭头 */}
      <div className="flex justify-center mt-8 animate-bounce">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
