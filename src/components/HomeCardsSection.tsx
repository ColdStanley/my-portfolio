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
}

function CardColumn({ cards, title }: { cards: CardItem[], title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-purple-800 text-center bg-white border border-purple-200 rounded-xl px-4 py-3 shadow-sm w-full">
        {title}
      </h2>

      {cards.map((card, idx) => (
        <motion.div
          key={card.id || card.slug || `card-${idx}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: idx * 0.1 }}
          whileHover={{ scale: 1.02, opacity: 0.98 }}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 overflow-hidden border border-gray-100 flex flex-col justify-between p-6 cursor-pointer"
        >
          <div className="flex-1">
            <h3 className="text-xl font-bold text-purple-700 mb-2">{card.title}</h3>

            <p className="text-gray-700 mb-2 leading-relaxed whitespace-pre-line">{card.content}</p>
            <p className="text-sm text-gray-500 italic">{card.subtext}</p>

            {card.tech && card.tech.length > 0 && (
              <div className="flex flex-wrap gap-2 my-4">
                {card.tech.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <Link
              href={`/${card.category}/${card.slug}?id=${card.pageId}`}
              className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Learn more
            </Link>

            {/* ✅ 图片宽高与 Learn more 按钮一致 */}
            {card.imageUrl && (
              <div className="w-[96px] h-[40px] ml-4 flex-shrink-0 bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm relative">
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  className="object-contain p-1"
                />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function HomeCardsSection() {
  const [cards, setCards] = useState<CardItem[]>([])

  useEffect(() => {
    fetch('/api/notion')
      .then((res) => res.json())
      .then((data) => {
        const cardItems: CardItem[] = data.data.filter(
          (item: CardItem) => item.section === 'Cards'
        )
        setCards(cardItems)
      })
  }, [])

  const techCards = cards.filter(c => c.category === 'technology')
  const knowCards = cards.filter(c => c.category === 'knowledge')
  const lifeCards = cards.filter(c => c.category === 'life')

  return (
    <section id="home-cards" className="pt-4 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <CardColumn cards={techCards} title="Technology" />
        <CardColumn cards={knowCards} title="Knowledge" />
        <CardColumn cards={lifeCards} title="Life" />
      </div>
    </section>
  )
}
