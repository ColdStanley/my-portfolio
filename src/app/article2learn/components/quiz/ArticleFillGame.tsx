'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { theme } from '@/styles/theme.config'
import { useArticleStore } from '../../store/useArticleStore'
import SpeakerButton from '../SpeakerButton'
import { playCorrectSound, playErrorSound } from '../../utils/soundEffects'

// 数字转圆圈序号（①②③...）
const getCircledNumber = (num: number): string => {
  return String.fromCharCode(9312 + num) // ① = U+2460
}

export default function ArticleFillGame() {
  const { currentArticle, queries } = useArticleStore()

  const [answers, setAnswers] = useState<Map<number, string>>(new Map())
  const [correctBlanks, setCorrectBlanks] = useState<Set<number>>(new Set())
  const [errorBlanks, setErrorBlanks] = useState<Set<number>>(new Set())
  const [errorTooltip, setErrorTooltip] = useState<string | null>(null)
  const [errorWord, setErrorWord] = useState<string | null>(null)

  // 获取被查询单词列表（去重）
  const queriedWords = useMemo(() => {
    if (!currentArticle) return []

    const filteredQueries = queries.filter(
      (q) =>
        q.article_language === currentArticle.article_language &&
        q.mother_tongue === currentArticle.mother_tongue
    )

    return Array.from(new Set(filteredQueries.map((q) => q.selected_text)))
  }, [queries, currentArticle])

  // 解析文章内容，将被查询单词替换为填空
  const fragments = useMemo(() => {
    if (!currentArticle || queriedWords.length === 0) return []

    const content = currentArticle.content
    const result: Array<{ type: 'text' | 'blank'; content?: string; word?: string; index?: number }> = []

    // 按长度排序（从长到短）
    const sortedWords = [...queriedWords].sort((a, b) => b.length - a.length)

    // 构建正则
    const pattern = sortedWords
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')
    const regex = new RegExp(`\\b(${pattern})\\b`, 'g')

    let lastIndex = 0
    let blankIndex = 0

    let match
    while ((match = regex.exec(content)) !== null) {
      // 添加前面的普通文本
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        })
      }

      // 添加填空
      result.push({
        type: 'blank',
        word: match[0], // 保留原始大小写
        index: blankIndex++,
      })

      lastIndex = regex.lastIndex
    }

    // 添加剩余文本
    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        content: content.slice(lastIndex),
      })
    }

    return result
  }, [currentArticle, queriedWords])

  const handleInputChange = (index: number, value: string) => {
    if (correctBlanks.has(index)) return
    setAnswers((prev) => new Map(prev).set(index, value))
  }

  const handleSubmit = (index: number, correctWord: string) => {
    if (correctBlanks.has(index)) return

    const userAnswer = answers.get(index)?.trim()

    if (userAnswer === correctWord) {
      // 100% 完全匹配（包括大小写）+ 音效
      playCorrectSound()
      setCorrectBlanks((prev) => new Set(prev).add(index))
      setErrorBlanks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    } else {
      // 错误：音效 + 抖动 + 显示提示 + 清空
      playErrorSound()
      setErrorBlanks((prev) => new Set(prev).add(index))

      // 获取该单词的 AI 回复
      const query = queries.find(
        (q) =>
          q.selected_text === correctWord &&
          q.article_language === currentArticle?.article_language &&
          q.mother_tongue === currentArticle?.mother_tongue
      )
      setErrorWord(correctWord)
      setErrorTooltip(query?.ai_response || '')

      setTimeout(() => {
        setErrorBlanks((prev) => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
        setAnswers((prev) => {
          const newMap = new Map(prev)
          newMap.delete(index)
          return newMap
        })
      }, 500)

      // 3秒后隐藏提示
      setTimeout(() => {
        setErrorTooltip(null)
        setErrorWord(null)
      }, 3000)
    }
  }

  const handleKeyDown = (index: number, correctWord: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(index, correctWord)
    }
  }

  const totalBlanks = fragments.filter((f) => f.type === 'blank').length

  if (!currentArticle) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: theme.textSecondary }}>Please select an article first</p>
      </div>
    )
  }

  if (queriedWords.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: theme.textSecondary }}>No queries yet. Please query some words first</p>
      </div>
    )
  }

  // 获取所有填空题目（word + index）
  const blanks = useMemo(() => {
    return fragments
      .filter((f) => f.type === 'blank')
      .map((f) => ({
        index: f.index!,
        word: f.word!,
      }))
  }, [fragments])

  return (
    <div className="relative flex h-full gap-6 p-6">
      {/* 错误提示气泡 - 右下角 */}
      <AnimatePresence>
        {errorTooltip && errorWord && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 max-w-md rounded-lg border p-4 shadow-lg"
            style={{
              borderColor: theme.neutralDark,
              backgroundColor: theme.surface,
            }}
          >
            {/* 单词标题 */}
            <div className="mb-3 border-b pb-2" style={{ borderColor: theme.neutralDark }}>
              <p className="text-sm font-semibold" style={{ color: theme.primary }}>
                {errorWord}
              </p>
            </div>

            {/* AI 回复 */}
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p style={{ color: theme.textPrimary }} className="mb-2 text-sm leading-relaxed">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: theme.primary }}>{children}</strong>
                  ),
                  code: ({ children }) => (
                    <code
                      style={{
                        backgroundColor: theme.neutralLight,
                        color: theme.primary,
                      }}
                      className="rounded px-1 py-0.5"
                    >
                      {children}
                    </code>
                  ),
                }}
              >
                {errorTooltip}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 左侧：文章阅读区 (70%) */}
      <div className="w-[70%] overflow-auto">
        <div className="rounded-lg border bg-white p-8 shadow-md" style={{ borderColor: theme.neutralDark }}>
          <h1 className="mb-6 text-2xl font-semibold" style={{ color: theme.primary }}>
            {currentArticle.title}
          </h1>

          <div
            className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed"
            style={{ color: theme.textPrimary }}
          >
            {fragments.map((fragment, idx) => {
              if (fragment.type === 'text') {
                return <span key={idx}>{fragment.content}</span>
              }

              // fragment.type === 'blank'
              const blankIndex = fragment.index!
              const isCorrect = correctBlanks.has(blankIndex)
              const correctWord = fragment.word!

              if (isCorrect) {
                // 正确：显示用户输入的答案（原单词）+ 淡入动画
                return (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mx-1 inline-block rounded px-1 font-semibold"
                    style={{
                      color: theme.primary,
                      backgroundColor: 'rgba(244, 211, 94, 0.2)',
                    }}
                  >
                    {correctWord}
                  </motion.span>
                )
              }

              // 未填写/错误：显示序号 + 横线
              return (
                <span
                  key={idx}
                  className="relative mx-1 inline-block border-b-2 px-2 py-0.5"
                  style={{
                    borderColor: theme.neutralDark,
                    backgroundColor: 'transparent',
                  }}
                >
                  <span className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                    {getCircledNumber(blankIndex)}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* 右侧：答题卡区域 (30%) */}
      <div className="w-[30%] overflow-auto">
        <div className="sticky top-0 rounded-lg border bg-white shadow-md" style={{ borderColor: theme.neutralDark }}>
          {/* 进度统计 */}
          <div className="border-b p-4" style={{ borderColor: theme.neutralDark }}>
            <h2 className="mb-3 text-lg font-semibold" style={{ color: theme.primary }}>
              Answer Sheet
            </h2>
            <div className="space-y-2">
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Correct: <span className="font-semibold" style={{ color: theme.primary }}>{correctBlanks.size}</span> / {totalBlanks}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${totalBlanks > 0 ? (correctBlanks.size / totalBlanks) * 100 : 0}%`,
                    backgroundColor: theme.accent,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 题目列表 */}
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4">
            <div className="space-y-3">
              {blanks.map((blank) => {
                const isCorrect = correctBlanks.has(blank.index)
                const isError = errorBlanks.has(blank.index)
                const userAnswer = answers.get(blank.index) || ''

                return (
                  <motion.div
                    key={blank.index}
                    animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-2 rounded border p-2"
                    style={{
                      borderColor: isCorrect ? theme.primary : theme.neutralDark,
                      backgroundColor: isCorrect ? 'rgba(244, 211, 94, 0.1)' : theme.surface,
                    }}
                  >
                    {/* 序号 */}
                    <span className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
                      {getCircledNumber(blank.index)}
                    </span>

                    {/* 小喇叭 */}
                    <SpeakerButton
                      text={blank.word}
                      language={currentArticle.article_language}
                      size="sm"
                    />

                    {/* 输入框 */}
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => handleInputChange(blank.index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(blank.index, blank.word, e)}
                      disabled={isCorrect}
                      placeholder="Type here"
                      className="flex-1 rounded border px-2 py-1 text-center text-xs outline-none"
                      style={{
                        minWidth: '80px',
                        borderColor: theme.neutralDark,
                        backgroundColor: isCorrect ? 'transparent' : 'white',
                        color: theme.primary,
                      }}
                    />

                    {/* 正确提示 */}
                    {isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm font-bold"
                        style={{ color: theme.primary }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
