import { create } from 'zustand'
import { 
  getPromptTemplates, 
  updateTemplateForLanguagePair, 
  resetTemplateForLanguagePair,
  initializeTemplateManager
} from '../utils/promptTemplateManager'
import type { PromptTemplates, PromptTemplatesByLanguagePair } from '../utils/promptTemplateManager'

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

// 重新导出类型，保持向后兼容
export type { PromptTemplates, PromptTemplatesByLanguagePair }

// QuizQuestion moved to quizManager.ts for better organization

export interface AITooltip {
  id: string
  selectedText: string
  queryType: string
  aiResponse: string
  isLoading: boolean
  hasError: boolean
  position: { x: number, y: number }
  userQuestion?: string
  createdAt: number
}

export interface SelectedEmailContent {
  id: string
  content: string
  type: 'query_response' | 'ai_response' | 'user_query'
  source: 'query_history'
  timestamp: string
  queryId?: string
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
  
  // 优化后的Prompt Templates - 不再在Store中存储巨大对象
  getCurrentPromptTemplates: () => PromptTemplates
  setPromptTemplate: (type: keyof PromptTemplates, template: string) => void
  resetPromptTemplates: () => void
  
  // AI Tooltips
  aiTooltips: AITooltip[]
  addAITooltip: (tooltip: Omit<AITooltip, 'id' | 'createdAt'>) => string
  updateAITooltip: (id: string, updates: Partial<AITooltip>) => void
  removeAITooltip: (id: string) => void
  clearAllTooltips: () => void
  
  // Email Selection
  selectedEmailContents: SelectedEmailContent[]
  addToEmailSelection: (content: Omit<SelectedEmailContent, 'id' | 'timestamp'>) => void
  removeFromEmailSelection: (id: string) => void
  clearEmailSelection: () => void
  showEmailPanel: boolean
  setShowEmailPanel: (show: boolean) => void
  
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

// 初始化模板管理器
initializeTemplateManager()

export const useReadLinguaStore = create<ReadLinguaState>((set, get) => ({
  // Tab management
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Articles
  articles: [],
  setArticles: (articles) => set({ articles }),
  selectedArticle: null,
  setSelectedArticle: (article) => set((state) => ({ 
    selectedArticle: article,
    // Clear queries and selectedQuery when switching articles
    queries: [],
    selectedQuery: null
  })),
  
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
  
  // 优化后的Prompt Templates - 使用懒加载管理器
  getCurrentPromptTemplates: () => {
    const state = get()
    if (!state.selectedArticle) {
      // Return default english-chinese if no article selected
      return getPromptTemplates('english', 'chinese')
    }
    
    return getPromptTemplates(
      state.selectedArticle.source_language,
      state.selectedArticle.native_language
    )
  },
  
  setPromptTemplate: (type, template) => {
    const state = get()
    if (!state.selectedArticle) return
    
    updateTemplateForLanguagePair(
      state.selectedArticle.source_language,
      state.selectedArticle.native_language,
      type,
      template
    )
    
    // 触发重新渲染 - 但不需要在Store中存储巨大对象
    set({ selectedArticle: { ...state.selectedArticle } })
  },
  
  resetPromptTemplates: () => {
    const state = get()
    if (!state.selectedArticle) return
    
    resetTemplateForLanguagePair(
      state.selectedArticle.source_language,
      state.selectedArticle.native_language
    )
    
      // 触发重新渲染
    set({ selectedArticle: { ...state.selectedArticle } })
  },
  
  // 优化后的AI Tooltips - 减少不必要的重渲染
  aiTooltips: [],
  
  addAITooltip: (tooltip) => {
    const id = `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tooltipCount = get().aiTooltips.length
    
    // Simple position offset strategy
    const offsetX = (tooltipCount % 3) * 50
    const offsetY = Math.floor(tooltipCount / 3) * 50
    
    const newTooltip: AITooltip = {
      ...tooltip,
      id,
      position: {
        x: tooltip.position.x + offsetX,
        y: tooltip.position.y + offsetY
      },
      createdAt: Date.now()
    }
    
    set((state) => ({
      aiTooltips: [...state.aiTooltips, newTooltip]
    }))
    
    return id
  },
  
  // 优化：更精确的tooltip更新，只更新必要字段
  updateAITooltip: (id, updates) => set((state) => {
    const tooltipIndex = state.aiTooltips.findIndex(tooltip => tooltip.id === id)
    if (tooltipIndex === -1) return state
    
    // 浅比较，如果没有实际变化就不更新
    const currentTooltip = state.aiTooltips[tooltipIndex]
    let hasChanges = false
    
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'position') {
        // 特殊处理position对象
        const pos = value as { x: number, y: number }
        if (currentTooltip.position.x !== pos.x || currentTooltip.position.y !== pos.y) {
          hasChanges = true
          break
        }
      } else if ((currentTooltip as any)[key] !== value) {
        hasChanges = true
        break
      }
    }
    
    if (!hasChanges) return state
    
    // 使用更高效的数组更新策略
    const newTooltips = [...state.aiTooltips]
    newTooltips[tooltipIndex] = { ...currentTooltip, ...updates }
    
    return { aiTooltips: newTooltips }
  }),
  
  removeAITooltip: (id) => set((state) => {
    const newTooltips = state.aiTooltips.filter(tooltip => tooltip.id !== id)
    // 避免不必要的状态更新
    if (newTooltips.length === state.aiTooltips.length) return state
    return { aiTooltips: newTooltips }
  }),
  
  clearAllTooltips: () => set((state) => 
    state.aiTooltips.length === 0 ? state : { aiTooltips: [] }
  ),
  
  // Email Selection
  selectedEmailContents: [],
  
  addToEmailSelection: (content) => set((state) => {
    const id = `email-content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date().toISOString()
    
    const newContent: SelectedEmailContent = {
      ...content,
      id,
      timestamp
    }
    
    return { selectedEmailContents: [...state.selectedEmailContents, newContent] }
  }),
  
  removeFromEmailSelection: (id) => set((state) => ({
    selectedEmailContents: state.selectedEmailContents.filter(content => content.id !== id)
  })),
  
  clearEmailSelection: () => set({ selectedEmailContents: [] }),
  
  showEmailPanel: false,
  setShowEmailPanel: (show) => set({ showEmailPanel: show }),
  
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