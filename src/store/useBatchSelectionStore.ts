import { create } from 'zustand'

interface BatchSelectionStore {
  // 批量模式状态
  batchMode: boolean
  selectedJDIds: Set<string>
  
  // 批量模式操作
  setBatchMode: (enabled: boolean) => void
  toggleJDSelection: (jdId: string) => void
  selectAllJDs: (jdIds: string[]) => void
  clearSelection: () => void
  isJDSelected: (jdId: string) => boolean
  getSelectedCount: () => number
}

export const useBatchSelectionStore = create<BatchSelectionStore>((set, get) => ({
  batchMode: false,
  selectedJDIds: new Set<string>(),

  setBatchMode: (enabled) => set({ 
    batchMode: enabled,
    selectedJDIds: enabled ? get().selectedJDIds : new Set()
  }),

  toggleJDSelection: (jdId) => set((state) => {
    const newSelection = new Set(state.selectedJDIds)
    if (newSelection.has(jdId)) {
      newSelection.delete(jdId)
    } else {
      newSelection.add(jdId)
    }
    return { selectedJDIds: newSelection }
  }),

  selectAllJDs: (jdIds) => set({ 
    selectedJDIds: new Set(jdIds) 
  }),

  clearSelection: () => set({ 
    selectedJDIds: new Set() 
  }),

  isJDSelected: (jdId) => get().selectedJDIds.has(jdId),

  getSelectedCount: () => get().selectedJDIds.size
}))