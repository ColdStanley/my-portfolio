'use client'

import { useState } from 'react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { articleApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'

const LANGUAGE_OPTIONS = {
  source: [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'ja', label: 'Japanese' },
    { value: 'es', label: 'Spanish' },
    { value: 'de', label: 'German' },
  ],
  native: [
    { value: 'zh', label: 'Chinese' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'ja', label: 'Japanese' },
    { value: 'es', label: 'Spanish' },
  ]
}

export default function UploadForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source_language: 'en',
    native_language: 'zh'
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
          console.log('✅ User authenticated:', { id: user.id })
        } else {
          console.log('👤 Using anonymous mode')
        }
      } catch (authError) {
        console.log('⚠️ Auth check failed, using anonymous mode:', authError)
      }

      console.log('📝 Saving article with data:', { user_id: userId, ...formData })

      // Save to Supabase
      const article = await articleApi.createArticle({
        user_id: userId,
        ...formData
      })

      console.log('✅ Article saved successfully:', article)

      // Auto-switch to learning mode
      setSelectedArticle(article)
      setActiveTab('learning')
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        source_language: 'en',
        native_language: 'zh'
      })
      
      alert('Article saved successfully!')
    } catch (error) {
      console.error('❌ Error saving article:', error)
      alert(`Failed to save article: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
              onChange={(e) => setFormData({ ...formData, source_language: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              {LANGUAGE_OPTIONS.native.map(lang => (
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none"
            placeholder="Paste your article content here..."
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-40 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-2 justify-center"
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