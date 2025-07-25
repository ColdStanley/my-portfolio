'use client'

import { useState, useEffect } from 'react'
import ArticleInput from './components/ArticleInput'
import MobileArticleInput from './components/MobileArticleInput'
import ReadingView from './components/ReadingView'
import SkeletonLoader from './components/SkeletonLoader'
import { useLanguageReadingStore } from './store/useLanguageReadingStore'
import { Language, getUITexts } from './config/uiText'

const NATIVE_LANGUAGES = [
  { code: 'chinese', name: '中文' }
]

const LEARNING_LANGUAGES = [
  { code: 'english', name: 'English' },
  { code: 'french', name: 'Français' }
]

export default function MasterAnyLanguagePage() {
  const [nativeLanguage, setNativeLanguage] = useState('chinese')
  const [learningLanguage, setLearningLanguage] = useState<Language>('english')
  const [articleId, setArticleId] = useState<number | null>(null)
  const [articleContent, setArticleContent] = useState<string>('')
  const [articleTitle, setArticleTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [currentMode, setCurrentMode] = useState<'reading' | 'management'>('reading') // Track current mode
  
  const { loadStoredData } = useLanguageReadingStore()
  const uiTexts = getUITexts(learningLanguage)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Only run on initial page load, not on language changes
    const initializePage = async () => {
      const lastArticleId = localStorage.getItem(`lastArticleId_${learningLanguage}`)
      if (lastArticleId) {
        try {
          const res = await fetch(`/api/language-reading/articles?id=${lastArticleId}&language=${learningLanguage}`)
          if (res.ok) {
            const article = await res.json()
            setArticleId(article.id)
            setArticleContent(article.content)
            setArticleTitle(article.title || getUITexts(learningLanguage).untitled)
            await loadStoredData(article.id, learningLanguage)
            setCurrentMode('reading') // Start in reading mode
          } else {
            // No article found, start in management mode
            setCurrentMode('management')
          }
        } catch (error) {
          console.error('Failed to load last article:', error)
          setCurrentMode('management')
        }
      } else {
        // No last article, start in management mode
        setCurrentMode('management')
      }
      setIsLoading(false)
    }
    
    initializePage()
  }, [loadStoredData]) // Remove learningLanguage and uiTexts.untitled from dependencies

  const handleArticleSubmit = async (id: number, content: string, title?: string) => {
    // Clear previous data before loading new article
    const { clearAll, loadStoredData } = useLanguageReadingStore.getState()
    clearAll()
    
    setArticleId(id)
    setArticleContent(content)
    setArticleTitle(title || uiTexts.untitled)
    localStorage.setItem(`lastArticleId_${learningLanguage}`, id.toString())
    
    // Switch to reading mode and load data for the new article
    setCurrentMode('reading')
    await loadStoredData(id, learningLanguage)
  }

  const handleLanguageChange = async (newLearningLanguage: Language) => {
    if (newLearningLanguage !== learningLanguage) {
      setLearningLanguage(newLearningLanguage)
      
      // Clear store data
      const { clearAll } = useLanguageReadingStore.getState()
      clearAll()
      
      // If in reading mode, try to load the last article for the new language
      if (currentMode === 'reading') {
        const lastArticleId = localStorage.getItem(`lastArticleId_${newLearningLanguage}`)
        if (lastArticleId) {
          try {
            const res = await fetch(`/api/language-reading/articles?id=${lastArticleId}&language=${newLearningLanguage}`)
            if (res.ok) {
              const article = await res.json()
              setArticleId(article.id)
              setArticleContent(article.content)
              setArticleTitle(article.title || getUITexts(newLearningLanguage).untitled)
              await loadStoredData(article.id, newLearningLanguage)
              return // Stay in reading mode
            }
          } catch (error) {
            console.error('Failed to load last article for new language:', error)
          }
        }
        // If no article found for new language, switch to management mode
        setCurrentMode('management')
        setArticleId(null)
        setArticleContent('')
        setArticleTitle('')
      } else {
        // If in management mode, just clear current article data
        setArticleId(null)
        setArticleContent('')
        setArticleTitle('')
      }
    }
  }

  // Language selector component
  const LanguageSelector = () => (
    <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex items-center gap-4'}`}>
      {/* Native Language */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Native:</span>
        <div className="relative">
          <select
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
            className="appearance-none bg-white border border-purple-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 cursor-pointer"
          >
            {NATIVE_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Learning Language */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Learning:</span>
        <div className="relative">
          <select
            value={learningLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="appearance-none bg-white border border-purple-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 cursor-pointer"
          >
            {LEARNING_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6">
          <div className="mb-6 pt-4">
            <h1 className="text-xl font-bold text-purple-700 mb-4">Master Any Language</h1>
            <LanguageSelector />
          </div>
          {currentMode === 'management' ? (
            <MobileArticleInput 
              language={learningLanguage}
              onSelectArticle={handleArticleSubmit} 
            />
          ) : (
            <ReadingView 
              language={learningLanguage}
              articleId={articleId} 
              content={articleContent} 
              title={articleTitle}
              onNewArticle={() => { 
                setCurrentMode('management')
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

  // Desktop view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-purple-700">Master Any Language by Articles</h1>
          <LanguageSelector />
        </div>
        
        {isLoading ? (
          <SkeletonLoader type="page" />
        ) : currentMode === 'management' ? (
          <ArticleInput 
            language={learningLanguage}
            onSubmit={handleArticleSubmit} 
            onSelectArticle={handleArticleSubmit} 
          />
        ) : (
          <ReadingView 
            language={learningLanguage}
            articleId={articleId} 
            content={articleContent} 
            title={articleTitle}
            onNewArticle={() => { 
              setCurrentMode('management')
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