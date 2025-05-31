// app/[category]/[slug]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function DetailPage() {
  const { category, slug } = useParams()
  const [item, setItem] = useState<any>(null)

  useEffect(() => {
    fetch('/api/notion')
      .then(res => res.json())
      .then(data => {
        const found = data.data.find((i: any) => i.slug === slug && i.category.toLowerCase() === category)
        setItem(found)
      })
  }, [category, slug])

  if (!item) return <div className="p-10 text-gray-500">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">{item.title}</h1>
      <p className="text-gray-600 italic mb-6">{item.subtext}</p>
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-auto rounded-xl mb-6 shadow"
        />
      )}
      <div className="prose prose-lg text-gray-800">
        {item.body}
      </div>
    </div>
  )
}
