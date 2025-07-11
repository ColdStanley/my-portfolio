'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'
import clsx from 'clsx'

export default function NewIELTSCustomHeader() {
  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!response.trim() || submitted || submitting) return
    setSubmitting(true)

    const res = await fetch('/api/your-voice-matters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'new-ielts-speaking-custom',
        responses: {
          'Additional Suggestion': response,
        },
      }),
    })

    if (res.ok) {
      setSubmitted(true)
      setSubmitting(false)
      toast.success('感谢你的反馈，我们已经收到！')
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
            <li>3- 提供关键词</li>
            <li>4- 输入答题思路</li>
            <li>5- 获取个性化答案</li>
          </ul>
        </div>
      </div>

      {/* 右侧：反馈状态说明卡片 */}
      <div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between">
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Voice Matters.</h2>

            {!submitted ? (
              <>
                <p className="text-base font-medium text-gray-800 mb-1">你希望加入哪些功能？</p>
                <textarea
                  rows={4}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="欢迎填写你的建议或期待的功能～"
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 italic mb-2">页面下方邮件订阅获取最新资讯！</p>
                <p className="text-sm text-purple-600 font-medium">感谢你的建议，我们会认真考虑！</p>
              </>
            )}
          </div>

          {/* ✅ 提交按钮移至右侧卡片底部 */}
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
