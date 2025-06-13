'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface Props {
  imageUrl: string
  description: string
  quotes: string
}

export default function PicGameDisplayuser({ imageUrl, description, quotes }: Props) {
  const quoteArray = quotes?.split('\n').filter(line => line.trim() !== '') || []

  // ✅ 自动补全 imageUrl（确保包含 https://）
  const safeImageUrl = imageUrl?.startsWith('http') ? imageUrl : `https://${imageUrl}`

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* 左图 */}
      <div className="md:w-1/2 w-full rounded-xl overflow-hidden shadow">
        {imageUrl ? (
          <img
        src={safeImageUrl}
        alt="picgame"
        className="w-full h-auto object-cover rounded-xl"
          />

        ) : (
          <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            图片加载失败或尚未提供链接
          </div>
        )}
      </div>

      {/* 右文 */}
      <div className="md:w-1/2 w-full bg-white shadow rounded-xl p-6 flex flex-col justify-between">
        <div className="mb-4">
          <div className="text-lg font-bold text-purple-600 mb-2">描述（Description）</div>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{description}</p>
        </div>

        <div>
          <div className="text-lg font-bold text-purple-600 mb-2">留言语录（Quotes）</div>
          <div className="space-y-2">
            {quoteArray.map((quote, idx) => (
              <motion.p
                key={idx}
                className="text-gray-600 text-sm italic"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {quote}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
