'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { theme } from '@/styles/theme.config'
import { ANIMATIONS } from '../utils/animations'
import { promptsApi } from '../utils/apiClient'
import { useArticleStore } from '../store/useArticleStore'

interface SelectionTooltipProps {
  position: { x: number; y: number }
  selectedText: string
  onClose: () => void
}

export default function SelectionTooltip({
  position,
  selectedText,
  onClose,
}: SelectionTooltipProps) {
  const [prompts, setPrompts] = useState<
    Array<{
      name: string
      promptType: string
      promptTemplate: string
      sortOrder: number
      articleLanguage: string
      motherTongue: string
    }>
  >([])
  const [isLoading, setIsLoading] = useState(true)

  const { setShowAIModal, currentArticle } = useArticleStore()

  useEffect(() => {
    promptsApi
      .getActivePrompts()
      .then((data) => {
        setPrompts(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Failed to load prompts:', error)
        setIsLoading(false)
      })
  }, [])

  const handlePromptClick = (prompt: typeof prompts[0]) => {
    // 存储当前选中的文本和 prompt 到 store
    useArticleStore.setState({
      showAIModal: true,
      // 临时存储，后续在 AIResponseModal 中使用
      selectedText,
      selectedPrompt: prompt,
    })
    onClose()
  }

  // 根据文章的语言对过滤 prompts
  const filteredPrompts = prompts.filter((prompt) => {
    // 如果文章没有语言信息，显示所有 prompts
    if (!currentArticle?.article_language || !currentArticle?.mother_tongue) {
      return true
    }

    // 匹配文章的语言对
    return (
      prompt.articleLanguage === currentArticle.article_language &&
      prompt.motherTongue === currentArticle.mother_tongue
    )
  })

  const calculatePosition = () => {
    const offsetX = 8 // 右侧偏移
    const offsetY = 8 // 下方偏移
    const tooltipWidth = 200
    const tooltipHeight = 200

    // 定位在选中文本的右下方
    let left = position.x + offsetX
    let top = position.y + offsetY

    // 防止超出右边界
    if (left + tooltipWidth > window.innerWidth - 20) {
      left = position.x - tooltipWidth - offsetX // 放到左侧
    }

    // 防止超出下边界
    if (top + tooltipHeight > window.innerHeight - 20) {
      top = position.y - tooltipHeight - offsetY // 放到上方
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
    }
  }

  if (typeof window === 'undefined') return null

  const positionStyle = calculatePosition()

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="selection-tooltip"
        {...ANIMATIONS.fadeIn}
        className="fixed z-50 flex flex-col gap-2 rounded-lg border bg-white p-3 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          ...positionStyle,
          borderColor: theme.neutralDark,
        }}
      >
        {/* 小箭头 - 指向选中文本 */}
        <div
          className="absolute"
          style={{
            left: '-6px',
            top: '12px',
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: `6px solid ${theme.neutralDark}`,
          }}
        />
        <div
          className="absolute"
          style={{
            left: '-5px',
            top: '12px',
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '6px solid white',
          }}
        />
        {isLoading ? (
          <div className="px-4 py-1 text-xs" style={{ color: theme.textSecondary }}>
            Loading...
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="px-4 py-1 text-xs" style={{ color: theme.textSecondary }}>
            No prompts available for selected languages
          </div>
        ) : (
          <>
            {filteredPrompts.map((prompt) => (
              <button
                key={prompt.promptType}
                onClick={() => handlePromptClick(prompt)}
                className="h-9 w-full rounded-lg px-4 text-xs font-medium text-white transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: theme.primary }}
              >
                {prompt.name}
              </button>
            ))}

            {/* Close button */}
            <button
              onClick={onClose}
              className="h-9 w-full rounded-lg border text-xs font-medium transition-all duration-200 hover:brightness-95"
              style={{
                borderColor: theme.neutralDark,
                backgroundColor: theme.neutralLight,
                color: theme.textPrimary,
              }}
              aria-label="Close"
            >
              Close
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
