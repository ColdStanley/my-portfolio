import { Article, Query } from '../store/useArticleStore'

// ==================== Article API ====================

export const articleApi = {
  // 创建文章
  async createArticle(data: {
    user_id: string
    title: string
    content: string
    article_language: string
    mother_tongue: string
  }): Promise<Article> {
    const response = await fetch('/api/article2learn/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create article')
    }

    const result = await response.json()
    return result.article
  },

  // 获取用户文章列表
  async getArticles(userId: string): Promise<Article[]> {
    const response = await fetch(`/api/article2learn/articles?user_id=${userId}`)

    if (!response.ok) {
      throw new Error('Failed to fetch articles')
    }

    const result = await response.json()
    return result.articles
  },

  // 删除文章
  async deleteArticle(id: string, userId: string): Promise<void> {
    const response = await fetch(
      `/api/article2learn/articles?id=${id}&user_id=${userId}`,
      {
        method: 'DELETE',
      }
    )

    if (!response.ok) {
      throw new Error('Failed to delete article')
    }
  },
}

// ==================== Query API ====================

export const queryApi = {
  // 创建查询记录
  async createQuery(data: {
    article_id: string
    user_id: string
    selected_text: string
    prompt_type: string
    prompt_label: string
    ai_response: string
    article_language: string
    mother_tongue: string
  }): Promise<Query> {
    const response = await fetch('/api/article2learn/queries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create query')
    }

    const result = await response.json()
    return result.query
  },

  // 获取文章的查询历史
  async getQueries(articleId: string, userId: string): Promise<Query[]> {
    const response = await fetch(
      `/api/article2learn/queries?article_id=${articleId}&user_id=${userId}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch queries')
    }

    const result = await response.json()
    return result.queries
  },

  // 删除查询记录
  async deleteQuery(id: string, userId: string): Promise<void> {
    const response = await fetch(
      `/api/article2learn/queries?id=${id}&user_id=${userId}`,
      {
        method: 'DELETE',
      }
    )

    if (!response.ok) {
      throw new Error('Failed to delete query')
    }
  },
}

// ==================== AI Query API ====================

export const aiApi = {
  // 流式 AI 查询
  async processQueryStream(
    data: {
      selected_text: string
      prompt_template: string
    },
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/article2learn/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('AI query failed')
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

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

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
            } catch {
              // Skip malformed data
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error')
    }
  },
}

// ==================== Prompts API ====================

export const promptsApi = {
  // 获取激活的 Prompts
  async getActivePrompts(): Promise<
    Array<{
      name: string
      promptType: string
      promptTemplate: string
      sortOrder: number
      articleLanguage: string
      motherTongue: string
    }>
  > {
    const response = await fetch('/api/article2learn/prompts')

    if (!response.ok) {
      throw new Error('Failed to fetch prompts')
    }

    const result = await response.json()
    return result.prompts
  },

  // 获取语言选项
  async getLanguageOptions(): Promise<{
    articleLanguages: string[]
    motherTongues: string[]
  }> {
    const response = await fetch('/api/article2learn/languages')

    if (!response.ok) {
      throw new Error('Failed to fetch language options')
    }

    return await response.json()
  },
}
