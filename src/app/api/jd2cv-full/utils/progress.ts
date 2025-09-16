// Memory-based progress state management
interface ProgressStep {
  step: number
  stepName: string
  status: 'waiting' | 'running' | 'completed' | 'error'
  message: string
  duration?: number
  content?: string
  tokens?: { prompt: number; completion: number; total: number }
}

interface ProgressState {
  currentStep: number
  totalSteps: number
  overallStatus: 'idle' | 'running' | 'completed' | 'error'
  steps: ProgressStep[]
  totalTokens: { prompt: number; completion: number; total: number }
  totalDuration: number
  startTime?: number
}

// In-memory progress storage
let progressState: ProgressState = {
  currentStep: 0,
  totalSteps: 3,
  overallStatus: 'idle',
  steps: [
    { step: 1, stepName: 'Role Classification', status: 'waiting', message: 'Analyzing job description...' },
    { step: 2, stepName: 'Content Customization', status: 'waiting', message: 'Customizing work experience and personal info...' },
    { step: 3, stepName: 'Quality Review', status: 'waiting', message: 'Reviewing and finalizing...' }
  ],
  totalTokens: { prompt: 0, completion: 0, total: 0 },
  totalDuration: 0
}

// Initialize progress state for new workflow
export function initializeProgress() {
  progressState = {
    currentStep: 0,
    totalSteps: 3,
    overallStatus: 'running',
    steps: [
      { step: 1, stepName: 'Role Classification', status: 'waiting', message: 'Analyzing job description...' },
      { step: 2, stepName: 'Content Customization', status: 'waiting', message: 'Customizing work experience and personal info...' },
      { step: 3, stepName: 'Quality Review', status: 'waiting', message: 'Reviewing and finalizing...' }
    ],
    totalTokens: { prompt: 0, completion: 0, total: 0 },
    totalDuration: 0,
    startTime: Date.now()
  }
}

// Update progress for specific step
export function updateProgress(progress: {
  type: 'step_start' | 'step_complete' | 'step_error' | 'completed' | 'error'
  step?: number
  stepName?: string
  message: string
  duration?: number
  data?: {
    content?: string
    tokens?: { prompt: number; completion: number; total: number }
    [key: string]: any
  }
}) {
  if (progress.type === 'step_start' && progress.step) {
    progressState.currentStep = progress.step
    progressState.steps = progressState.steps.map(step => {
      if (step.step === progress.step) {
        return { ...step, status: 'running' as const, message: progress.message }
      }
      return step
    })
  }

  if (progress.type === 'step_complete' && progress.step) {
    progressState.steps = progressState.steps.map(step => {
      if (step.step === progress.step) {
        return {
          ...step,
          status: 'completed' as const,
          message: progress.message,
          duration: progress.duration,
          content: progress.data?.content,
          tokens: progress.data?.tokens
        }
      }
      return step
    })

    // Accumulate tokens
    if (progress.data?.tokens) {
      progressState.totalTokens.prompt += progress.data.tokens.prompt
      progressState.totalTokens.completion += progress.data.tokens.completion
      progressState.totalTokens.total += progress.data.tokens.total
    }
  }

  if (progress.type === 'step_error' && progress.step) {
    progressState.steps = progressState.steps.map(step => {
      if (step.step === progress.step) {
        return { ...step, status: 'error' as const, message: progress.message }
      }
      return step
    })
    progressState.overallStatus = 'error'
  }

  if (progress.type === 'completed') {
    progressState.overallStatus = 'completed'
    progressState.totalDuration = progressState.startTime ? Date.now() - progressState.startTime : 0

    // Set final total tokens if provided
    if (progress.data?.totalTokens) {
      progressState.totalTokens = progress.data.totalTokens
    }
  }

  if (progress.type === 'error') {
    progressState.overallStatus = 'error'
  }
}

// Get current progress state
export function getProgressState(): ProgressState {
  return progressState
}

// Reset progress state
export function resetProgress() {
  progressState = {
    currentStep: 0,
    totalSteps: 3,
    overallStatus: 'idle',
    steps: [
      { step: 1, stepName: 'Role Classification', status: 'waiting', message: 'Analyzing job description...' },
      { step: 2, stepName: 'Content Customization', status: 'waiting', message: 'Customizing work experience and personal info...' },
      { step: 3, stepName: 'Quality Review', status: 'waiting', message: 'Reviewing and finalizing...' }
    ],
    totalTokens: { prompt: 0, completion: 0, total: 0 },
    totalDuration: 0
  }
}