'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useNotionCards } from '@/hooks/useNotionData'
import { CategoryType } from '@/types/common'

interface UnifiedCardSectionProps {
  category: CategoryType
  className?: string
}

export default function UnifiedCardSection({ category, className = '' }: UnifiedCardSectionProps) {
  const { cards, loading, error } = useNotionCards()

  // 过滤指定类别的卡片
  const filteredCards = cards.filter(
    (item) => item.category === category && item.section === 'Cards'
  )

  if (loading) {
    return (
      <section className={`flex flex-col gap-8 ${className}`}>
        <div className="text-center text-gray-500">Loading {category} projects...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`flex flex-col gap-8 ${className}`}>
        <div className="text-center text-red-500">Failed to load {category} projects</div>
      </section>
    )
  }

  return (
    <section className={`flex flex-col gap-8 ${className}`}>
      {filteredCards.map((card, idx) => (
        <motion.div
          key={card.id || card.slug || `card-${idx}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
        >
          <Link
            href={`/${card.category}/${card.slug}?id=${card.pageId}`}
            aria-label={`View ${card.title}`}
            className="group block bg-white border border-gray-200 rounded-2xl shadow-sm 
                       hover:shadow-xl hover:border-purple-300 
                       transition-all duration-300 ease-in-out 
                       overflow-hidden p-8"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* 图片部分 */}
              {card.imageUrl && (
                <div className="flex-shrink-0 w-full md:w-32 h-32 relative">
                  <Image
                    src={card.imageUrl}
                    alt={card.title || 'Project image'}
                    fill
                    className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* 内容部分 */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                  {card.title || 'Untitled Project'}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {card.content || 'No description available'}
                </p>

                {card.subtext && (
                  <p className="text-sm text-gray-500 mb-4">
                    {card.subtext}
                  </p>
                )}

                {/* 技术标签 */}
                {card.tech && card.tech.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {card.tech.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}

      {filteredCards.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No {category} projects available at the moment.
        </div>
      )}
    </section>
  )
}