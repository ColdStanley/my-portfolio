'use client'

import { useState, useEffect } from 'react'

interface TaskCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (qualityRating: number, nextStep: string, isPlanCritical: boolean) => void
  taskTitle: string
}

export default function TaskCompletionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  taskTitle 
}: TaskCompletionModalProps) {
  const [qualityRating, setQualityRating] = useState<number>(5)
  const [nextStep, setNextStep] = useState<string>('')
  const [isPlanCritical, setIsPlanCritical] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // 处理动画状态
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!qualityRating || qualityRating < 1 || qualityRating > 5) {
      alert('Please provide a rating between 1 and 5')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(qualityRating, nextStep, isPlanCritical)
      // Reset form
      setQualityRating(5)
      setNextStep('')
      setIsPlanCritical(false)
      onClose()
    } catch (error) {
      console.error('Failed to submit task completion:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setQualityRating(5)
      setNextStep('')
      setIsPlanCritical(false)
      onClose()
    }
  }

  if (!isVisible && !isOpen) return null

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out ${
      isOpen 
        ? 'bg-white/20 backdrop-blur-sm' 
        : 'bg-transparent backdrop-blur-none'
    }`}>
      <div 
        className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20 transition-all duration-300 ease-out transform ${
          isOpen 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.98) 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Task Completion Feedback
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Task Title */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 via-purple-25 to-purple-50 rounded-xl border border-purple-100">
            <p className="text-sm text-purple-600 font-medium mb-1">Task:</p>
            <p className="text-gray-900 font-semibold">{taskTitle}</p>
          </div>

          {/* Question 1: Quality Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> How well did you complete this task? 
              Rate on a scale of 1 to 5 (5 = fully completed)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="5"
                value={qualityRating}
                onChange={(e) => setQualityRating(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-500">/ 5</span>
            </div>
            {/* Visual Rating Display */}
            <div className="flex items-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setQualityRating(star)}
                  disabled={isSubmitting}
                  className={`text-2xl transition-all duration-200 transform hover:scale-110 ${
                    star <= qualityRating 
                      ? 'text-yellow-400 drop-shadow-sm' 
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                >
                  ⭐
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                ({qualityRating}/5)
              </span>
            </div>
          </div>

          {/* Question 2: Next Step */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What's your next step? Describe what you'll do next or how you'll follow up.
            </label>
            <textarea
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              rows={4}
              placeholder="Enter your next step or follow-up plan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Question 3: Plan Critical */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Is this task critical for achieving your Plan?
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Critical tasks have significant impact on your overall plan success
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isPlanCritical"
                  checked={isPlanCritical === true}
                  onChange={() => setIsPlanCritical(true)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="isPlanCritical"
                  checked={isPlanCritical === false}
                  onChange={() => setIsPlanCritical(false)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 hover:shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !qualityRating}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit & Complete Task'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}