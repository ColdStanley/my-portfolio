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

interface Params {
  category: string
  slug: string
}

export default function DetailPage() {
  const params = useParams() as Params
  const { category, slug } = params

  const [item, setItem] = useState<CardData | null>(null)
  const [pageContent, setPageContent] = useState<string>('')

useEffect(() => {
  fetch('/api/notion')
    .then((res) => res.json())
    .then((data) => {
      console.log('🗂 所有卡片数据：', data.data)

      const found = data.data.find((i: CardData) => {
        const matched = 
          i.slug.toLowerCase() === slug.toLowerCase() &&
          i.category.toLowerCase() === category.toLowerCase()

        if (matched) {
          console.log('✅ 找到匹配项：', i)
        }

        return matched
      })

      if (!found) {
        console.warn('⚠️ 未找到匹配项。slug:', slug, 'category:', category)
      }

      setItem(found || null)
    })
    .catch((err) => {
      console.error('❌ 获取卡片数据失败：', err)
    })
}, [category, slug])


  // ✅ Step 2: 根据 pageId 获取 Notion 渲染 HTML
  useEffect(() => {
    if (item?.pageId) {
      fetch(`/api/notion/page?pageId=${item.pageId}`)
        .then((res) => res.json())
        .then((data) => {
          setPageContent(data.html || '')
        })
    }
  }, [item?.pageId])

  if (!item) return <div className="p-10 text-gray-500">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">{item.title}</h1>
      <p className="text-gray-600 italic mb-6">{item.subtext}</p>

      {item.imageUrl && (
        <div className="w-full h-auto mb-6 relative aspect-[16/9] rounded-xl overflow-hidden shadow">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      {/* ✅ Notion HTML 渲染内容（含 YouTube 视频） */}
      <div
        className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200"
        dangerouslySetInnerHTML={{ __html: pageContent }}
      />
    </div>
  )
}

