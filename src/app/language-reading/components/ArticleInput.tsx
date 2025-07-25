'use client'

import { useState } from 'react'
import ArticleList from './ArticleList'
import { Language, getUITexts } from '../config/uiText'

interface ArticleInputProps {
  language: Language
  onSubmit: (id: number, content: string, title?: string) => void
  onSelectArticle: (id: number, content: string, title?: string) => void
}

export default function ArticleInput({ language, onSubmit, onSelectArticle }: ArticleInputProps) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const uiTexts = getUITexts(language)

  const handleSubmit = async () => {
    if (!content.trim()) return
    
    setIsLoading(true)
    try {
      let backgroundImageUrl = null
      
      // Upload image if selected
      if (backgroundImage) {
        setImageUploading(true)
        const formData = new FormData()
        formData.append('image', backgroundImage)
        
        const imageRes = await fetch('/api/language-reading/upload-image', {
          method: 'POST',
          body: formData
        })
        
        if (imageRes.ok) {
          const imageData = await imageRes.json()
          backgroundImageUrl = imageData.imageUrl
        }
        setImageUploading(false)
      }
      
      const res = await fetch('/api/language-reading/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content.trim(), 
          title: title.trim() || uiTexts.untitled,
          language: language,
          backgroundImageUrl: backgroundImageUrl
        })
      })
      
      const data = await res.json()
      if (data.id) {
        onSubmit(data.id, content.trim(), title.trim() || uiTexts.untitled)
      }
    } catch (error) {
      console.error('Failed to save article:', error)
    } finally {
      setIsLoading(false)
      setImageUploading(false)
    }
  }

  return (
    <div className="flex gap-6">
      {/* Left Panel - Input Form */}
      <div className="w-1/2">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{uiTexts.articleInputTitle}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {uiTexts.titleOptional}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={uiTexts.titlePlaceholder}
              />
            </div>
            
            {/* Background Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Image (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setBackgroundImage(file)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {backgroundImage && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {backgroundImage.name}
                    <button
                      type="button"
                      onClick={() => setBackgroundImage(null)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {uiTexts.articleContent}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder={uiTexts.contentPlaceholder}
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading || imageUploading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {imageUploading ? 'Uploading image...' : isLoading ? uiTexts.loading : uiTexts.startReading}
            </button>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Article List */}
      <div className="w-1/2">
        <ArticleList language={language} onSelectArticle={onSelectArticle} />
      </div>
    </div>
  )
}