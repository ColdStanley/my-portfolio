'use client'

import ArticleList from './ArticleList'
import { Language, getUITexts } from '../config/uiText'

interface MobileArticleInputProps {
  language: Language
  onSelectArticle: (id: number, content: string, title?: string) => void
}

export default function MobileArticleInput({ language, onSelectArticle }: MobileArticleInputProps) {
  const uiTexts = getUITexts(language)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-purple-700 mb-2">
              {uiTexts.pageTitle}
            </h1>
            <p className="text-sm text-gray-600">
              Select an article to start reading
            </p>
          </div>
        </div>
      </div>

      {/* Article List */}
      <div className="px-4 py-6">
        <ArticleList language={language} onSelectArticle={onSelectArticle} isMobile={true} />
      </div>

      {/* Instructions for creating new articles */}
      <div className="px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Need to add new articles?
              </h3>
              <p className="text-sm text-blue-700">
                Use the desktop version to create and edit articles. This mobile version is optimized for reading and reviewing your saved content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}