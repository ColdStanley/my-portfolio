// 统一的类型定义文件
export interface CardItem {
  id: string
  title: string
  content: string
  subtext: string
  link: string
  imageUrl: string
  category: string
  slug: string
  section: string
  tech?: string[]
  pageId?: string
  visibleOnSite?: boolean
  status?: string
  order?: number
}

export interface HighlightItem {
  title: string
  description?: string
  slug?: string
  category?: string
  section?: string
  status?: string
  order?: number
  tag?: string[]
  visibleOnSite?: boolean
}

export interface NotionFile {
  name: string
  url: string
  type: string
}

export type CategoryType = 'technology' | 'knowledge' | 'life'

// API 响应类型
export interface NotionApiResponse<T> {
  data: T[]
  error?: string
}