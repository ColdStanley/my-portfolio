'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface CardData {
  id: string
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

  useEffect(() => {
    fetch('/api/notion')
      .then(res => res.json())
      .then(data => {
        const found = data.data.find((i: CardData) =>
          i.slug === slug && i.category.toLowerCase() === category
        )
        setItem(found || null)
      })
  }, [category, slug])

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
      <div className="prose prose-lg text-gray-800 whitespace-pre-line">
        {item.body}
      </div>
    </div>
  )
}
