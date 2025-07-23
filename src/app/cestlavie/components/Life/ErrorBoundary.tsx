'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class TaskErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('TaskPanel Error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">
              The task panel encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
                <summary className="cursor-pointer font-medium text-red-800 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-red-700 overflow-auto">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="space-y-2">
              <button
                onClick={this.handleRetry}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading component with better UX
export const TaskLoadingSpinner = ({ message = 'Loading tasks...' }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)

// Error display component
export const TaskErrorDisplay = ({ 
  error, 
  onRetry 
}: { 
  error: string
  onRetry?: () => void 
}) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="text-6xl mb-4">❌</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Failed to load tasks
      </h3>
      <p className="text-gray-600 mb-4">
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
)

// Success toast notification
export const ToastNotification = ({ 
  message, 
  type = 'success',
  onClose 
}: { 
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void 
}) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${typeStyles[type]} shadow-lg max-w-sm`}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">
          {typeIcons[type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-lg hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  )
}