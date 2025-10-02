'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { theme } from '@/styles/theme.config'
import { useArticleStore, Query } from '../store/useArticleStore'
import { queryApi } from '../utils/apiClient'
import { toast } from 'sonner'

interface QueryCardViewProps {
  queries: Query[]
}

export default function QueryCardView({ queries }: QueryCardViewProps) {
  const { removeQuery, currentArticle } = useArticleStore()
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const handleDelete = async (query: Query) => {
    if (!currentArticle) return

    try {
      await queryApi.deleteQuery(query.id, currentArticle.user_id)
      removeQuery(query.id)
      toast.success('Query deleted')
    } catch (error) {
      toast.error('Failed to delete query')
      console.error(error)
    }
  }

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

  if (queries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: theme.textSecondary }}>No query history yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2" style={{ gridAutoRows: 'auto' }}>
      {queries.map((query) => (
        <div
          key={query.id}
          className="rounded-lg border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
          style={{
            borderColor: theme.neutralDark,
            alignSelf: 'start'
          }}
        >
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex flex-1 items-center gap-2">
              <span
                className="inline-block rounded px-2 py-0.5 text-sm font-semibold"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.primary,
                }}
              >
                "{query.selected_text}"
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: theme.textSecondary }}
              >
                {query.prompt_label}
              </span>
            </div>

            <button
              onClick={() => handleDelete(query)}
              className="ml-2 h-6 w-6 rounded border text-xs transition-all duration-200 hover:brightness-95"
              style={{
                borderColor: theme.neutralDark,
                backgroundColor: theme.neutralLight,
                color: theme.textPrimary,
              }}
              aria-label="Delete"
            >
              ✕
            </button>
          </div>

          {/* Response Preview */}
          <div
            className={`prose prose-xs mb-2 max-w-none break-words text-xs leading-relaxed ${
              expandedCards.has(query.id) ? '' : 'line-clamp-4'
            }`}
            style={{ color: theme.textSecondary }}
          >
            <ReactMarkdown>{query.ai_response}</ReactMarkdown>
          </div>

          {/* More/Less Button */}
          {query.ai_response.length > 200 && (
            <button
              onClick={() => toggleExpand(query.id)}
              className="mb-2 text-xs font-medium transition-colors duration-200 hover:underline"
              style={{ color: theme.primary }}
            >
              {expandedCards.has(query.id) ? 'Show less' : 'Show more'}
            </button>
          )}

          {/* Timestamp */}
          <div className="text-xs" style={{ color: theme.textSecondary }}>
            {new Date(query.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
