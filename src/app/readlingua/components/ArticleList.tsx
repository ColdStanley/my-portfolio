'use client'

import { Article } from '../store/useReadLinguaStore'

interface ArticleListProps {
  articles: Article[]
  onArticleSelect: (article: Article) => void
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  fr: 'French', 
  ja: 'Japanese',
  es: 'Spanish',
  de: 'German',
  zh: 'Chinese'
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <div
          key={article.id}
          onClick={() => onArticleSelect(article)}
          className="bg-purple-50 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors border border-purple-200"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
              {article.title}
            </h3>
            <svg className="w-5 h-5 text-purple-500 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
            </svg>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-purple-200 text-purple-700 text-xs rounded font-medium">
              {LANGUAGE_LABELS[article.source_language]}
            </span>
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded font-medium">
              {LANGUAGE_LABELS[article.native_language]}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {article.content.substring(0, 120)}...
          </p>
          
          <div className="text-xs text-gray-500">
            {new Date(article.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}