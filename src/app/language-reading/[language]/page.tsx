'use client'

import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import ArticleInput from '../components/ArticleInput'
import ReadingView from '../components/ReadingView'
import SkeletonLoader from '../components/SkeletonLoader'
import { useLanguageReadingStore } from '../store/useLanguageReadingStore'
import { Language, getUITexts } from '../config/uiText'

interface LanguageReadingProps {
  params: Promise<{
    language: string
  }>
}

const SUPPORTED_LANGUAGES = ['english', 'french']

export default function LanguageReading({ params }: LanguageReadingProps) {
  const { language } = use(params)
  
  // Validate language parameter
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    notFound()
  }

  const currentLanguage = language as Language
  const uiTexts = getUITexts(currentLanguage)
  
  const [articleId, setArticleId] = useState<number | null>(null)
  const [articleContent, setArticleContent] = useState<string>('')
  const [articleTitle, setArticleTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  
  const { loadStoredData } = useLanguageReadingStore()

  useEffect(() => {
    // Load last article from localStorage for this language
    const loadLastArticle = async () => {
      const lastArticleId = localStorage.getItem(`lastArticleId_${currentLanguage}`)
      if (lastArticleId) {
        try {
          const res = await fetch(`/api/language-reading/articles?id=${lastArticleId}&language=${currentLanguage}`)
          if (res.ok) {
            const article = await res.json()
            setArticleId(article.id)
            setArticleContent(article.content)
            setArticleTitle(article.title || uiTexts.untitled)
            await loadStoredData(article.id, currentLanguage)
          }
        } catch (error) {
          console.error('Failed to load last article:', error)
        }
      }
      setIsLoading(false)
    }
    
    loadLastArticle()
  }, [currentLanguage, loadStoredData, uiTexts.untitled])

  const handleArticleSubmit = async (id: number, content: string, title?: string) => {
    // Clear previous data before loading new article
    const { clearAll, loadStoredData } = useLanguageReadingStore.getState()
    clearAll()
    
    setArticleId(id)
    setArticleContent(content)
    setArticleTitle(title || uiTexts.untitled)
    localStorage.setItem(`lastArticleId_${currentLanguage}`, id.toString())
    
    // Load data for the new article
    await loadStoredData(id, currentLanguage)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-8">{uiTexts.pageTitle}</h1>
        
        {isLoading ? (
          <SkeletonLoader type="page" />
        ) : !articleId ? (
          <ArticleInput 
            language={currentLanguage}
            onSubmit={handleArticleSubmit} 
            onSelectArticle={handleArticleSubmit} 
          />
        ) : (
          <ReadingView 
            language={currentLanguage}
            articleId={articleId} 
            content={articleContent} 
            title={articleTitle}
            onNewArticle={() => { 
              setArticleId(null)
              setArticleContent('')
              setArticleTitle('') 
            }} 
          />
        )}
      </div>
    </div>
  )
}