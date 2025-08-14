'use client'

import { useState, useEffect } from 'react'
import { useIELTSStepStore } from '../store/useIELTSStepStore'
import StepComponent from './StepComponent'

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
    { id: 4, name: 'Suggest', description: 'Get Framework' },
    { id: 5, name: 'Practice', description: 'Voice Practice' },
    { id: 6, name: 'Evaluate', description: 'Analyze Speech' },
    { id: 7, name: 'Optimize', description: 'Optimize Speech' }
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
    <div className="h-full flex flex-col">
      
      {/* Top Steps Navigation - Fixed Position */}
      <div className="fixed top-16 left-0 right-0 md:left-64 z-10 bg-white/95 backdrop-blur-md pl-6 pr-4 py-4">
        <div className="flex items-center gap-2 overflow-x-auto mb-3 justify-start">
            {steps.map((step) => {
              const isAvailable = isStepAvailable(step.id)
              const isCompleted = isStepCompleted(step.id)
              const isCurrent = selectedStep === step.id
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isAvailable}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ease-out ${
                    isCurrent
                      ? 'bg-purple-500 text-white hover:-translate-y-0.5'
                      : isCompleted
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:-translate-y-0.5'
                      : isAvailable
                      ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:-translate-y-0.5'
                      : 'text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                    {step.name}
                  </div>
                </button>
              )
            })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden pt-20">
        <StepComponent
          part={activePart}
          step={selectedStep}
          onStepComplete={() => {
            // No automatic step advancement - user manually clicks steps
          }}
        />
      </div>
    </div>
  )
}