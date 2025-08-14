'use client'

import { useState, useEffect } from 'react'
import { useIELTSStepStore, PartType, PromptTemplates } from '../store/useIELTSStepStore'
import VoiceRecorder from './VoiceRecorder'
import MarkdownContent from './MarkdownContent'
import Part1Step1Component from './Part1Step1Component'
import FloatingPromptManager from './FloatingPromptManager'

interface StepComponentProps {
  part: PartType
  step: number
  onStepComplete: () => void
}

export default function StepComponent({ part, step, onStepComplete }: StepComponentProps) {
  // Use specialized component for Part1 Step1
  if (part === 'part1' && step === 1) {
    return <Part1Step1Component onStepComplete={onStepComplete} />
  }
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
  const [activeTab, setActiveTab] = useState('6') // For Step 7 Band level tabs

  
  // Get system context for Step 2, 3, 4, 5, 6, and 7
  const getSystemContext = () => {
    if (step === 2 || step === 3) {
      const step1Result = getStepResult(part, 1)
      if (step1Result?.content) {
        return `Question: ${step1Result.content}`
      }
    } else if (step === 4) {
      const step1Result = getStepResult(part, 1)
      if (step1Result?.content) {
        return `Question: ${step1Result.content}`
      }
      return null
    } else if (step === 5) {
      const step1Result = getStepResult(part, 1)
      // Check for any Step 4 band result (prefer the most recent one)
      const step4_band6 = getStepResult(part, '4_band6' as any)
      const step4_band7 = getStepResult(part, '4_band7' as any)
      const step4_band8 = getStepResult(part, '4_band8' as any)
      const step4Result = step4_band8 || step4_band7 || step4_band6 || getStepResult(part, 4)
      
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


  // 处理 AI 调用
  const handleAICall = async (bandLevel?: string) => {
    setIsLoading(true)
    try {
      let effectivePrompt = ''
      let effectiveStep = step
      
      // Step 7 使用特定的 Band 级别 prompt 和 step
      if (step === 7 && bandLevel) {
        const stepKey = `step7_band${bandLevel}`
        effectivePrompt = getPromptForStep(part, stepKey)
        effectiveStep = `7_band${bandLevel}` as any // 使用不同的step标识
      }
      
      // Step 4 使用特定的 Band 级别 prompt 和 step
      else if (step === 4 && bandLevel) {
        const stepKey = `step4_band${bandLevel}`
        effectivePrompt = getPromptForStep(part, stepKey)
        effectiveStep = `4_band${bandLevel}` as any // 使用不同的step标识
      }
      
      // 其他步骤使用常规 prompt
      else {
        effectivePrompt = getPromptForStep(part, step)
      }
      
      // 构建完整的 prompt (系统上下文 + 用户自定义 prompt)
      let fullPrompt = effectivePrompt
      if (systemContext) {
        fullPrompt = `${systemContext}\n\n${effectivePrompt}`
      }
      
      const response = await generateAIResponse(part, step, undefined, fullPrompt)
      
      // 保存结果，Step 7 和 Step 4 包含 band 级别信息
      const resultData = {
        content: response,
        timestamp: new Date(),
        prompt: fullPrompt, // 保存完整的 prompt (包含系统上下文)
        ...((step === 7 || step === 4) && bandLevel && { band_level: bandLevel })
      }
      
      await setStepResult(part, effectiveStep, resultData)

      // Step 7 和 Step 4: 自动切换到对应的Tab
      if ((step === 7 || step === 4) && bandLevel) {
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
        <div className="w-1/3 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg shadow-purple-500/10 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {getStepTitle()}
            </h3>
            <p className="text-sm text-gray-600">Record your speaking practice</p>
          </div>
          
          <VoiceRecorder 
            onTranscript={handleVoiceTranscript}
            disabled={isLoading}
          />
        </div>

        {/* Right Panel - Reference Content with Band Tabs */}
        <div className="flex-1 flex flex-col">
          {(() => {
            const step1Result = getStepResult(part, 1)
            const step4_band6 = getStepResult(part, '4_band6' as any)
            const step4_band7 = getStepResult(part, '4_band7' as any)
            const step4_band8 = getStepResult(part, '4_band8' as any)
            
            // Check if we have any Step 4 band results to show tabs
            const hasBandResults = step4_band6 || step4_band7 || step4_band8
            
            if (!step1Result) {
              return (
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-8 h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Complete Step 1 to see reference content</p>
                  </div>
                </div>
              )
            }
            
            if (!hasBandResults) {
              // Fallback to original single reference display if no band results
              return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full overflow-y-auto">
                  <div className="mb-3">
                    <h4 className="text-base font-medium text-gray-900 mb-3">Reference</h4>
                  </div>
                  <MarkdownContent 
                    content={`Question: ${step1Result.content}`}
                    className="text-gray-800 leading-relaxed text-sm"
                  />
                </div>
              )
            }
            
            // Show tab-based reference with different band levels
            return (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
                <div className="border-b border-gray-200 p-4">
                  <h4 className="text-base font-medium text-gray-900">Framework Reference</h4>
                </div>
                
                {/* Tab Headers */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    {['6', '7', '8'].map((band) => {
                      const bandResult = getStepResult(part, `4_band${band}` as any)
                      const hasResult = !!bandResult
                      const isActive = activeTab === band
                      
                      return (
                        <button
                          key={band}
                          onClick={() => setActiveTab(band)}
                          disabled={!hasResult}
                          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            isActive
                              ? 'border-purple-500 text-purple-600 bg-white'
                              : hasResult 
                                ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                : 'border-transparent text-gray-400'
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
                    const currentBandResult = getStepResult(part, `4_band${activeTab}` as any)
                    
                    return currentBandResult ? (
                      <MarkdownContent 
                        content={`Question: ${step1Result.content}\n\n挖空框架：\n${currentBandResult.content}`}
                        className="text-gray-800 leading-relaxed text-sm"
                      />
                    ) : (
                      <div className="text-center text-gray-500 py-12">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                        </svg>
                        <h5 className="text-lg font-medium text-gray-900 mb-2">No Band {activeTab} Framework</h5>
                        <p className="text-sm">Generate Band {activeTab} framework in Step 4 to see reference</p>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    )
  }

  // 常规步骤布局 (Step 1-4, 6)
  return (
    <div className="flex gap-4 h-full">
      
      {/* Left Panel - Controls */}
      <div className="w-1/3 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg shadow-purple-500/10 p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {getStepTitle()}
          </h3>
        </div>

        {/* System Context */}
        {systemContext && (step === 2 || step === 3 || step === 4 || step === 6 || step === 7) && (
          <div className="mb-4">
            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
              {systemContext}
            </div>
          </div>
        )}



        {/* Action Buttons */}
        {(step === 7 || step === 4) ? (
          /* Step 7 and Step 4 - Three Band Level Buttons */
          <div className="space-y-2">
            {['6', '7', '8'].map((band) => {
              const bandResult = getStepResult(part, `${step}_band${band}` as any)
              const hasResult = !!bandResult
              const buttonText = step === 7 
                ? (hasResult ? `Regenerate Band ${band}` : `Optimize to Band ${band}`)
                : (hasResult ? `Regenerate Band ${band}` : `Framework Band ${band}`)
              
              return (
                <button
                  key={band}
                  onClick={() => handleAICall(band)}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed ${
                    hasResult 
                      ? 'bg-purple-600 text-white hover:-translate-y-0.5' 
                      : 'bg-purple-500 text-white hover:-translate-y-0.5'
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
                      {buttonText}
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
            disabled={isLoading}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-medium whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-300 ease-out hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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

        {(step === 7 || step === 4) ? (
          /* Step 7 and Step 4 - Tab-based Band level results */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
            <div className="border-b border-gray-200 p-4">
              <h4 className="text-base font-medium text-gray-900">
                {step === 7 ? 'Optimization Results' : 'Framework Results'}
              </h4>
            </div>
            
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
              <div className="flex">
                {['6', '7', '8'].map((band) => {
                  const bandResult = getStepResult(part, `${step}_band${band}` as any)
                  const hasResult = !!bandResult
                  const isActive = activeTab === band
                  
                  return (
                    <button
                      key={band}
                      onClick={() => setActiveTab(band)}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        isActive
                          ? 'border-purple-500 text-purple-600 bg-white'
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
                const currentBandResult = getStepResult(part, `${step}_band${activeTab}` as any)
                
                return currentBandResult ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">
                        Band {activeTab} {step === 7 ? 'Optimization' : 'Framework'}
                      </h5>
                      <span className="text-xs text-gray-500">
                        {new Date(currentBandResult.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <MarkdownContent 
                      content={currentBandResult.content}
                      className="text-gray-800 leading-relaxed text-sm"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                    </svg>
                    <h5 className="text-lg font-medium text-gray-900 mb-2">No Band {activeTab} Result Yet</h5>
                    <p className="text-sm">
                      Click "{step === 7 ? 'Optimize to' : 'Framework'} Band {activeTab}" to generate {step === 7 ? 'optimization' : 'framework'} result
                    </p>
                  </div>
                )
              })()}
            </div>
          </div>
        ) : (
          /* Regular Steps - Single Result Display */
          stepResult ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg shadow-purple-500/10 p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Response</h4>
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
            <div className="bg-white/60 backdrop-blur-sm rounded-lg shadow-lg shadow-purple-500/5 p-8 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-sm font-medium">Ready to generate</p>
                <p className="text-xs text-gray-400 mt-1">Click the button to create AI response</p>
              </div>
            </div>
          )
        )}

      </div>
      
      {/* Floating Prompt Manager */}
      <FloatingPromptManager part={part} step={step} />
    </div>
  )
}