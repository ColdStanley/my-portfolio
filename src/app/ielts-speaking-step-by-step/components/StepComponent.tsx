'use client'

import { useState, useEffect } from 'react'
import { useIELTSStepStore, PartType, PromptTemplates } from '../store/useIELTSStepStore'
import VoiceRecorder from './VoiceRecorder'

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
    isLoading: storeLoading,
    getPromptForStep,
    setPromptTemplate
  } = useIELTSStepStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [activeTab, setActiveTab] = useState('6') // For Step 7 Band level tabs

  // Initialize prompt from store on component mount and when part/step changes
  useEffect(() => {
    let defaultPrompt
    if (step === 7) {
      // For Step 7, default to Band 6 prompt
      defaultPrompt = getPromptForStep(part, 'step7_band6')
    } else {
      defaultPrompt = getPromptForStep(part, step)
    }
    setPrompt(defaultPrompt)
  }, [part, step, getPromptForStep])
  
  // Get system context for Step 2, 3, 4, 5, 6, and 7
  const getSystemContext = () => {
    if (step === 2 || step === 3) {
      const step1Result = getStepResult(part, 1)
      if (step1Result?.content) {
        return `Question: ${step1Result.content}`
      }
    } else if (step === 4) {
      const step1Result = getStepResult(part, 1)
      let context = ''
      if (step1Result?.content) {
        context = `Question: ${step1Result.content}`
      }
      // Add user input from Step 3 if available
      if (userInput.trim()) {
        context += `\n学生输入：${userInput.trim()}`
      }
      return context || null
    } else if (step === 5) {
      const step1Result = getStepResult(part, 1)
      const step4Result = getStepResult(part, 4)
      let context = ''
      if (step1Result?.content) {
        context = `Question: ${step1Result.content}`
      }
      if (step4Result?.content) {
        context += `\n\n挖空框架：\n${step4Result.content}`
      }
      return context || null
    } else if (step === 6) {
      const step1Result = getStepResult(part, 1)
      const step5Result = getStepResult(part, 5)
      let context = ''
      if (step1Result?.content) {
        context = `Question: ${step1Result.content}`
      }
      if (step5Result?.content) {
        context += `\n\nSpeech Transcript: ${step5Result.content}`
      }
      return context || null
    } else if (step === 7) {
      const step1Result = getStepResult(part, 1)
      const step5Result = getStepResult(part, 5)
      let context = ''
      if (step1Result?.content) {
        context = `Question: ${step1Result.content}`
      }
      if (step5Result?.content) {
        context += `\n\nSpeech Transcript: ${step5Result.content}`
      }
      return context || null
    }
    return null
  }
  
  const systemContext = getSystemContext()

  // 获取当前步骤的结果
  const stepResult = getStepResult(part, step)

  // Save prompt to store when user modifies it
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt)
    if (step === 7) {
      // For Step 7, save to Band 6 template by default
      const stepKey = 'step7_band6' as keyof PromptTemplates
      setPromptTemplate(part, stepKey, newPrompt)
    } else {
      const stepKey = `step${step}` as keyof PromptTemplates
      setPromptTemplate(part, stepKey, newPrompt)
    }
  }

  // 处理 AI 调用
  const handleAICall = async (bandLevel?: string) => {
    setIsLoading(true)
    try {
      let effectivePrompt = prompt
      let effectiveStep = step
      
      // Step 7 使用特定的 Band 级别 prompt 和 step
      if (step === 7 && bandLevel) {
        const stepKey = `step7_band${bandLevel}` as keyof PromptTemplates
        effectivePrompt = getPromptForStep(part, stepKey as any)
        effectiveStep = `7_band${bandLevel}` as any // 使用不同的step标识
      }
      
      // 构建完整的 prompt (系统上下文 + 用户自定义 prompt)
      let fullPrompt = effectivePrompt
      if (systemContext) {
        fullPrompt = `${systemContext}\n\n${effectivePrompt}`
      }
      
      const response = await generateAIResponse(part, 7, userInput.trim() || undefined, fullPrompt)
      
      // 保存结果到不同的step键
      const resultData = {
        content: response,
        timestamp: new Date(),
        prompt: fullPrompt, // 保存完整的 prompt (包含系统上下文)
        band_level: bandLevel
      }
      
      await setStepResult(part, effectiveStep, resultData)

      // Step 7: 自动切换到对应的Tab
      if (step === 7 && bandLevel) {
        setActiveTab(bandLevel)
      }

      // 更新进度但不自动跳转
      goToNextStep(part)
      
    } catch (error) {
      console.error('AI call failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 处理语音录音结果
  const handleVoiceTranscript = async (transcript: string, duration: number) => {
    try {
      await setStepResult(part, step, {
        content: transcript,
        timestamp: new Date(),
        duration,
        voice_practice: true
      })
      
      // 更新进度
      goToNextStep(part)
    } catch (error) {
      console.error('Voice practice save failed:', error)
    }
  }

  const getStepTitle = () => {
    const titles = {
      1: 'Generate',
      2: 'Analyze', 
      3: 'Guide',
      4: 'Suggest',
      5: 'Practice',
      6: 'Evaluate',
      7: 'Optimize'
    }
    return titles[step] || `Step ${step}`
  }

  const getButtonText = () => {
    const buttonTexts = {
      1: 'Generate Question',
      2: 'Analyze Question',
      3: 'Get Guidance', 
      4: 'Get Framework',
      5: 'Voice Practice',
      6: 'Analyze Speech'
    }
    return buttonTexts[step] || 'Process'
  }

  // Step 5 特殊布局 - 语音练习
  if (step === 5) {
    return (
      <div className="flex gap-4 h-full">
        {/* Left Panel - Voice Recorder */}
        <div className="w-1/3 bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getStepTitle()}
            </h3>
          </div>
          
          <VoiceRecorder 
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
          />
        </div>

        {/* Right Panel - Reference Content */}
        <div className="flex-1 flex flex-col">
          {systemContext ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full overflow-y-auto">
              <div className="mb-3">
                <h4 className="text-base font-medium text-gray-900 mb-3">Reference</h4>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
                  {systemContext}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-8 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p className="text-sm">Complete previous steps to see reference content</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 常规步骤布局 (Step 1-4, 6)
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

        {/* System Context (Step 2, 3, 4, 6, 7 默认显示，不显示标签) */}
        {systemContext && (step === 2 || step === 3 || step === 4 || step === 6 || step === 7) && (
          <div className="mb-3">
            <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
              {systemContext}
            </div>
          </div>
        )}

        {/* Prompt Editor */}
        {showPromptEditor && (
          <div className="mb-3 space-y-3">
            {/* User Editable Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Prompt:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                rows={step === 3 || step === 4 || step === 6 || step === 7 ? 12 : 6}
                placeholder="Enter custom prompt..."
              />
            </div>
          </div>
        )}

        {/* User Input (for Step 3 and 4) - Step 6 doesn't need user input */}
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

        {/* Action Buttons */}
        {step === 7 ? (
          /* Step 7 - Three Band Level Buttons */
          <div className="space-y-2">
            {['6', '7', '8'].map((band) => {
              const bandResult = getStepResult(part, `7_band${band}` as any)
              const hasResult = !!bandResult
              return (
                <button
                  key={band}
                  onClick={() => handleAICall(band)}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    hasResult 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
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
                      {hasResult ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM8.5 7.5a.5.5 0 11-1 0 .5.5 0 011 0zM12.5 7.5a.5.5 0 11-1 0 .5.5 0 011 0zM16 14a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5L8.29 9.29a1 1 0 011.42 0L16 15.5V14z" clipRule="evenodd"/>
                        </svg>
                      )}
                      {hasResult ? `Regenerate Band ${band}` : `Optimize to Band ${band}`}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          /* Regular Steps - Single Button */
          <button
            onClick={() => handleAICall()}
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
        )}
      </div>

      {/* Right Panel - Content Display */}
      <div className="flex-1 flex flex-col">

        {step === 7 ? (
          /* Step 7 - Tab-based Band level results */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
            <div className="border-b border-gray-200 p-4">
              <h4 className="text-base font-medium text-gray-900">Optimization Results</h4>
            </div>
            
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
              <div className="flex">
                {['6', '7', '8'].map((band) => {
                  const bandResult = getStepResult(part, `7_band${band}` as any)
                  const hasResult = !!bandResult
                  const isActive = activeTab === band
                  
                  return (
                    <button
                      key={band}
                      onClick={() => setActiveTab(band)}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        isActive
                          ? 'border-purple-500 text-purple-600 bg-purple-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Band {band}
                      {hasResult && (
                        <svg className="w-4 h-4 ml-1 inline text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                const currentBandResult = getStepResult(part, `7_band${activeTab}` as any)
                
                return currentBandResult ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">Band {activeTab} Optimization</h5>
                      <span className="text-xs text-gray-500">
                        {new Date(currentBandResult.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
                        {currentBandResult.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                    </svg>
                    <h5 className="text-lg font-medium text-gray-900 mb-2">No Band {activeTab} Result Yet</h5>
                    <p className="text-sm">Click "Optimize to Band {activeTab}" to generate optimization result</p>
                  </div>
                )
              })()}
            </div>
          </div>
        ) : (
          /* Regular Steps - Single Result Display */
          stepResult ? (
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
          )
        )}

      </div>
    </div>
  )
}