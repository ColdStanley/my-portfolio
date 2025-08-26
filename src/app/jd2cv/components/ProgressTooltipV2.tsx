'use client'

interface ProgressTooltipV2Props {
  show: boolean
  currentStep: string
  stepNumber: number
  totalSteps: number
}

const stepMessages = {
  validating: 'Validating input data...',
  'ai-generating': 'AI generating tailored experience...',
  merging: 'Merging personal info with AI content...',
  'pdf-generating': 'Generating PDF document...',
  completed: 'CV generated successfully!'
}

export default function ProgressTooltipV2({ 
  show, 
  currentStep, 
  stepNumber, 
  totalSteps 
}: ProgressTooltipV2Props) {
  if (!show) return null

  const progress = (stepNumber / totalSteps) * 100
  const isCompleted = currentStep === 'completed'

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
      <div className={`
        bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-6 min-w-[320px] max-w-sm
        transition-all duration-300 ease-out
        ${show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}
      `}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
            ${isCompleted ? 'bg-green-100' : 'bg-purple-100'}
          `}>
            {isCompleted ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className={`
                w-5 h-5 rounded-full border-2 border-t-transparent animate-spin
                ${currentStep === 'ai-generating' ? 'border-yellow-500' : 'border-purple-500'}
              `}></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {isCompleted ? 'Complete!' : 'Generating Resume...'}
            </h3>
            <p className="text-sm text-gray-600">
              Step {stepNumber} of {totalSteps}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ease-out ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-400 to-green-600' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step Message */}
        <div className="text-sm text-gray-700 flex items-center gap-2">
          <span className={`
            w-2 h-2 rounded-full animate-pulse
            ${isCompleted ? 'bg-green-500' : 'bg-purple-500'}
          `}></span>
          {stepMessages[currentStep] || 'Processing...'}
        </div>

        {/* Special message for AI generation step */}
        {currentStep === 'ai-generating' && (
          <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 rounded-lg p-2">
            💡 AI is analyzing the job requirements and creating personalized experience content
          </div>
        )}

        {/* Success message */}
        {isCompleted && (
          <div className="mt-3 text-sm text-green-700 bg-green-50 rounded-lg p-3 border border-green-200">
            🎉 Your tailored resume has been generated and downloaded successfully!
          </div>
        )}
      </div>
    </div>
  )
}