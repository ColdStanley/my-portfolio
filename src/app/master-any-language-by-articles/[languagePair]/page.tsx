'use client'

import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import ArticleInput from '../components/ArticleInput'
import MobileArticleInput from '../components/MobileArticleInput'
import ChineseEnglishReadingView from '../components/ReadingView'
import ChineseFrenchInterface from '../components/ChineseFrenchInterface'
import SkeletonLoader from '../components/SkeletonLoader'
import { useLanguageReadingStore } from '../store/useLanguageReadingStore'
import { useChineseFrenchStore } from '../store/useChineseFrenchStore'
import { Language, getUITexts } from '../config/uiText'

interface LanguagePairProps {
  params: Promise<{
    languagePair: string
  }>
}

// Supported language combinations
const SUPPORTED_COMBINATIONS = [
  { code: 'chinese-english', native: 'chinese', learning: 'english' },
  { code: 'chinese-french', native: 'chinese', learning: 'french' }
]

const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  chinese: '中文',
  english: 'English',
  french: 'Français'
}

export default function LanguagePairPage({ params }: LanguagePairProps) {
  const { languagePair } = use(params)
  
  // Validate language combination
  const combination = SUPPORTED_COMBINATIONS.find(combo => combo.code === languagePair)
  
  if (!combination) {
    notFound()
  }

  const { native, learning } = combination
  const currentLanguage = learning as Language
  const uiTexts = getUITexts(currentLanguage)
  
  const [articleId, setArticleId] = useState<number | null>(null)
  const [articleContent, setArticleContent] = useState<string>('')
  const [articleTitle, setArticleTitle] = useState<string>('')
  const [articleData, setArticleData] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  const { loadStoredData } = useLanguageReadingStore()
  const { loadSentenceCards } = useChineseFrenchStore()

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-restore last article state on page load
  useEffect(() => {
    const restoreLastArticle = async () => {
      try {
        const lastArticleId = localStorage.getItem(`lastArticleId_${languagePair}`)
        const lastArticleContent = localStorage.getItem(`lastArticleContent_${languagePair}`)
        const lastArticleTitle = localStorage.getItem(`lastArticleTitle_${languagePair}`)
        
        if (lastArticleId && lastArticleContent) {
          const id = parseInt(lastArticleId)
          setArticleId(id)
          setArticleContent(lastArticleContent)
          setArticleTitle(lastArticleTitle || uiTexts.untitled)
          
          // Load data based on language pair
          if (languagePair === 'chinese-french') {
            const { clearAll } = useChineseFrenchStore.getState()
            clearAll()
            await loadSentenceCards(id)
          } else {
            const { clearAll, loadStoredData } = useLanguageReadingStore.getState()
            clearAll()
            await loadStoredData(id, currentLanguage)
          }
        }
      } catch (error) {
        console.error('Failed to restore last article:', error)
      }
    }
    
    restoreLastArticle()
  }, [languagePair, loadSentenceCards, loadStoredData, currentLanguage, uiTexts.untitled])

  const handleArticleSubmit = async (id: number, content: string, title?: string, fullData?: any) => {
    setArticleId(id)
    setArticleContent(content)
    setArticleTitle(title || uiTexts.untitled)
    setArticleData(fullData)
    
    // Save to localStorage for state restoration
    localStorage.setItem(`lastArticleId_${languagePair}`, id.toString())
    localStorage.setItem(`lastArticleContent_${languagePair}`, content)
    localStorage.setItem(`lastArticleTitle_${languagePair}`, title || uiTexts.untitled)
    
    // Load data based on language pair
    if (languagePair === 'chinese-french') {
      // Clear french store and load sentence cards
      const { clearAll } = useChineseFrenchStore.getState()
      clearAll()
      await loadSentenceCards(id)
    } else {
      // Clear english store and load word/sentence queries
      const { clearAll, loadStoredData } = useLanguageReadingStore.getState()
      clearAll()
      await loadStoredData(id, currentLanguage)
    }
  }

  // Get page title based on language combination
  const getPageTitle = () => {
    const nativeName = LANGUAGE_DISPLAY_NAMES[native]
    const learningName = LANGUAGE_DISPLAY_NAMES[learning]
    return `${nativeName} → ${learningName}`
  }

  // Mobile view - always start with management page
  if (isMobile) {
    return !articleId ? (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6">
          <div className="mb-6 pt-4">
            <h1 className="text-xl font-bold text-purple-700 mb-2">{getPageTitle()}</h1>
            <p className="text-sm text-gray-600 mb-4">Select an article to start learning</p>
          </div>
          <MobileArticleInput 
            language={currentLanguage}
            languagePair={`${native}-${learning}`}
            onSelectArticle={handleArticleSubmit} 
          />
        </div>
      </div>
    ) : (
      languagePair === 'chinese-french' ? (
        <ChineseFrenchInterface 
          article={{
            id: articleId,
            title: articleTitle,
            content: articleContent,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...articleData
          }}
          onBack={() => { 
            setArticleId(null)
            setArticleContent('')
            setArticleTitle('')
            setArticleData(null)
            // Clear localStorage when returning to management mode
            localStorage.removeItem(`lastArticleId_${languagePair}`)
            localStorage.removeItem(`lastArticleContent_${languagePair}`)
            localStorage.removeItem(`lastArticleTitle_${languagePair}`)
          }} 
        />
      ) : (
        <ChineseEnglishReadingView 
          language={currentLanguage}
          nativeLanguage={native}
          articleId={articleId} 
          content={articleContent} 
          title={articleTitle}
          onNewArticle={() => { 
            setArticleId(null)
            setArticleContent('')
            setArticleTitle('')
            // Clear localStorage when returning to management mode
            localStorage.removeItem(`lastArticleId_${languagePair}`)
            localStorage.removeItem(`lastArticleContent_${languagePair}`)
            localStorage.removeItem(`lastArticleTitle_${languagePair}`)
          }} 
        />
      )
    )
  }

  // Desktop view - always start with management page
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">{getPageTitle()}</h1>
          <p className="text-gray-600">
            {!articleId ? 'Select an article to start learning' : `Reading: ${articleTitle}`}
          </p>
        </div>
        
        {!articleId ? (
          <ArticleInput 
            language={currentLanguage}
            languagePair={`${native}-${learning}`}
            onSubmit={handleArticleSubmit} 
            onSelectArticle={handleArticleSubmit} 
          />
        ) : (
          languagePair === 'chinese-french' ? (
            <ChineseFrenchInterface 
              article={{
                id: articleId,
                title: articleTitle,
                content: articleContent,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...articleData
              }}
              onBack={() => { 
                setArticleId(null)
                setArticleContent('')
                setArticleTitle('')
                setArticleData(null)
                // Clear localStorage when returning to management mode
                localStorage.removeItem(`lastArticleId_${languagePair}`)
                localStorage.removeItem(`lastArticleContent_${languagePair}`)
                localStorage.removeItem(`lastArticleTitle_${languagePair}`)
              }} 
            />
          ) : (
            <ChineseEnglishReadingView 
              language={currentLanguage}
              nativeLanguage={native}
              articleId={articleId} 
              content={articleContent} 
              title={articleTitle}
              onNewArticle={() => { 
                setArticleId(null)
                setArticleContent('')
                setArticleTitle('')
                // Clear localStorage when returning to management mode
                localStorage.removeItem(`lastArticleId_${languagePair}`)
                localStorage.removeItem(`lastArticleContent_${languagePair}`)
                localStorage.removeItem(`lastArticleTitle_${languagePair}`)
              }} 
            />
          )
        )}
      </div>
    </div>
  )
}