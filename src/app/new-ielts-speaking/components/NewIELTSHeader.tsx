'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import clsx from 'clsx'

export default function NewIELTSHeader() {
  const router = useRouter()

  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const options = [
    '题目自定义：可手动输入题目',
    '串题：一个答案可用于多个题目',
  ]

  const handleSubmit = async () => {
    if (!response || submitted || submitting) return
    setSubmitting(true)

    const res = await fetch('/api/your-voice-matters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'new-ielts-speaking',
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
      alert('提交失败，请稍后再试')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* 左侧：标题卡片 */}
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
      <div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">快速了解</h2>
          <ul className="text-sm text-gray-700 leading-relaxed list-none pl-0 space-y-1">
            <li>1- 选择 Part (Part 1, Part 2, Part 3)</li>
            <li>2- 点击题目</li>
            <li>3- 学习6分、7分、8分范文</li>
            <li>4- 掌握Highlight词汇</li>
          </ul>
        </div>
      </div>

      {/* 右侧：反馈问卷卡片 */}
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
                      className="flex items-center gap-3 cursor-pointer text-sm text-gray-700"
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
                submitted && 'bg-gray-300 cursor-not-allowed'
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
