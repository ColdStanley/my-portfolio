'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import RenderBlock from '@/components/notion/RenderBlock'

interface CardData {
  id: string
  pageId: string
  title: string
  content: string
  subtext: string
  link: string
  imageUrl: string
  category: string
  slug: string
  body: string
}

export default function DetailPage() {
  const { category, slug } = useParams() as { category: string; slug: string }

  const [item, setItem] = useState<CardData | null>(null)
  const [blocks, setBlocks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    fetch('/api/notion')
      .then(res => res.json())
      .then(data => {
        const found = data.data.find(
          (i: CardData) =>
            i.slug.toLowerCase() === slug.toLowerCase() &&
            i.category.toLowerCase() === category.toLowerCase()
        )
        if (found) {
          setItem(found)
        } else {
          setError('Page not found.')
        }
        setIsLoading(false)
      })
      .catch(() => {
        setError('Failed to load content.')
        setIsLoading(false)
      })
  }, [category, slug])

  useEffect(() => {
    if (item?.pageId) {
      fetch(`/api/notion/page?pageId=${item.pageId}`)
        .then(res => res.json())
        .then(data => {
          setBlocks(data.blocks || [])
        })
        .catch(() => {
          setError('Failed to load page content.')
        })
    }
  }, [item?.pageId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-sm text-gray-500 gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        <span>Loading page content…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-20">
        🚫 {error}
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center text-gray-500 py-20">
        ⚠️ Page data not available.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8 fade-in">
      <h1 className="text-3xl font-bold text-purple-700 mb-2">{item.title}</h1>

      <div className="flex justify-between items-start mb-6 gap-4">
        <p className="text-gray-600 italic">{item.subtext}</p>

        {item.imageUrl && (
          <div className="min-w-[160px] max-w-[200px]">
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={300}
              height={180}
              className="w-full h-auto rounded-xl shadow fade-image"
              sizes="(max-width: 768px) 100vw, 300px"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      <article className="prose dark:prose-invert max-w-none text-[17px]">
        <RenderBlock blocks={blocks} />
      </article>
    </div>
  )
}
