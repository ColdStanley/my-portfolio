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
      duration: 2.4,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    },
  }),
}

const floatImage = {
  animate: {
    y: [0, -4, 4, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export default function HeroImageGrid() {
  const router = useRouter()

  const handleKeywordClick = (path: string) => {
    router.push(path)
  }

  const interactiveSpanClass =
    'inline-block italic font-[Playfair_Display] underline-offset-2 hover:underline cursor-pointer transition-all'

  return (
    <section className="flex flex-col gap-6 w-full lg:w-2/3">
      {/* 顶部文字区 */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-snug tracking-tight">
          <span className="text-gray-700 dark:text-gray-300">Explore</span>{' '}
          <motion.span
            className={`${interactiveSpanClass} text-violet-500`}
            animate={floatKeyword.animate(0)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleKeywordClick('/technology')}
          >
            Technology
          </motion.span>
          ,{' '}
          <motion.span
            className={`${interactiveSpanClass} text-sky-500`}
            animate={floatKeyword.animate(0.4)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleKeywordClick('/knowledge')}
          >
            Knowledge
          </motion.span>{' '}
          <span className="text-gray-700 dark:text-gray-300">and</span>{' '}
          <motion.span
            className={`${interactiveSpanClass} text-amber-500`}
            animate={floatKeyword.animate(0.8)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleKeywordClick('/life')}
          >
            Life
          </motion.span>{' '}
          <span className="text-black dark:text-white font-semibold inline-flex items-center">
            with Music <span className="inline-block animate-bounce ml-1">🎧</span>
          </span>
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
          Dive into curated content across categories, powered by real stories and creativity.
        </p>
      </div>

      {/* 三张主卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {heroSections.map((section, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(section.link)}
            className="cursor-pointer rounded-2xl overflow-hidden shadow-md bg-white dark:bg-card border border-gray-100 dark:border-border transition-all duration-300 group"
            aria-label={`Go to ${section.title}`}
          >
            <motion.div
              className="w-full h-36 relative bg-white dark:bg-gray-800"
              animate={floatImage.animate}
            >
              <Image
                src={section.image}
                alt={`${section.title} banner`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                priority={index === 0}
              />
            </motion.div>
            <div className="p-4 text-center">
              <h2 className={`text-lg font-semibold ${section.colorClass}`}>{section.title}</h2>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{section.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
