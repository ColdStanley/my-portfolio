
export interface ColumnCard {
  id: string
  type: 'info' | 'aitool'
  title?: string
  description?: string
  buttonName?: string
  promptText?: string
  generatedContent?: string
  options?: string[]  // Optional array of option values
  aiModel?: 'deepseek' | 'openai'  // AI model selection for aitool cards
  deleting?: boolean
  justCreated?: boolean
  isGenerating?: boolean  // AI generation state
}

export interface Column {
  id: string
  cards: ColumnCard[]
}