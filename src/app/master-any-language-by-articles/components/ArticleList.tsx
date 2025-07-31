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
  languagePair?: string
  onSelectArticle: (id: number, content: string, title?: string, fullData?: Article) => void
  isMobile?: boolean
}

export default function ArticleList({ language, languagePair, onSelectArticle, isMobile = false }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(6)
  const uiTexts = getUITexts(language)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Use appropriate API endpoint based on language pair
        let apiEndpoint = '/api/master-language/articles/list'
        let queryParam = `language=${language}`
        
        if (languagePair === 'chinese-french') {
          apiEndpoint = '/api/master-language/articles/list'
          queryParam = '' // Chinese-French API doesn't need query params
        } else if (languagePair) {
          queryParam = `languagePair=${languagePair}`
        }
        
        const url = queryParam ? `${apiEndpoint}?${queryParam}` : apiEndpoint
        const res = await fetch(url)
        
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
  }, [language, languagePair])

  const handleSelectArticle = (article: Article) => {
    localStorage.setItem(`lastArticleId_${language}`, article.id.toString())
    onSelectArticle(article.id, article.content || '', article.title || 'Untitled', article)
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
      <div className={isMobile ? "space-y-3" : "bg-white rounded-lg shadow-lg border border-gray-200 p-6"}>
        {!isMobile && <h2 className="text-xl font-semibold text-gray-800 mb-4">{uiTexts.previousArticles}</h2>}
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
    <div className={isMobile ? "" : "bg-white rounded-lg shadow-lg border border-gray-200 p-6"}>
      {!isMobile && <h2 className="text-xl font-semibold text-gray-800 mb-4">{uiTexts.previousArticles}</h2>}
      
      {articles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">📚</div>
          <p>{isMobile ? "No articles available. Use desktop to create articles." : uiTexts.createFirstArticle}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleSelectArticle(article)}
              className={`${isMobile ? 'bg-white shadow-sm' : 'bg-white'} p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] min-h-[80px] flex flex-col justify-between`}
            >
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 flex-1 pr-2 line-clamp-1">
                    {article.title || uiTexts.untitled}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                    {formatDate(article.created_at)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {article.content ? `${article.content.substring(0, 120)}...` : 'No content available'}
                </p>
              </div>
              
              {isMobile && (
                <div className="mt-2 flex justify-end">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
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