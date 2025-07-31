import { create } from 'zustand'

interface SentenceQuery {
  id: number
  sentence_text: string
  translation: string
  analysis: string
  start_offset: number
  end_offset: number
  query_type?: string
  user_notes?: string
  ai_notes?: string
  created_at?: string
  updated_at?: string
}

interface ChineseFrenchState {
  // French sentence cards data (main learning interface)
  sentenceCards: SentenceQuery[]
  
  // Loading states
  isLoading: boolean
  
  // Action methods
  addSentenceCard: (query: SentenceQuery) => void
  removeSentenceCard: (id: number) => void
  updateSentenceNotes: (id: number, notes: string) => void
  loadSentenceCards: (articleId: number) => Promise<void>
  clearAll: () => void
  
  // UI states
  selectedSentenceId: number | null
  setSelectedSentenceId: (id: number | null) => void
}

export const useChineseFrenchStore = create<ChineseFrenchState>((set, get) => ({
  sentenceCards: [],
  isLoading: false,
  selectedSentenceId: null,
  
  addSentenceCard: (query) => set((state) => ({
    sentenceCards: [...state.sentenceCards, query]
  })),
  
  removeSentenceCard: (id) => set((state) => ({
    sentenceCards: state.sentenceCards.filter(q => q.id !== id)
  })),
  
  updateSentenceNotes: (id: number, notes: string) => set((state) => ({
    sentenceCards: state.sentenceCards.map(q => 
      q.id === id ? { ...q, user_notes: notes } : q
    )
  })),
  
  loadSentenceCards: async (articleId: number) => {
    try {
      set({ isLoading: true })
      
      // Clear existing data first
      set({ sentenceCards: [] })
      
      // Load sentence queries from chinese-french specific API
      const response = await fetch(`/api/master-language/chinese-french-sentences?articleId=${articleId}`)
      
      if (response.ok) {
        const sentenceQueries = await response.json()
        set({ sentenceCards: sentenceQueries })
      } else {
        console.error('Failed to load sentence cards:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to load Chinese-French sentence cards:', error)
      // Clear data on error
      set({ sentenceCards: [] })
    } finally {
      set({ isLoading: false })
    }
  },
  
  clearAll: () => set({
    sentenceCards: [],
    selectedSentenceId: null,
    isLoading: false
  }),
  
  setSelectedSentenceId: (id) => set({ selectedSentenceId: id })
}))