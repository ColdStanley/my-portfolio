import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PartType = 'part1' | 'part2' | 'part3'
export type TabType = 'dashboard' | 'learning'

interface StepResult {
  content: string
  timestamp: Date
  prompt?: string
}

interface PartProgress {
  currentStep: number
  stepResults: Record<number, StepResult>
  isCompleted: boolean
}

interface IELTSStepStore {
  // UI State
  activeTab: TabType
  activePart: PartType
  selectedAiModel: 'deepseek' | 'openai'
  setActiveTab: (tab: TabType) => void
  setActivePart: (part: PartType) => void
  setSelectedAiModel: (model: 'deepseek' | 'openai') => void
  
  // Progress State
  progress: Record<PartType, PartProgress>
  isLoading: boolean
  
  // Step Actions
  setStepResult: (part: PartType, step: number, result: StepResult) => Promise<void>
  getStepResult: (part: PartType, step: number) => StepResult | undefined
  getCurrentStep: (part: PartType) => number
  goToNextStep: (part: PartType) => void
  resetPartProgress: (part: PartType) => void
  
  // Data Sync
  loadPartProgress: (part: PartType) => Promise<void>
  savePartProgress: (part: PartType) => Promise<void>
  
  // AI Generation
  generateAIResponse: (part: PartType, step: number, userInput?: string) => Promise<string>
  
  // User Management
  getUserId: () => string
}

const initialPartProgress: PartProgress = {
  currentStep: 1,
  stepResults: {},
  isCompleted: false
}

// Helper function to generate UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Helper function to get user ID (anonymous or authenticated)
const getUserId = (): string => {
  // Check if there's an authenticated user
  // For now, use anonymous UUID stored in localStorage
  
  // Force regenerate UUID for debugging (temporary)
  const userId = generateUUID()
  localStorage.setItem('ielts-anonymous-user-id', userId)
  console.log('Generated new user ID:', userId)
  return userId
  
  /* Original logic - will restore after debugging
  let userId = localStorage.getItem('ielts-anonymous-user-id')
  
  // Check if existing userId is valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  
  if (!userId || !uuidRegex.test(userId)) {
    userId = generateUUID() // Generate proper UUID format
    localStorage.setItem('ielts-anonymous-user-id', userId)
  }
  return userId
  */
}

export const useIELTSStepStore = create<IELTSStepStore>()(
  persist(
    (set, get) => ({
      // UI State
      activeTab: 'dashboard',
      activePart: 'part1',
      selectedAiModel: 'deepseek',
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActivePart: (part) => set({ activePart: part }),
      setSelectedAiModel: (model) => set({ selectedAiModel: model }),
      
      // Progress State
      progress: {
        part1: { ...initialPartProgress },
        part2: { ...initialPartProgress },
        part3: { ...initialPartProgress }
      },
      isLoading: false,
      
      // Step Actions
      setStepResult: async (part, step, result) => {
        // Update local state immediately
        set((state) => ({
          progress: {
            ...state.progress,
            [part]: {
              ...state.progress[part],
              stepResults: {
                ...state.progress[part].stepResults,
                [step]: result
              }
            }
          }
        }))
        
        // Save to Supabase
        try {
          const response = await fetch('/api/ielts-speaking-step-by-step/step-result-simple', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: getUserId(),
              part,
              step,
              result: {
                ...result,
                timestamp: result.timestamp instanceof Date ? result.timestamp.toISOString() : result.timestamp
              }
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to save step result to server:', response.status, errorData)
          }
        } catch (error) {
          console.error('Error saving step result:', error)
        }
      },
      
      getStepResult: (part, step) => {
        const state = get()
        return state.progress[part]?.stepResults[step]
      },
      
      getCurrentStep: (part) => {
        const state = get()
        return state.progress[part]?.currentStep || 1
      },
      
      goToNextStep: (part) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [part]: {
              ...state.progress[part],
              currentStep: Math.min(state.progress[part].currentStep + 1, 10) // 扩展到10步
            }
          }
        })),
      
      resetPartProgress: (part) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [part]: { ...initialPartProgress }
          }
        })),
      
      // Data Sync
      loadPartProgress: async (part) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`/api/ielts-speaking-step-by-step/sessions?userId=${getUserId()}&part=${part}`)
          if (response.ok) {
            const data = await response.json()
            set((state) => ({
              progress: {
                ...state.progress,
                [part]: {
                  currentStep: data.current_step || 1,
                  stepResults: data.step_results || {},
                  isCompleted: data.is_completed || false
                }
              }
            }))
          }
        } catch (error) {
          console.error('Error loading part progress:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      savePartProgress: async (part) => {
        const state = get()
        const partData = state.progress[part]
        
        try {
          const response = await fetch('/api/ielts-speaking-step-by-step/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: getUserId(),
              part,
              currentStep: partData.currentStep,
              stepResults: partData.stepResults,
              isCompleted: partData.isCompleted
            })
          })
          
          if (!response.ok) {
            console.error('Failed to save part progress')
          }
        } catch (error) {
          console.error('Error saving part progress:', error)
        }
      },
      
      // AI Generation
      generateAIResponse: async (part, step, userInput?) => {
        const state = get()
        const partProgress = state.progress[part]
        
        // Collect previous steps for context
        const previousSteps = []
        for (let i = 1; i < step; i++) {
          const stepResult = partProgress.stepResults[i]
          if (stepResult) {
            previousSteps.push(stepResult)
          }
        }
        
        try {
          const response = await fetch('/api/ielts-speaking-step-by-step/ai-generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              part,
              step,
              previousSteps,
              userInput,
              aiModel: state.selectedAiModel
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to generate AI response')
          }
          
          const data = await response.json()
          return data.content
        } catch (error) {
          console.error('Error generating AI response:', error)
          throw error
        }
      },
      
      // User Management
      getUserId
    }),
    {
      name: 'ielts-step-storage-v2', // Changed name to force fresh start
      partialize: (state) => ({ 
        progress: state.progress, 
        activePart: state.activePart,
        selectedAiModel: state.selectedAiModel 
      })
    }
  )
)