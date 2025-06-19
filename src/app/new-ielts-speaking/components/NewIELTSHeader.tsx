'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewIELTSHeader() {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* 左侧：标题区域 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-row items-center gap-3 mb-3">
            <h1 className="text-4xl font-extrabold text-purple-600">IELTS Speaking</h1>
            <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Image src="/images/IELTS7.png" alt="IELTS7" width={60} height={60} />
            </motion.div>
          </div>
          <blockquote className="text-sm text-gray-600 leading-relaxed pl-2 border-l-4 border-purple-400">
            <p>"We are what we repeatedly do.</p>
            <p>我们由我们反复做的事情塑造而成。</p>
            <p>Excellence, then, is not an act, but a habit."</p>
            <p>卓越并非一时之举，而是一种习惯</p>
            <footer className="mt-2 text-xs text-gray-500">—— Aristotle / 亚里士多德</footer>
          </blockquote>
        </div>
      </div>

      {/* 中间：功能介绍卡片 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between relative">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">快速了解</h2>
          <ul className="text-sm text-gray-700 leading-relaxed list-disc pl-5 space-y-1">
            <li>提供真实 IELTS Speaking 题目</li>
            <li>参考 Band 6–8 答案 & 高分表达</li>
            <li>使用即享，无需注册，持续更新</li>
          </ul>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2">

          <Link
            href="/new-ielts-speaking/custom-answer"
            className="text-sm font-medium text-purple-600 hover:underline border border-purple-600 rounded-lg px-4 py-2"
          >
            定制属于你的真实答案
          </Link>
        </div>
      </div>

      {/* 右侧：视频区域 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center justify-between">
        <video
          src="/images/cat.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="rounded-xl w-full h-[200px] object-cover"
        />
        <p className="text-sm text-gray-500 mt-4 italic">Have fun like this cat 🐾</p>
      </div>
    </div>
  )
}
