'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfettiExplosion from 'react-confetti-explosion'
import ReactMarkdown from 'react-markdown'
import { theme } from '@/styles/theme.config'
import { useArticleStore } from '../../store/useArticleStore'
import { playCorrectSound, playErrorSound } from '../../utils/soundEffects'

interface WordTranslationPair {
  word: string
  translation: string
}

export default function WordTranslationMatchGame() {
  const { currentArticle, queries } = useArticleStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showError, setShowError] = useState(false)

  // 获取所有 word-translation 对（去重）
  const allPairs = useMemo(() => {
    if (!currentArticle) return []

    const filteredQueries = queries.filter(
      (q) =>
        q.article_language === currentArticle.article_language &&
        q.mother_tongue === currentArticle.mother_tongue
    )

    // 去重：按 selected_text
    const uniqueWords = Array.from(
      new Set(filteredQueries.map((q) => q.selected_text))
    )

    return uniqueWords.map((word): WordTranslationPair => {
      const query = filteredQueries.find((q) => q.selected_text === word)!
      return {
        word: query.selected_text,
        translation: query.ai_response,
      }
    })
  }, [queries, currentArticle])

  // 当前题目数据
  const currentPair = allPairs[currentIndex]

  const handleSubmit = () => {
    if (!currentPair || !userAnswer.trim()) return

    const trimmedAnswer = userAnswer.trim().toLowerCase()
    const correctAnswer = currentPair.word.toLowerCase()

    if (trimmedAnswer === correctAnswer) {
      // ✅ 正确：音效 + 爆炸效果
      playCorrectSound()
      setShowConfetti(true)

      // 延迟后进入下一题
      setTimeout(() => {
        setShowConfetti(false)
        if (currentIndex < allPairs.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          setUserAnswer('')
        }
      }, 1500)
    } else {
      // ❌ 错误：音效 + 抖动 + 清空输入
      playErrorSound()
      setShowError(true)

      setTimeout(() => {
        setShowError(false)
        setUserAnswer('')
      }, 500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (!currentArticle) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: theme.textSecondary }}>Please select an article first</p>
      </div>
    )
  }

  if (allPairs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: theme.textSecondary }}>No queries yet. Please query some words first</p>
      </div>
    )
  }

  if (currentIndex >= allPairs.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold" style={{ color: theme.primary }}>
          🎉 Congratulations! All completed!
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0)
            setUserAnswer('')
          }}
          className="rounded-lg border px-6 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md"
          style={{
            borderColor: theme.neutralDark,
            backgroundColor: theme.primary,
            color: 'white',
          }}
        >
          Restart
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* 进度提示 */}
      <div className="text-center">
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          Progress: {currentIndex + 1} / {allPairs.length}
        </p>
      </div>

      {/* 游戏区域 - 移动端上下布局 / 桌面端左右布局 */}
      <div className="flex flex-1 flex-col items-stretch justify-center gap-6 md:flex-row">
        {/* 输入卡片：移动端上方 / 桌面端左侧 (50%) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="relative flex w-full flex-col justify-center gap-4 rounded-lg border p-6 md:order-1 md:w-1/2"
            style={{
              borderColor: theme.neutralDark,
              backgroundColor: theme.surface,
            }}
          >
            <p className="text-center text-sm font-medium" style={{ color: theme.textSecondary }}>
              Type the word:
            </p>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type here"
              autoFocus
              className="w-full rounded border px-3 py-2 text-center text-sm outline-none transition-all duration-200"
              style={{
                borderColor: theme.neutralDark,
                backgroundColor: 'white',
                color: theme.primary,
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="flex h-10 items-center justify-center rounded-lg transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: theme.primary,
                color: 'white',
              }}
            >
              Submit
            </button>

            {/* 粒子爆炸效果 */}
            {showConfetti && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <ConfettiExplosion
                  force={0.6}
                  duration={2500}
                  particleCount={50}
                  width={400}
                  colors={['#F4D35E', '#111111', '#FFFFFF']}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 翻译卡片：移动端下方 / 桌面端右侧 (50%) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={showError ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: showError ? 0.4 : 0.3 }}
            className="relative flex w-full items-center justify-center rounded-lg border p-6 md:order-2 md:w-1/2"
            style={{
              borderColor: theme.neutralDark,
              backgroundColor: theme.surface,
            }}
          >
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p
                      style={{ color: theme.textPrimary }}
                      className="mb-2 text-sm leading-relaxed"
                    >
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
                {currentPair?.translation}
              </ReactMarkdown>
            </div>

            {/* 粒子爆炸效果 */}
            {showConfetti && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <ConfettiExplosion
                  force={0.6}
                  duration={2500}
                  particleCount={50}
                  width={400}
                  colors={['#F4D35E', '#111111', '#FFFFFF']}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  )
}
