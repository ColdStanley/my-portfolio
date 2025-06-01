'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

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
  const [pageContent, setPageContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取 Notion 卡片基本信息
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

  // 获取 Notion 渲染内容
  useEffect(() => {
    if (item?.pageId) {
      fetch(`/api/notion/page?pageId=${item.pageId}`)
        .then(res => res.json())
        .then(data => {
          setPageContent(data.html || '')
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
      <h1 className="text-3xl font-bold text-purple-700 mb-4">{item.title}</h1>
      <p className="text-gray-600 italic mb-6">{item.subtext}</p>

      {item.imageUrl && (
        <div className="w-full h-auto mb-6 relative aspect-[16/9] rounded-xl overflow-hidden shadow">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover fade-image"
            sizes="100vw"
          />
        </div>
      )}

      {/* 渲染 Notion 富文本（包含表格） */}
      <article
        className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 [&_table]:w-full [&_th]:bg-gray-100 [&_td]:p-2 [&_th]:p-2 border-collapse border border-gray-300"
        aria-label="Notion page content"
        dangerouslySetInnerHTML={{ __html: pageContent }}
      />
    </div>
  )
}
