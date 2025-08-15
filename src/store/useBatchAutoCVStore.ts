import { create } from 'zustand'
import { JDRecord } from '@/shared/types'

interface FailedJD {
  jdId: string
  title: string
  company: string
  error: string
}

interface BatchAutoCVStore {
  // 批量处理状态
  isProcessing: boolean
  totalJDs: number
  currentJDIndex: number
  currentJD: JDRecord | null
  currentStep: string
  progress: number
  
  // 结果状态
  completedJDs: string[]
  failedJDs: FailedJD[]
  
  // 操作方法
  startBatchProcess: (jdIds: string[]) => void
  updateProgress: (updates: {
    currentJDIndex?: number
    currentJD?: JDRecord | null
    currentStep?: string
    progress?: number
  }) => void
  completeJD: (jdId: string) => void
  failJD: (jd: JDRecord, error: string) => void
  resetState: () => void
}

export const useBatchAutoCVStore = create<BatchAutoCVStore>((set, get) => ({
  isProcessing: false,
  totalJDs: 0,
  currentJDIndex: 0,
  currentJD: null,
  currentStep: '',
  progress: 0,
  completedJDs: [],
  failedJDs: [],

  startBatchProcess: (jdIds) => set({
    isProcessing: true,
    totalJDs: jdIds.length,
    currentJDIndex: 0,
    currentJD: null,
    currentStep: 'Starting batch process...',
    progress: 0,
    completedJDs: [],
    failedJDs: []
  }),

  updateProgress: (updates) => set((state) => ({
    ...state,
    ...updates
  })),

  completeJD: (jdId) => set((state) => ({
    completedJDs: [...state.completedJDs, jdId]
  })),

  failJD: (jd, error) => set((state) => ({
    failedJDs: [...state.failedJDs, {
      jdId: jd.id,
      title: jd.title,
      company: jd.company,
      error
    }]
  })),

  resetState: () => set({
    isProcessing: false,
    totalJDs: 0,
    currentJDIndex: 0,
    currentJD: null,
    currentStep: '',
    progress: 0,
    completedJDs: [],
    failedJDs: []
  })
}))