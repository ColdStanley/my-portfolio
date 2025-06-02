'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface CardItem {
  id: string
  title: string
  content: string
  subtext: string
  link: string
  imageUrl: string
  category: string
  slug: string
  section: string
  tech?: string[]
  pageId?: string
}

export default function TechnologyCardSection() {
  const [techCards, setTechCards] = useState<CardItem[]>([])

  useEffect(() => {
    fetch('/api/notion')
      .then((res) => res.json())
      .then((data) => {
        const cards: CardItem[] = data.data.filter(
          (item: CardItem) => item.category === 'technology' && item.section === 'Cards'
        )
        setTechCards(cards)
      })
  }, [])

  return (
    <section className="flex flex-col gap-8">
      {techCards.map((card, idx) => (
        <motion.div
          key={card.id || card.slug || `card-${idx}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: idx * 0.1, ease: 'easeOut' }}
          className="bg-white dark:bg-card dark:text-foreground rounded-2xl shadow-md border border-gray-100 dark:border-border 
                     hover:shadow-purple-300 dark:hover:shadow-purple-700 
                     hover:border-purple-400 active:scale-[0.98] active:shadow-inner 
                     transition-all duration-300 ease-in-out overflow-hidden 
                     flex flex-col justify-between p-6 cursor-pointer"
        >
          <Link href={`/${card.category}/${card.slug}?id=${card.pageId}`}>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                {card.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-200 mb-2 leading-relaxed whitespace-pre-line">
                {card.content}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {card.subtext}
              </p>

              {card.tech && card.tech.length > 0 && (
                <div className="flex flex-wrap gap-2 my-4">
                  {card.tech.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="text-purple-600 dark:text-purple-300 text-sm font-medium flex items-center gap-1 transition-transform group-hover:translate-x-1">
                View Project <span className="text-lg">→</span>
              </div>

              {card.imageUrl && (
                <div className="w-[96px] h-[40px] ml-4 flex-shrink-0 bg-white dark:bg-gray-800 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm relative">
                  <Image
                    src={card.imageUrl}
                    alt={card.title}
                    fill
                    className="object-contain p-1 transition-transform duration-300 ease-in-out hover:scale-105"
                  />
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </section>
  )
}
