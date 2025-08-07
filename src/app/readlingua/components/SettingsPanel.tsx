'use client'

import { useState } from 'react'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import ModelSelector from './ModelSelector'

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { setShowPromptManager } = useReadLinguaStore()

  return (
    <>
      {/* Settings Button - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center group"
          style={{
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          <svg 
            className={`w-6 h-6 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Settings Panel - Expandable */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Settings Content */}
          <div className="fixed bottom-24 right-6 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 min-w-80 transform transition-all duration-200"
            style={{
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
                Settings
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* AI Model Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">AI Model</label>
              <ModelSelector />
            </div>

            {/* Prompt Manager */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Prompt Templates</label>
              <button
                onClick={() => {
                  setShowPromptManager(true)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                Manage Prompts
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}