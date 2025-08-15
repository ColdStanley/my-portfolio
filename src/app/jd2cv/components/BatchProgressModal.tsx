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
    progress,
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

  const handleCancel = () => {
    resetState()
    onClose()
  }

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-lg w-full mx-4 transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.15), 0 8px 30px rgba(0, 0, 0, 0.1)'
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

        {/* Progress Content */}
        <div className="p-6">
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
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              {isProcessing ? (
                <>Processing {currentJDIndex + 1} of {totalJDs} JDs</>
              ) : (
                <>Batch Processing {progress === 100 ? 'Completed' : 'Stopped'}</>
              )}
            </h4>
            <p className="text-sm text-gray-600 mb-2">{currentStep}</p>
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

          {/* Results Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Completed */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <h5 className="font-medium text-green-700">Completed</h5>
              </div>
              <p className="text-2xl font-bold text-green-600">{completedJDs.length}</p>
            </div>

            {/* Failed */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <h5 className="font-medium text-purple-700">Failed</h5>
              </div>
              <p className="text-2xl font-bold text-purple-600">{failedJDs.length}</p>
            </div>
          </div>

          {/* Failed JDs Details */}
          {failedJDs.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
              <h6 className="font-medium text-gray-700 mb-2">Failed JDs:</h6>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {failedJDs.map((failed, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium text-gray-800">
                      {failed.title} at {failed.company}
                    </p>
                    <p className="text-gray-600 text-xs">
                      Error: {failed.error}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-purple-50/80 rounded-lg p-4 border border-purple-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <p className="text-sm text-purple-700 font-medium">
                  Processing in progress... Please do not close this window.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-6">
          <div className="flex justify-center gap-3">
            {isProcessing ? (
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel Process
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
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