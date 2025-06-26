// src/app/frenotes/components/FrenotesHeader.tsx
'use client'

import Image from 'next/image' // 仍然需要导入 Image，即使暂时不用，以防将来需要
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner' // 确保 sonner 已安装并配置
import clsx from 'clsx'

// 组件名称改为 FrenotesHeader，以符合项目上下文
export default function FrenotesHeader() {
  const router = useRouter()

  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 针对 Frenotes 学习功能定制的反馈选项
  const options = [
    '更多主题和难度筛选', // More topic and difficulty filters
    '学习进度追踪', // Learning progress tracking
    '自定义学习清单', // Custom learning lists
    'AI 辅助练习', // AI-assisted practice
  ]

  const handleSubmit = async () => {
    if (!response || submitted || submitting) return
    setSubmitting(true)

    const res = await fetch('/api/your-voice-matters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // 提交页面的标识改为 Frenotes 相关
        page: 'frenotes-feedback', 
        responses: {
          'Feature Expectation': response,
        },
      }),
    })

    if (res.ok) {
      setSubmitted(true)
      setSubmitting(false)
      toast.success('🎉 感谢你的反馈，我们已收到！')
    } else {
      setSubmitting(false)
      // 使用 toast.error 替换 alert，保持风格统一
      toast.error('提交失败，请稍后再试');
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* 左侧：标题卡片 - 定制化法语学习主题 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex flex-row items-center gap-3 mb-3">
            {/* 标题改为 Frenotes 或法语学习相关 */}
            <h1 className="text-4xl font-extrabold text-purple-600">Frenotes</h1>
            {/* 移除图片和动画部分 */}
            {/* <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Image src="/images/IELTS7.png" alt="Frenotes Icon" width={60} height={60} />
            </motion.div> */}
          </div>
          {/* 引用语改为法语学习相关名言，并附带中文翻译 */}
          <blockquote className="text-sm text-gray-600 leading-relaxed pl-2 border-l-4 border-purple-400">
            <p>"Parler une autre langue,</p>
            <p>说另一种语言，</p>
            <p>c'est posséder une autre âme."</p>
            <p>就是拥有另一种灵魂。</p>
            <footer className="mt-2 text-xs text-gray-500">—— Charlemagne / 查理曼</footer>
          </blockquote>
        </div>
      </div>

      {/* 中间：功能介绍卡片 - 定制化 Frenotes 功能 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">快速了解</h2>
          {/* 功能列表定制为 Frenotes 的核心功能 */}
          <ul className="text-sm text-gray-700 leading-relaxed list-none pl-0 space-y-1">
            <li>1- 选择学习主题和难度</li>
            <li>2- 探索高频核心表达</li>
            <li>3- 掌握地道例句和句对</li>
            <li>4- 巩固背景知识和文化</li>
          </ul>
        </div>

        {/* 移除“掌握法语，自信表达”的 span 和“开始学习”按钮 */}
        {/* <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 gap-3">
          <span className="text-xs text-gray-500 flex items-center">
            掌握法语，自信表达
            <span className="ml-1 animate-bounce-x text-purple-500 text-base">→</span>
          </span>
          <button
            className="text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-700
                       hover:scale-105 transition-transform rounded-full px-5 py-2 shadow-md
                       flex items-center justify-center"
            onClick={() => { // 可以在此处添加滚动到内容区域的逻辑 }
          >
            开始学习
          </button>
        </div> */}
      </div>

      {/* 右侧：反馈问卷卡片 - 逻辑和样式保持不变 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between">
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Voice Matters.</h2>

            {!submitted ? (
              <>
                <p className="text-base font-medium text-gray-800 mb-3">你最期待的功能是什么？</p>
                <div className="space-y-2">
                  {options.map((opt) => (
                    <label
                      key={opt}
                      className={clsx(
                        'flex items-center gap-3 cursor-pointer text-sm text-gray-700',
                        // 增加聚焦时的 outline 样式，提升可访问性
                        'focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 rounded-md'
                      )}
                    >
                      <span
                        className={clsx(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          response === opt ? 'border-purple-600' : 'border-gray-300'
                        )}
                      >
                        {response === opt && (
                          <span className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </span>
                      <input
                        type="radio"
                        name="feature"
                        value={opt}
                        checked={response === opt}
                        onChange={() => setResponse(opt)}
                        className="hidden"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 italic">页面下方邮件订阅获取最新资讯！</p>
                <p className="text-sm text-purple-600 font-medium">你选择了：{response}</p>
              </>
            )}
          </div>

          {/* 提交按钮始终保持位置不变 + 视觉降权 */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitted || submitting}
              className={clsx(
                'w-[160px] h-[40px] text-sm font-medium text-gray-700',
                'bg-gray-200 hover:bg-gray-300 transition-all rounded-lg',
                'flex items-center justify-center',
                submitted && 'bg-gray-300 cursor-not-allowed',
                // 增加聚焦时的 outline 样式，提升可访问性
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2'
              )}
            >
              {submitted ? '感谢反馈！' : submitting ? '提交中...' : '提交'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
