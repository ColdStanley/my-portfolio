'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfettiExplosion from 'react-confetti-explosion'
import ReactMarkdown from 'react-markdown'
import { theme } from '@/styles/theme.config'
import { useArticleStore } from '../../store/useArticleStore'
import SpeakerButton from '../SpeakerButton'
import { playCorrectSound, playErrorSound } from '../../utils/soundEffects'

export default function FillBlankGame() {
  const { currentArticle, queries } = useArticleStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isError, setIsError] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [errorTooltip, setErrorTooltip] = useState<string | null>(null)
  const [errorWord, setErrorWord] = useState<string | null>(null)

  // 过滤并去重单词（遵循 History 逻辑）
  const allWords = useMemo(() => {
    if (!currentArticle) return []

    const filteredQueries = queries.filter(
      (q) =>
        q.article_language === currentArticle.article_language &&
        q.mother_tongue === currentArticle.mother_tongue
    )

    return Array.from(new Set(filteredQueries.map((q) => q.selected_text)))
  }, [queries, currentArticle])

  // 当前单词
  const currentWord = allWords[currentIndex] || ''

  // 获取当前单词的 AI 回复
  const getCurrentWordTranslation = () => {
    if (!currentArticle) return ''
    const query = queries.find(
      (q) =>
        q.selected_text === currentWord &&
        q.article_language === currentArticle.article_language &&
        q.mother_tongue === currentArticle.mother_tongue
    )
    return query?.ai_response || ''
  }

  // 重置状态
  const resetInput = () => {
    setUserAnswer('')
    setIsError(false)
  }

  const handleSubmit = () => {
    const trimmedAnswer = userAnswer.trim().toLowerCase()
    const correctAnswer = currentWord.toLowerCase()

    if (trimmedAnswer === correctAnswer) {
      // 正确：触发爆炸效果 + 音效
      playCorrectSound()
      setShowConfetti(true)

      // 延迟后进入下一题
      setTimeout(() => {
        setShowConfetti(false)
        if (currentIndex < allWords.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          resetInput()
        }
      }, 1500)
    } else {
      // 错误：音效 + 抖动 + 显示提示 + 清空输入
      playErrorSound()
      setIsError(true)
      setErrorWord(currentWord)
      setErrorTooltip(getCurrentWordTranslation())

      setTimeout(() => {
        setIsError(false)
        setUserAnswer('')
      }, 500)

      // 3秒后隐藏提示
      setTimeout(() => {
        setErrorTooltip(null)
        setErrorWord(null)
      }, 3000)
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

  if (allWords.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: theme.textSecondary }}>No queries yet. Please query some words first</p>
      </div>
    )
  }

  if (currentIndex >= allWords.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold" style={{ color: theme.primary }}>
          🎉 Congratulations! All completed!
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0)
            resetInput()
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
    <div className="relative flex h-full flex-col gap-6 p-6">
      {/* 进度提示 */}
      <div className="text-center">
        <p className="text-sm" style={{ color: theme.textSecondary }}>
          Progress: {currentIndex + 1} / {allWords.length}
        </p>
      </div>

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

      {/* 游戏区域 - 左右布局 */}
      <div className="flex flex-1 items-center justify-center gap-6 md:gap-12">
        {/* 喇叭卡片：左侧 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="relative flex h-40 w-40 cursor-pointer items-center justify-center rounded-lg border p-6 transition-all duration-200 hover:shadow-lg md:h-48 md:w-48"
            style={{
              borderColor: theme.neutralDark,
              backgroundColor: theme.surface,
            }}
          >
            <div className="scale-150">
              <SpeakerButton
                text={currentWord}
                language={currentArticle.article_language}
                size="lg"
              />
            </div>

            {/* 粒子爆炸效果 */}
            {showConfetti && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <ConfettiExplosion
                  force={0.6}
                  duration={2500}
                  particleCount={50}
                  width={400}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 填空卡片：右侧 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord}
            initial={{ opacity: 0, x: 50 }}
            animate={isError ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: isError ? 0.4 : 0.3 }}
            className="relative flex h-40 w-40 flex-col items-center justify-center gap-4 rounded-lg border p-6 transition-all duration-200 md:h-48 md:w-48"
            style={{
              borderColor: theme.neutralDark,
              backgroundColor: theme.surface,
            }}
          >
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type here"
              autoFocus
              className="w-full rounded border px-3 py-2 text-center text-lg outline-none transition-all duration-200"
              style={{
                borderColor: theme.neutralDark,
                backgroundColor: 'white',
                color: theme.primary,
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: theme.primary,
              }}
              aria-label="Submit"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 6L4.5 9.5L11 1.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* 粒子爆炸效果 */}
            {showConfetti && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <ConfettiExplosion
                  force={0.6}
                  duration={2500}
                  particleCount={50}
                  width={400}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
