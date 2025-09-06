'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'

/**
 * System Stats Module - Comprehensive Analytics Dashboard
 * 
 * Displays detailed statistics and analytics about the AI Card Studio system
 * Provides insights into user behavior, system performance, and business metrics
 */

interface SystemStats {
  users: {
    total: number
    active: number
    newThisWeek: number
    topUsers: Array<{ email: string; cards: number; downloads: number }>
  }
  marketplace: {
    totalItems: number
    totalDownloads: number
    averageDownloads: number
    topItems: Array<{ name: string; downloads: number; author: string }>
    topAuthors: Array<{ email: string; items: number; totalDownloads: number }>
  }
  content: {
    totalWorkspaces: number
    totalCards: number
    passwordProtectedCards: number
    cardTypes: Record<string, number>
  }
}

export default function SystemStatsModule() {
  const { makeAdminRequest } = useAdminAuth()
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  /**
   * Load comprehensive system statistics from optimized backend API
   * Replaces 3 API calls + frontend aggregation with single optimized call
   */
  const loadSystemStats = async () => {
    setLoading(true)
    try {
      console.log('[SYSTEM_STATS] Loading statistics from optimized backend API')
      
      // Single API call to get all pre-aggregated statistics
      const response = await makeAdminRequest('/api/admin/stats')
      const data = await response.json()

      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to load statistics')
      }

      // Transform backend data to match frontend interface
      // All aggregation is now done on the backend for optimal performance
      setStats({
        users: {
          total: data.users?.totalUsers || 0,
          active: data.users?.activeUsers || 0,
          newThisWeek: data.users?.newThisWeek || 0,
          topUsers: data.users?.topUsers || []
        },
        marketplace: {
          totalItems: data.marketplace?.totalItems || 0,
          totalDownloads: data.marketplace?.totalDownloads || 0,
          averageDownloads: data.marketplace?.averageDownloads || 0,
          topItems: data.marketplace?.topItems || [],
          topAuthors: data.marketplace?.topAuthors || []
        },
        content: {
          totalWorkspaces: data.content?.totalWorkspaces || 0,
          totalCards: data.content?.totalCards || 0,
          passwordProtectedCards: data.content?.passwordProtectedCards || 0,
          cardTypes: data.content?.cardTypes || {}
        }
      })

      setLastUpdated(new Date())
      
      console.log(`[SYSTEM_STATS] Statistics loaded successfully via optimized backend (${data.admin_metadata?.response_time}ms)`)
      
    } catch (error) {
      console.error('[SYSTEM_STATS] Failed to load statistics:', error)
      // Set empty state on error rather than keeping stale data
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  // Load stats on component mount
  useEffect(() => {
    loadSystemStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">📊</span>
            System Statistics
          </h2>
          <p className="text-gray-400 mt-1">Loading comprehensive system analytics...</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-gray-400">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Loading analytics...
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p>Failed to load system statistics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">📊</span>
            System Statistics Dashboard
          </h2>
          <p className="text-gray-400 mt-1">
            Comprehensive analytics and insights • Last updated: {lastUpdated?.toLocaleString()}
          </p>
        </div>
        <button
          onClick={loadSystemStats}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.users.total, change: `+${stats.users.newThisWeek} this week`, color: 'text-blue-400' },
          { label: 'Total Cards', value: stats.content.totalCards, change: `${stats.content.passwordProtectedCards} protected`, color: 'text-green-400' },
          { label: 'Marketplace Items', value: stats.marketplace.totalItems, change: `${stats.marketplace.totalDownloads} downloads`, color: 'text-purple-400' },
          { label: 'Active Users', value: stats.users.active, change: `${((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total`, color: 'text-yellow-400' }
        ].map((metric, index) => (
          <div key={index} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
            <div className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value.toLocaleString()}</div>
            <div className="text-white font-medium mb-1">{metric.label}</div>
            <div className="text-gray-400 text-sm">{metric.change}</div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <span>👥</span>
            User Analytics
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Total Registered</span>
              <span className="text-white font-medium">{stats.users.total}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Active Users</span>
              <span className="text-green-400 font-medium">{stats.users.active}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">New This Week</span>
              <span className="text-blue-400 font-medium">+{stats.users.newThisWeek}</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Top Active Users</h4>
            <div className="space-y-2">
              {stats.users.topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white">
                      {index + 1}
                    </div>
                    <span className="text-gray-300 text-sm truncate">{user.email}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.cards} cards
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Marketplace Analytics */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <span>🛍️</span>
            Marketplace Analytics
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Total Items</span>
              <span className="text-white font-medium">{stats.marketplace.totalItems}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Total Downloads</span>
              <span className="text-green-400 font-medium">{stats.marketplace.totalDownloads.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Avg Downloads/Item</span>
              <span className="text-yellow-400 font-medium">{stats.marketplace.averageDownloads.toFixed(1)}</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Most Downloaded Items</h4>
            <div className="space-y-2">
              {stats.marketplace.topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-gray-300 text-sm truncate">{item.name}</div>
                      <div className="text-gray-500 text-xs">by {item.author}</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-400 font-medium">
                    {item.downloads} downloads
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Analytics */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <span>📝</span>
            Content Analytics
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Total Workspaces</span>
              <span className="text-white font-medium">{stats.content.totalWorkspaces}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Total Cards</span>
              <span className="text-white font-medium">{stats.content.totalCards.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Protected Cards</span>
              <span className="text-red-400 font-medium">
                {stats.content.passwordProtectedCards} ({((stats.content.passwordProtectedCards / stats.content.totalCards) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Card Type Distribution</h4>
            <div className="space-y-3">
              {Object.entries(stats.content.cardTypes).map(([type, count]) => {
                const percentage = (count / stats.content.totalCards) * 100
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 capitalize">{type.replace('-', ' ')}</span>
                      <span className="text-gray-400">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Authors */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <span>🏆</span>
            Top Contributors
          </h3>
          
          <div className="space-y-3">
            {stats.marketplace.topAuthors.map((author, index) => (
              <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-yellow-900' :
                    index === 1 ? 'bg-gray-400 text-gray-900' :
                    index === 2 ? 'bg-amber-600 text-amber-900' :
                    'bg-gray-600 text-gray-200'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{author.email}</div>
                    <div className="text-gray-400 text-sm">{author.items} items published</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">{author.totalDownloads}</div>
                  <div className="text-gray-500 text-sm">downloads</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}