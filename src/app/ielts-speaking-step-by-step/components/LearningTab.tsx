'use client'

import { useState, useEffect } from 'react'
import { useIELTSStepStore } from '../store/useIELTSStepStore'
import StepComponent from './StepComponent'
import ModelSelector from './ModelSelector'

export default function LearningTab() {
  const { 
    activePart, 
    setActivePart, 
    progress, 
    getCurrentStep,
    setActiveTab,
    loadPartProgress,
    isLoading
  } = useIELTSStepStore()
  
  const [selectedStep, setSelectedStep] = useState(1)

  const parts = [
    { id: 'part1' as const, label: 'Part 1', title: 'Personal Questions' },
    { id: 'part2' as const, label: 'Part 2', title: 'Individual Long Turn' },
    { id: 'part3' as const, label: 'Part 3', title: 'Two-way Discussion' }
  ]

  const steps = [
    { id: 1, name: 'Generate', description: 'Generate Question' },
    { id: 2, name: 'Analyze', description: 'Analyze Question' },
    { id: 3, name: 'Guide', description: 'Get Guidance' },
    { id: 4, name: 'Suggest', description: 'Get Suggestions' }
    // Expandable: { id: 5, name: 'Record', description: 'Record Answer' },
    // { id: 6, name: 'Feedback', description: 'Get Feedback' }
  ]

  // Load progress when component mounts or part changes
  useEffect(() => {
    loadPartProgress(activePart)
  }, [activePart, loadPartProgress])

  const handlePartChange = (partId: 'part1' | 'part2' | 'part3') => {
    setActivePart(partId)
    setSelectedStep(getCurrentStep(partId))
  }

  const handleStepClick = (stepId: number) => {
    // 只能选择当前可用的步骤
    const currentStep = getCurrentStep(activePart)
    if (stepId <= currentStep) {
      setSelectedStep(stepId)
    }
  }

  const isStepAvailable = (stepId: number) => {
    const currentStep = getCurrentStep(activePart)
    return stepId <= currentStep
  }

  const isStepCompleted = (stepId: number) => {
    return !!progress[activePart]?.stepResults[stepId]
  }

  const isNextStepReady = (stepId: number) => {
    // 检查这是否是刚刚变为可用的下一步
    const currentStep = getCurrentStep(activePart)
    const isCompleted = isStepCompleted(stepId - 1)
    return stepId === currentStep && isCompleted && stepId !== selectedStep
  }

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Header with Part Selection */}
      <div className="px-4 py-3 border-b border-gray-200 bg-purple-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {parts.map((part) => (
                <button
                  key={part.id}
                  onClick={() => handlePartChange(part.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activePart === part.id
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                  }`}
                >
                  {part.label}
                </button>
              ))}
            </div>
            <ModelSelector />
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-20 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            Back
          </button>
        </div>

        {/* Current Part Title */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {parts.find(p => p.id === activePart)?.title}
          </h2>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-center gap-1 overflow-x-auto">
          {steps.map((step, index) => {
            const isAvailable = isStepAvailable(step.id)
            const isCompleted = isStepCompleted(step.id)
            const isCurrent = selectedStep === step.id
            
            const isNextReady = isNextStepReady(step.id)
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isAvailable}
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full font-medium text-xs transition-all duration-300 ${
                    isCurrent
                      ? 'bg-purple-500 text-white ring-2 ring-purple-200'
                      : isCompleted
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : isNextReady
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 ring-2 ring-green-200 animate-pulse shadow-lg'
                      : isAvailable
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  ) : isNextReady ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    step.id
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-6 h-0.5 mx-0.5 ${
                    isStepCompleted(step.id) ? 'bg-purple-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
        
        {/* Step Name */}
        <div className="text-center mt-2">
          <h3 className="text-base font-medium text-gray-900">
            Step {selectedStep}: {steps.find(s => s.id === selectedStep)?.description}
          </h3>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4">
        <StepComponent
          part={activePart}
          step={selectedStep}
          onStepComplete={() => {
            // 自动进入下一步
            const nextStep = Math.min(selectedStep + 1, steps.length)
            if (nextStep <= steps.length) {
              setSelectedStep(nextStep)
            }
          }}
        />
      </div>
    </div>
  )
}