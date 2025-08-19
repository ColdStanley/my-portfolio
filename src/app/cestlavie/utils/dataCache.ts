/**
 * Simple data cache utility for reducing loading times
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // time to live in milliseconds
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clear expired items
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const dataCache = new DataCache()

// Cache keys
export const CACHE_KEYS = {
  TASKS: 'cestlavie:tasks',
  STRATEGIES: 'cestlavie:strategies', 
  PLANS: 'cestlavie:plans',
  TASK_SCHEMA: 'cestlavie:task_schema'
} as const

// Auto cleanup every 10 minutes
setInterval(() => {
  dataCache.cleanup()
}, 10 * 60 * 1000)