'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface PromptManagerProps {
  isOpen: boolean
  onClose: () => void
}

interface Prompts {
  jd_key_sentences: string
  jd_keywords: string
  cv_optimization: string
}

interface PromptData {
  ai_model: string
  prompts: Prompts
  defaults: Prompts
  has_customizations: boolean
}

const AI_MODELS = [
  { value: 'deepseek', label: 'DeepSeek', description: 'Default model' },
  { value: 'openai', label: 'OpenAI', description: 'GPT-4' }
]

const PROMPT_TYPES = [
  {
    key: 'jd_key_sentences',
    label: 'JD Key Sentences',
    description: 'Extract key sentences from job descriptions',
    placeholder: '{full_job_description}'
  },
  {
    key: 'jd_keywords',
    label: 'JD Keywords',
    description: 'Extract keywords from key sentences',
    placeholder: '{key_sentences}'
  },
  {
    key: 'cv_optimization',
    label: 'CV Optimization',
    description: 'Optimize experience based on job requirements',
    placeholder: '{jd_keywords}, {experience_content}'
  }
]

export default function PromptManager({ isOpen, onClose }: PromptManagerProps) {
  const { user } = useCurrentUser()
  const [selectedModel, setSelectedModel] = useState('deepseek')
  const [activeTab, setActiveTab] = useState(0)
  const [promptData, setPromptData] = useState<PromptData | null>(null)
  const [customPrompts, setCustomPrompts] = useState<Prompts>({
    jd_key_sentences: '',
    jd_keywords: '',
    cv_optimization: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({})

  // Load prompts when model changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadPrompts()
    }
  }, [isOpen, selectedModel, user])


  const loadPrompts = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/jd2cv/prompts?user_id=${user.id}&ai_model=${selectedModel}`)
      const result = await response.json()

      if (response.ok && result.success) {
        setPromptData(result.data)
        setCustomPrompts(result.data.prompts)
      }
    } catch (error) {
      console.error('Error loading prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePrompt = async (promptType: string) => {
    if (!user || !customPrompts) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/jd2cv/prompts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          aiModel: selectedModel,
          promptType: promptType,
          promptContent: customPrompts[promptType as keyof Prompts]
        })
      })

      if (response.ok) {
        await loadPrompts() // Refresh data
      } else {
        throw new Error('Failed to save prompt')
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
      alert('Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const resetPrompt = async (promptType: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to reset this prompt to default?')) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/jd2cv/prompts?user_id=${user.id}&ai_model=${selectedModel}&prompt_type=${promptType}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadPrompts() // Refresh data
      } else {
        throw new Error('Failed to reset prompt')
      }
    } catch (error) {
      console.error('Error resetting prompt:', error)
      alert('Failed to reset prompt')
    } finally {
      setSaving(false)
    }
  }

  const handlePromptChange = (promptType: string, value: string) => {
    setCustomPrompts(prev => ({
      ...prev,
      [promptType]: value
    }))
  }

  const isPromptModified = (promptType: string) => {
    if (!promptData) return false
    return customPrompts[promptType as keyof Prompts] !== promptData.defaults[promptType as keyof Prompts]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Prompt Manager</h2>
            <p className="text-sm text-gray-600 mt-1">Customize AI prompts for different models and tasks</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Model Selection */}
        <div className="p-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">AI Model</label>
          <div className="flex gap-2">
            {AI_MODELS.map(model => (
              <button
                key={model.value}
                onClick={() => setSelectedModel(model.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedModel === model.value
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-center">
                  <div>{model.label}</div>
                  <div className="text-xs opacity-75">{model.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Type Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {PROMPT_TYPES.map((type, index) => (
              <button
                key={type.key}
                onClick={() => setActiveTab(index)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === index
                    ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-500'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div>
                  <div>{type.label}</div>
                  {isPromptModified(type.key) && (
                    <div className="text-xs text-purple-600 mt-1">Modified</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              {PROMPT_TYPES.map((type, index) => (
                <div
                  key={type.key}
                  className={`p-4 ${activeTab === index ? 'block' : 'hidden'}`}
                >
                  <div className="space-y-3">
                    {/* Description */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{type.label}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-gray-600">{type.description}</p>
                          <p className="text-xs text-purple-600">
                            Available placeholders: <code className="bg-gray-100 px-1 rounded">{type.placeholder}</code>
                          </p>
                        </div>
                      </div>
                      {isPromptModified(type.key) && (
                        <button
                          onClick={() => resetPrompt(type.key)}
                          disabled={saving}
                          className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                        >
                          Reset to Default
                        </button>
                      )}
                    </div>

                    {/* Horizontal Layout for Prompts */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Default Prompt (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Prompt (Read-only)
                        </label>
                        <textarea
                          value={promptData?.defaults[type.key as keyof Prompts] || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm resize-none h-48 overflow-y-auto"
                        />
                      </div>

                      {/* Custom Prompt (Editable) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Prompt {isPromptModified(type.key) && <span className="text-purple-600">(Modified)</span>}
                        </label>
                        <textarea
                          ref={(el) => { textareaRefs.current[type.key] = el }}
                          value={customPrompts[type.key as keyof Prompts] || ''}
                          onChange={(e) => handlePromptChange(type.key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none h-48"
                          placeholder="Enter your custom prompt here..."
                          style={{ 
                            overflow: 'auto'
                          }}
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => savePrompt(type.key)}
                        disabled={saving || !customPrompts[type.key as keyof Prompts]?.trim()}
                        className="px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z"></path>
                            </svg>
                            Save Prompt
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}