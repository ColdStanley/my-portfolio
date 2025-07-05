import { create } from 'zustand'

type TabKey = 'summary' | 'jd' | 'match' | 'output' | 'experience' | 'basic'

interface JobAppState {
  currentTab: TabKey
  setTab: (tab: TabKey) => void

  selectedWorkIndices: number[]
  setSelectedWorkIndices: (v: number[]) => void

  selectedProjectIndices: number[]
  setSelectedProjectIndices: (v: number[]) => void

  selectedSkillIndices: number[]
  setSelectedSkillIndices: (v: number[]) => void

  selectedEducationIndices: number[]
  setSelectedEducationIndices: (v: number[]) => void

  selectedAwardIndices: number[]
  setSelectedAwardIndices: (v: number[]) => void
}

export const useJobAppStore = create<JobAppState>((set) => ({
  currentTab: 'summary', // ✅ 默认展示“个人信息汇总”
  setTab: (tab) => set({ currentTab: tab }),

  selectedWorkIndices: [],
  setSelectedWorkIndices: (v) => set({ selectedWorkIndices: v }),

  selectedProjectIndices: [],
  setSelectedProjectIndices: (v) => set({ selectedProjectIndices: v }),

  selectedSkillIndices: [],
  setSelectedSkillIndices: (v) => set({ selectedSkillIndices: v }),

  selectedEducationIndices: [],
  setSelectedEducationIndices: (v) => set({ selectedEducationIndices: v }),

  selectedAwardIndices: [],
  setSelectedAwardIndices: (v) => set({ selectedAwardIndices: v }),
}))
