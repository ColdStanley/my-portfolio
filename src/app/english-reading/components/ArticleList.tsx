'use client'

import { useState, useEffect } from 'react'

interface Article {
  id: number
  title: string
  content: string
  created_at: string
}

interface ArticleListProps {
  onSelectArticle: (id: number, content: string, title?: string) => void
}

export default function ArticleList({ onSelectArticle }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/english-reading/articles/list')
        if (res.ok) {
          const data = await res.json()
          setArticles(data)
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const handleSelectArticle = (article: Article) => {
    localStorage.setItem('lastArticleId', article.id.toString())
    onSelectArticle(article.id, article.content, article.title)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Previous Articles</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Previous Articles</h2>
      
      {articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">📚</div>
          <p>No articles yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleSelectArticle(article)}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 truncate flex-1 pr-2">
                  {article.title || 'Untitled'}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(article.created_at)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2">
                {article.content.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}