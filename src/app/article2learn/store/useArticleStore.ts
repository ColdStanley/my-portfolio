import { create } from 'zustand'

export interface Article {
  id: string
  user_id: string
  title: string
  content: string
  article_language: string
  mother_tongue: string
  created_at: string
  updated_at: string
}

export interface Query {
  id: string
  article_id: string
  user_id: string
  selected_text: string
  prompt_type: string
  prompt_label: string
  ai_response: string
  article_language: string
  mother_tongue: string
  created_at: string
}

interface ArticleStoreState {
  // 当前文章
  currentArticle: Article | null
  setCurrentArticle: (article: Article | null) => void

  // 查询历史
  queries: Query[]
  setQueries: (queries: Query[]) => void
  addQuery: (query: Query) => void
  removeQuery: (queryId: string) => void

  // UI 状态
  isLearningMode: boolean
  setIsLearningMode: (mode: boolean) => void

  showAIModal: boolean
  setShowAIModal: (show: boolean) => void

  showSettings: boolean
  setShowSettings: (show: boolean) => void

  showArticleHistoryModal: boolean
  setShowArticleHistoryModal: (show: boolean) => void

  showSettingsTooltip: boolean
  setShowSettingsTooltip: (show: boolean) => void

  activeTab: 'article' | 'history' | 'quiz'
  setActiveTab: (tab: 'article' | 'history' | 'quiz') => void

  // 查询历史视图模式
  viewMode: 'card' | 'table'
  setViewMode: (mode: 'card' | 'table') => void

  // Loading 状态
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // 临时存储（用于 AI 查询）
  selectedText: string
  setSelectedText: (text: string) => void

  selectedPrompt: {
    name: string
    promptType: string
    promptTemplate: string
    sortOrder: number
    articleLanguage: string
    motherTongue: string
  } | null
  setSelectedPrompt: (
    prompt: {
      name: string
      promptType: string
      promptTemplate: string
      sortOrder: number
      articleLanguage: string
      motherTongue: string
    } | null
  ) => void

  // 语言选择
  availableArticleLanguages: string[]
  setAvailableArticleLanguages: (languages: string[]) => void

  availableMotherTongues: string[]
  setAvailableMotherTongues: (languages: string[]) => void

  // 高亮单词
  highlightedWords: Map<string, Query[]>
  addHighlightedWord: (word: string, query: Query) => void
  clearHighlights: () => void

  // 历史 Popover 状态
  showHistoryPopover: boolean
  setShowHistoryPopover: (show: boolean) => void
  historyPopoverWord: string
  setHistoryPopoverWord: (word: string) => void
}

export const useArticleStore = create<ArticleStoreState>((set) => ({
  // 文章状态
  currentArticle: null,
  setCurrentArticle: (article) => set({ currentArticle: article }),

  // 查询历史
  queries: [],
  setQueries: (queries) => set({ queries }),
  addQuery: (query) =>
    set((state) => {
      // 检查是否已存在相同 ID 的 query（更新场景）
      const existingIndex = state.queries.findIndex((q) => q.id === query.id)

      if (existingIndex !== -1) {
        // 更新现有记录并移到最前面
        const newQueries = [...state.queries]
        newQueries.splice(existingIndex, 1)
        return { queries: [query, ...newQueries] }
      } else {
        // 新增记录
        return { queries: [query, ...state.queries] }
      }
    }),
  removeQuery: (queryId) =>
    set((state) => ({
      queries: state.queries.filter((q) => q.id !== queryId),
    })),

  // UI 状态
  isLearningMode: false,
  setIsLearningMode: (mode) => set({ isLearningMode: mode }),

  showAIModal: false,
  setShowAIModal: (show) => set({ showAIModal: show }),

  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),

  showArticleHistoryModal: false,
  setShowArticleHistoryModal: (show) => set({ showArticleHistoryModal: show }),

  showSettingsTooltip: false,
  setShowSettingsTooltip: (show) => set({ showSettingsTooltip: show }),

  activeTab: 'article',
  setActiveTab: (tab) => set({ activeTab: tab }),

  viewMode: 'card',
  setViewMode: (mode) => set({ viewMode: mode }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // 临时存储
  selectedText: '',
  setSelectedText: (text) => set({ selectedText: text }),

  selectedPrompt: null,
  setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),

  // 语言选择选项
  availableArticleLanguages: [],
  setAvailableArticleLanguages: (languages) => set({ availableArticleLanguages: languages }),

  availableMotherTongues: [],
  setAvailableMotherTongues: (languages) => set({ availableMotherTongues: languages }),

  // 高亮单词
  highlightedWords: new Map<string, Query[]>(),
  addHighlightedWord: (word, query) =>
    set((state) => {
      const newMap = new Map(state.highlightedWords)
      const normalizedWord = word.toLowerCase()
      const existing = newMap.get(normalizedWord) || []
      newMap.set(normalizedWord, [...existing, query])
      return { highlightedWords: newMap }
    }),
  clearHighlights: () => set({ highlightedWords: new Map() }),

  // 历史 Popover 状态
  showHistoryPopover: false,
  setShowHistoryPopover: (show) => set({ showHistoryPopover: show }),
  historyPopoverWord: '',
  setHistoryPopoverWord: (word) => set({ historyPopoverWord: word }),
}))
