'use client'

import { useState } from 'react'
import { useIELTSStepStore, PART1_CATEGORIES, CategorySelection } from '../store/useIELTSStepStore'
import MarkdownContent from './MarkdownContent'
import FloatingPromptManager from './FloatingPromptManager'

interface Part1Step1ComponentProps {
  onStepComplete: () => void
}

export default function Part1Step1Component({ onStepComplete }: Part1Step1ComponentProps) {
  const {
    categorySelection,
    setCategorySelection,
    generateAIResponse,
    setStepResult,
    getStepResult,
    goToNextStep,
    getPromptForStep
  } = useIELTSStepStore()

  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categorySelection?.categoryId || 'topic')

  const stepResult = getStepResult('part1', 1)

  const selectedCategory = PART1_CATEGORIES.find(cat => cat.id === selectedCategoryId)
  const canGenerate = categorySelection && categorySelection.categoryId === selectedCategoryId

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    // Reset item selection when changing category
    setCategorySelection(null)
  }

  const handleItemSelect = (itemId: string) => {
    const selection: CategorySelection = {
      categoryId: selectedCategoryId,
      itemId
    }
    setCategorySelection(selection)
  }


  const handleGenerate = async () => {
    if (!categorySelection) return

    setIsLoading(true)
    try {
      // Get the placeholder for the selected item
      const selectedItem = selectedCategory?.items.find(item => item.id === categorySelection.itemId)
      if (!selectedItem) return

      // Get user-editable prompt part
      const userPrompt = getPromptForStep('part1', 1)
      
      // Combine user prompt with system placeholder part
      const finalPrompt = `${userPrompt}\n\n典型类型：${selectedItem.placeholder}`

      const response = await generateAIResponse('part1', 1, undefined, finalPrompt)

      await setStepResult('part1', 1, {
        content: response,
        timestamp: new Date(),
        prompt: finalPrompt
      })

      // Don't auto-advance to next step, stay on current step
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Left Panel - Category Selection */}
      <div className="w-1/3 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Generate</h3>
        </div>

        {/* Category Tabs */}
        <div className="mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {PART1_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedCategoryId === category.id
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Items */}
        {selectedCategory && (
          <div className="mb-8">
            <div className="h-32 flex flex-col">
              <div className="grid grid-cols-2 gap-2 flex-1 content-start">
                {selectedCategory.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      categorySelection?.itemId === item.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
              Generate Question
            </>
          )}
        </button>
      </div>

      {/* Right Panel - Result Display */}
      <div className="flex-1">
        {stepResult ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">Generated Question</h4>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {stepResult.timestamp.toLocaleString()}
              </span>
            </div>
            <MarkdownContent 
              content={stepResult.content}
              className="text-gray-800 leading-relaxed"
            />
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg p-8 h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-sm font-medium">Select category and type</p>
              <p className="text-xs text-gray-400 mt-1">Choose a category and item to generate questions</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Prompt Manager */}
      <FloatingPromptManager part="part1" step={1} />
    </div>
  )
}