'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useThemeStore } from '../store/useThemeStore'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const { theme, actions } = useThemeStore()

  // Handle panel opening animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
      setTimeout(() => setShouldRender(false), 300)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleThemeSelect = (selectedTheme: 'light' | 'dark' | 'lakers') => {
    actions.setTheme(selectedTheme)
  }

  if (!shouldRender || typeof document === 'undefined') return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isVisible ? 'bg-black/20 backdrop-blur-sm' : 'bg-transparent'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 z-50 bg-white dark:bg-neutral-900 lakers:bg-gradient-to-br lakers:from-lakers-800 lakers:to-lakers-700 shadow-2xl transform transition-all duration-300 ease-out ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700 lakers:border-lakers-300/30">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 lakers:text-lakers-300">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 lakers:hover:bg-lakers-300/20 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-200 lakers:text-lakers-300 lakers:hover:text-lakers-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Theme Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-neutral-100 lakers:text-lakers-300 mb-4">Theme</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400 lakers:text-lakers-300 mb-4">
              Choose your preferred theme for the AI Card Studio interface.
            </p>
            
            <div className="space-y-3">
              {/* Light Theme Option */}
              <button
                onClick={() => handleThemeSelect('light')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  theme === 'light'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400 lakers:border-lakers-300 lakers:bg-lakers-300/20'
                    : 'border-gray-200 dark:border-neutral-700 lakers:border-lakers-200/30 hover:border-purple-300 dark:hover:border-purple-600 lakers:hover:border-lakers-300 hover:bg-gray-50 dark:hover:bg-neutral-800 lakers:hover:bg-lakers-300/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-neutral-100 lakers:text-lakers-300">Light</div>
                    <div className="text-sm text-gray-500 dark:text-neutral-400 lakers:text-lakers-300">Clean and bright interface</div>
                  </div>
                  {theme === 'light' && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>

              {/* Dark Theme Option */}
              <button
                onClick={() => handleThemeSelect('dark')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  theme === 'dark'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400 lakers:border-lakers-300 lakers:bg-lakers-300/20'
                    : 'border-gray-200 dark:border-neutral-700 lakers:border-lakers-200/30 hover:border-purple-300 dark:hover:border-purple-600 lakers:hover:border-lakers-300 hover:bg-gray-50 dark:hover:bg-neutral-800 lakers:hover:bg-lakers-300/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-neutral-600 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-neutral-100 lakers:text-lakers-300">Dark</div>
                    <div className="text-sm text-gray-500 dark:text-neutral-400 lakers:text-lakers-300">Easy on the eyes</div>
                  </div>
                  {theme === 'dark' && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>

              {/* Lakers Theme Option */}
              <button
                onClick={() => handleThemeSelect('lakers')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  theme === 'lakers'
                    ? 'border-lakers-300 bg-lakers-300/20 dark:bg-lakers-300/30 dark:border-lakers-300 lakers:border-lakers-300 lakers:bg-lakers-300/20'
                    : 'border-gray-200 dark:border-neutral-700 lakers:border-lakers-200/30 hover:border-lakers-300 dark:hover:border-lakers-300 lakers:hover:border-lakers-300 hover:bg-lakers-100 dark:hover:bg-lakers-800/20 lakers:hover:bg-lakers-300/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lakers-700 to-lakers-300 border-2 border-lakers-300 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-lakers-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-neutral-100 lakers:text-lakers-300">Lakers</div>
                    <div className="text-sm text-gray-500 dark:text-neutral-400 lakers:text-lakers-300">Championship energy</div>
                  </div>
                  {theme === 'lakers' && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 bg-lakers-300 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-lakers-700" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Future Settings Sections */}
          <div className="border-t border-gray-200 dark:border-neutral-700 lakers:border-lakers-300/30 pt-6">
            <div className="text-sm text-gray-500 dark:text-neutral-400 lakers:text-lakers-300 text-center">
              More settings coming soon...
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}