'use client'

import Link from 'next/link'
import { useState } from 'react'

const languages = [
  {
    code: 'english',
    name: 'English',
    nativeName: 'English',
    description: 'Interactive English reading with AI-powered vocabulary analysis and grammar insights.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.01-4.65.51-6.81l-.46-.58-.5.96c-.15.29-.48 1.08-.94 1.69l-.22-.22c-.02.02-.22.21-.69.69l-.31-.31c.05-.05.08-.2.05-.29-.08-.29-.13-.64-.09-1.06.04-.41-.08-.82-.33-1.15-.27-.34-.71-.53-1.18-.53-.47 0-.91.19-1.18.53-.25.33-.37.74-.33 1.15.04.42-.01.77-.09 1.06-.03.09 0 .24.05.29l-.31.31c-.47-.48-.67-.67-.69-.69l-.22.22c-.46-.61-.79-1.4-.94-1.69l-.5-.96-.46.58c-1.5 2.16-1.23 4.87.51 6.81l.03.03-2.54 2.51v.01l-.85.85 2.33 2.33h7.52l2.33-2.33-.85-.86-.01-.01z"/>
      </svg>
    ),
    accent: 'from-purple-500 to-purple-600',
    hoverAccent: 'from-purple-600 to-purple-700',
    borderColor: 'border-purple-200',
    tagColor: 'bg-purple-50 text-purple-700'
  },
  {
    code: 'french',
    name: 'French',
    nativeName: 'Français',
    description: 'Apprentissage du français interactif avec analyse IA du vocabulaire et conjugaisons.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 6H3v12h18V6zM8 16H4v-2h4v2zm0-3H4v-2h4v2zm0-3H4V8h4v2zm6 6H9v-2h5v2zm0-3H9v-2h5v2zm0-3H9V8h5v2zm6 6h-5v-8h5v8z"/>
      </svg>
    ),
    accent: 'from-indigo-500 to-indigo-600',
    hoverAccent: 'from-indigo-600 to-indigo-700',
    borderColor: 'border-indigo-200',
    tagColor: 'bg-indigo-50 text-indigo-700'
  }
]

export default function LanguageSelectionPage() {
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Language Reading Assistant
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your preferred language to start your interactive reading journey with AI-powered analysis
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Language Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {languages.map((language) => (
            <Link
              key={language.code}
              href={`/language-reading/${language.code}`}
              className="group block transform transition-all duration-300 hover:scale-[1.02]"
              onMouseEnter={() => setHoveredLanguage(language.code)}
              onMouseLeave={() => setHoveredLanguage(null)}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${language.accent} p-6 text-white relative overflow-hidden`}>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                          {language.icon}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{language.name}</h2>
                          <p className="text-white text-opacity-80 text-sm font-medium">{language.nativeName}</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white bg-opacity-5 rounded-full -ml-10 -mb-10"></div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {language.description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">AI-Powered Analysis</p>
                        <p className="text-xs text-gray-500">Word definitions, grammar insights, and contextual examples</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Interactive Highlighting</p>
                        <p className="text-xs text-gray-500">Select text for instant analysis and personalized notes</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Audio Pronunciation</p>
                        <p className="text-xs text-gray-500">Native voice synthesis for words and example sentences</p>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Ready to start reading?</span>
                      <div className={`px-4 py-2 bg-gradient-to-r ${
                        hoveredLanguage === language.code ? language.hoverAccent : language.accent
                      } text-white text-sm font-medium rounded-lg transition-all duration-300 group-hover:shadow-lg`}>
                        Get Started
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              How Language Reading Assistant Works
            </h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Experience a new way to learn languages through interactive reading with AI-powered assistance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Import Your Text</h4>
              <p className="text-sm text-gray-600">
                Paste any article, story, or text you want to read and analyze in your chosen language
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Select & Analyze</h4>
              <p className="text-sm text-gray-600">
                Highlight any word or sentence to get instant AI-powered definitions, translations, and grammar insights
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Learn & Remember</h4>
              <p className="text-sm text-gray-600">
                Save personal notes, review highlighted content, and track your learning progress over time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>Powered by AI language models for accurate analysis and translation</p>
          </div>
        </div>
      </div>
    </div>
  )
}