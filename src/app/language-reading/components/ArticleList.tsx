'use client'

import { useState, useEffect } from 'react'
import { Language, getUITexts } from '../config/uiText'
import SkeletonLoader from './SkeletonLoader'
import AnimatedButton from './AnimatedButton'

interface Article {
  id: number
  title: string
  content: string
  created_at: string
  language: string
}

interface ArticleListProps {
  language: Language
  onSelectArticle: (id: number, content: string, title?: string) => void
}

export default function ArticleList({ language, onSelectArticle }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(6)
  const uiTexts = getUITexts(language)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`/api/language-reading/articles/list?language=${language}`)
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
  }, [language])

  const handleSelectArticle = (article: Article) => {
    localStorage.setItem(`lastArticleId_${language}`, article.id.toString())
    onSelectArticle(article.id, article.content, article.title)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const loadMore = () => {
    setDisplayedCount(prev => prev + 6)
  }

  const displayedArticles = articles.slice(0, displayedCount)
  const hasMore = articles.length > displayedCount

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{uiTexts.previousArticles}</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between items-start mb-2">
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
              </div>
              <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{uiTexts.previousArticles}</h2>
      
      {articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">📚</div>
          <p>{uiTexts.createFirstArticle}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleSelectArticle(article)}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200 transform hover:scale-[1.01]"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 truncate flex-1 pr-2">
                  {article.title || uiTexts.untitled}
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
          
          {hasMore && (
            <AnimatedButton
              onClick={loadMore}
              variant="accent"
              size="md"
              className="w-full"
            >
              {uiTexts.loadMore} ({articles.length - displayedCount} more)
            </AnimatedButton>
          )}
        </div>
      )}
    </div>
  )
}