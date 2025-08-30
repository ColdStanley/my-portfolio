export interface CardInfo {
  id: string
  buttonName: string
  generatedContent: string
  order: number
}

export interface CardContextType {
  cards: CardInfo[]
  addCard: (card: CardInfo) => void
  updateCard: (id: string, updates: Partial<CardInfo>) => void
  getCard: (id: string) => CardInfo | undefined
}

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
}

export interface Column {
  id: string
  cards: ColumnCard[]
}