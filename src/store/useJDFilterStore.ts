import { create } from 'zustand'

interface JDFilters {
  stage: string
  role: string
  firm: string
  time: string
  comment: string
  searchTerm: string
}

interface JDFilterStore {
  filters: JDFilters
  sortOrder: 'asc' | 'desc' | ''
  
  // Actions
  setFilters: (filters: JDFilters) => void
  handleFilterChange: (field: string, value: string) => void
  setSortOrder: (sortOrder: 'asc' | 'desc' | '') => void
  handleSortChange: () => void
  clearFilters: () => void
}

export const useJDFilterStore = create<JDFilterStore>((set, get) => ({
  filters: {
    stage: 'Raw JD',
    role: '',
    firm: '',
    time: '',
    comment: '',
    searchTerm: ''
  },
  sortOrder: '',

  // Set entire filters object
  setFilters: (filters) => set({ filters }),

  // Handle individual filter changes
  handleFilterChange: (field, value) => set((state) => ({
    filters: {
      ...state.filters,
      [field]: value
    }
  })),

  // Set sort order
  setSortOrder: (sortOrder) => set({ sortOrder }),

  // Handle sort changes (cycle through: '' -> 'desc' -> 'asc' -> '')
  handleSortChange: () => set((state) => {
    if (state.sortOrder === '') {
      return { sortOrder: 'desc' }
    } else if (state.sortOrder === 'desc') {
      return { sortOrder: 'asc' }
    } else {
      return { sortOrder: '' }
    }
  }),

  // Clear all filters and sort
  clearFilters: () => set({
    filters: {
      stage: '',
      role: '',
      firm: '',
      time: '',
      comment: '',
      searchTerm: ''
    },
    sortOrder: ''
  })
}))