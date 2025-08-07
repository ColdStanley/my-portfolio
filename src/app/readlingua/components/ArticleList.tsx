'use client'

import { Article } from '../store/useReadLinguaStore'

interface ArticleListProps {
  articles: Article[]
  onArticleSelect: (article: Article) => void
}

const LANGUAGE_LABELS: Record<string, string> = {
  english: 'English',
  chinese: '中文',
  french: 'Français', 
  japanese: '日本語',
  korean: '한국어',
  russian: 'Русский',
  spanish: 'Español',
  arabic: 'العربية'
}

export default function ArticleList({ articles, onArticleSelect }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
        </svg>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Articles Yet</h3>
        <p className="text-gray-500">Upload your first article to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {articles.map((article) => (
        <div
          key={article.id}
          onClick={() => onArticleSelect(article)}
          className="p-4 cursor-pointer transition-all duration-200 rounded-lg hover:bg-purple-50"
          style={{
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08), 0 1px 4px rgba(139, 92, 246, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(139, 92, 246, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.08), 0 1px 4px rgba(139, 92, 246, 0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              {article.title}
            </h3>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
              {LANGUAGE_LABELS[article.source_language] || article.source_language}
            </span>
            <span>→</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
              {LANGUAGE_LABELS[article.native_language] || article.native_language}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
            {article.content.length > 100 
              ? article.content.substring(0, 100) + '...' 
              : article.content
            }
          </p>
          
          <div className="text-xs text-gray-400">
            {new Date(article.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      ))}
    </div>
  )
}