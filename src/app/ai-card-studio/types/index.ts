
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
  urls?: string[]  // n8n workflow URLs for info cards
  isLocked?: boolean  // Card lock status
  passwordHash?: string  // Hashed password for locked cards
}

export interface Column {
  id: string
  cards: ColumnCard[]
}

export interface Canvas {
  id: string
  name: string
  columns: Column[]
}

export interface MarketplaceItem {
  id: string
  name: string
  description: string
  data: Column
  content_hash: string
  author_id: string
  author_name: string
  downloads: number
  tags: string[]
  created_at: string
}

export interface MarketplaceListItem {
  id: string
  name: string
  description: string
  author_id: string
  author_name: string
  downloads: number
  tags: string[]
  created_at: string
}

export interface MarketplacePagination {
  page: number
  limit: number
  total: number
  totalPages: number
}