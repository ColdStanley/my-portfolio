'use client'

import { useState, useEffect } from 'react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { articleApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'
import UploadForm from './UploadForm'
import ArticleList from './ArticleList'

export default function DashboardTab() {
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'articles'>('upload')
  const { articles, setArticles, setSelectedArticle, setActiveTab } = useReadLinguaStore()

  useEffect(() => {
    // Load articles from Supabase
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      let userId = 'anonymous'
      
      // Try to get authenticated user, but don't require it
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          userId = user.id
        }
      } catch (authError) {
        console.log('Using anonymous mode for loading articles')
      }

      const userArticles = await articleApi.getArticles(userId)
      setArticles(userArticles)
    } catch (error) {
      console.error('Error loading articles:', error)
    }
  }

  const handleArticleSelect = (article: any) => {
    setSelectedArticle(article)
    setActiveTab('learning')
  }

  return (
    <div className="p-6">
      {/* Sub-tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('upload')}
          className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 ${
            activeSubTab === 'upload'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Upload
        </button>
        <button
          onClick={() => setActiveSubTab('articles')}
          className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 ${
            activeSubTab === 'articles'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
          </svg>
          My Articles ({articles.length})
        </button>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeSubTab === 'upload' && <UploadForm />}
        {activeSubTab === 'articles' && (
          <ArticleList 
            articles={articles}
            onArticleSelect={handleArticleSelect}
          />
        )}
      </div>
    </div>
  )
}