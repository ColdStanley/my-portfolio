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

interface LanguageReadingState {
  wordQueries: WordQuery[]
  sentenceQueries: SentenceQuery[]
  highlightedRanges: Array<{
    type: 'word' | 'sentence'
    start: number
    end: number
    id: number
  }>
  pendingWordQueries: Array<{
    start: number
    end: number
    text: string
  }>
  
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
  addPendingWordQuery: (start: number, end: number, text: string) => void
  removePendingWordQuery: (start: number, end: number) => void
  triggerWordBounce: (start: number, end: number) => void
}

export const useLanguageReadingStore = create<LanguageReadingState>((set, get) => ({
  wordQueries: [],
  sentenceQueries: [],
  highlightedRanges: [],
  pendingWordQueries: [],
  
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
        wordQueries: [], 
        sentenceQueries: [], 
        highlightedRanges: [] 
      })
      
      // Load word queries
      const wordRes = await fetch(`/api/language-reading/queries?articleId=${articleId}&type=word&language=${language}`)
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
        const sentenceRes = await fetch(`/api/language-reading/queries?articleId=${articleId}&type=sentence&language=${language}`)
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
        const sentenceRes = await fetch(`/api/language-reading/queries?articleId=${articleId}&type=sentence&language=${language}`)
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
    highlightedRanges: [],
    pendingWordQueries: []
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
  })),

  addPendingWordQuery: (start: number, end: number, text: string) => set((state) => ({
    pendingWordQueries: [...state.pendingWordQueries, { start, end, text }]
  })),

  removePendingWordQuery: (start: number, end: number) => set((state) => ({
    pendingWordQueries: state.pendingWordQueries.filter(q => 
      !(q.start === start && q.end === end)
    )
  })),

  triggerWordBounce: (start: number, end: number) => {
    // Trigger bounce animation for word at given position
    const element = document.querySelector(`[data-word-range="${start}-${end}"]`) as HTMLElement
    if (element) {
      element.classList.add('word-bounce')
      setTimeout(() => {
        element.classList.remove('word-bounce')
      }, 500)
    }
  }
}))