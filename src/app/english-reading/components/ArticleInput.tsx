'use client'

import { useState } from 'react'
import ArticleList from './ArticleList'

interface ArticleInputProps {
  onSubmit: (id: number, content: string, title?: string) => void
  onSelectArticle: (id: number, content: string, title?: string) => void
}

export default function ArticleInput({ onSubmit, onSelectArticle }: ArticleInputProps) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    
    setIsLoading(true)
    try {
      const res = await fetch('/api/english-reading/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), title: title.trim() || 'Untitled' })
      })
      
      const data = await res.json()
      if (data.id) {
        onSubmit(data.id, content.trim(), title.trim() || 'Untitled')
      }
    } catch (error) {
      console.error('Failed to save article:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-6">
      {/* Left Panel - Input Form */}
      <div className="w-1/2">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">New Article</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter article title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Paste your English article here..."
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Start Reading'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Article List */}
      <div className="w-1/2">
        <ArticleList onSelectArticle={onSelectArticle} />
      </div>
    </div>
  )
}