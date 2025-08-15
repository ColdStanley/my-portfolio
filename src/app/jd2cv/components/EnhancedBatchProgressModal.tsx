import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useBatchAutoCVStore } from '@/store/useBatchAutoCVStore'

interface EnhancedBatchProgressModalProps {
  isOpen: boolean
  onClose: () => void
}

// 简化的状态展示，不需要复杂日志

const batchSteps = [
  { key: 'initializing', label: 'Initializing batch process', icon: '○' },
  { key: 'analyzing', label: 'Analyzing job descriptions', icon: '○' },
  { key: 'loading', label: 'Loading experience database', icon: '○' },
  { key: 'matching', label: 'Running similarity matching', icon: '○' },
  { key: 'optimizing', label: 'Optimizing content with AI', icon: '○' },
  { key: 'generating', label: 'Generating CV modules', icon: '○' },
  { key: 'finalizing', label: 'Finalizing batch process', icon: '○' }
]

export default function EnhancedBatchProgressModal({ isOpen, onClose }: EnhancedBatchProgressModalProps) {
  const [mounted, setMounted] = useState(false)
  // 移除复杂的日志状态
  
  const {
    isProcessing,
    totalJDs,
    currentJDIndex,
    currentJD,
    currentStep,
    progress,
    completedJDs,
    failedJDs,
    resetState
  } = useBatchAutoCVStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 移除所有复杂的日志生成逻辑

  if (!mounted) return null

  const handleClose = () => {
    if (!isProcessing) {
      resetState()
    }
    onClose()
  }

  const handleCancel = () => {
    resetState()
    onClose()
  }

  const getCurrentStepIndex = () => {
    // 直接使用 currentStep 匹配，因为 useBatchAutoCVStore 中的 currentStep 就是步骤描述
    const index = batchSteps.findIndex(step => 
      currentStep.toLowerCase().includes(step.key) || 
      step.label.toLowerCase().includes(currentStep.toLowerCase().replace(/\.\.\./g, ''))
    )
    return index === -1 ? 0 : index
  }

  const currentStepIndex = getCurrentStepIndex()

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex && isProcessing) return 'current'
    if (stepIndex === currentStepIndex && !isProcessing && progress === 100) return 'completed'
    return 'pending'
  }

  // 移除时间戳格式化

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-4xl w-full mx-4 transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15), 0 8px 30px rgba(0, 0, 0, 0.1)',
          height: 'auto',
          maxHeight: '80vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
          <h3 className="text-lg font-semibold text-gray-800">
            Batch Auto CV Progress
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 flex items-center justify-center group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="flex h-full">
          {/* Left Column - Progress Steps (40%) */}
          <div className="w-2/5 p-6 border-r border-gray-100/50">
            {/* Overall Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Progress
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Status */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {isProcessing ? (
                  <>Processing {currentJDIndex + 1} of {totalJDs} JDs</>
                ) : (
                  <>Batch Processing {progress === 100 ? 'Completed' : 'Stopped'}</>
                )}
              </h4>
              {currentJD && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <p className="text-sm font-medium text-purple-700">
                    {currentJD.title}
                  </p>
                  <p className="text-xs text-purple-600">
                    at {currentJD.company}
                  </p>
                </div>
              )}
            </div>

            {/* Progress Steps */}
            <div className="space-y-4 flex-1 overflow-y-auto">
              {batchSteps.map((step, index) => {
                const status = getStepStatus(index)
                return (
                  <div key={step.key} className="flex items-center gap-4">
                    {/* Step Indicator */}
                    <div className="flex-shrink-0 relative">
                      {status === 'completed' ? (
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg transform transition-all duration-300">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : status === 'current' ? (
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-50"></div>
                      )}
                      
                      {/* Connecting Line */}
                      {index < batchSteps.length - 1 && (
                        <div className={`absolute top-8 left-1/2 w-0.5 h-6 transform -translate-x-1/2 transition-colors duration-300 ${
                          status === 'completed' ? 'bg-purple-300' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm transition-colors duration-300 ${
                        status === 'current' ? 'text-purple-700' : 
                        status === 'completed' ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {status === 'current' && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-purple-600">Processing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Completed */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <h5 className="font-medium text-green-700 text-sm">Completed</h5>
                </div>
                <p className="text-xl font-bold text-green-600">{completedJDs.length}</p>
              </div>

              {/* Failed */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <h5 className="font-medium text-purple-700 text-sm">Failed</h5>
                </div>
                <p className="text-xl font-bold text-purple-600">{failedJDs.length}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Current Status (60%) */}
          <div className="w-3/5 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-800">Current Status</h4>
              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              )}
            </div>
            
            {/* Status Display */}
            <div className="flex-1 bg-gray-900 rounded-lg p-6 font-mono text-sm flex flex-col justify-center">
              <div className="text-center space-y-4">
                <div className="text-green-400 text-lg font-semibold">
                  {currentStep || 'Ready to process'}
                </div>
                
                {currentJD && (
                  <div className="text-yellow-400">
                    <div>Processing: {currentJD.title}</div>
                    <div className="text-gray-400 text-xs mt-1">at {currentJD.company}</div>
                  </div>
                )}
                
                <div className="text-blue-400">
                  Progress: {currentJDIndex + 1} / {totalJDs} JDs
                </div>
                
                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 text-gray-400 mt-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
                
                {!isProcessing && progress === 100 && (
                  <div className="text-green-400 font-semibold">
                    ✓ Batch processing completed
                  </div>
                )}
              </div>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="bg-purple-50/80 rounded-lg p-4 border border-purple-100 mt-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-purple-700 font-medium">
                    Processing in progress... Please do not close this window.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-6 border-t border-gray-100/50">
          <div className="flex justify-center gap-3 pt-4">
            {isProcessing ? (
              <button
                onClick={handleCancel}
                className="w-32 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="w-32 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}