'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { theme } from '@/styles/theme.config'
import { ANIMATIONS } from '../utils/animations'
import { useArticleStore } from '../store/useArticleStore'
import { aiApi, queryApi } from '../utils/apiClient'

export default function AIResponseModal() {
  const {
    showAIModal,
    setShowAIModal,
    selectedText,
    selectedPrompt,
    currentArticle,
    addQuery,
    addHighlightedWord,
  } = useArticleStore()

  const [streamedContent, setStreamedContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [fullResponse, setFullResponse] = useState('')

  useEffect(() => {
    if (showAIModal && selectedText && selectedPrompt) {
      setStreamedContent('')
      setIsStreaming(true)

      aiApi.processQueryStream(
        {
          selected_text: selectedText,
          prompt_template: selectedPrompt.promptTemplate,
        },
        // onChunk
        (chunk) => {
          setStreamedContent((prev) => prev + chunk)
        },
        // onComplete
        async (complete) => {
          setFullResponse(complete)
          setIsStreaming(false)

          // 保存到数据库
          if (currentArticle) {
            try {
              const query = await queryApi.createQuery({
                article_id: currentArticle.id,
                user_id: currentArticle.user_id,
                selected_text: selectedText,
                prompt_type: selectedPrompt.promptType,
                prompt_label: selectedPrompt.name,
                ai_response: complete,
                article_language: currentArticle.article_language,
                mother_tongue: currentArticle.mother_tongue,
              })

              addQuery(query)
              // 添加高亮单词
              addHighlightedWord(selectedText, query)
            } catch (error) {
              console.error('Failed to save query:', error)
            }
          }
        },
        // onError
        (error) => {
          setIsStreaming(false)
          toast.error('AI query failed')
          console.error(error)
        }
      )
    }
  }, [showAIModal, selectedText, selectedPrompt, currentArticle, addQuery])

  const handleClose = () => {
    setShowAIModal(false)
    setStreamedContent('')
    setFullResponse('')
  }

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          {...ANIMATIONS.modalBackdrop}
          className="absolute inset-0 bg-black/20"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          {...ANIMATIONS.fadeIn}
          className="relative z-10 w-[90%] max-w-2xl rounded-lg border bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          style={{ borderColor: theme.neutralDark }}
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between border-b pb-3" style={{ borderColor: theme.neutralDark }}>
            <div className="flex-1">
              <h3
                className="text-lg font-semibold"
                style={{ color: theme.primary }}
              >
                {selectedText}
              </h3>
              <p
                className="mt-1 text-xs"
                style={{ color: theme.textSecondary }}
              >
                {selectedPrompt?.name}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="ml-4 h-8 w-8 rounded-lg border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
              style={{
                borderColor: theme.neutralDark,
                color: theme.textPrimary,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div
            className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed"
            style={{ color: theme.textPrimary }}
          >
            {streamedContent || 'Analyzing...'}
            {isStreaming && (
              <span className="ml-1 inline-block animate-pulse">▊</span>
            )}
          </div>

          {/* Footer */}
          {!isStreaming && fullResponse && (
            <div className="mt-4 flex justify-end border-t pt-3" style={{ borderColor: theme.neutralDark }}>
              <button
                onClick={handleClose}
                className="h-10 rounded-lg px-6 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:shadow-[0_1px_2px_rgba(0,0,0,0.2)_inset]"
                style={{ backgroundColor: theme.primary }}
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
