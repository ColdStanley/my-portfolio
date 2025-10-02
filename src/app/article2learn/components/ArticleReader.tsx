'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '@/styles/theme.config'
import { ANIMATIONS } from '../utils/animations'
import { useArticleStore } from '../store/useArticleStore'
import SelectionTooltip from './SelectionTooltip'
import HistoryPopover from './HistoryPopover'

export default function ArticleReader() {
  const {
    currentArticle,
    queries,
    highlightedWords,
    showHistoryPopover,
    setShowHistoryPopover,
    historyPopoverWord,
    setHistoryPopoverWord,
    clearHighlights,
    addHighlightedWord,
  } = useArticleStore()

  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')

  // 从 queries 重建 highlightedWords（刷新后恢复高亮）
  useEffect(() => {
    if (!currentArticle) return

    // 清空旧的高亮
    clearHighlights()

    // 从 queries 中重建
    queries.forEach((query) => {
      addHighlightedWord(query.selected_text, query)
    })
  }, [currentArticle?.id, queries, clearHighlights, addHighlightedWord])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()

      if (rect) {
        setSelectedText(text)
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom,
        })
        setShowTooltip(true)
      }
    } else {
      setShowTooltip(false)
    }
  }, [])

  // 处理数字角标点击
  const handleBadgeClick = useCallback(
    (e: React.MouseEvent, word: string) => {
      e.stopPropagation()
      e.preventDefault()

      const queries = highlightedWords.get(word.toLowerCase())

      if (queries && queries.length > 0) {
        setHistoryPopoverWord(word)
        setShowHistoryPopover(true)
      }
    },
    [highlightedWords, setHistoryPopoverWord, setShowHistoryPopover]
  )

  // 渲染高亮文本
  const renderHighlightedContent = useMemo(() => {
    if (!currentArticle || highlightedWords.size === 0) {
      return currentArticle?.content || ''
    }

    const content = currentArticle.content
    const fragments: Array<{ type: 'text' | 'highlight'; content: string; word?: string; count?: number }> = []
    let lastIndex = 0

    // 构建所有高亮词的正则
    const sortedWords = Array.from(highlightedWords.keys()).sort((a, b) => b.length - a.length)
    const pattern = sortedWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi')

    let match
    while ((match = regex.exec(content)) !== null) {
      // 添加高亮前的普通文本
      if (match.index > lastIndex) {
        fragments.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        })
      }

      // 添加高亮文本
      const matchedWord = match[0]
      const queries = highlightedWords.get(matchedWord.toLowerCase())
      fragments.push({
        type: 'highlight',
        content: matchedWord,
        word: matchedWord,
        count: queries?.length || 0,
      })

      lastIndex = regex.lastIndex
    }

    // 添加剩余的普通文本
    if (lastIndex < content.length) {
      fragments.push({
        type: 'text',
        content: content.slice(lastIndex),
      })
    }

    return fragments
  }, [currentArticle, highlightedWords])

  // 获取历史 Popover 的 queries (必须在 early return 之前)
  const historyQueries = useMemo(() => {
    if (!historyPopoverWord) return []
    return highlightedWords.get(historyPopoverWord.toLowerCase()) || []
  }, [historyPopoverWord, highlightedWords])

  // 所有 hooks 调用完毕后才能 early return
  if (!currentArticle) {
    return null
  }

  return (
    <motion.div {...ANIMATIONS.contentSwitch} className="flex gap-6 px-6 py-12">
      {/* 左侧文章区域 70% */}
      <div className="w-[70%]">
        <div className="rounded-lg border bg-white p-8 shadow-md" style={{ borderColor: theme.neutralDark }}>
          <h1
            className="mb-6 text-2xl font-semibold"
            style={{ color: theme.primary }}
          >
            {currentArticle.title}
          </h1>

          <div
            className="prose prose-sm max-w-none select-text whitespace-pre-wrap leading-relaxed"
            style={{ color: theme.textPrimary }}
            onMouseUp={handleTextSelection}
          >
            {typeof renderHighlightedContent === 'string' ? (
              renderHighlightedContent
            ) : (
              renderHighlightedContent.map((fragment, index) => {
                if (fragment.type === 'text') {
                  return <span key={index}>{fragment.content}</span>
                }
                return (
                  <mark
                    key={index}
                    className="relative inline-block cursor-pointer rounded-sm px-0.5 transition-all duration-200 hover:brightness-95"
                    style={{
                      backgroundColor: 'rgba(244, 211, 94, 0.3)',
                      color: theme.textPrimary,
                    }}
                  >
                    {fragment.content}
                    <sup
                      onClick={(e) => handleBadgeClick(e, fragment.word!)}
                      className="absolute -right-1.5 -top-1.5 inline-flex h-3 w-3 cursor-pointer items-center justify-center rounded-full text-[8px] font-semibold text-white transition-all duration-200 hover:scale-110"
                      style={{
                        backgroundColor: theme.primary,
                        fontSize: '8px',
                        lineHeight: '1',
                      }}
                    >
                      {fragment.count}
                    </sup>
                  </mark>
                )
              })
            )}
          </div>
        </div>

        {showTooltip && (
          <SelectionTooltip
            position={tooltipPosition}
            selectedText={selectedText}
            onClose={() => setShowTooltip(false)}
          />
        )}
      </div>

      {/* 右侧 Popover 区域 30% */}
      <div className="w-[30%]">
        <AnimatePresence mode="wait">
          {showHistoryPopover && (
            <motion.div
              key={historyPopoverWord}
              {...ANIMATIONS.fadeIn}
              className="sticky top-24"
            >
              <HistoryPopover
                word={historyPopoverWord}
                queries={historyQueries}
                onClose={() => setShowHistoryPopover(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
