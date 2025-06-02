// ✅ ImageBlock.tsx - 图片展示（含 caption）
import React from 'react'

export default function ImageBlock({ block }: { block: any }) {
  const value = block.image
  const src = value.type === 'external' ? value.external.url : value.file.url
  const caption = value.caption?.[0]?.plain_text || ''

  return (
    <figure className="my-6 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md">
      <img
        src={src}
        alt={caption}
        className="w-full h-auto object-contain"
      />
      {caption && (
        <figcaption className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
