import { create } from 'zustand'

export interface CVModule {
  id: string
  title: string
  items: string[]
  width: number // percentage (0-100)
  position: {
    x: number
    y: number
  }
  sourceType?: 'manual' | 'imported'
  sourceId?: string
}

interface CVBuilderStore {
  // State
  modules: CVModule[]
  selectedModuleId: string | null
  draggedModuleId: string | null
  
  // Actions
  addModule: (module: CVModule) => void
  updateModule: (id: string, updates: Partial<CVModule>) => void
  deleteModule: (id: string) => void
  moveModule: (id: string, position: { x: number, y: number }) => void
  resizeModule: (id: string, width: number) => void
  reorderModules: (fromIndex: number, toIndex: number) => void
  
  // Module content actions
  updateModuleTitle: (id: string, title: string) => void
  addItem: (moduleId: string, index?: number) => void
  updateItem: (moduleId: string, itemIndex: number, value: string) => void
  deleteItem: (moduleId: string, itemIndex: number) => void
  
  // Selection
  selectModule: (id: string | null) => void
  setDraggedModule: (id: string | null) => void
  
  // Storage
  saveToStorage: () => void
  loadFromStorage: () => void
  clearStorage: () => void
}

const STORAGE_KEY = 'cv-builder-data'

export const useCVBuilderStore = create<CVBuilderStore>((set, get) => ({
  // Initial state
  modules: [],
  selectedModuleId: null,
  draggedModuleId: null,
  
  // Module CRUD actions
  addModule: (module: CVModule) => {
    set((state) => {
      const newState = {
        ...state,
        modules: [...state.modules, module],
        selectedModuleId: module.id
      }
      
      // Auto-save to localStorage
      setTimeout(() => {
        const currentState = get()
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          modules: currentState.modules,
          lastUpdated: new Date().toISOString()
        }))
      }, 100)
      
      return newState
    })
  },
  
  updateModule: (id: string, updates: Partial<CVModule>) => {
    set((state) => {
      const newState = {
        ...state,
        modules: state.modules.map(module =>
          module.id === id ? { ...module, ...updates } : module
        )
      }
      
      // Auto-save to localStorage
      setTimeout(() => {
        const currentState = get()
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          modules: currentState.modules,
          lastUpdated: new Date().toISOString()
        }))
      }, 100)
      
      return newState
    })
  },
  
  deleteModule: (id: string) => {
    set((state) => {
      const newState = {
        ...state,
        modules: state.modules.filter(module => module.id !== id),
        selectedModuleId: state.selectedModuleId === id ? null : state.selectedModuleId
      }
      
      // Auto-save to localStorage
      setTimeout(() => {
        const currentState = get()
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          modules: currentState.modules,
          lastUpdated: new Date().toISOString()
        }))
      }, 100)
      
      return newState
    })
  },
  
  moveModule: (id: string, position: { x: number, y: number }) => {
    get().updateModule(id, { position })
  },
  
  resizeModule: (id: string, width: number) => {
    get().updateModule(id, { width: Math.max(20, Math.min(100, width)) }) // Clamp between 20-100%
  },
  
  reorderModules: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newModules = [...state.modules]
      const [removed] = newModules.splice(fromIndex, 1)
      newModules.splice(toIndex, 0, removed)
      
      const newState = {
        ...state,
        modules: newModules
      }
      
      // Auto-save to localStorage
      setTimeout(() => {
        const currentState = get()
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          modules: currentState.modules,
          lastUpdated: new Date().toISOString()
        }))
      }, 100)
      
      return newState
    })
  },
  
  // Content editing actions
  updateModuleTitle: (id: string, title: string) => {
    get().updateModule(id, { title })
  },
  
  addItem: (moduleId: string, index?: number) => {
    set((state) => {
      const module = state.modules.find(m => m.id === moduleId)
      if (!module) return state
      
      const newItems = [...module.items]
      const insertIndex = index !== undefined ? index : newItems.length
      newItems.splice(insertIndex, 0, '')
      
      return {
        ...state,
        modules: state.modules.map(m =>
          m.id === moduleId ? { ...m, items: newItems } : m
        )
      }
    })
    
    // Auto-save
    setTimeout(() => {
      const currentState = get()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        modules: currentState.modules,
        lastUpdated: new Date().toISOString()
      }))
    }, 100)
  },
  
  updateItem: (moduleId: string, itemIndex: number, value: string) => {
    set((state) => {
      const module = state.modules.find(m => m.id === moduleId)
      if (!module) return state
      
      const newItems = [...module.items]
      newItems[itemIndex] = value
      
      // Remove empty items except the last one
      if (value === '' && itemIndex < newItems.length - 1) {
        newItems.splice(itemIndex, 1)
      }
      
      return {
        ...state,
        modules: state.modules.map(m =>
          m.id === moduleId ? { ...m, items: newItems } : m
        )
      }
    })
    
    // Auto-save
    setTimeout(() => {
      const currentState = get()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        modules: currentState.modules,
        lastUpdated: new Date().toISOString()
      }))
    }, 100)
  },
  
  deleteItem: (moduleId: string, itemIndex: number) => {
    set((state) => {
      const module = state.modules.find(m => m.id === moduleId)
      if (!module || module.items.length <= 1) return state // Keep at least one item
      
      const newItems = [...module.items]
      newItems.splice(itemIndex, 1)
      
      return {
        ...state,
        modules: state.modules.map(m =>
          m.id === moduleId ? { ...m, items: newItems } : m
        )
      }
    })
    
    // Auto-save
    setTimeout(() => {
      const currentState = get()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        modules: currentState.modules,
        lastUpdated: new Date().toISOString()
      }))
    }, 100)
  },
  
  // Selection actions
  selectModule: (id: string | null) => {
    set({ selectedModuleId: id })
  },
  
  setDraggedModule: (id: string | null) => {
    set({ draggedModuleId: id })
  },
  
  // Storage actions
  saveToStorage: () => {
    const { modules } = get()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      modules,
      lastUpdated: new Date().toISOString()
    }))
  },
  
  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        set({ modules: data.modules || [] })
      }
    } catch (error) {
      console.error('Failed to load CV Builder data from storage:', error)
    }
  },
  
  clearStorage: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ modules: [], selectedModuleId: null, draggedModuleId: null })
  }
}))