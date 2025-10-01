import { create } from 'zustand'

// Stage configuration
const STAGE_CONFIG = [
  { key: 'classifier', label: 'Insights', icon: '🎯' },
  { key: 'experience', label: 'Experience', icon: '💼' },
  { key: 'reviewer', label: 'Review', icon: '🔍' }
] as const

export type StageKey = typeof STAGE_CONFIG[number]['key']
export type TaskStatus = 'pending' | 'running' | 'completed' | 'error'

export interface TokensUsage {
  prompt: number
  completion: number
  total: number
}

export interface StageData {
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  content?: string
  json?: any
  tokens?: TokensUsage
  duration?: number
  roleType?: string
  keywords?: string[]
  insights?: string[]
  streamingContent?: string
}

export interface TaskEntry {
  id: string
  label: string
  status: TaskStatus
  startedAt: number
  updatedAt: number
  stageOutputs: Record<StageKey, StageData>
  activeStage: StageKey
  jdId?: string // Reference to the JD that triggered this task
}

interface DockState {
  // Dock UI state
  isDockOpen: boolean
  dockPosition: { x: number; y: number }
  isDockDragging: boolean
  dockInitialized: boolean

  // Progress Panel state
  showPanel: boolean

  // Tasks management
  tasks: TaskEntry[]
  currentTaskId: string | null

  // Manual Review state
  pendingReview: { resume: any; personalInfo: any } | null
  manualReviewOpen: boolean
  manualWorkExperience: string
  manualPersonalInfoText: string
  manualReviewError: string | null
  isFinalizingPdf: boolean

  // Actions - Dock UI
  setIsDockOpen: (open: boolean) => void
  setDockPosition: (pos: { x: number; y: number }) => void
  setIsDockDragging: (dragging: boolean) => void
  setDockInitialized: (initialized: boolean) => void

  // Actions - Panel
  setShowPanel: (show: boolean) => void

  // Actions - Tasks
  addTask: (task: TaskEntry) => void
  updateTask: (id: string, updates: Partial<TaskEntry>) => void
  setCurrentTask: (id: string | null) => void
  removeTask: (id: string) => void
  clearTasks: () => void

  // Actions - Manual Review
  setPendingReview: (review: { resume: any; personalInfo: any } | null) => void
  setManualReviewOpen: (open: boolean) => void
  setManualWorkExperience: (text: string) => void
  setManualPersonalInfoText: (text: string) => void
  setManualReviewError: (error: string | null) => void
  setIsFinalizingPdf: (finalizing: boolean) => void
}

const DOCK_POSITION_STORAGE_KEY = 'resumeProgressDockPosition'

// Helper to get initial dock position from localStorage
const getInitialDockPosition = (): { x: number; y: number } => {
  if (typeof window === 'undefined') {
    return { x: 24, y: 88 }
  }

  try {
    const stored = localStorage.getItem(DOCK_POSITION_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Failed to load dock position:', error)
  }

  return { x: 24, y: 88 }
}

export const useDockStore = create<DockState>((set, get) => ({
  // Initial state - Dock UI
  isDockOpen: false,
  dockPosition: getInitialDockPosition(),
  isDockDragging: false,
  dockInitialized: false,

  // Initial state - Panel
  showPanel: false,

  // Initial state - Tasks
  tasks: [],
  currentTaskId: null,

  // Initial state - Manual Review
  pendingReview: null,
  manualReviewOpen: false,
  manualWorkExperience: '',
  manualPersonalInfoText: '',
  manualReviewError: null,
  isFinalizingPdf: false,

  // Actions - Dock UI
  setIsDockOpen: (open) => set({ isDockOpen: open }),

  setDockPosition: (pos) => {
    set({ dockPosition: pos })
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DOCK_POSITION_STORAGE_KEY, JSON.stringify(pos))
      } catch (error) {
        console.warn('Failed to save dock position:', error)
      }
    }
  },

  setIsDockDragging: (dragging) => set({ isDockDragging: dragging }),
  setDockInitialized: (initialized) => set({ dockInitialized: initialized }),

  // Actions - Panel
  setShowPanel: (show) => set({ showPanel: show }),

  // Actions - Tasks
  addTask: (task) => {
    const state = get()
    const newTasks = [task, ...state.tasks].slice(0, 5) // Keep max 5 tasks
    set({
      tasks: newTasks,
      currentTaskId: task.id,
      isDockOpen: true,
      showPanel: true
    })
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
      )
    }))
  },

  setCurrentTask: (id) => {
    const state = get()
    const task = state.tasks.find(t => t.id === id)
    if (task) {
      set({
        currentTaskId: id,
        showPanel: id !== null
      })
    }
  },

  removeTask: (id) => {
    const state = get()
    const newTasks = state.tasks.filter(t => t.id !== id)
    set({
      tasks: newTasks,
      currentTaskId: state.currentTaskId === id ? (newTasks[0]?.id || null) : state.currentTaskId
    })
  },

  clearTasks: () => set({
    tasks: [],
    currentTaskId: null,
    showPanel: false,
    isDockOpen: false
  }),

  // Actions - Manual Review
  setPendingReview: (review) => set({ pendingReview: review }),
  setManualReviewOpen: (open) => set({ manualReviewOpen: open }),
  setManualWorkExperience: (text) => set({ manualWorkExperience: text }),
  setManualPersonalInfoText: (text) => set({ manualPersonalInfoText: text }),
  setManualReviewError: (error) => set({ manualReviewError: error }),
  setIsFinalizingPdf: (finalizing) => set({ isFinalizingPdf: finalizing })
}))

// Export stage config for use in components
export { STAGE_CONFIG }
