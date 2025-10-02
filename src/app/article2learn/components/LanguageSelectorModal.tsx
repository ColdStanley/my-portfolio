'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { theme } from '@/styles/theme.config'
import { ANIMATIONS } from '../utils/animations'
import { promptsApi } from '../utils/apiClient'
import { useArticleStore } from '../store/useArticleStore'

interface LanguageSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (articleLanguage: string, motherTongue: string) => void
}

export default function LanguageSelectorModal({
  isOpen,
  onClose,
  onConfirm,
}: LanguageSelectorModalProps) {
  const {
    availableArticleLanguages,
    availableMotherTongues,
    setAvailableArticleLanguages,
    setAvailableMotherTongues,
  } = useArticleStore()

  const [selectedArticleLanguage, setSelectedArticleLanguage] = useState('')
  const [selectedMotherTongue, setSelectedMotherTongue] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // 加载语言选项
  useEffect(() => {
    if (isOpen && availableArticleLanguages.length === 0) {
      promptsApi
        .getLanguageOptions()
        .then((data) => {
          setAvailableArticleLanguages(data.articleLanguages)
          setAvailableMotherTongues(data.motherTongues)

          // 设置默认值
          if (data.articleLanguages.length > 0) {
            setSelectedArticleLanguage(data.articleLanguages[0])
          }
          if (data.motherTongues.length > 0) {
            setSelectedMotherTongue(data.motherTongues[0])
          }

          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Failed to load language options:', error)
          setIsLoading(false)
        })
    } else if (isOpen) {
      // 已有数据，直接设置默认值
      if (availableArticleLanguages.length > 0 && !selectedArticleLanguage) {
        setSelectedArticleLanguage(availableArticleLanguages[0])
      }
      if (availableMotherTongues.length > 0 && !selectedMotherTongue) {
        setSelectedMotherTongue(availableMotherTongues[0])
      }
      setIsLoading(false)
    }
  }, [isOpen, availableArticleLanguages, availableMotherTongues, selectedArticleLanguage, selectedMotherTongue, setAvailableArticleLanguages, setAvailableMotherTongues])

  const handleConfirm = () => {
    if (selectedArticleLanguage && selectedMotherTongue) {
      onConfirm(selectedArticleLanguage, selectedMotherTongue)
    }
  }

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          {...ANIMATIONS.modalBackdrop}
          className="absolute inset-0 bg-black/20"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          {...ANIMATIONS.fadeIn}
          className="relative z-10 w-[90%] max-w-md rounded-lg border bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          style={{ borderColor: theme.neutralDark }}
        >
          {/* Header */}
          <div className="mb-6">
            <h3
              className="text-lg font-semibold"
              style={{ color: theme.primary }}
            >
              Select Languages
            </h3>
            <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
              Choose the article language and your mother tongue
            </p>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: theme.textSecondary }}>
              Loading language options...
            </div>
          ) : (
            <>
              {/* Article Language */}
              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: theme.textPrimary }}
                >
                  Article Language
                </label>
                <select
                  value={selectedArticleLanguage}
                  onChange={(e) => setSelectedArticleLanguage(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: theme.neutralDark,
                    backgroundColor: theme.surface,
                    color: theme.textPrimary,
                  }}
                >
                  {availableArticleLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mother Tongue */}
              <div className="mb-6">
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: theme.textPrimary }}
                >
                  Mother Tongue
                </label>
                <select
                  value={selectedMotherTongue}
                  onChange={(e) => setSelectedMotherTongue(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: theme.neutralDark,
                    backgroundColor: theme.surface,
                    color: theme.textPrimary,
                  }}
                >
                  {availableMotherTongues.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="h-10 flex-1 rounded-lg border bg-white text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                  style={{
                    borderColor: theme.neutralDark,
                    color: theme.textPrimary,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedArticleLanguage || !selectedMotherTongue}
                  className="h-10 flex-1 rounded-lg text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:shadow-[0_1px_2px_rgba(0,0,0,0.2)_inset] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: theme.primary }}
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
