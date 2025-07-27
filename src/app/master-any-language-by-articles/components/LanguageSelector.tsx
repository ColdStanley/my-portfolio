'use client'

import { useState } from 'react'
import { LanguageConfig, SupportedLanguage, SUPPORTED_LANGUAGES, getLanguageInfo } from '../config/languageConfig'

interface LanguageSelectorProps {
  config: LanguageConfig
  onChange: (config: LanguageConfig) => void
  className?: string
}

export default function LanguageSelector({ config, onChange, className = '' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNativeChange = (native: SupportedLanguage) => {
    onChange({ ...config, native })
  }

  const handleTargetChange = (target: SupportedLanguage) => {
    onChange({ ...config, target })
  }

  const nativeInfo = getLanguageInfo(config.native)
  const targetInfo = getLanguageInfo(config.target)

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <span className="text-lg">{nativeInfo.flag}</span>
        <span className="text-gray-600">→</span>
        <span className="text-lg">{targetInfo.flag}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
            {/* Native Language Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                母语 / Native Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={`native-${lang.code}`}
                    onClick={() => handleNativeChange(lang.code)}
                    className={`flex items-center gap-2 p-2 text-xs rounded border transition-colors ${
                      config.native === lang.code
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Language Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标语言 / Target Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={`target-${lang.code}`}
                    onClick={() => handleTargetChange(lang.code)}
                    className={`flex items-center gap-2 p-2 text-xs rounded border transition-colors ${
                      config.target === lang.code
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Example */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                AI将用<strong>{nativeInfo.nativeName}</strong>解释<strong>{targetInfo.nativeName}</strong>内容
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}