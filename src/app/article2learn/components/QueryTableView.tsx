'use client'

import { useState } from 'react'
import { theme } from '@/styles/theme.config'
import { useArticleStore, Query } from '../store/useArticleStore'
import { queryApi } from '../utils/apiClient'
import { toast } from 'sonner'

export default function QueryTableView() {
  const { queries, removeQuery, currentArticle } = useArticleStore()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleExpand = (queryId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(queryId)) {
      newExpanded.delete(queryId)
    } else {
      newExpanded.add(queryId)
    }
    setExpandedRows(newExpanded)
  }

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

  if (queries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: theme.textSecondary }}>No query history yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: theme.neutralDark }}>
      <table className="min-w-full divide-y" style={{ backgroundColor: theme.background, borderColor: theme.neutralDark }}>
        <thead style={{ backgroundColor: theme.surface }}>
          <tr>
            <th
              className="px-4 py-3 text-left text-xs font-semibold"
              style={{ color: theme.textPrimary }}
            >
              Word/Phrase
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold"
              style={{ color: theme.textPrimary }}
            >
              Type
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold"
              style={{ color: theme.textPrimary }}
            >
              Response Preview
            </th>
            <th
              className="px-4 py-3 text-left text-xs font-semibold"
              style={{ color: theme.textPrimary }}
            >
              Time
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: theme.neutralDark }}>
          {queries.map((query) => (
            <tr
              key={query.id}
              className="transition-colors hover:bg-[var(--neutral-light)]"
            >
              <td className="px-4 py-3">
                <span
                  className="inline-block rounded px-2 py-0.5 text-sm font-medium"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.primary,
                  }}
                >
                  {query.selected_text}
                </span>
              </td>
              <td
                className="px-4 py-3 text-xs font-medium"
                style={{ color: theme.textSecondary }}
              >
                {query.prompt_label}
              </td>
              <td className="max-w-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-xs ${expandedRows.has(query.id) ? '' : 'truncate'}`}
                    style={{ color: theme.textSecondary }}
                  >
                    {query.ai_response}
                  </p>
                  <button
                    onClick={() => toggleExpand(query.id)}
                    className="shrink-0 text-xs font-medium underline transition-colors hover:brightness-90"
                    style={{ color: theme.primary }}
                  >
                    {expandedRows.has(query.id) ? 'Less' : 'More'}
                  </button>
                </div>
              </td>
              <td
                className="whitespace-nowrap px-4 py-3 text-xs"
                style={{ color: theme.textSecondary }}
              >
                {new Date(query.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(query)}
                  className="h-6 w-6 rounded border text-xs transition-all duration-200 hover:brightness-95"
                  style={{
                    borderColor: theme.neutralDark,
                    backgroundColor: theme.neutralLight,
                    color: theme.textPrimary,
                  }}
                  aria-label="Delete"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
