import { create } from 'zustand'
import { Language } from '../config/uiText'

interface WordQuery {
  id: number | string // Support both number (old system) and string (UUID for new system)
  word_text: string
  definition?: string
  analysis?: string
  part_of_speech?: string
  root_form?: string
  examples?: string[]
  example_translation?: string
  start_offset: number
  end_offset: number
  query_type?: string
  user_notes?: string
  ai_notes?: string
  language?: string
  analysis_mode?: 'mark' | 'simple' | 'deep' | 'grammar'
  // French-specific fields
  gender?: string // masculin/féminin
  conjugation_info?: string
}

interface SentenceQuery {
  id: number | string // Support both number (old system) and string (UUID for new system)
  sentence_text: string
  translation?: string
  analysis?: string
  start_offset: number
  end_offset: number
  query_type?: string
  user_notes?: string
  ai_notes?: string
  language?: string
  analysis_mode?: 'mark' | 'simple' | 'deep' | 'grammar'
}

interface LanguageReadingState {
  wordQueries: WordQuery[]
  sentenceQueries: SentenceQuery[]
  highlightedRanges: Array<{
    type: 'word' | 'sentence'
    start: number
    end: number
    id: number | string // Support both number and string IDs
  }>
  pendingWordQueries: Array<{
    start: number
    end: number
    text: string
  }>
  pendingSentenceQueries: Array<{
    start: number
    end: number
    text: string
  }>
  
  addWordQuery: (query: WordQuery) => void
  addSentenceQuery: (query: SentenceQuery) => void
  addHighlight: (type: 'word' | 'sentence', start: number, end: number, id: number | string) => void
  isHighlighted: (start: number, end: number) => boolean
  loadStoredData: (articleId: number, language: Language) => Promise<void>
  deleteWordQuery: (id: number | string) => void
  deleteSentenceQuery: (id: number | string) => void
  clearAll: () => void
  updateWordNotes: (id: number | string, notes: string) => void
  updateSentenceNotes: (id: number | string, notes: string) => void
  addPendingWordQuery: (start: number, end: number, text: string) => void
  removePendingWordQuery: (start: number, end: number) => void
  triggerWordBounce: (start: number, end: number) => void
  addPendingSentenceQuery: (start: number, end: number, text: string) => void
  removePendingSentenceQuery: (start: number, end: number) => void
  triggerSentenceBounce: (start: number, end: number) => void
}

export const useLanguageReadingStore = create<LanguageReadingState>((set, get) => ({
  wordQueries: [],
  sentenceQueries: [],
  highlightedRanges: [],
  pendingWordQueries: [],
  pendingSentenceQueries: [],
  
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
      
      // For chinese-english, use unified JSON structure
      if (language === 'english') {
        const languagePair = 'chinese-english'
        const res = await fetch(`/api/master-language/analysis-records?articleId=${articleId}&languagePair=${languagePair}`)
        
        if (res.ok) {
          const data = await res.json()
          const records = data.records || []
          
          // Convert JSON records to word queries format
          const wordQueries = records.map((record: any) => ({
            id: record.id, // Keep UUID as string
            word_text: record.selected_text,
            definition: record.analysis,
            analysis: record.analysis,
            start_offset: record.start_offset,
            end_offset: record.end_offset,
            query_type: record.query_type,
            user_notes: record.user_notes,
            ai_notes: record.ai_notes,
            language: 'english',
            analysis_mode: record.analysis_mode
          }))
          
          // Create highlights with validation
          const highlights = records
            .filter((record: any) => record.start_offset !== undefined && record.end_offset !== undefined)
            .map((record: any) => ({
              type: 'word' as const,
              start: parseInt(record.start_offset) || 0,
              end: parseInt(record.end_offset) || 0,
              id: record.id // Keep UUID as string
            }))
            .filter((highlight: any) => highlight.start < highlight.end) // Remove invalid ranges
          
          console.log('Loaded analysis records:', {
            recordsCount: records.length,
            wordQueriesCount: wordQueries.length,
            highlightsCount: highlights.length,
            highlights: highlights.map(h => `${h.start}-${h.end}`)
          })
          
          set({ 
            wordQueries,
            sentenceQueries: [], // No separate sentence queries in unified structure
            highlightedRanges: highlights 
          })
        }
        return
      }
      
      // For other languages, keep the old logic
      let allHighlights: Array<{type: 'word' | 'sentence', start: number, end: number, id: number}> = []
      
      // Data is now stored in articles.analysis_records JSON field
      // This store is deprecated - data access moved to unified structure
      console.log('useLanguageReadingStore queries deprecated - data moved to articles.analysis_records')
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
  },

  addPendingSentenceQuery: (start: number, end: number, text: string) => set((state) => ({
    pendingSentenceQueries: [...state.pendingSentenceQueries, { start, end, text }]
  })),

  removePendingSentenceQuery: (start: number, end: number) => set((state) => ({
    pendingSentenceQueries: state.pendingSentenceQueries.filter(q => 
      !(q.start === start && q.end === end)
    )
  })),

  triggerSentenceBounce: (start: number, end: number) => {
    // Trigger bounce animation for sentence at given position
    const element = document.querySelector(`[data-sentence-range="${start}-${end}"]`) as HTMLElement
    if (element) {
      element.classList.add('sentence-bounce')
      setTimeout(() => {
        element.classList.remove('sentence-bounce')
      }, 500)
    }
  }
}))