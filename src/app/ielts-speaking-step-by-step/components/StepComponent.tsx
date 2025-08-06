'use client'

import { useState, useEffect } from 'react'
import { useIELTSStepStore, PartType } from '../store/useIELTSStepStore'

interface StepComponentProps {
  part: PartType
  step: number
  onStepComplete: () => void
}

export default function StepComponent({ part, step, onStepComplete }: StepComponentProps) {
  const { 
    getStepResult, 
    setStepResult, 
    generateAIResponse, 
    goToNextStep,
    progress,
    isLoading: storeLoading
  } = useIELTSStepStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [userInput, setUserInput] = useState('')

  // 预设的 prompt 模板
  const defaultPrompts = {
    1: { // 出题
      part1: "Generate an IELTS Speaking Part 1 question about personal life, hobbies, or daily activities. Make it natural and conversational.",
      part2: "Generate an IELTS Speaking Part 2 topic card. Include: main topic, 3-4 bullet points to cover, and 'You should say' structure.",
      part3: "Generate an IELTS Speaking Part 3 question that requires analytical thinking and discussion about societal or abstract topics."
    },
    2: { // 分析
      part1: "Analyze this IELTS Part 1 question. Explain what the examiner is testing, key grammar points, and what makes a good answer.",
      part2: "Analyze this IELTS Part 2 topic card. Break down each bullet point, suggest time management, and explain assessment criteria.",
      part3: "Analyze this IELTS Part 3 question. Explain what critical thinking skills are needed and how to structure a high-band answer."
    },
    3: { // 引导
      part1: "Help the student brainstorm ideas for this question. Ask guiding questions to help them think of personal examples and experiences.",
      part2: "Guide the student through content planning. Help them think of specific details, examples, and experiences for each bullet point.",
      part3: "Help the student explore different perspectives on this topic. Suggest angles, viewpoints, and examples they can discuss."
    },
    4: { // 建议
      part1: "Provide specific speaking tips and framework for this question. Include useful vocabulary, grammar structures, and organization tips.",
      part2: "Give a detailed speaking strategy for this topic. Include time management, structure template, and high-level vocabulary suggestions.",
      part3: "Provide advanced speaking techniques for this question. Include argument development, sophisticated vocabulary, and discourse markers."
    }
  }

  // 初始化 prompt
  useEffect(() => {
    if (!prompt) {
      setPrompt(defaultPrompts[step]?.[part] || '')
    }
  }, [step, part, prompt])

  // 获取当前步骤的结果
  const stepResult = getStepResult(part, step)

  // 处理 AI 调用
  const handleAICall = async () => {
    setIsLoading(true)
    try {
      const response = await generateAIResponse(part, step, userInput.trim() || undefined)
      
      // 保存结果
      await setStepResult(part, step, {
        content: response,
        timestamp: new Date(),
        prompt: prompt
      })

      // 更新进度但不自动跳转
      goToNextStep(part)
      
    } catch (error) {
      console.error('AI call failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = () => {
    const titles = {
      1: 'Generate',
      2: 'Analyze', 
      3: 'Guide',
      4: 'Suggest'
    }
    return titles[step] || `Step ${step}`
  }

  const getButtonText = () => {
    const buttonTexts = {
      1: 'Generate Question',
      2: 'Analyze Question',
      3: 'Get Guidance', 
      4: 'Get Suggestions'
    }
    return buttonTexts[step] || 'Process'
  }

  return (
    <div className="flex gap-4 h-full">
      
      {/* Left Panel - Controls */}
      <div className="w-1/3 bg-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {getStepTitle()}
          </h3>
          <button
            onClick={() => setShowPromptEditor(!showPromptEditor)}
            className="w-7 h-7 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full flex items-center justify-center"
            title="Edit Prompt"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          </button>
        </div>

        {/* Prompt Editor */}
        {showPromptEditor && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Prompt:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              rows={3}
              placeholder="Enter custom prompt..."
            />
          </div>
        )}

        {/* User Input (for some steps) */}
        {(step === 3 || step === 4) && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Input (Optional):
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              rows={2}
              placeholder="Enter your thoughts or additional information..."
            />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAICall}
          disabled={isLoading || !prompt.trim()}
          className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              {getButtonText()}
            </>
          )}
        </button>
      </div>

      {/* Right Panel - Content Display */}
      <div className="flex-1 flex flex-col">

        {/* AI Response Display */}
        {stepResult ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-medium text-gray-900">Response</h4>
              <span className="text-xs text-gray-500">
                {stepResult.timestamp.toLocaleString()}
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
                {stepResult.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-8 h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm">Click the button to generate AI response</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}