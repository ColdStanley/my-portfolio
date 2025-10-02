'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '@/styles/theme.config'
import { useArticleStore } from '../../store/useArticleStore'
import SpeakerButton from '../SpeakerButton'

export default function FillBlankGame() {
  const { currentArticle, queries } = useArticleStore()

  const [currentRound, setCurrentRound] = useState(0)
  const [answers, setAnswers] = useState<Map<string, string>>(new Map())
  const [correctWords, setCorrectWords] = useState<Set<string>>(new Set())
  const [errorWords, setErrorWords] = useState<Set<string>>(new Set())

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

  // 分组（每组 8 个）
  const rounds = useMemo(() => {
    const groups = []
    for (let i = 0; i < allWords.length; i += 8) {
      groups.push(allWords.slice(i, i + 8))
    }
    return groups
  }, [allWords])

  // 当前轮的数据
  const currentWords = rounds[currentRound] || []

  // 当前轮全部正确后，自动进入下一轮
  useEffect(() => {
    if (currentWords.length > 0 && correctWords.size === currentWords.length) {
      setTimeout(() => {
        if (currentRound < rounds.length - 1) {
          setCurrentRound((prev) => prev + 1)
          setAnswers(new Map())
          setCorrectWords(new Set())
          setErrorWords(new Set())
        }
      }, 1000)
    }
  }, [correctWords, currentWords, currentRound, rounds.length])

  const handleInputChange = (word: string, value: string) => {
    if (correctWords.has(word)) return
    setAnswers((prev) => new Map(prev).set(word, value))
  }

  const handleSubmit = (word: string) => {
    if (correctWords.has(word)) return

    const userAnswer = answers.get(word)?.trim().toLowerCase()
    const correctAnswer = word.toLowerCase()

    if (userAnswer === correctAnswer) {
      // 正确
      setCorrectWords((prev) => new Set(prev).add(word))
      setErrorWords((prev) => {
        const newSet = new Set(prev)
        newSet.delete(word)
        return newSet
      })
    } else {
      // 错误：抖动 + 清空输入
      setErrorWords((prev) => new Set(prev).add(word))
      setTimeout(() => {
        setErrorWords((prev) => {
          const newSet = new Set(prev)
          newSet.delete(word)
          return newSet
        })
        setAnswers((prev) => {
          const newMap = new Map(prev)
          newMap.delete(word)
          return newMap
        })
      }, 500)
    }
  }

  const handleKeyDown = (word: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(word)
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

  if (currentRound >= rounds.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold" style={{ color: theme.primary }}>
          🎉 Congratulations! All completed!
        </p>
        <button
          onClick={() => {
            setCurrentRound(0)
            setAnswers(new Map())
            setCorrectWords(new Set())
            setErrorWords(new Set())
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
          Round {currentRound + 1} / {rounds.length} · Correct {correctWords.size} / {currentWords.length}
        </p>
      </div>

      {/* 游戏区域 */}
      <div className="flex flex-1 gap-6">
        {/* 左侧：小喇叭卡片 (50%) */}
        <div className="flex w-1/2 items-center justify-center">
          <div
            className={`grid w-full gap-4 ${
              currentWords.length <= 4 ? 'grid-cols-4' : 'grid-cols-4 grid-rows-2'
            }`}
          >
            {currentWords.map((word) => (
              <div
                key={word}
                className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border p-2 transition-all duration-200 hover:shadow-lg"
                style={{
                  borderColor: theme.neutralDark,
                  backgroundColor: theme.surface,
                }}
              >
                <div className="scale-125">
                  <SpeakerButton
                    text={word}
                    language={currentArticle.article_language}
                    size="md"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：填空卡片 (50%) */}
        <div className="flex w-1/2 items-center justify-center">
          <div
            className={`grid w-full gap-4 ${
              currentWords.length <= 4 ? 'grid-cols-4' : 'grid-cols-4 grid-rows-2'
            }`}
          >
            {currentWords.map((word) => {
              const isCorrect = correctWords.has(word)
              const isError = errorWords.has(word)
              const userAnswer = answers.get(word) || ''

              return (
                <motion.div
                  key={word}
                  animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border p-2 transition-all duration-200"
                  style={{
                    borderColor: isCorrect ? theme.primary : theme.neutralDark,
                    borderWidth: isCorrect ? '2px' : '1px',
                    backgroundColor: isCorrect
                      ? 'rgba(244, 211, 94, 0.2)'
                      : theme.surface,
                  }}
                >
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => handleInputChange(word, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(word, e)}
                    disabled={isCorrect}
                    placeholder="Type here"
                    className="w-full rounded border px-2 py-1 text-center text-sm outline-none transition-all duration-200 disabled:cursor-not-allowed"
                    style={{
                      borderColor: theme.neutralDark,
                      backgroundColor: isCorrect ? 'transparent' : 'white',
                      color: theme.primary,
                    }}
                  />
                  {isCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-lg font-bold"
                      style={{ color: theme.primary }}
                    >
                      ✓
                    </motion.div>
                  )}
                  {!isCorrect && (
                    <button
                      onClick={() => handleSubmit(word)}
                      className="rounded border px-3 py-1 text-xs font-medium transition-all duration-200 hover:shadow-md"
                      style={{
                        borderColor: theme.neutralDark,
                        backgroundColor: theme.primary,
                        color: 'white',
                      }}
                    >
                      Submit
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
