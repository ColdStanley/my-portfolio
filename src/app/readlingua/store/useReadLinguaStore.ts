import { create } from 'zustand'

export interface Article {
  id: string
  title: string
  content: string
  source_language: string
  native_language: string
  created_at: string
  updated_at: string
}

export interface Query {
  id: string
  article_id: string
  selected_text: string | null
  query_type: 'quick' | 'standard' | 'deep' | 'ask_ai'
  user_question?: string
  ai_response: string
  text_position?: {
    start: number
    end: number
    highlight_id: string
  }
  created_at: string
}

export interface PromptTemplates {
  quick: string
  standard: string
  deep: string
  ask_ai: string
}

interface ReadLinguaState {
  // Tab management
  activeTab: 'dashboard' | 'learning'
  setActiveTab: (tab: 'dashboard' | 'learning') => void
  
  // Articles
  articles: Article[]
  setArticles: (articles: Article[]) => void
  selectedArticle: Article | null
  setSelectedArticle: (article: Article | null) => void
  
  // Queries
  queries: Query[]
  setQueries: (queries: Query[]) => void
  addQuery: (query: Query) => void
  removeQuery: (queryId: string) => void
  
  // AI Model
  selectedAiModel: 'deepseek' | 'openai'
  setSelectedAiModel: (model: 'deepseek' | 'openai') => void
  
  // Prompt Templates
  promptTemplates: PromptTemplates
  setPromptTemplate: (type: keyof PromptTemplates, template: string) => void
  
  // UI states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  showQueryPanel: boolean
  setShowQueryPanel: (show: boolean) => void
  selectedQuery: Query | null
  setSelectedQuery: (query: Query | null) => void
  showPromptManager: boolean
  setShowPromptManager: (show: boolean) => void
}

// Default prompt templates
const DEFAULT_PROMPT_TEMPLATES: PromptTemplates = {
  quick: 'Provide a quick, concise explanation of "{text}" in {nativeLang}. Focus on basic meaning and pronunciation if relevant. Keep it under 100 words.',
  standard: `Provide a comprehensive explanation of "{text}" in {nativeLang}. Include:
1. Meaning and translation
2. Grammar structure (if applicable)  
3. Usage examples
4. Common contexts
Keep it informative but accessible.`,
  deep: `Provide an in-depth analysis of "{text}" in {nativeLang}. Include:
1. Detailed meaning and nuances
2. Etymology or origin
3. Grammar and syntax analysis
4. Cultural context and usage
5. Similar expressions or alternatives
6. Advanced usage examples
Be thorough and educational.`,
  ask_ai: `Context: "{text}" ({sourceLang} text)
User question: {question}
Please answer the user's question about this text in {nativeLang}. Be helpful and detailed.`
}

// LocalStorage key for prompt templates
const PROMPT_STORAGE_KEY = 'readlingua_prompt_templates'

// Load prompt templates from localStorage
const loadPromptTemplatesFromStorage = (): PromptTemplates => {
  if (typeof window === 'undefined') return DEFAULT_PROMPT_TEMPLATES
  
  try {
    const stored = localStorage.getItem(PROMPT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Validate that all required keys exist
      if (parsed.quick && parsed.standard && parsed.deep && parsed.ask_ai) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Failed to load prompt templates from localStorage:', error)
  }
  
  return DEFAULT_PROMPT_TEMPLATES
}

// Save prompt templates to localStorage
const savePromptTemplatesToStorage = (templates: PromptTemplates) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(templates))
  } catch (error) {
    console.warn('Failed to save prompt templates to localStorage:', error)
  }
}

export const useReadLinguaStore = create<ReadLinguaState>((set) => ({
  // Tab management
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Articles
  articles: [],
  setArticles: (articles) => set({ articles }),
  selectedArticle: null,
  setSelectedArticle: (article) => set({ selectedArticle: article }),
  
  // Queries
  queries: [],
  setQueries: (queries) => set({ queries }),
  addQuery: (query) => set((state) => ({ queries: [...state.queries, query] })),
  removeQuery: (queryId) => set((state) => ({ 
    queries: state.queries.filter(q => q.id !== queryId),
    selectedQuery: state.selectedQuery?.id === queryId ? null : state.selectedQuery
  })),
  
  // AI Model
  selectedAiModel: 'deepseek',
  setSelectedAiModel: (model) => set({ selectedAiModel: model }),
  
  // Prompt Templates
  promptTemplates: loadPromptTemplatesFromStorage(),
  setPromptTemplate: (type, template) => set((state) => {
    const newTemplates = {
      ...state.promptTemplates,
      [type]: template
    }
    // Save to localStorage whenever templates are updated
    savePromptTemplatesToStorage(newTemplates)
    return { promptTemplates: newTemplates }
  }),
  
  // UI states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  showQueryPanel: false,
  setShowQueryPanel: (show) => set({ showQueryPanel: show }),
  selectedQuery: null,
  setSelectedQuery: (query) => set({ selectedQuery: query }),
  showPromptManager: false,
  setShowPromptManager: (show) => set({ showPromptManager: show }),
}))