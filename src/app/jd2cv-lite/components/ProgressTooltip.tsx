'use client'

import { useState, useEffect } from 'react'

interface ProgressTooltipProps {
  show: boolean
  currentStep: string
  stepNumber?: number
  totalSteps?: number
}

interface ProgressStep {
  step: string
  description: string
  icon: string
}

// SVG Icon Components
const ValidatingIcon = () => (
  <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AIGeneratingIcon = () => (
  <svg className="w-8 h-8 text-purple-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const MergingIcon = () => (
  <svg className="w-8 h-8 text-purple-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const PDFGeneratingIcon = () => (
  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    <animateTransform
      attributeName="transform"
      type="translate"
      values="0,0; 0,-2; 0,0"
      dur="1.5s"
      repeatCount="indefinite"
    />
  </svg>
)

const CompletedIcon = () => (
  <svg className="w-8 h-8 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const progressMessages: ProgressStep[] = [
  {
    step: 'validating',
    description: 'Validating your information...',
    icon: 'validating'
  },
  {
    step: 'ai-generating',
    description: 'AI is crafting your experience...',
    icon: 'ai-generating'
  },
  {
    step: 'merging',
    description: 'Merging your data...',
    icon: 'merging'
  },
  {
    step: 'pdf-generating',
    description: 'Generating your PDF resume...',
    icon: 'pdf-generating'
  },
  {
    step: 'completed',
    description: 'Resume ready for download!',
    icon: 'completed'
  }
]

export default function ProgressTooltip({ show, currentStep, stepNumber = 1, totalSteps = 4 }: ProgressTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<ProgressStep | null>(null)
  const [messageKey, setMessageKey] = useState(0)

  // Update visibility with smooth transition
  useEffect(() => {
    if (show) {
      setIsVisible(true)
    } else {
      // Delay hiding to allow completion message to show
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [show])

  // Update current message based on step
  useEffect(() => {
    const stepMessage = progressMessages.find(msg => msg.step === currentStep)
    if (stepMessage) {
      setCurrentMessage(stepMessage)
      setMessageKey(prev => prev + 1) // Force re-render for animation
    }
  }, [currentStep])

  // Auto-hide completed step after delay
  useEffect(() => {
    if (currentStep === 'completed' && show) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, show])

  if (!show && !isVisible) return null

  return (
    <div 
      className={`fixed inset-0 bg-black/30 flex items-center justify-center z-50 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-10 max-w-lg mx-4 transform transition-all duration-500 ease-out ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Progress Content */}
        <div className="text-center">
          <div 
            key={messageKey}
            className="text-gray-800 leading-relaxed min-h-[120px] flex flex-col items-center justify-center space-y-4 text-base font-medium animate-fade-in"
            style={{
              animation: 'fadeInSlide 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
          >
            {/* Icon */}
            {currentMessage && (
              <div className="mb-2">
                {currentMessage.icon === 'validating' && <ValidatingIcon />}
                {currentMessage.icon === 'ai-generating' && <AIGeneratingIcon />}
                {currentMessage.icon === 'merging' && <MergingIcon />}
                {currentMessage.icon === 'pdf-generating' && <PDFGeneratingIcon />}
                {currentMessage.icon === 'completed' && <CompletedIcon />}
              </div>
            )}
            
            {/* Message */}
            <div className="text-lg">
              {currentMessage?.description || 'Processing...'}
            </div>
            
            {/* Step indicator */}
            {currentStep !== 'completed' && (
              <div className="text-sm text-gray-500">
                Step {stepNumber} of {totalSteps}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {currentStep !== 'completed' && (
          <div className="mt-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center mt-8 space-x-3">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-700 ease-out ${
                index < stepNumber
                  ? 'bg-purple-500 scale-125' 
                  : index === stepNumber - 1
                  ? 'bg-purple-400 scale-110 animate-pulse'
                  : 'bg-gray-300 scale-100'
              }`}
            />
          ))}
        </div>

        {/* Processing indicator - Only show for non-completed steps */}
        {currentStep !== 'completed' && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInSlide {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeInSlide 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  )
}