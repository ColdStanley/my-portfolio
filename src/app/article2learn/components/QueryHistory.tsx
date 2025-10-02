'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '@/styles/theme.config'
import { ANIMATIONS } from '../utils/animations'
import { useArticleStore } from '../store/useArticleStore'
import { queryApi } from '../utils/apiClient'
import QueryCardView from './QueryCardView'
import QueryTableView from './QueryTableView'
import FilterPanel from './FilterPanel'

export default function QueryHistory() {
  const { currentArticle, queries, setQueries, viewMode, setViewMode } =
    useArticleStore()

  // 筛选状态 - 单选字符串
  const [selectedLabel, setSelectedLabel] = useState<string>('')

  useEffect(() => {
    if (currentArticle) {
      queryApi
        .getQueries(currentArticle.id, currentArticle.user_id)
        .then((queries) => {
          setQueries(queries)
        })
        .catch((error) => {
          console.error('Failed to load queries:', error)
        })
    }
  }, [currentArticle, setQueries])

  // 筛选逻辑：默认按语言对筛选，然后按选中的 label 筛选
  const filteredQueries = useMemo(() => {
    let result = queries

    // 1. 默认按当前文章的语言对筛选
    if (currentArticle?.article_language && currentArticle?.mother_tongue) {
      result = result.filter(
        (q) =>
          q.article_language === currentArticle.article_language &&
          q.mother_tongue === currentArticle.mother_tongue
      )
    }

    // 2. 如果选中了特定 label，进一步筛选
    if (selectedLabel) {
      result = result.filter((q) => q.prompt_label === selectedLabel)
    }

    return result
  }, [queries, currentArticle, selectedLabel])

  if (!currentArticle) {
    return (
      <div className="flex h-full items-center justify-center">
        <p style={{ color: theme.textSecondary }}>
          No article selected
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* 远景容器背景 */}
      <div className="rounded-xl bg-gradient-to-br from-neutral-50/30 to-white p-6">
      {/* Header with View Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold" style={{ color: theme.primary }}>
          Query History
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('card')}
            className={`h-8 rounded-lg border px-4 text-xs font-medium transition-all duration-200 ${
              viewMode === 'card' ? 'text-white' : ''
            }`}
            style={{
              backgroundColor:
                viewMode === 'card' ? theme.primary : theme.background,
              borderColor: theme.primary,
              color: viewMode === 'card' ? '#FFFFFF' : theme.primary,
            }}
          >
            Card View
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`h-8 rounded-lg border px-4 text-xs font-medium transition-all duration-200 ${
              viewMode === 'table' ? 'text-white' : ''
            }`}
            style={{
              backgroundColor:
                viewMode === 'table' ? theme.primary : theme.background,
              borderColor: theme.primary,
              color: viewMode === 'table' ? '#FFFFFF' : theme.primary,
            }}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'card' ? (
          <motion.div key="card" {...ANIMATIONS.contentSwitch}>
            <FilterPanel
              queries={queries}
              selectedLabel={selectedLabel}
              onFilterChange={setSelectedLabel}
            />
            <QueryCardView queries={filteredQueries} />
          </motion.div>
        ) : (
          <motion.div key="table" {...ANIMATIONS.contentSwitch}>
            <QueryTableView />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
