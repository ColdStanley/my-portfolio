'use client'

import { useState, useEffect } from 'react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import { articleApi } from '../utils/apiClient'
import { supabase } from '../utils/supabaseClient'
import UploadForm from './UploadForm'
import ArticleList from './ArticleList'
import FlagIcon from './FlagIcon'

export default function DashboardTab() {
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'articles'>('upload')
  const { articles, setArticles, setSelectedArticle, setActiveTab } = useReadLinguaStore()
  const [nativeLanguage, setNativeLanguage] = useState('chinese')
  const [learningLanguage, setLearningLanguage] = useState('english')

  // Filter articles based on selected languages
  const filteredArticles = articles.filter(article => 
    article.native_language === nativeLanguage && article.source_language === learningLanguage
  )

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Header */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          
          {/* Language Selector */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-purple-100">
            <span className="text-xs text-gray-500 font-medium">From:</span>
            <div className="flex items-center gap-2">
              <FlagIcon language={learningLanguage} size={16} />
              <select 
                value={learningLanguage}
                onChange={(e) => setLearningLanguage(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="english">English</option>
                <option value="chinese">中文</option>
                <option value="french">Français</option>
                <option value="japanese">日本語</option>
                <option value="korean">한국어</option>
                <option value="russian">Русский</option>
                <option value="spanish">Español</option>
                <option value="arabic">العربية</option>
              </select>
            </div>
            
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            
            <span className="text-xs text-gray-500 font-medium">To:</span>
            <div className="flex items-center gap-2">
              <FlagIcon language={nativeLanguage} size={16} />
              <select 
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="chinese">中文</option>
                <option value="english">English</option>
                <option value="french">Français</option>
                <option value="japanese">日本語</option>
                <option value="korean">한국어</option>
                <option value="russian">Русский</option>
                <option value="spanish">Español</option>
                <option value="arabic">العربية</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Browse Articles */}
          <div 
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-purple-100 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
            style={{
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.1), 0 4px 15px rgba(139, 92, 246, 0.05)'
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                  </svg>
                  Browse
                </h2>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {filteredArticles.length}
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                <ArticleList 
                  articles={filteredArticles}
                  onArticleSelect={handleArticleSelect}
                />
              </div>
            </div>
          </div>

          {/* Add New Article */}
          <div 
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl border border-purple-100 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
            style={{
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.1), 0 4px 15px rgba(139, 92, 246, 0.05)'
            }}
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                Add New
              </h2>
              
              <UploadForm 
                defaultNativeLanguage={nativeLanguage}
                defaultSourceLanguage={learningLanguage}
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}