'use client'

import { useState, useEffect } from 'react'
import ArticleInput from './components/ArticleInput'
import ReadingView from './components/ReadingView'
import { useReadingStore } from './store/useReadingStore'

export default function EnglishReading() {
  const [articleId, setArticleId] = useState<number | null>(null)
  const [articleContent, setArticleContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  
  const { loadStoredData } = useReadingStore()

  useEffect(() => {
    // Load last article from localStorage
    const loadLastArticle = async () => {
      const lastArticleId = localStorage.getItem('lastArticleId')
      if (lastArticleId) {
        try {
          const res = await fetch(`/api/english-reading/articles?id=${lastArticleId}`)
          if (res.ok) {
            const article = await res.json()
            setArticleId(article.id)
            setArticleContent(article.content)
            await loadStoredData(article.id)
          }
        } catch (error) {
          console.error('Failed to load last article:', error)
        }
      }
      setIsLoading(false)
    }
    
    loadLastArticle()
  }, [])

  const handleArticleSubmit = async (id: number, content: string) => {
    // Clear previous data before loading new article
    const { clearAll, loadStoredData } = useReadingStore.getState()
    clearAll()
    
    setArticleId(id)
    setArticleContent(content)
    localStorage.setItem('lastArticleId', id.toString())
    
    // Load data for the new article
    await loadStoredData(id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-8">English Reading Assistant</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-purple-600">Loading...</div>
          </div>
        ) : !articleId ? (
          <ArticleInput onSubmit={handleArticleSubmit} onSelectArticle={handleArticleSubmit} />
        ) : (
          <ReadingView articleId={articleId} content={articleContent} onNewArticle={() => { setArticleId(null); setArticleContent(''); }} />
        )}
      </div>
    </div>
  )
}