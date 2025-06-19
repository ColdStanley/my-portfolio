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
      {/* 中间：功能介绍卡片 */}
<div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between">
  {/* 顶部介绍 */}
  <div className="space-y-3">
    <h2 className="text-lg font-semibold text-gray-800">快速了解</h2>

    <ul className="text-sm text-gray-700 leading-relaxed list-none pl-0 space-y-1">
  <li>1- 选择 Part (Part 1, Part 2, Part 3)</li>
  <li>2- 点击题目</li>
  <li>3- 学习6分、7分、8分范文</li>
  <li>4- 掌握Highlight词汇</li>
</ul>


  </div>

  {/* 底部提示与按钮：一行居中对齐 */}
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 gap-3">
    {/* 提示 + 动效箭头 */}
    <span className="text-xs text-gray-500 flex items-center">
      属于你自己的，考场才能脱口而出
      <span className="ml-1 animate-bounce-x text-purple-500 text-base">→</span>
    </span>

    {/* 吸引力增强按钮 */}
    <Link
      href="/new-ielts-speaking/custom-answer"
      className="text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-700
                 hover:scale-105 transition-transform rounded-full px-5 py-2 shadow-md"
    >
      口语私人定制
    </Link>
  </div>
</div>





      {/* 右侧：视频区域 */}

      <div className="bg-white shadow rounded-xl p-6 flex items-center justify-center">
  <img
    src="/images/IELTSSpeaking01.png"
    alt="IELTS Speaking Visual"
    className="w-full h-[200px] object-contain rounded-xl"
  />
</div>



    </div>
  )
}
