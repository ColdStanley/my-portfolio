'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { theme } from '@/styles/theme.config'
import { ANIMATIONS } from '../utils/animations'
import { useArticleStore, Article } from '../store/useArticleStore'
import { articleApi, queryApi } from '../utils/apiClient'

export default function ArticleHistoryModal() {
  const {
    showArticleHistoryModal,
    setShowArticleHistoryModal,
    setCurrentArticle,
    setQueries,
    setIsLearningMode,
    setActiveTab,
  } = useArticleStore()

  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (showArticleHistoryModal) {
      setIsLoading(true)
      articleApi
        .getArticles('anonymous')
        .then((data) => {
          setArticles(data)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Failed to load articles:', error)
          toast.error('Failed to load articles')
          setIsLoading(false)
        })
    }
  }, [showArticleHistoryModal])

  const handleSelectArticle = async (article: Article) => {
    try {
      // 1. 设置当前文章
      setCurrentArticle(article)

      // 2. 加载查询历史
      const queries = await queryApi.getQueries(article.id, article.user_id)
      setQueries(queries)

      // 3. 进入学习模式
      setIsLearningMode(true)

      // 4. 切换到 Article Tab
      setActiveTab('article')

      // 5. 关闭 Modal
      setShowArticleHistoryModal(false)

      toast.success('Article loaded')
    } catch (error) {
      console.error('Failed to load article:', error)
      toast.error('Failed to load article')
    }
  }

  const handleDeleteArticle = async (
    e: React.MouseEvent,
    article: Article
  ) => {
    e.stopPropagation()

    try {
      await articleApi.deleteArticle(article.id, article.user_id)
      setArticles((prev) => prev.filter((a) => a.id !== article.id))
      toast.success('Article deleted')

      // 如果删除的是当前文章，清空当前文章
      const currentArticle = useArticleStore.getState().currentArticle
      if (currentArticle?.id === article.id) {
        setCurrentArticle(null)
        setQueries([])
        setIsLearningMode(false)
      }
    } catch (error) {
      console.error('Failed to delete article:', error)
      toast.error('Failed to delete article')
    }
  }

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {showArticleHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          {...ANIMATIONS.modalBackdrop}
          className="absolute inset-0 bg-black/20"
          onClick={() => setShowArticleHistoryModal(false)}
        />

        {/* Modal */}
        <motion.div
          {...ANIMATIONS.fadeIn}
          className="relative z-10 w-[600px] max-w-[95vw] max-h-[80vh] rounded-xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          style={{ borderColor: theme.neutralDark }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6" style={{ borderColor: theme.neutralDark }}>
            <h2 className="text-xl font-semibold" style={{ color: theme.primary }}>
              Article History
            </h2>
            <button
              onClick={() => setShowArticleHistoryModal(false)}
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

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
            {isLoading ? (
              <div className="py-12 text-center">
                <p style={{ color: theme.textSecondary }}>Loading...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="py-12 text-center">
                <p style={{ color: theme.textSecondary }}>No articles yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleSelectArticle(article)}
                    className="cursor-pointer rounded-lg border bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                    style={{
                      borderColor: theme.neutralDark,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className="mb-2 font-medium"
                          style={{ color: theme.primary }}
                        >
                          📄 {article.title}
                        </h3>
                        <p
                          className="text-xs"
                          style={{ color: theme.textSecondary }}
                        >
                          Created: {new Date(article.created_at).toLocaleString()}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteArticle(e, article)}
                        className="ml-4 h-8 w-8 rounded-lg border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                        style={{
                          borderColor: theme.neutralDark,
                          color: theme.textPrimary,
                        }}
                        aria-label="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
