// 内容格式化缓存管理器
// 优化ArticleReader中的formatArticleContent性能

import { marked } from 'marked'
import type { Query } from '../store/useReadLinguaStore'

interface CacheEntry {
  contentHash: string
  queriesHash: string
  formattedContent: string
  timestamp: number
}

// 内存缓存，存储格式化后的内容
const contentCache = new Map<string, CacheEntry>()

// 缓存过期时间 (5分钟)
const CACHE_EXPIRY = 5 * 60 * 1000

// 最大缓存条目数
const MAX_CACHE_SIZE = 50

// 生成内容哈希
const generateContentHash = (content: string): string => {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

// 生成查询哈希（基于高亮信息）
const generateQueriesHash = (queries: Query[]): string => {
  const highlights = queries
    .filter(q => q.text_position && q.selected_text)
    .map(q => `${q.id}:${q.selected_text}:${q.text_position?.highlight_id}`)
    .sort()
    .join('|')
  
  return generateContentHash(highlights)
}

// 清理过期缓存
const cleanupExpiredCache = () => {
  const now = Date.now()
  for (const [key, entry] of contentCache.entries()) {
    if (now - entry.timestamp > CACHE_EXPIRY) {
      contentCache.delete(key)
    }
  }
}

// 如果缓存过大，移除最老的条目
const evictOldestEntries = () => {
  if (contentCache.size <= MAX_CACHE_SIZE) return

  const entries = Array.from(contentCache.entries())
    .sort((a, b) => a[1].timestamp - b[1].timestamp)

  const toRemove = entries.slice(0, contentCache.size - MAX_CACHE_SIZE)
  toRemove.forEach(([key]) => contentCache.delete(key))
}

// 处理Markdown内容（可缓存）
const processMarkdown = (content: string): string => {
  try {
    // Configure marked options for better rendering
    return marked.parse(content, {
      breaks: true,        // Convert line breaks to <br>
      gfm: true,          // GitHub Flavored Markdown
    })
  } catch (error) {
    console.warn('Markdown parsing failed, using plain text:', error)
    // Fallback: convert line breaks manually if markdown parsing fails
    return content
      .replace(/\n\n+/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p class="mb-4">')
      .replace(/$/, '</p>')
  }
}

// 应用高亮到内容（可缓存）
const applyHighlights = (content: string, queries: Query[]): string => {
  let processedContent = content
  const highlights = queries.filter(q => q.text_position && q.selected_text)
  
  // Apply highlights by finding text matches instead of using positions
  highlights.forEach((query) => {
    if (query.selected_text && query.text_position?.highlight_id) {
      const searchText = query.selected_text.trim()
      if (searchText && processedContent.includes(searchText)) {
        const highlightSpan = `<span class="article-highlight cursor-pointer" data-highlight-id="${query.text_position.highlight_id}" data-query-id="${query.id}">${searchText}</span>`
        // Only replace the first occurrence to avoid duplicates
        processedContent = processedContent.replace(searchText, highlightSpan)
      }
    }
  })

  return processedContent
}

// 主要的内容格式化函数 - 带缓存
export const formatArticleContent = (
  articleId: string, 
  rawContent: string, 
  queries: Query[]
): string => {
  // 定期清理过期缓存
  cleanupExpiredCache()

  const contentHash = generateContentHash(rawContent)
  const queriesHash = generateQueriesHash(queries)
  const cacheKey = `${articleId}:${contentHash}:${queriesHash}`

  // 检查缓存
  const cachedEntry = contentCache.get(cacheKey)
  if (cachedEntry && 
      cachedEntry.contentHash === contentHash && 
      cachedEntry.queriesHash === queriesHash) {
    // 更新访问时间
    cachedEntry.timestamp = Date.now()
    return cachedEntry.formattedContent
  }

  // 缓存未命中，处理内容
  
  // 1. 清理现有的HTML高亮
  let cleanContent = rawContent
    .replace(/<span[^>]*data-highlight-id[^>]*>([^<]*)<\/span>/g, '$1')
    .replace(/class="bg-purple-[^"]*"/g, '')
    .replace(/data-highlight-id="[^"]*"/g, '')
    .replace(/data-query-id="[^"]*"/g, '')

  // Remove any malformed HTML artifacts
  cleanContent = cleanContent
    .replace(/>\s*class="[^"]*"\s*</g, '><')
    .replace(/^\s*class="[^"]*"\s*/g, '')
    .replace(/\s*class="[^"]*"\s*$/g, '')

  // 2. 处理Markdown
  const markdownContent = processMarkdown(cleanContent)
  
  // 3. 应用高亮
  const finalContent = applyHighlights(markdownContent, queries)

  // 4. 存储到缓存
  evictOldestEntries() // 确保缓存大小在限制内
  
  const newEntry: CacheEntry = {
    contentHash,
    queriesHash,
    formattedContent: finalContent,
    timestamp: Date.now()
  }
  
  contentCache.set(cacheKey, newEntry)

  return finalContent
}

// 清除特定文章的缓存
export const clearArticleCache = (articleId: string) => {
  const keysToDelete = Array.from(contentCache.keys())
    .filter(key => key.startsWith(`${articleId}:`))
  
  keysToDelete.forEach(key => contentCache.delete(key))
}

// 清除所有缓存
export const clearAllCache = () => {
  contentCache.clear()
}

// 获取缓存统计信息
export const getCacheStats = () => {
  const now = Date.now()
  const expired = Array.from(contentCache.values())
    .filter(entry => now - entry.timestamp > CACHE_EXPIRY).length
    
  return {
    totalEntries: contentCache.size,
    expiredEntries: expired,
    validEntries: contentCache.size - expired,
    cacheHitRate: 0, // This would need to be tracked separately
    maxSize: MAX_CACHE_SIZE
  }
}