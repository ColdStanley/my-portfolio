import { createStore } from 'zustand'
import { useStore } from 'zustand'
import { persist } from 'zustand/middleware'

export type FeedbackType = 'completed' | 'difficult' | 'repeat'

export interface TaskTemplate {
  id: string
  title: string
  description: string
  link: string
}

// ✅ 已删除 day 字段
export type DailyTask = TaskTemplate

interface BoosterState {
  currentScore: string | null
  targetScore: string | null
  plan: DailyTask[]
  feedback: Record<string, FeedbackType>
  goal: string | null
  keyPoints: string[]

  setScores: (curr: string, target: string) => void
  setPlan: (p: DailyTask[]) => void
  setFeedback: (taskId: string, type: FeedbackType) => void
  setGoal: (g: string) => void
  setKeyPoints: (k: string[]) => void
}

// ✅ 使用 persist 封装 createStore
const boosterStore = createStore<BoosterState>()(
  persist(
    (set) => ({
      currentScore: null,
      targetScore: null,
      plan: [],
      feedback: {},
      goal: null,
      keyPoints: [],

      setScores: (curr, target) => set({ currentScore: curr, targetScore: target }),
      setPlan: (p) => set({ plan: p }),
      setFeedback: (taskId, type) =>
        set((state) => ({
          feedback: {
            ...state.feedback,
            [taskId]: type,
          },
        })),
      setGoal: (g) => set({ goal: g }),
      setKeyPoints: (k) => set({ keyPoints: k }),
    }),
    {
      name: 'booster-speaking-store', // localStorage key
    }
  )
)

// ✅ 使用 hook 获取 store 中的状态/方法
export const useBoosterStore = <T>(selector: (state: BoosterState) => T) =>
  useStore(boosterStore, selector)
