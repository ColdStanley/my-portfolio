'use client'

import { useState, useEffect } from 'react'
import { Language, getUITexts } from '../config/uiText'
import { getPromptConfig, updatePromptConfig } from '../../../utils/modelConfig'

interface PromptManagementProps {
  isVisible: boolean
  language: Language
  onClose: () => void
}

type AnalysisMode = 'simple' | 'deep' | 'grammar'

const MODE_LABELS = {
  simple: 'Simple Analysis',
  deep: 'Deep Analysis', 
  grammar: 'Grammar Analysis'
}

const LANGUAGE_LABELS = {
  english: 'English',
  french: 'Français',
  spanish: 'Español',
  german: 'Deutsch',
  chinese: '中文'
}

export default function PromptManagement({ isVisible, language, onClose }: PromptManagementProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language)
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('simple')
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [editedPrompt, setEditedPrompt] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const uiTexts = getUITexts(language)

  // Load current prompt when language or mode changes
  useEffect(() => {
    if (isVisible) {
      const prompt = getPromptConfig(selectedLanguage, selectedMode)
      setCurrentPrompt(prompt)
      setEditedPrompt(prompt)
      setIsEditing(false)
    }
  }, [selectedLanguage, selectedMode, isVisible])

  const handleSave = async () => {
    if (!editedPrompt.trim()) return
    
    setIsSaving(true)
    try {
      await updatePromptConfig(selectedLanguage, selectedMode, editedPrompt)
      setCurrentPrompt(editedPrompt)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save prompt:', error)
      alert('Failed to save prompt. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedPrompt(currentPrompt)
    setIsEditing(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Prompt Management</h2>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white p-1.5 rounded-full hover:bg-purple-600/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Language and Mode Selection */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Mode
              </label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value as AnalysisMode)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.entries(MODE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Prompt Display/Edit */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Current Prompt for {LANGUAGE_LABELS[selectedLanguage]} - {MODE_LABELS[selectedMode]}
              </label>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editedPrompt.trim()}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                  {currentPrompt}
                </pre>
              </div>
            ) : (
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full h-[400px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm leading-relaxed resize-none"
                placeholder="Enter your prompt here..."
              />
            )}
          </div>

          {/* Usage Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Usage Instructions</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Select the language and analysis mode you want to customize</li>
              <li>• Click "Edit" to modify the prompt template</li>
              <li>• The prompt will be used for all AI analysis in the selected mode</li>
              <li>• Changes take effect immediately after saving</li>
              <li>• Use placeholders like [SELECTED_TEXT] and [CONTEXT] in your prompts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}