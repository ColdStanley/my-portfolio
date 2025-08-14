'use client'

import { useState, useEffect } from 'react'
import { useIELTSStepStore, PartType } from '../store/useIELTSStepStore'

interface FloatingPromptManagerProps {
  part: PartType
  step: number
}

export default function FloatingPromptManager({ part, step }: FloatingPromptManagerProps) {
  const {
    selectedAiModel,
    setSelectedAiModel,
    getCurrentPromptTemplates,
    setPromptTemplate,
    getPromptForStep
  } = useIELTSStepStore()

  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')

  // Get step key for the current step
  const getStepKey = () => {
    if (step === 4) return 'step4_band6' // Default to band 6 for step 4
    if (step === 7) return 'step7_band6' // Default to band 6 for step 7
    return `step${step}` as keyof any
  }

  // Initialize prompt when component mounts or step changes
  useEffect(() => {
    const stepKey = getStepKey()
    const currentPrompt = getPromptForStep(part, stepKey)
    setPrompt(currentPrompt)
  }, [part, step, getPromptForStep])

  const handleSave = () => {
    const stepKey = getStepKey()
    setPromptTemplate(part, stepKey as any, prompt)
    setIsOpen(false)
  }

  const handleReset = () => {
    const stepKey = getStepKey()
    const templates = getCurrentPromptTemplates(part)
    setPrompt(templates[stepKey as keyof typeof templates] || '')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-10 h-10 bg-purple-500/70 hover:bg-purple-500/90 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 z-50"
        title="Prompt Manager"
      >
        <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
        </svg>
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 z-50">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            <h3 className="font-semibold text-gray-800">
              {part.toUpperCase()} Step {step}
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Model Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Model
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedAiModel('deepseek')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                selectedAiModel === 'deepseek'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              DeepSeek
            </button>
            <button
              onClick={() => setSelectedAiModel('openai')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                selectedAiModel === 'openai'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              OpenAI
            </button>
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt Template
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none transition-all"
            rows={8}
            placeholder="Enter prompt template..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="w-16 px-3 py-2 bg-purple-500 text-white rounded-lg font-medium text-sm hover:bg-purple-600 transition-all"
          >
            Save
          </button>
          <button
            onClick={handleReset}
            className="w-16 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-all"
          >
            Reset
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="w-16 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}