import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useBatchAutoCVStore } from '@/store/useBatchAutoCVStore'

interface BatchProgressModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function BatchProgressModal({ isOpen, onClose }: BatchProgressModalProps) {
  const [mounted, setMounted] = useState(false)
  
  const {
    isProcessing,
    totalJDs,
    currentJDIndex,
    currentJD,
    currentStep,
    completedJDs,
    failedJDs,
    resetState
  } = useBatchAutoCVStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleClose = () => {
    if (!isProcessing) {
      resetState()
    }
    onClose()
  }

  // Create dynamic steps based on batch processing
  const remainingCount = totalJDs - completedJDs.length - failedJDs.length - (currentJD ? 1 : 0)

  const steps = [
    ...completedJDs.map(jd => ({
      key: `completed-${jd.id}`,
      label: `${jd.title} at ${jd.company}`,
      status: 'completed' as const
    })),
    ...failedJDs.map(jd => ({
      key: `failed-${jd.id}`,
      label: `${jd.title} at ${jd.company}`,
      status: 'failed' as const
    })),
    ...(currentJD ? [{
      key: `current-${currentJD.id}`,
      label: `${currentJD.title} at ${currentJD.company}`,
      status: 'current' as const
    }] : []),
    ...Array(remainingCount).fill(null).map((_, index) => ({
      key: `pending-${index}`,
      label: 'Waiting...',
      status: 'pending' as const
    }))
  ]

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-4 transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15), 0 8px 30px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
          <h3 className="text-lg font-semibold text-gray-800">Batch Progress</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100/80 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-all duration-200 flex items-center justify-center group"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-4">
              {/* Step Indicator */}
              <div className="flex-shrink-0 relative">
                {step.status === 'completed' ? (
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg transform transition-all duration-300">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : step.status === 'failed' ? (
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : step.status === 'current' ? (
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-50"></div>
                )}
                
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-8 left-1/2 w-0.5 h-6 transform -translate-x-1/2 transition-colors duration-300 ${
                    step.status === 'completed' ? 'bg-purple-300' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium transition-colors duration-300 ${
                  step.status === 'current' ? 'text-purple-700' : 
                  step.status === 'completed' ? 'text-gray-700' : 
                  step.status === 'failed' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                {step.status === 'current' && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-purple-600">{currentStep}</span>
                  </div>
                )}
                {step.status === 'failed' && (
                  <p className="text-xs text-gray-500 mt-1">Failed to process</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="bg-purple-50/80 rounded-lg p-4 border border-purple-100">
            <p className="text-sm text-purple-700 font-medium">
              {isProcessing ? 'Please wait and do not interrupt the process' : 'Process completed'}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {isProcessing ? `Processing ${currentJDIndex + 1} of ${totalJDs} JDs` : 
               `Completed: ${completedJDs.length}, Failed: ${failedJDs.length}`}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}