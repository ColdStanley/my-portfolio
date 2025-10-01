import { Article, Query } from '../store/useReadLinguaStore'

// Article API calls
export const articleApi = {
  // Fetch user articles with optional language filters
  async getArticles(userId: string, filters?: {
    source_language?: string
    native_language?: string
  }): Promise<Article[]> {
    const params = new URLSearchParams({ user_id: userId })
    if (filters?.source_language) params.append('source_language', filters.source_language)
    if (filters?.native_language) params.append('native_language', filters.native_language)
    
    const response = await fetch(`/api/readlingua/articles?${params.toString()}`)
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
  // Process AI query with streaming
  async processQueryStream(
    queryData: {
      selected_text?: string
      query_type: string
      user_question?: string
      source_language: string
      native_language: string
      ai_model?: 'deepseek' | 'openai'
      custom_prompt_template?: string
    },
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/readlingua/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...queryData,
          ai_model: queryData.ai_model || 'deepseek' // Default to DeepSeek
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process AI query')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'chunk') {
                onChunk(data.content)
              } else if (data.type === 'complete') {
                onComplete(data.full_response)
                return
              } else if (data.type === 'error') {
                onError(data.error)
                return
              }
            } catch (parseError) {
              // Skip malformed data
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error)
      onError(error instanceof Error ? error.message : 'Unknown error')
    }
  },

  // Legacy method for backward compatibility (non-streaming)
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
    return new Promise((resolve, reject) => {
      let fullResponse = ''

      this.processQueryStream(
        queryData,
        (chunk) => {
          fullResponse += chunk
        },
        (complete) => {
          resolve({
            ai_response: complete,
            query_type: queryData.query_type,
            selected_text: queryData.selected_text,
            user_question: queryData.user_question,
            ai_model: queryData.ai_model || 'deepseek',
            model_name: queryData.ai_model === 'openai' ? 'OpenAI GPT-4' : 'DeepSeek'
          })
        },
        (error) => {
          reject(new Error(error))
        }
      )
    })
  }
}

// Email API calls
export const emailApi = {
  // Send selected content via email
  async sendSelectedContent(data: {
    selectedContents: any[]
    userEmail: string
  }): Promise<void> {
    const response = await fetch('/api/readlingua/send-selected-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to send email')
  }
}

// Text-to-Speech API calls
export const ttsApi = {
  // Get pronunciation audio
  async getPronunciation(text: string, language: string): Promise<Blob> {
    const response = await fetch('/api/readlingua/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language })
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to generate pronunciation')
    }
    return await response.blob()
  }
}