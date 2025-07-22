// ✅ ImageBlock.tsx - 图片展示（含 caption）
import React, { useState } from 'react'

export default function ImageBlock({ block }: { block: any }) {
  const value = block.image
  const src = value.type === 'external' ? value.external.url : value.file.url
  const caption = value.caption?.[0]?.plain_text || ''
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  if (imageError) {
    return (
      <figure className="my-6 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Image unavailable</p>
          {caption && (
            <p className="text-xs mt-1 italic">{caption}</p>
          )}
        </div>
      </figure>
    )
  }

  return (
    <figure className="my-6 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md">
      <img
        src={src}
        alt={caption}
        className="w-full h-auto object-contain"
        onError={handleImageError}
      />
      {caption && (
        <figcaption className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
