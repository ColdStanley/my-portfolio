'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ProgressStep {
  step: number
  stepName: string
  status: 'waiting' | 'running' | 'completed' | 'error'
  message: string
  duration?: number
  startTime?: number
}

interface LangChainProgressModalProps {
  isOpen: boolean
  requestId: string
  onClose: () => void
  onComplete?: (result: any) => void
  onError?: (error: string) => void
}

export default function LangChainProgressModal({
  isOpen,
  requestId,
  onClose,
  onComplete,
  onError
}: LangChainProgressModalProps) {
  const [mounted, setMounted] = useState(false)
  const [steps, setSteps] = useState<ProgressStep[]>([
    { step: 1, stepName: 'Role Classification', status: 'waiting', message: 'Analyzing job description...' },
    { step: 2, stepName: 'Content Customization', status: 'waiting', message: 'Customizing resume content...' },
    { step: 3, stepName: 'Quality Review', status: 'waiting', message: 'Reviewing and finalizing...' }
  ])
  const [currentMessage, setCurrentMessage] = useState('Initializing LangChain AI workflow...')
  const [totalDuration, setTotalDuration] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [totalTokens, setTotalTokens] = useState({ prompt: 0, completion: 0, total: 0 })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen || !requestId) return

    const eventSource = new EventSource(`/api/jd2cv-full/progress/${requestId}`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('SSE Progress:', data)

        if (data.type === 'connected') {
          console.log('SSE connection established')
          return
        }

        if (data.type === 'step_start') {
          setCurrentMessage(data.message)
          setSteps(prev => prev.map(step => {
            if (step.step === data.step) {
              return { ...step, status: 'running', message: data.message, startTime: Date.now() }
            }
            return step
          }))
        }

        if (data.type === 'step_complete') {
          setSteps(prev => prev.map(step => {
            if (step.step === data.step) {
              return { ...step, status: 'completed', message: data.message, duration: data.duration }
            }
            return step
          }))

          // Accumulate tokens if present in step data
          if (data.data?.tokens) {
            setTotalTokens(prev => ({
              prompt: prev.prompt + data.data.tokens.prompt,
              completion: prev.completion + data.data.tokens.completion,
              total: prev.total + data.data.tokens.total
            }))
          }
        }

        if (data.type === 'completed') {
          setCurrentMessage(data.message)
          setTotalDuration(data.duration)
          setIsCompleted(true)

          // Set final total tokens if provided
          if (data.data?.totalTokens) {
            setTotalTokens(data.data.totalTokens)
          }

          // Auto-close after 2 seconds
          setTimeout(() => {
            onComplete?.(data)
            onClose()
          }, 2000)
        }

        if (data.type === 'error') {
          setCurrentMessage(`Error: ${data.message}`)
          setHasError(true)
          onError?.(data.message)
        }

      } catch (error) {
        console.error('Failed to parse SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      setHasError(true)
      setCurrentMessage('Connection error occurred')
    }

    return () => {
      eventSource.close()
    }
  }, [isOpen, requestId, onClose, onComplete, onError])

  const formatDuration = (ms: number) => {
    return `${Math.round(ms / 1000)}s`
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'running':
        return '🔄'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/20">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            🎯 LangChain AI Processing
          </h2>
          {isCompleted || hasError ? (
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          ) : null}
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step) => (
            <div key={step.step} className="flex items-center space-x-3">
              <span className="text-2xl">{getStepIcon(step.status)}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">
                    Step {step.step}: {step.stepName}
                  </h3>
                  {step.duration && (
                    <span className="text-sm text-gray-500">
                      {formatDuration(step.duration)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Current Status */}
        <div className="bg-purple-50/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 font-medium">Current Status:</p>
          <p className="text-sm text-gray-600">{currentMessage}</p>
        </div>

        {/* Total Duration (when completed) */}
        {isCompleted && totalDuration > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm font-medium text-green-800">
                Completed in {formatDuration(totalDuration)}
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">❌</span>
              <span className="text-sm font-medium text-red-800">
                Processing failed
              </span>
            </div>
          </div>
        )}

        {/* Loading Animation */}
        {!isCompleted && !hasError && (
          <div className="flex items-center justify-center mt-4">
            <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Token Counter - Right Bottom */}
        {totalTokens.total > 0 && (
          <div className="absolute bottom-4 right-4 bg-purple-50/80 rounded-lg px-3 py-2 border border-purple-200/50">
            <div className="text-xs text-purple-700 font-medium">
              🔢 {totalTokens.total.toLocaleString()} tokens
            </div>
            <div className="text-xs text-purple-500 mt-0.5">
              {totalTokens.prompt.toLocaleString()} + {totalTokens.completion.toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}