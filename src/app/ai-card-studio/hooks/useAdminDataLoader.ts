import { useState, useEffect } from 'react'
import { useAdminAuth } from './useAdminAuth'

interface UseAdminDataLoaderOptions {
  url: string
  autoLoad?: boolean
  refreshInterval?: number
}

interface UseAdminDataLoaderResult<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  setData: (data: T | null) => void
}

export function useAdminDataLoader<T = any>(
  options: UseAdminDataLoaderOptions
): UseAdminDataLoaderResult<T> {
  const { url, autoLoad = true, refreshInterval } = options
  const { makeAdminRequest } = useAdminAuth()
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!url) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await makeAdminRequest(url)
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error(`[useAdminDataLoader] Error loading from ${url}:`, err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    await loadData()
  }

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad) {
      loadData()
    }
  }, [url, autoLoad])

  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        loadData()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [refreshInterval, url])

  return {
    data,
    loading,
    error,
    refresh,
    setData
  }
}

// Specialized hooks for common admin data types
export function useAdminUsers() {
  return useAdminDataLoader<{ users: any[] }>({
    url: '/api/admin/users',
    autoLoad: true
  })
}

export function useAdminWorkspaces() {
  return useAdminDataLoader<{ workspaces: any[] }>({
    url: '/api/admin/workspaces', 
    autoLoad: true
  })
}

export function useAdminMarketplace() {
  return useAdminDataLoader<{ marketplace_items: any[] }>({
    url: '/api/admin/marketplace',
    autoLoad: true
  })
}

export function useAdminStats() {
  return useAdminDataLoader({
    url: '/api/admin/monitor/stats',
    autoLoad: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  })
}

export function useAdminLogs() {
  return useAdminDataLoader({
    url: '/api/admin/monitor/logs',
    autoLoad: true,
    refreshInterval: 10000 // Refresh every 10 seconds for real-time logs
  })
}