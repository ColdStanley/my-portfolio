'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import { theme } from '@/styles/theme.config'
import { Query } from '../store/useArticleStore'
import { ANIMATIONS } from '../utils/animations'
import SpeakerButton from './SpeakerButton'

interface HistoryPopoverProps {
  word: string
  queries: Query[]
  onClose: () => void
}

export default function HistoryPopover({
  word,
  queries,
  onClose,
}: HistoryPopoverProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const toggleExpand = (queryId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(queryId)) {
        newSet.delete(queryId)
      } else {
        newSet.add(queryId)
      }
      return newSet
    })
  }

  if (typeof window === 'undefined') return null

  const content = (
    <div className="hidden md:flex h-full max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border bg-white shadow-lg" style={{ borderColor: theme.neutralDark }}>
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3"
          style={{ borderColor: theme.neutralDark }}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold" style={{ color: theme.primary }}>
              "{word}"
            </h3>
            {queries.length > 0 && (queries[0].article_language === 'English' || queries[0].article_language === 'Français') && (
              <SpeakerButton text={word} language={queries[0].article_language} size="sm" />
            )}
            <span
              className="text-xs"
              style={{ color: theme.textSecondary }}
            >
              {queries.length} {queries.length === 1 ? 'query' : 'queries'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-6 w-6 rounded border text-xs transition-all duration-200 hover:brightness-95"
            style={{
              borderColor: theme.neutralDark,
              backgroundColor: theme.neutralLight,
              color: theme.textPrimary,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Query Cards */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {queries.map((query) => {
            const isExpanded = expandedCards.has(query.id)
            const shouldShowToggle = query.ai_response.length > 200

            return (
              <div
                key={query.id}
                className="rounded-lg border p-3 transition-all duration-200"
                style={{
                  borderColor: theme.neutralDark,
                  backgroundColor: theme.surface,
                }}
              >
                {/* Card Header */}
                <div className="mb-2 flex items-center justify-between">
                  <h4
                    className="text-sm font-semibold"
                    style={{ color: theme.primary }}
                  >
                    {query.prompt_label}
                  </h4>
                  <span
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    {new Date(query.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* AI Response */}
                <div
                  className={`prose prose-xs max-w-none break-words text-xs leading-relaxed ${
                    isExpanded ? '' : 'line-clamp-3'
                  }`}
                  style={{ color: theme.textSecondary }}
                >
                  <ReactMarkdown>{query.ai_response}</ReactMarkdown>
                </div>

                {/* Show More/Less Button */}
                {shouldShowToggle && (
                  <button
                    onClick={() => toggleExpand(query.id)}
                    className="mt-2 text-xs font-medium transition-colors duration-200 hover:underline"
                    style={{ color: theme.primary }}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
    </div>
  )

  const mobileModal = (
    <AnimatePresence>
      <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          {...ANIMATIONS.modalBackdrop}
          className="absolute inset-0 bg-black/20"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          {...ANIMATIONS.fadeIn}
          className="relative z-10 w-[600px] max-w-[95vw] max-h-[80vh] flex flex-col overflow-hidden rounded-xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          style={{ borderColor: theme.neutralDark }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b bg-white px-6 py-4"
            style={{ borderColor: theme.neutralDark }}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold" style={{ color: theme.primary }}>
                "{word}"
              </h3>
              {queries.length > 0 && (queries[0].article_language === 'English' || queries[0].article_language === 'Français') && (
                <SpeakerButton text={word} language={queries[0].article_language} size="sm" />
              )}
              <span
                className="text-sm"
                style={{ color: theme.textSecondary }}
              >
                {queries.length} {queries.length === 1 ? 'query' : 'queries'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
              style={{
                borderColor: theme.neutralDark,
                color: theme.textPrimary,
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Query Cards */}
          <div className="flex-1 space-y-3 overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
            {queries.map((query) => {
              const isExpanded = expandedCards.has(query.id)
              const shouldShowToggle = query.ai_response.length > 200

              return (
                <div
                  key={query.id}
                  className="rounded-lg border p-4 transition-all duration-200"
                  style={{
                    borderColor: theme.neutralDark,
                    backgroundColor: theme.surface,
                  }}
                >
                  {/* Card Header */}
                  <div className="mb-2 flex items-center justify-between">
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: theme.primary }}
                    >
                      {query.prompt_label}
                    </h4>
                    <span
                      className="text-xs"
                      style={{ color: theme.textSecondary }}
                    >
                      {new Date(query.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* AI Response */}
                  <div
                    className={`prose prose-sm max-w-none break-words text-sm leading-relaxed ${
                      isExpanded ? '' : 'line-clamp-3'
                    }`}
                    style={{ color: theme.textSecondary }}
                  >
                    <ReactMarkdown>{query.ai_response}</ReactMarkdown>
                  </div>

                  {/* Show More/Less Button */}
                  {shouldShowToggle && (
                    <button
                      onClick={() => toggleExpand(query.id)}
                      className="mt-2 text-sm font-medium transition-colors duration-200 hover:underline"
                      style={{ color: theme.primary }}
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return (
    <>
      {content}
      {typeof window !== 'undefined' && createPortal(mobileModal, document.body)}
    </>
  )
}
