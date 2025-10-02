'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { articleApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'

const LANGUAGE_OPTIONS = {
  source: [
    { value: 'english', label: 'English' },
    { value: 'chinese', label: '中文' },
    { value: 'french', label: 'Français' },
    { value: 'japanese', label: '日本語' },
    { value: 'korean', label: '한국어' },
    { value: 'russian', label: 'Русский' },
    { value: 'spanish', label: 'Español' },
    { value: 'arabic', label: 'العربية' }
  ],
  native: [
    { value: 'chinese', label: '中文' },
    { value: 'english', label: 'English' },
    { value: 'french', label: 'Français' },
    { value: 'japanese', label: '日本語' },
    { value: 'korean', label: '한국어' },
    { value: 'russian', label: 'Русский' },
    { value: 'spanish', label: 'Español' },
    { value: 'arabic', label: 'العربية' }
  ]
}

// Helper function to get available native languages based on source language
const getAvailableNativeLanguages = (sourceLanguage: string) => {
  return LANGUAGE_OPTIONS.native.filter(lang => lang.value !== sourceLanguage)
}

interface UploadFormProps {
  defaultNativeLanguage?: string
  defaultSourceLanguage?: string
}

export default function UploadForm({ defaultNativeLanguage = 'chinese', defaultSourceLanguage = 'english' }: UploadFormProps = {}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source_language: defaultSourceLanguage,
    native_language: defaultNativeLanguage
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setSelectedArticle, setActiveTab } = useReadLinguaStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Generate anonymous user ID for guest usage  
      let userId = 'anonymous'
      
      // Try to get authenticated user, but don't require it
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
        }
      } catch (authError) {
        // Using anonymous mode
      }

      // Save to Supabase
      const article = await articleApi.createArticle({
        user_id: userId,
        ...formData
      })

      // Auto-switch to learning mode
      setSelectedArticle(article)
      setActiveTab('learning')
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        source_language: defaultSourceLanguage,
        native_language: defaultNativeLanguage
      })
      
      toast.success('Article saved successfully!')
    } catch (error) {
      console.error('❌ Error saving article:', error)
      toast.error(`Failed to save article: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Article Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Enter article title..."
              required
            />
          </div>

          {/* Language Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="source_language" className="block text-sm font-medium text-gray-700 mb-2">
                Learning Language
              </label>
              <select
                id="source_language"
                value={formData.source_language}
                onChange={(e) => {
                  const newSourceLanguage = e.target.value
                  const availableNativeLanguages = getAvailableNativeLanguages(newSourceLanguage)
                  // If current native language is same as new source language, change to first available
                  const newNativeLanguage = newSourceLanguage === formData.native_language 
                    ? availableNativeLanguages[0]?.value || 'chinese'
                    : formData.native_language
                  
                  setFormData({ 
                    ...formData, 
                    source_language: newSourceLanguage,
                    native_language: newNativeLanguage
                  })
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              >
                {LANGUAGE_OPTIONS.source.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="native_language" className="block text-sm font-medium text-gray-700 mb-2">
                Native Language
              </label>
              <select
                id="native_language"
                value={formData.native_language}
                onChange={(e) => setFormData({ ...formData, native_language: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              >
                {getAvailableNativeLanguages(formData.source_language).map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Article Content
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
              placeholder="Paste your article content here..."
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 mt-4 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-40 px-6 py-3 bg-primary hover:bg-primary hover:brightness-110 disabled:bg-accent text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-2 justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Save & Learn
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
