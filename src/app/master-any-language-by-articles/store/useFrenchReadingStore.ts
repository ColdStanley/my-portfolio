import { create } from 'zustand'
import { Language } from '../config/uiText'

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
  ai_notes?: string
  language?: string
  // French-specific fields
  gender?: string // masculin/féminin
  conjugation_info?: string
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
  ai_notes?: string
  language?: string
}

interface FrenchReadingState {
  // French-specific sentence cards data
  frenchSentenceCards: SentenceQuery[]
  
  // Traditional word/sentence highlighting for reading view
  wordQueries: WordQuery[]
  sentenceQueries: SentenceQuery[]
  highlightedRanges: Array<{
    type: 'word' | 'sentence'
    start: number
    end: number
    id: number
  }>
  
  // Action methods
  addFrenchSentenceCard: (query: SentenceQuery) => void
  removeFrenchSentenceCard: (id: number) => void
  addWordQuery: (query: WordQuery) => void
  addSentenceQuery: (query: SentenceQuery) => void
  addHighlight: (type: 'word' | 'sentence', start: number, end: number, id: number) => void
  isHighlighted: (start: number, end: number) => boolean
  loadStoredData: (articleId: number, language: Language) => Promise<void>
  deleteWordQuery: (id: number) => void
  deleteSentenceQuery: (id: number) => void
  clearAll: () => void
  updateWordNotes: (id: number, notes: string) => void
  updateSentenceNotes: (id: number, notes: string) => void
}

export const useFrenchReadingStore = create<FrenchReadingState>((set, get) => ({
  frenchSentenceCards: [],
  wordQueries: [],
  sentenceQueries: [],
  highlightedRanges: [],
  
  addFrenchSentenceCard: (query) => set((state) => ({
    frenchSentenceCards: [...state.frenchSentenceCards, query]
  })),
  
  removeFrenchSentenceCard: (id) => set((state) => ({
    frenchSentenceCards: state.frenchSentenceCards.filter(q => q.id !== id)
  })),
  
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
  
  loadStoredData: async (articleId, language) => {
    try {
      // Clear existing data first
      set({ 
        frenchSentenceCards: [],
        wordQueries: [], 
        sentenceQueries: [], 
        highlightedRanges: [] 
      })
      
      // Data is now stored in articles.analysis_records JSON field
      // This store is deprecated - data access moved to unified structure
      console.log('useFrenchReadingStore is deprecated - data moved to articles.analysis_records')
      
    } catch (error) {
      console.error('Failed to load French reading data:', error)
      // Clear data on error
      set({ 
        frenchSentenceCards: [],
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
    frenchSentenceCards: state.frenchSentenceCards.filter(q => q.id !== id),
    highlightedRanges: state.highlightedRanges.filter(r => !(r.type === 'sentence' && r.id === id))
  })),
  
  clearAll: () => set({
    frenchSentenceCards: [],
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
    ),
    frenchSentenceCards: state.frenchSentenceCards.map(q => 
      q.id === id ? { ...q, user_notes: notes } : q
    )
  }))
}))