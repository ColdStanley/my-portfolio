'use client'

import { useState } from 'react'
import { useReadLinguaStore, PromptTemplates } from '../store/useReadLinguaStore'

const PROMPT_LABELS = {
  quick: 'Quick Explanation',
  standard: 'Standard Analysis', 
  deep: 'Deep Analysis',
  ask_ai: 'Ask AI'
}

const PLACEHOLDER_INFO = {
  '{text}': 'Selected text from article',
  '{nativeLang}': 'User\'s native language',
  '{sourceLang}': 'Article\'s source language', 
  '{question}': 'User\'s custom question (Ask AI only)'
}

export default function PromptManager() {
  const { 
    getCurrentPromptTemplates,
    setPromptTemplate, 
    resetPromptTemplates,
    showPromptManager, 
    setShowPromptManager,
    selectedArticle
  } = useReadLinguaStore()
  
  const promptTemplates = getCurrentPromptTemplates()
  
  const [editingTemplate, setEditingTemplate] = useState<keyof PromptTemplates | null>(null)
  const [tempValue, setTempValue] = useState('')

  const handleEdit = (type: keyof PromptTemplates) => {
    setEditingTemplate(type)
    setTempValue(promptTemplates[type])
  }

  const handleSave = () => {
    if (editingTemplate) {
      setPromptTemplate(editingTemplate, tempValue)
      setEditingTemplate(null)
    }
  }

  const handleCancel = () => {
    setEditingTemplate(null)
    setTempValue('')
  }

  if (!showPromptManager) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-purple-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Prompt Manager</h2>
            <button
              onClick={() => setShowPromptManager(false)}
              className="w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Customize AI prompts for each query type. Changes apply to current language pair ({selectedArticle ? `${selectedArticle.source_language}-${selectedArticle.native_language}` : 'english-chinese'}) only.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {(Object.keys(promptTemplates) as (keyof PromptTemplates)[]).map((type) => (
              <div key={type} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    {PROMPT_LABELS[type]}
                  </h3>
                  {editingTemplate !== type && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="w-16 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium whitespace-nowrap flex items-center gap-1 text-sm"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Reset this prompt to default? This action cannot be undone.'))
                            resetPromptTemplates()
                        }}
                        className="w-16 px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium whitespace-nowrap flex items-center gap-1 text-sm"
                        title="Reset to default"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                        </svg>
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                {editingTemplate === type ? (
                  <div className="space-y-3">
                    <textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm font-mono"
                      placeholder="Enter your custom prompt..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="w-20 px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium whitespace-nowrap flex items-center gap-1 text-sm"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-20 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium whitespace-nowrap flex items-center gap-1 text-sm"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded border border-gray-200 p-3">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {promptTemplates[type]}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer - Placeholder Info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Available Placeholders:</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {Object.entries(PLACEHOLDER_INFO).map(([placeholder, description]) => (
              <div key={placeholder} className="flex items-center gap-2">
                <code className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-mono">
                  {placeholder}
                </code>
                <span className="text-gray-600">{description}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: Placeholders are automatically replaced when generating prompts. Do not modify them.
          </p>
        </div>
      </div>
    </div>
  )
}