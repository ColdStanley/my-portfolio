'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '@/styles/theme.config'
import { promptsApi } from '../utils/apiClient'
import { useArticleStore } from '../store/useArticleStore'

export default function LanguageSelector() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [tempArticleLanguage, setTempArticleLanguage] = useState('')
  const [tempMotherTongue, setTempMotherTongue] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    availableArticleLanguages,
    availableMotherTongues,
    selectedArticleLanguage,
    selectedMotherTongue,
    setAvailableArticleLanguages,
    setAvailableMotherTongues,
    setSelectedArticleLanguage,
    setSelectedMotherTongue,
  } = useArticleStore()

  // 加载语言选项
  useEffect(() => {
    promptsApi
      .getLanguageOptions()
      .then((data) => {
        setAvailableArticleLanguages(data.articleLanguages)
        setAvailableMotherTongues(data.motherTongues)

        // 设置默认值（第一个选项）
        if (data.articleLanguages.length > 0 && !selectedArticleLanguage) {
          setSelectedArticleLanguage(data.articleLanguages[0])
          setTempArticleLanguage(data.articleLanguages[0])
        }
        if (data.motherTongues.length > 0 && !selectedMotherTongue) {
          setSelectedMotherTongue(data.motherTongues[0])
          setTempMotherTongue(data.motherTongues[0])
        }
      })
      .catch((error) => {
        console.error('Failed to load language options:', error)
      })
  }, [])

  // 同步临时状态
  useEffect(() => {
    if (showDropdown) {
      setTempArticleLanguage(selectedArticleLanguage)
      setTempMotherTongue(selectedMotherTongue)
    }
  }, [showDropdown, selectedArticleLanguage, selectedMotherTongue])

  // 点击外部关闭
  useEffect(() => {
    if (!showDropdown) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  const handleConfirm = () => {
    setSelectedArticleLanguage(tempArticleLanguage)
    setSelectedMotherTongue(tempMotherTongue)
    setShowDropdown(false)
  }

  const displayText = selectedArticleLanguage && selectedMotherTongue
    ? `${selectedArticleLanguage} → ${selectedMotherTongue}`
    : 'Select Languages'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium shadow-md transition-all duration-200 hover:shadow-lg"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.neutralDark,
          color: theme.textPrimary,
        }}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span>{displayText}</span>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white p-4 shadow-lg"
            style={{ borderColor: theme.neutralDark }}
          >
            {/* Article Language */}
            <div className="mb-4">
              <label
                className="mb-2 block text-xs font-medium"
                style={{ color: theme.textSecondary }}
              >
                Article Language
              </label>
              <select
                value={tempArticleLanguage}
                onChange={(e) => setTempArticleLanguage(e.target.value)}
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
            <div className="mb-4">
              <label
                className="mb-2 block text-xs font-medium"
                style={{ color: theme.textSecondary }}
              >
                Mother Tongue
              </label>
              <select
                value={tempMotherTongue}
                onChange={(e) => setTempMotherTongue(e.target.value)}
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

            {/* 确认按钮 */}
            <button
              onClick={handleConfirm}
              className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: theme.primary }}
            >
              Confirm
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
