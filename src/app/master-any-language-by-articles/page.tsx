'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const NATIVE_LANGUAGES = [
  { code: 'chinese', name: '中文' }
]

const LEARNING_LANGUAGES = [
  { code: 'english', name: 'English' },
  { code: 'french', name: 'Français' }
]

export default function MasterAnyLanguagePage() {
  const [nativeLanguage, setNativeLanguage] = useState('chinese')
  const [learningLanguage, setLearningLanguage] = useState('english')
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleStartLearning = () => {
    const languageRoute = `${nativeLanguage}-${learningLanguage}`
    window.location.href = `/master-any-language-by-articles/${languageRoute}`
  }

  const LanguageSelector = () => (
    <div className="bg-purple-50 rounded-lg p-6 shadow-sm">
      <div className={`${isMobile ? 'flex flex-col gap-6' : 'flex items-center gap-8 justify-center'}`}>
        {/* Native Language */}
        <div className="flex flex-col gap-2">
          <span className="text-lg font-medium text-gray-700">Native Language:</span>
          <div className="relative">
            <select
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              className="appearance-none bg-white border border-purple-200 rounded-lg px-4 py-3 pr-10 text-base font-medium text-gray-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 cursor-pointer min-w-[200px]"
            >
              {NATIVE_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Learning Language */}
        <div className="flex flex-col gap-2">
          <span className="text-lg font-medium text-gray-700">Learning Language:</span>
          <div className="relative">
            <select
              value={learningLanguage}
              onChange={(e) => setLearningLanguage(e.target.value)}
              className="appearance-none bg-white border border-purple-200 rounded-lg px-4 py-3 pr-10 text-base font-medium text-gray-700 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 cursor-pointer min-w-[200px]"
            >
              {LEARNING_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Start Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleStartLearning}
          className="w-48 px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap transition-colors duration-200"
        >
          Start Learning
        </button>
      </div>
    </div>
  )

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-purple-700 mb-4">Master Any Language</h1>
            <p className="text-gray-600 mb-8">Choose your language combination to start learning</p>
          </div>
          <LanguageSelector />
        </div>
      </div>
    )
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-700 mb-4">Master Any Language by Articles</h1>
          <p className="text-lg text-gray-600">Choose your language combination to start your learning journey</p>
        </div>
        <LanguageSelector />
      </div>
    </div>
  )
}