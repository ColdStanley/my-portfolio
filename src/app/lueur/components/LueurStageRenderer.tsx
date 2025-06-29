'use client'

import React, { useEffect, useState } from 'react'
import useLueurData from '../hooks/useLueurData'
import useRevealControl from '../hooks/useRevealControl'
import useHighlightManager from '../hooks/useHighlightManager'
import LueurTextSegment from '../components/LueurTextSegment'
import Tooltip from '../components/Tooltip'
import { FiEye, FiX } from 'react-icons/fi'
import { motion } from 'framer-motion'

// ✅ 新增：游戏组件
import GameControllerButton from './GameControllerButton'
import MatchingGameEngine from './MatchingGameEngine'

interface Explanation {
  word: string
  note: string
}

export default function LueurStageRenderer() {
  const { item, loading, error } = useLueurData()

  const {
    currentParagraph,
    currentWord,
    advanceStage,
  } = useRevealControl(item)

  const {
    manualHighlights,
    forceHighlightAll,
    handleManualClick,
    toggleHighlightAll,
  } = useHighlightManager(item?.highlightData.map(h => h.word) || [])

  const [tooltip, setTooltip] = useState<{
    word: string; note: string; x: number; y: number
  } | null>(null)

  // ✅ 新增：解释卡片状态（全局卡片面板）
  const [explanations, setExplanations] = useState<Explanation[]>([])

  // ✅ 新增：配对游戏状态
  const [isPlaying, setIsPlaying] = useState(false)

  // ✅ 提供全局方法以在悬停时添加卡片（并去重）
  useEffect(() => {
    (window as any).addExplanation = (ex: Explanation) => {
      setExplanations((prev) => {
        if (prev.some(e => e.word === ex.word)) return prev
        return [...prev, ex]
      })
    }
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">加载中...</div>
  }

  if (!item) {
    return <div className="flex items-center justify-center h-screen text-gray-500">未找到任何文章数据</div>
  }

  const handleTooltip = (word: string, note: string, x: number, y: number) => {
    setTooltip({ word, note, x, y })
    // ✅ 同时添加到右侧解释卡片区
    ;(window as any).addExplanation({ word, note })
  }

  const handleTooltipHide = () => setTooltip(null)

  return (
  <div
  className="relative w-full min-h-screen bg-cover bg-center text-white overflow-x-hidden"
  style={{ backgroundImage: `url(${item.imageUrl})` }}
  onClick={(e) => {
    if (!isPlaying) advanceStage()
    else e.stopPropagation()
  }}
>
    {/* 背景遮罩 */}
    <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

    {/* ✅ 右上角按钮区：固定位置，垂直排列 */}
<div className="fixed top-[120px] right-6 z-50 flex flex-col gap-5">
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleHighlightAll()
        }}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow text-sm w-[96px] h-[40px]"
        title={forceHighlightAll ? '取消全部高亮' : '全部高亮'}
      >
        {forceHighlightAll ? '取消高亮' : '全部高亮'}
      </button>

      {!isPlaying && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsPlaying(true)
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow text-sm w-[96px] h-[40px]"
          title="进入配对游戏"
        >
          开始游戏
        </button>
      )}
    </div>

    {/* ✅ 主区域使用 flex 划分：左段落 + 右解释 */}
    <div className="relative z-10 flex w-full">
      {/* ✅ 左侧段落区（占 65%） */}
      <div className="w-[65%] pl-10 pr-6 py-12 space-y-10">
        <motion.h1
          className="text-center text-4xl font-semibold text-[var(--theme-accent)] mt-10 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {item.title}
        </motion.h1>

        {item.paragraphs.map((para, index) => {
          if (index > currentParagraph) return null
          const isCurrent = index === currentParagraph
          const maxWordIndex = isCurrent ? currentWord : Infinity

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-5 shadow-md hover:shadow-xl transition"
            >
              <LueurTextSegment
                paragraph={para}
                highlightData={item.highlightData}
                maxHighlightIndex={maxWordIndex}
                manuallyHighlightedWords={manualHighlights}
                forceHighlightAll={forceHighlightAll}
                globalForceHighlightIndex={currentParagraph}
                paragraphIndex={index}
                onWordClick={handleManualClick}
                onWordHover={handleTooltip}
                onWordLeave={handleTooltipHide}
              />
            </motion.div>
          )
        })}
      </div>

      {/* ✅ 右侧解释卡片区（占 35%） */}
      <div className="w-[35%] pr-6 pt-14 pb-20 mt-34">
        {explanations.length > 0 && (
          <div className="columns-1 md:columns-2 gap-4 space-y-4">
            {explanations.map((ex, idx) => (
              <motion.div
                key={ex.word + idx}
                initial={{ opacity: 0, x: 300, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.8, 0.3, 1],
                }}
                className="break-inside-avoid p-4 rounded-xl bg-white text-black shadow-md"
              >
                <div className="text-purple-700 font-semibold mb-2">🧠 {ex.word}</div>
                <p className="text-gray-800 text-sm whitespace-pre-wrap">{ex.note}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* ✅ 游戏全屏覆盖模式 */}
    {isPlaying && (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
        <div className="text-white text-xl font-semibold mb-6">
          🎯 游戏模式：点击词语与释义进行配对
        </div>

        <MatchingGameEngine data={explanations} isPlaying={isPlaying} />

        <button
          onClick={() => setIsPlaying(false)}
          className="absolute top-6 right-6 bg-white text-purple-700 px-4 py-2 rounded-full shadow hover:bg-gray-100 transition"
        >
          退出游戏
        </button>
      </div>
    )}

    {/* Tooltip 浮动解释 */}
    {tooltip && (
      <Tooltip word={tooltip.word} note={tooltip.note} x={tooltip.x} y={tooltip.y} />
    )}
  </div>
)
}
