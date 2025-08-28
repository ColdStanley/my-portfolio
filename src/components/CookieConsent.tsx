'use client'

import { useState, useEffect } from 'react'
import { getCookieConsent, setCookieConsent, hasConsented, CookiePreferences } from '@/lib/cookies'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasConsented()) {
        setIsVisible(true)
        setTimeout(() => setIsAnimating(true), 10) // 微延迟触发动画
      }
    }, 1000) // 1秒延迟显示

    return () => clearTimeout(timer)
  }, [])

  const hideWithAnimation = () => {
    setIsAnimating(false)
    setTimeout(() => setIsVisible(false), 300) // 等待动画完成
  }

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true }
    setCookieConsent(allAccepted)
    hideWithAnimation()
  }

  const handleRejectAll = () => {
    const onlyNecessary = { necessary: true, analytics: false, marketing: false }
    setCookieConsent(onlyNecessary)
    hideWithAnimation()
  }

  const handleCustomize = () => {
    setCookieConsent(preferences)
    hideWithAnimation()
  }

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
      isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl p-6">
        <div className="max-w-6xl mx-auto">
          {!showDetails ? (
            // 简化视图
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  We use cookies
                </h3>
                <p className="text-sm text-gray-600">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Customize
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            // 详细设置视图
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Cookie Preferences
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                {/* 必要Cookie */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Required for website functionality. Cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-purple-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* 分析Cookie */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.analytics ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                    </button>
                  </div>
                </div>

                {/* 营销Cookie */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Used to track visitors for advertising purposes.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.marketing ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCustomize}
                  className="px-6 py-2 text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}