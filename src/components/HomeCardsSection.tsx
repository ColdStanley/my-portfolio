'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useNotionCards } from '@/hooks/useNotionData'
import { CardItem } from '@/types/common'

function CardColumn({ cards, title }: { cards: CardItem[], title: string }) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6">
      {/* 顶部标题：点击跳转，无下划线 */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03 }}
        onClick={() => router.push(`/${title.toLowerCase()}`)}
        className="text-lg font-semibold text-purple-800 text-center bg-white border border-purple-200 rounded-xl px-4 py-3 shadow-sm w-full 
                   dark:bg-gray-800 dark:border-purple-700 dark:text-white 
                   cursor-pointer transition-transform duration-200"
      >
        {title}
      </motion.div>

      {/* 卡片列表 */}
      {cards.map((card, idx) => (
        <motion.div
          key={card.id || card.slug || `card-${idx}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
        >
          <Link
            href={`/${card.category}/${card.slug}?id=${card.pageId}`}
            aria-label={`View ${card.title}`}
            className="block bg-white dark:bg-card dark:text-foreground rounded-2xl shadow-md border border-gray-100 dark:border-border 
                       hover:shadow-purple-300 dark:hover:shadow-purple-700 
                       hover:border-purple-400 active:scale-[0.98] active:shadow-inner 
                       transition-all duration-300 ease-in-out overflow-hidden 
                       flex flex-col justify-between p-6 cursor-pointer"
          >
            <div className="flex-1">
              <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                {card.title}
              </h3>

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
                Learn more <span className="text-lg">→</span>
              </div>

              {card.imageUrl && (
                <div className="w-[96px] h-[40px] ml-4 flex-shrink-0 bg-white dark:bg-gray-800 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm relative">
                  <Image
                    src={card.imageUrl}
                    alt={card.title}
                    fill
                    sizes="96px"
                    className="object-contain p-1 transition-transform duration-300 ease-in-out hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

interface HomeCardsSectionProps {
  initialCards?: CardItem[]
}

export default function HomeCardsSection({ initialCards = [] }: HomeCardsSectionProps) {
  // 如果有初始数据，使用它，否则客户端加载（向后兼容）
  const { cards: allCards, loading, error } = useNotionCards(initialCards.length > 0 ? undefined : 'cards')

  // 使用初始数据或客户端加载的数据
  const cards = initialCards.length > 0 ? initialCards : allCards.filter((item: CardItem) => item.section === 'Cards')

  const techCards = cards.filter(c => c.category === 'technology')
  const knowCards = cards.filter(c => c.category === 'knowledge')
  const lifeCards = cards.filter(c => c.category === 'life')

  // 只有在没有初始数据时才显示加载状态
  if (initialCards.length === 0 && loading) {
    return (
      <section id="home-cards" className="pt-4 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {['Technology', 'Knowledge', 'Life'].map((title) => (
            <div key={title} className="flex flex-col gap-6">
              <div className="text-lg font-semibold text-purple-800 text-center bg-white border border-purple-200 rounded-xl px-4 py-3 shadow-sm animate-pulse">
                {title}
              </div>
              <div className="text-center text-gray-500">Loading...</div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (initialCards.length === 0 && error) {
    return (
      <section id="home-cards" className="pt-4 px-6 max-w-7xl mx-auto">
        <div className="text-center text-red-500 py-8">
          Failed to load project cards: {error}
        </div>
      </section>
    )
  }

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
