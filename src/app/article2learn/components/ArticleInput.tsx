'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { theme } from '@/styles/theme.config'
import { ANIMATIONS } from '../utils/animations'
import { articleApi } from '../utils/apiClient'
import { useArticleStore } from '../store/useArticleStore'
import LanguageSelectorModal from './LanguageSelectorModal'

export default function ArticleInput() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)

  const { setCurrentArticle, setIsLearningMode } = useArticleStore()

  const handleStart = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter both title and content')
      return
    }

    // 打开语言选择 Modal
    setShowLanguageModal(true)
  }

  const handleLanguageConfirm = async (articleLanguage: string, motherTongue: string) => {
    setShowLanguageModal(false)
    setIsSubmitting(true)

    try {
      const article = await articleApi.createArticle({
        user_id: 'anonymous', // 默认匿名用户
        title: title.trim(),
        content: content.trim(),
        article_language: articleLanguage,
        mother_tongue: motherTongue,
      })

      setCurrentArticle(article)
      setIsLearningMode(true)
      toast.success('Article created')
    } catch (error) {
      toast.error('Failed to create article')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      {...ANIMATIONS.contentSwitch}
      className="px-6 py-12"
    >
      <div className="rounded-lg border bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]" style={{ borderColor: theme.neutralDark }}>
        <h1
          className="mb-6 text-2xl font-semibold"
          style={{ color: theme.primary }}
        >
          Article Input
        </h1>

        {/* Title */}
        <div className="mb-6">
          <label
            className="mb-2 block text-sm font-medium"
            style={{ color: theme.textPrimary }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title"
            className="w-full rounded-lg border px-4 py-2 text-sm shadow-inner transition-all duration-200 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.neutralDark,
              backgroundColor: 'rgba(250, 250, 250, 0.5)',
              color: theme.textPrimary,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.primary
              e.target.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.06), 0 0 0 2px ${theme.focus.ring}`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.neutralDark
              e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <label
            className="mb-2 block text-sm font-medium"
            style={{ color: theme.textPrimary }}
          >
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your article here"
            rows={12}
            className="w-full resize-y rounded-lg border px-4 py-2 text-sm shadow-inner transition-all duration-200 focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2"
            style={{
              borderColor: theme.neutralDark,
              backgroundColor: 'rgba(250, 250, 250, 0.5)',
              color: theme.textPrimary,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.primary
              e.target.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.06), 0 0 0 2px ${theme.focus.ring}`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = theme.neutralDark
              e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="h-10 w-full rounded-lg px-6 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:shadow-[0_1px_2px_rgba(0,0,0,0.2)_inset] disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: theme.primary }}
        >
          {isSubmitting ? 'Creating...' : 'Start'}
        </button>
      </div>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onConfirm={handleLanguageConfirm}
      />
    </motion.div>
  )
}
