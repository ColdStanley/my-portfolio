import { create } from 'zustand'

interface WordQuery {
  id: number
  word_text: string
  definition: string
  part_of_speech?: string
  root_form?: string
  examples: string[]
  example_translation?: string
  start_offset: number
  end_offset: number
  query_type?: string
  user_notes?: string
}

interface SentenceQuery {
  id: number
  sentence_text: string
  translation: string
  analysis: string
  start_offset: number
  end_offset: number
  query_type?: string
  user_notes?: string
}

interface ReadingState {
  wordQueries: WordQuery[]
  sentenceQueries: SentenceQuery[]
  highlightedRanges: Array<{
    type: 'word' | 'sentence'
    start: number
    end: number
    id: number
  }>
  
  addWordQuery: (query: WordQuery) => void
  addSentenceQuery: (query: SentenceQuery) => void
  addHighlight: (type: 'word' | 'sentence', start: number, end: number, id: number) => void
  isHighlighted: (start: number, end: number) => boolean
  loadStoredData: (articleId: number) => Promise<void>
  deleteWordQuery: (id: number) => void
  deleteSentenceQuery: (id: number) => void
  clearAll: () => void
  updateWordNotes: (id: number, notes: string) => void
  updateSentenceNotes: (id: number, notes: string) => void
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  wordQueries: [],
  sentenceQueries: [],
  highlightedRanges: [],
  
  addWordQuery: (query) => set((state) => ({
    wordQueries: [...state.wordQueries, query]
  })),
  
  addSentenceQuery: (query) => set((state) => ({
    sentenceQueries: [...state.sentenceQueries, query]
  })),
  
  addHighlight: (type, start, end, id) => set((state) => ({
    highlightedRanges: [...state.highlightedRanges, { type, start, end, id }]
  })),
  
  isHighlighted: (start, end) => {
    const ranges = get().highlightedRanges
    return ranges.some(range => 
      (start >= range.start && start < range.end) ||
      (end > range.start && end <= range.end) ||
      (start <= range.start && end >= range.end)
    )
  },
  
  loadStoredData: async (articleId) => {
    try {
      // Clear existing data first
      set({ 
        wordQueries: [], 
        sentenceQueries: [], 
        highlightedRanges: [] 
      })
      
      // Load word queries
      const wordRes = await fetch(`/api/english-reading/queries?articleId=${articleId}&type=word`)
      if (wordRes.ok) {
        const wordQueries = await wordRes.json()
        set({ wordQueries })
        
        // Add highlights for words
        const wordHighlights = wordQueries.map((q: WordQuery) => ({
          type: 'word' as const,
          start: q.start_offset,
          end: q.end_offset,
          id: q.id
        }))
        
        // Load sentence queries
        const sentenceRes = await fetch(`/api/english-reading/queries?articleId=${articleId}&type=sentence`)
        if (sentenceRes.ok) {
          const sentenceQueries = await sentenceRes.json()
          set({ sentenceQueries })
          
          // Add highlights for sentences
          const sentenceHighlights = sentenceQueries.map((q: SentenceQuery) => ({
            type: 'sentence' as const,
            start: q.start_offset,
            end: q.end_offset,
            id: q.id
          }))
          
          set({ highlightedRanges: [...wordHighlights, ...sentenceHighlights] })
        } else {
          // If no sentence queries, just set word highlights
          set({ highlightedRanges: wordHighlights })
        }
      } else {
        // If no word queries, try sentence queries only
        const sentenceRes = await fetch(`/api/english-reading/queries?articleId=${articleId}&type=sentence`)
        if (sentenceRes.ok) {
          const sentenceQueries = await sentenceRes.json()
          set({ sentenceQueries })
          
          const sentenceHighlights = sentenceQueries.map((q: SentenceQuery) => ({
            type: 'sentence' as const,
            start: q.start_offset,
            end: q.end_offset,
            id: q.id
          }))
          
          set({ highlightedRanges: sentenceHighlights })
        }
      }
    } catch (error) {
      console.error('Failed to load stored data:', error)
      // Clear data on error
      set({ 
        wordQueries: [], 
        sentenceQueries: [], 
        highlightedRanges: [] 
      })
    }
  },
  
  deleteWordQuery: (id) => set((state) => ({
    wordQueries: state.wordQueries.filter(q => q.id !== id),
    highlightedRanges: state.highlightedRanges.filter(r => !(r.type === 'word' && r.id === id))
  })),
  
  deleteSentenceQuery: (id) => set((state) => ({
    sentenceQueries: state.sentenceQueries.filter(q => q.id !== id),
    highlightedRanges: state.highlightedRanges.filter(r => !(r.type === 'sentence' && r.id === id))
  })),
  
  clearAll: () => set({
    wordQueries: [],
    sentenceQueries: [],
    highlightedRanges: []
  }),
  
  updateWordNotes: (id: number, notes: string) => set((state) => ({
    wordQueries: state.wordQueries.map(q => 
      q.id === id ? { ...q, user_notes: notes } : q
    )
  })),
  
  updateSentenceNotes: (id: number, notes: string) => set((state) => ({
    sentenceQueries: state.sentenceQueries.map(q => 
      q.id === id ? { ...q, user_notes: notes } : q
    )
  }))
}))