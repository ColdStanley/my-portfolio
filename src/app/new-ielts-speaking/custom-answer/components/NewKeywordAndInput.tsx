'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { buildPrompt } from '@/utils/promptBuilder'

interface Props {
  part: 'Part 1' | 'Part 2' | 'Part 3'
  questionText: string
  keywords: string[]
  onSubmit: (prompt: string) => Promise<void>
}

export default function NewKeywordAndInput({ part, questionText, keywords, onSubmit }: Props) {
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])

  const handleToggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw)
        ? prev.filter((k) => k !== kw)
        : [...prev, kw]
    )
  }

  const handleGenerateAnswers = async () => {
    if (!userInput.trim()) {
      alert('⚠️ 请输入内容')
      return
    }
    setLoading(true)
    try {
      const prompt = buildPrompt({
        part,
        questionText,
        keywords: selectedKeywords,
        userInput: userInput.trim(),
      })
      await onSubmit(prompt)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 w-full space-y-6">
      {/* 关键词提示文字 */}
      <p className="text-sm text-gray-600 leading-relaxed">
        请选择参考的关键字（可多选）：
      </p>

      {/* 关键词展示区域 */}
      <div className="flex flex-wrap gap-3">
        {keywords.map((kw, idx) => {
          const isSelected = selectedKeywords.includes(kw)
          return (
            <motion.span
              key={idx}
              onClick={() => handleToggleKeyword(kw)}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200
                ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md scale-105'
                    : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
                }`}
            >
              {kw}
            </motion.span>
          )
        })}
      </div>

      {/* 用户输入区域 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          请用中文描述你想表达的内容，越详细越具体，答案与你越接近：
        </label>
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          rows={5}
          placeholder="请输入中文描述..."
          className="w-full resize-none rounded-xl border border-purple-300 p-3 text-gray-800 focus:ring-2 focus:ring-purple-400 transition-all"
        />
      </div>

      {/* 确认按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          onClick={handleGenerateAnswers}
          disabled={loading}
          className="w-full max-w-[400px] mx-auto bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-6 rounded-xl transition-all"
        >
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {loading
            ? '思想的交响正在谱写，高潮即将到来，请静候'
            : '确认'}
        </Button>
      </motion.div>
    </div>
  )
}
