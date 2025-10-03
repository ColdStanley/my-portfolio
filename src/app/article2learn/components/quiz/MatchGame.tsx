'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfettiExplosion from 'react-confetti-explosion'
import { theme } from '@/styles/theme.config'
import { useArticleStore } from '../../store/useArticleStore'
import SpeakerButton from '../SpeakerButton'

export default function MatchGame() {
  const { currentArticle, queries } = useArticleStore()

  const [currentRound, setCurrentRound] = useState(0)
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null)
  const [matchedWords, setMatchedWords] = useState<Set<string>>(new Set())
  const [justMatchedWords, setJustMatchedWords] = useState<Set<string>>(new Set())
  const [showError, setShowError] = useState(false)
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
  const shuffledWords = useMemo(
    () => [...currentWords].sort(() => Math.random() - 0.5),
    [currentWords]
  )

  // 当前轮全部匹配后，自动进入下一轮
  useEffect(() => {
    if (currentWords.length > 0 && matchedWords.size === currentWords.length) {
      setTimeout(() => {
        if (currentRound < rounds.length - 1) {
          setCurrentRound((prev) => prev + 1)
          setMatchedWords(new Set())
          setSelectedSpeaker(null)
        }
      }, 1000)
    }
  }, [matchedWords, currentWords, currentRound, rounds.length])

  const handleSpeakerClick = (word: string) => {
    if (matchedWords.has(word)) return
    setSelectedSpeaker(word)
  }

  const handleCardClick = (word: string) => {
    if (!selectedSpeaker || matchedWords.has(word)) return

    if (selectedSpeaker === word) {
      // 正确匹配：触发爆炸效果
      setJustMatchedWords((prev) => new Set(prev).add(word))

      // 延迟 600ms 后真正标记为匹配（等待动画完成）
      setTimeout(() => {
        setMatchedWords((prev) => new Set(prev).add(word))
        setJustMatchedWords((prev) => {
          const newSet = new Set(prev)
          newSet.delete(word)
          return newSet
        })
        setSelectedSpeaker(null)
      }, 600)
    } else {
      // 错误
      setShowError(true)
      setErrorWord(word)
      setTimeout(() => {
        setShowError(false)
        setErrorWord(null)
      }, 3000)
    }
  }

  // 根据单词长度自适应字号
  const getFontSize = (word: string) => {
    if (word.length > 15) return 'text-[10px]'
    if (word.length > 10) return 'text-xs'
    return 'text-sm'
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
            setMatchedWords(new Set())
            setSelectedSpeaker(null)
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
          Round {currentRound + 1} / {rounds.length} · Matched {matchedWords.size} / {currentWords.length}
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
            style={{ perspective: '1000px' }}
          >
            {currentWords.map((word) => (
              <AnimatePresence key={word}>
                {!matchedWords.has(word) && (
                  <motion.div
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{
                      rotateY: 180,
                      scale: 0,
                      opacity: 0
                    }}
                    transition={{ duration: 0.6 }}
                    onClick={() => handleSpeakerClick(word)}
                    className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-lg border p-2 transition-all duration-200 hover:shadow-lg ${
                      selectedSpeaker === word ? 'ring-2' : ''
                    }`}
                    style={{
                      borderColor: selectedSpeaker === word ? theme.primary : theme.neutralDark,
                      backgroundColor: theme.surface,
                      ringColor: theme.primary,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="scale-125">
                      <SpeakerButton
                        text={word}
                        language={currentArticle.article_language}
                        size="md"
                      />
                    </div>

                    {/* 粒子爆炸效果 */}
                    {justMatchedWords.has(word) && (
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
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>

        {/* 右侧：单词卡片 (50%) */}
        <div className="flex w-1/2 items-center justify-center">
          <div
            className={`grid w-full gap-4 ${
              shuffledWords.length <= 4 ? 'grid-cols-4' : 'grid-cols-4 grid-rows-2'
            }`}
            style={{ perspective: '1000px' }}
          >
            {shuffledWords.map((word) => (
              <AnimatePresence key={word}>
                {!matchedWords.has(word) && (
                  <motion.div
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{
                      rotateY: 180,
                      scale: 0,
                      opacity: 0
                    }}
                    animate={
                      showError && errorWord === word
                        ? { x: [-10, 10, -10, 10, 0] }
                        : {}
                    }
                    transition={{ duration: 0.6 }}
                    onClick={() => handleCardClick(word)}
                    className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-lg border p-2 transition-all duration-200 hover:shadow-lg ${
                      getFontSize(word)
                    } font-semibold`}
                    style={{
                      borderColor:
                        showError && errorWord === word ? '#EF4444' : theme.neutralDark,
                      backgroundColor:
                        showError && errorWord === word ? '#FEE2E2' : theme.surface,
                      color: theme.primary,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <span className="break-words text-center">{word}</span>

                    {/* 粒子爆炸效果 */}
                    {justMatchedWords.has(word) && (
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
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-lg border px-6 py-3 shadow-lg"
            style={{
              borderColor: '#EF4444',
              backgroundColor: '#FEE2E2',
              color: '#EF4444',
            }}
          >
            <p className="text-sm font-medium">❌ Incorrect match, please try again</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
