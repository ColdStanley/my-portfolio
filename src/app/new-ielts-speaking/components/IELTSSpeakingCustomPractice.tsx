'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import clsx from 'clsx'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/SimpleComponents'
import { Loader2 } from 'lucide-react'
import { buildPrompt } from '@/utils/promptBuilder'
import { useAnswerCounter } from '@/hooks/useAnswerCounter'
import { useCurrentUserType } from '@/hooks/useCurrentUserType'
import { usePathname, useRouter } from 'next/navigation'

interface QuestionItem {
  id: string
  questionText: string
}

export default function IELTSSpeakingCustomPractice() {
  const router = useRouter()
  const pathname = usePathname()

  // Main state
  const [part, setPart] = useState<'Part 1' | 'Part 2' | 'Part 3'>('Part 1')
  const [questionText, setQuestionText] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [userInput, setUserInput] = useState('')
  const [answers, setAnswers] = useState<{
    band6: string
    band7: string
    band8: string
  } | null>(null)

  // Header state
  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Question selector state
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>([])
  const [displayedQuestions, setDisplayedQuestions] = useState<QuestionItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  const [keywordLoading, setKeywordLoading] = useState(false)

  // Keyword and input state
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [answerLoading, setAnswerLoading] = useState(false)

  // User authentication and counter
  const { userId, userType } = useCurrentUserType()
  const {
    count,
    limit,
    loading: counterLoading,
    isLimitReached,
    increaseCount,
  } = useAnswerCounter(userId, userType)

  // Header functions
  const handleHeaderSubmit = async () => {
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

  // Question selector functions
  const fetchQuestions = async (partToFetch: 'Part 1' | 'Part 2' | 'Part 3') => {
    try {
      setPart(partToFetch)
      const res = await fetch(`/api/new-ielts-speaking/supabase-list-questions?part=${encodeURIComponent(partToFetch)}`)
      const data = await res.json()
      setAllQuestions(data.items || [])
      const shuffled = [...data.items].sort(() => 0.5 - Math.random())
      setDisplayedQuestions(shuffled.slice(0, 3))
      setSelectedId(null)
      setSelectedText('')
    } catch (err) {
      console.error('题库加载失败', err)
    }
  }

  const handleQuestionClick = (q: QuestionItem) => {
    setSelectedId(q.id)
    setSelectedText(q.questionText)
  }

  const handleKeywordConfirm = async () => {
    if (!selectedId || !selectedText) return alert('请先选择一道题目')
    setKeywordLoading(true)

    try {
      const res = await fetch('/api/new-ielts-speaking/part1-keyword-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: selectedText })
      })

      if (!res.ok) throw new Error('关键词生成失败')

      const data = await res.json()
      handleQuestionConfirm(data.keywords || [], selectedText, part)
    } catch (err) {
      console.error(err)
      alert('关键词生成出错，请稍后重试')
    } finally {
      setKeywordLoading(false)
    }
  }

  const reshuffleQuestions = () => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random())
    setDisplayedQuestions(shuffled.slice(0, 3))
    setSelectedId(null)
    setSelectedText('')
  }

  const handleQuestionConfirm = (
    generatedKeywords: string[],
    text: string,
    partFromSelector: 'Part 1' | 'Part 2' | 'Part 3'
  ) => {
    setQuestionText(text)
    setKeywords(generatedKeywords)
    setPart(partFromSelector)
    setAnswers(null)
  }

  // Keyword and input functions
  const handleToggleKeyword = (kw: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(kw)
        ? prev.filter((k) => k !== kw)
        : [...prev, kw]
    )
  }

  const handleGenerateAnswers = async () => {
    if (!userInput.trim()) {
      alert('请输入内容')
      return
    }

    // Remove upgrade modal functionality - just proceed with generation
    setAnswerLoading(true)
    try {
      const prompt = buildPrompt({
        part,
        questionText,
        keywords: selectedKeywords,
        userInput: userInput.trim(),
      })

      const res = await fetch('/api/new-ielts-speaking/custom-answer-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setAnswers({
        band6: data.band6,
        band7: data.band7,
        band8: data.band8,
      })
      increaseCount()
    } catch (err) {
      console.error('生成答案失败', err)
    } finally {
      setAnswerLoading(false)
    }
  }

  // Styles
  const questionCardStyle = (id: string) => `
    cursor-pointer border rounded-xl p-4 text-[15px] font-medium transition-all duration-200
    ${selectedId === id
      ? 'bg-purple-100 border-purple-500 shadow-md'
      : 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100 hover:shadow-sm'}
    text-gray-800
  `

  // Effects
  useEffect(() => {
    fetchQuestions(part)
  }, [])

  return (
    <div className="space-y-12 text-base">
      {/* Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {/* 移动端显示简化版本 */}
        <div className="md:hidden col-span-1 bg-white shadow rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold text-purple-600">IELTS Speaking</h1>
            <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Image src="/images/IELTS7.png" alt="IELTS7" width={40} height={40} />
            </motion.div>
          </div>
          <p className="text-sm text-gray-600">定制练习 · 个性化答案 · 关键词指导</p>
        </div>
        {/* 左侧：标题卡片 */}
        <div className="hidden md:block bg-white shadow rounded-xl p-6 flex flex-col justify-between">
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
        <div className="hidden md:block bg-white shadow rounded-xl p-6 flex flex-col justify-between">
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
        <div className="hidden md:block bg-white shadow rounded-xl p-6 flex flex-col justify-between">
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

            {/* 提交按钮移至右侧卡片底部 */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleHeaderSubmit}
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

      {/* Question Selector Section */}
      <div className="w-full space-y-6 mt-10">
        {/* Part切换按钮 + 换一组 */}
        <div className="flex flex-wrap items-center gap-3">
          {(['Part 1', 'Part 2', 'Part 3'] as const).map((p) => (
            <button
              key={p}
              onClick={() => fetchQuestions(p)}
              className={`rounded-lg text-sm font-semibold border px-5 py-2 transition
                ${part === p
                  ? 'bg-purple-600 text-white border-transparent shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:shadow-sm'
                }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={reshuffleQuestions}
            className="text-sm text-purple-600 hover:underline font-medium ml-2"
          >
            换一组
          </button>
        </div>

        {/* 题目卡片区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedQuestions.map((q) => (
            <div
              key={q.id}
              onClick={() => handleQuestionClick(q)}
              className={questionCardStyle(q.id)}
            >
              <div className="whitespace-pre-wrap break-words">
                {q.questionText}
              </div>
            </div>
          ))}
        </div>

        {/* 提示说明 */}
        <div className="mt-6 border border-dashed rounded-xl p-4 bg-white text-gray-700 shadow-sm text-sm">
          请选择一道题目，点击下方确认按钮后，我们将为你生成关键词
        </div>

        {/* 确认按钮 */}
        <motion.div
          className="mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            onClick={handleKeywordConfirm}
            disabled={keywordLoading}
            className="w-full max-w-[600px] mx-auto bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-6 rounded-xl transition-all"
          >
            {keywordLoading ? '正在召唤关键词，请稍等' : '确认生成关键词'}
          </Button>
        </motion.div>
      </div>

      {/* Keyword and Input Section */}
      {keywords.length > 0 ? (
        <>
          <div className="mt-10 w-full space-y-8">
            {/* 关键词提示文字 */}
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              请选择你想参考的关键词（可多选）：
            </p>

            {/* 关键词展示区域 */}
            <div className="flex flex-wrap gap-3">
              {keywords.map((kw, idx) => {
                const isSelected = selectedKeywords.includes(kw)
                return (
                  <motion.span
                    key={idx}
                    onClick={() => handleToggleKeyword(kw)}
                    whileTap={{ scale: 0.96 }}
                    className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200
                      ${
                        isSelected
                          ? 'bg-purple-600 text-white border-transparent shadow-md'
                          : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
                      }`}
                  >
                    {kw}
                  </motion.span>
                )
              })}
            </div>

            {/* 用户输入区域 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                请用中文描述你想表达的内容：
              </label>
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={5}
                placeholder="请输入中文描述..."
                className="w-full resize-none rounded-xl border border-purple-300 p-3 text-gray-800 focus:ring-2 focus:ring-purple-400 transition-all"
              />
              <p className="text-sm text-gray-500">越详细越具体，答案与你越接近</p>
            </div>

            {/* 确认按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Button
                onClick={handleGenerateAnswers}
                disabled={answerLoading}
                className="w-full max-w-[600px] mx-auto bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-6 rounded-xl transition-all flex justify-center items-center gap-2"
              >
                {answerLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {answerLoading ? '正在生成答案，请稍候' : '确认'}
              </Button>
            </motion.div>
          </div>

          {!counterLoading && (
            <div className="mt-2 text-sm bg-purple-50 border border-purple-200 text-purple-800 py-2 px-4 rounded-xl shadow-sm text-center">
              今日已使用 {count} / {limit} 次定制口语服务
            </div>
          )}

          {answers === null && (
            <div className="mt-4 text-sm text-gray-500 italic px-2">
              我们将为你重新生成参考答案，请稍候...
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 p-6 sm:p-8 border border-dashed rounded-2xl bg-purple-50/70 text-purple-900 text-base leading-relaxed shadow-sm transition">
          <p className="font-medium">先从一道你感兴趣的雅思口语题目开始吧～</p>
          <p className="mt-2 text-sm text-purple-700">
            点击上方 <span className="font-semibold">确认生成关键词</span> 后，我们将为你智能梳理关键词，并定制 Band 6 / 7 / 8 的高分参考答案。
          </p>
        </div>
      )}

      {/* Answer Display Section */}
      {answers && (
        <>
          <div className="mt-10 space-y-6">
            {answers.band6 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                whileHover={{ scale: 1.02 }}
                className="border border-purple-200 rounded-2xl bg-white p-6 shadow-sm hover:shadow-lg transition-transform"
              >
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-purple-700">Band 6 Answer</h3>
                </div>
                <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {answers.band6 || 'No answer available.'}
                </p>
              </motion.div>
            )}

            {answers.band7 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                whileHover={{ scale: 1.02 }}
                className="border border-purple-200 rounded-2xl bg-white p-6 shadow-sm hover:shadow-lg transition-transform"
              >
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-purple-700">Band 7 Answer</h3>
                </div>
                <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {answers.band7 || 'No answer available.'}
                </p>
              </motion.div>
            )}

            {answers.band8 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                whileHover={{ scale: 1.02 }}
                className="border border-purple-200 rounded-2xl bg-white p-6 shadow-sm hover:shadow-lg transition-transform"
              >
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-purple-700">Band 8 Answer</h3>
                </div>
                <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {answers.band8 || 'No answer available.'}
                </p>
              </motion.div>
            )}

            {!(answers.band6 || answers.band7 || answers.band8) && (
              <div className="text-sm text-gray-500 text-center italic py-4">
                No valid answers were returned by the model.
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-700 leading-relaxed bg-purple-50 p-4 rounded-xl shadow-inner border border-purple-200">
            <p className="font-semibold text-purple-700 mb-1">本轮定制已完成</p>
            <p>我们刚刚为你生成的答案，是结合你个人输入与关键词定制的。这将有助于你在考场中表达得更加真实、自然、自信。</p>
            <p className="mt-1">建议你认真阅读并理解每个答案，用你自己的方式复述出来。准备好后，点击上方重新选择题目，开启下一轮练习。</p>
          </div>
        </>
      )}
    </div>
  )
}