'use client'

import { motion } from 'framer-motion'
import { Quicksand } from 'next/font/google'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export default function PicGameUploadHeader() {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full items-stretch min-h-[200px] mb-10">
      {/* 左栏：标题 + Slogan + 动效 */}
      <motion.div
        className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col gap-4">
          <motion.h1
            className={`text-4xl font-extrabold text-purple-600 tracking-wide ${quicksand.className}`}
            animate={{
              textShadow: [
                '0px 0px 0px rgba(192,132,252,0.3)',
                '0px 0px 12px rgba(192,132,252,0.6)',
                '0px 0px 24px rgba(192,132,252,0.8)',
                '0px 0px 12px rgba(192,132,252,0.6)',
                '0px 0px 0px rgba(192,132,252,0.3)',
              ],
              scale: [1, 1.03, 1],
              opacity: [1, 0.95, 1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            光影碎片
          </motion.h1>

          <p className="text-sm text-gray-600 leading-relaxed">Shards of Light</p>
          <motion.p
            className="text-sm text-gray-600 leading-relaxed italic"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            片段即永恒，每次点击，都是一次静静的靠近
          </motion.p>
        </div>
      </motion.div>

      {/* 中栏：描述说明 */}
      <motion.div
        className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0 }}
      >
        <div className="text-sm leading-relaxed text-gray-600 space-y-3">
          <p className="font-semibold text-purple-500">📖 描述是什么？</p>
          <p>你可以简单地记录这张照片的背景、时间、情绪、或者你想传达的含义。</p>
          <p>它会出现在页面中图片的旁边，就像是你为照片写下的一段“碎片注解”。</p>
          <p className="italic text-purple-400">比如：“那天阳光正好，我只拍下了你的背影。”</p>
        </div>
      </motion.div>

      {/* 右栏：Quotes 说明 */}
      <motion.div
        className="flex-1 bg-white shadow rounded-xl p-6 flex flex-col justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <div className="text-sm leading-relaxed text-gray-600 space-y-3">
          <p className="font-semibold text-purple-500">💬 Quotes 是什么？</p>
          <p>这些是你想通过图片传递给他人或自己的话，像是藏在图像背后的心声。</p>
          <p>写给自己，写给某人，写给过去或未来都可以。</p>
          <p className="italic text-purple-400">比如：“我没有勇气当面说，但我想你一直都知道。”</p>
        </div>
      </motion.div>
    </div>
  )
}
