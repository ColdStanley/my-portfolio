import { Article, Query } from '../store/useReadLinguaStore'

// Article API calls
export const articleApi = {
  // Fetch user articles
  async getArticles(userId: string): Promise<Article[]> {
    const response = await fetch(`/api/readlingua/articles?user_id=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch articles')
    const data = await response.json()
    return data.articles
  },

  // Create new article
  async createArticle(articleData: {
    user_id: string
    title: string
    content: string
    source_language: string
    native_language: string
  }): Promise<Article> {
    const response = await fetch('/api/readlingua/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    })
    if (!response.ok) throw new Error('Failed to create article')
    const data = await response.json()
    return data.article
  },

  // Update article
  async updateArticle(articleData: {
    id: string
    user_id: string
    title?: string
    content?: string
    source_language?: string
    native_language?: string
  }): Promise<Article> {
    const response = await fetch('/api/readlingua/articles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    })
    if (!response.ok) throw new Error('Failed to update article')
    const data = await response.json()
    return data.article
  },

  // Delete article
  async deleteArticle(id: string, userId: string): Promise<void> {
    const response = await fetch(`/api/readlingua/articles?id=${id}&user_id=${userId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete article')
  }
}

// Query API calls
export const queryApi = {
  // Fetch queries for article
  async getQueries(articleId: string, userId: string): Promise<Query[]> {
    const response = await fetch(`/api/readlingua/queries?article_id=${articleId}&user_id=${userId}`)
    if (!response.ok) throw new Error('Failed to fetch queries')
    const data = await response.json()
    return data.queries
  },

  // Create new query
  async createQuery(queryData: {
    article_id: string
    user_id: string
    selected_text?: string
    query_type: string
    user_question?: string
    ai_response: string
    text_position?: {
      start: number
      end: number
      highlight_id: string
    }
  }): Promise<Query> {
    const response = await fetch('/api/readlingua/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryData)
    })
    if (!response.ok) throw new Error('Failed to create query')
    const data = await response.json()
    return data.query
  },

  // Delete query
  async deleteQuery(id: string, userId: string): Promise<void> {
    const response = await fetch(`/api/readlingua/queries?id=${id}&user_id=${userId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete query')
  }
}

// AI API calls
export const aiApi = {
  // Process AI query
  async processQuery(queryData: {
    selected_text?: string
    query_type: string
    user_question?: string
    source_language: string
    native_language: string
    ai_model?: 'deepseek' | 'openai'
    custom_prompt_template?: string
  }): Promise<{
    ai_response: string
    query_type: string
    selected_text?: string
    user_question?: string
    ai_model: string
    model_name: string
  }> {
    const response = await fetch('/api/readlingua/ai-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...queryData,
        ai_model: queryData.ai_model || 'deepseek' // Default to DeepSeek
      })
    })
    if (!response.ok) throw new Error('Failed to process AI query')
    return response.json()
  }
}