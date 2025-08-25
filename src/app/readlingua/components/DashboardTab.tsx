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
  const { 
    articles, 
    setArticles, 
    shouldRefreshArticles, 
    setSelectedArticle, 
    setActiveTab,
    addArticle
  } = useReadLinguaStore()
  const [nativeLanguage, setNativeLanguage] = useState('chinese')
  const [learningLanguage, setLearningLanguage] = useState('english')
  const [isLoading, setIsLoading] = useState(false)

  // Filter articles based on selected languages
  const filteredArticles = articles.filter(article => 
    article.native_language === nativeLanguage && article.source_language === learningLanguage
  )

  // Load articles on mount and when refresh is needed
  useEffect(() => {
    if (shouldRefreshArticles()) {
      loadArticles()
    }
  }, [])

  // Refresh articles when new article is uploaded
  const handleArticleUploaded = (newArticle: any) => {
    addArticle(newArticle)
  }

  const loadArticles = async () => {
    try {
      setIsLoading(true)
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

      const userArticles = await articleApi.getArticles(userId)
      setArticles(userArticles)
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArticleSelect = (article: any) => {
    setSelectedArticle(article)
    setActiveTab('learning')
  }

  return (
    <div className="min-h-screen md:min-h-0 md:bg-gradient-to-br md:from-slate-50 md:via-white md:to-purple-50/30">
      {/* Desktop Header */}
      <div className="hidden md:block px-6 py-6 bg-white/90 backdrop-blur-md shadow-lg"
        style={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(139, 92, 246, 0.1)'
        }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          
          {/* Language Selector */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-lg"
            style={{
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(139, 92, 246, 0.1)'
            }}>
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
        {/* Mobile Language Selector - Above Articles */}
        <div className="md:hidden mb-6 flex justify-center">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg"
            style={{
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(139, 92, 246, 0.1)'
            }}>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Browse Articles */}
          <div 
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 min-h-[500px] md:col-span-1 col-span-full"
            style={{
              boxShadow: '0 15px 35px rgba(139, 92, 246, 0.15), 0 6px 20px rgba(139, 92, 246, 0.08)'
            }}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                  </svg>
                  <span className="hidden md:inline">Browse</span>
                  <span className="md:hidden">Articles</span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadArticles}
                    disabled={isLoading}
                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh articles"
                  >
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {filteredArticles.length}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">Loading articles...</span>
                    </div>
                  </div>
                ) : (
                  <ArticleList 
                    articles={filteredArticles}
                    onArticleSelect={handleArticleSelect}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Add New Article - Hidden on Mobile */}
          <div 
            className="hidden md:block group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 min-h-[500px]"
            style={{
              boxShadow: '0 15px 35px rgba(139, 92, 246, 0.15), 0 6px 20px rgba(139, 92, 246, 0.08)'
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
                onArticleUploaded={handleArticleUploaded}
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}