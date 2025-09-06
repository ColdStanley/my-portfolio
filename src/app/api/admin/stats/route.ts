import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '../middleware'

/**
 * Admin System Statistics API - Unified Performance-Optimized Endpoint
 * 
 * Replaces multiple API calls with a single, comprehensive statistics endpoint
 * Utilizes the get_system_stats() RPC function for optimal database performance
 * 
 * Performance Benefits:
 * - Single database call instead of 3+ separate API requests
 * - Pre-aggregated data eliminating frontend computation
 * - Optimized SQL with JOINs and efficient filtering
 * 
 * Endpoint: GET /api/admin/stats
 */

/**
 * Fallback data aggregation for when RPC function is not available
 * Maintains backward compatibility during database migration
 */
async function getFallbackStats(supabase: any) {
  console.log('[ADMIN_STATS] Using fallback aggregation method')
  
  try {
    // Execute optimized parallel queries with JOINs
    const [usersResponse, contentResponse, marketplaceResponse] = await Promise.all([
      // Optimized user statistics query
      supabase
        .from('auth.users')
        .select(`
          id,
          email, 
          created_at,
          is_active,
          cards_count,
          marketplace_items_count
        `)
        .order('created_at', { ascending: false }),
      
      // Optimized content statistics with JOIN
      supabase
        .from('workspaces')
        .select(`
          id,
          name,
          created_at,
          cards (
            id,
            type,
            password_hash,
            created_at
          )
        `),
      
      // Optimized marketplace statistics with author info
      supabase
        .from('marketplace_items')
        .select(`
          id,
          name,
          downloads,
          is_featured,
          created_at,
          author:author_id (
            email
          )
        `)
        .order('downloads', { ascending: false })
    ])

    const users = usersResponse.data || []
    const workspaces = contentResponse.data || []
    const marketplaceItems = marketplaceResponse.data || []

    // User statistics calculation
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const userStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      newThisWeek: users.filter(u => new Date(u.created_at) > weekAgo).length,
      topUsers: users
        .sort((a, b) => (b.cards_count + b.marketplace_items_count) - (a.cards_count + a.marketplace_items_count))
        .slice(0, 5)
        .map(u => ({
          email: u.email,
          cards: u.cards_count || 0,
          downloads: u.marketplace_items_count || 0
        }))
    }

    // Content statistics calculation
    const allCards = workspaces.flatMap(w => w.cards || [])
    const cardTypes = allCards.reduce((acc, card) => {
      acc[card.type] = (acc[card.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const contentStats = {
      totalWorkspaces: workspaces.length,
      totalCards: allCards.length,
      passwordProtectedCards: allCards.filter(c => c.password_hash).length,
      cardTypes: {
        'ai-tool': cardTypes['ai-tool'] || 0,
        'info': cardTypes['info'] || 0,
        'note': cardTypes['note'] || 0,
        'other': Object.keys(cardTypes).filter(k => !['ai-tool', 'info', 'note'].includes(k)).reduce((sum, k) => sum + cardTypes[k], 0)
      }
    }

    // Marketplace statistics calculation
    const totalDownloads = marketplaceItems.reduce((sum, item) => sum + (item.downloads || 0), 0)
    const averageDownloads = marketplaceItems.length > 0 ? totalDownloads / marketplaceItems.length : 0

    const authorStats = marketplaceItems.reduce((acc, item) => {
      const email = item.author?.email || 'Unknown'
      if (!acc[email]) {
        acc[email] = { email, items: 0, totalDownloads: 0 }
      }
      acc[email].items += 1
      acc[email].totalDownloads += item.downloads || 0
      return acc
    }, {} as Record<string, any>)

    const marketplaceStats = {
      totalItems: marketplaceItems.length,
      totalDownloads,
      averageDownloads,
      featuredItems: marketplaceItems.filter(item => item.is_featured).length,
      topItems: marketplaceItems
        .slice(0, 5)
        .map(item => ({
          name: item.name,
          downloads: item.downloads || 0,
          author: item.author?.email || 'Unknown'
        })),
      topAuthors: Object.values(authorStats)
        .sort((a: any, b: any) => b.totalDownloads - a.totalDownloads)
        .slice(0, 10)
    }

    return {
      users: userStats,
      content: contentStats,
      marketplace: marketplaceStats,
      performance: {
        lastUpdated: new Date().toISOString(),
        queryExecutionTime: Date.now(),
        databaseHealth: 'FALLBACK_MODE',
        systemVersion: '2.0.0-fallback'
      },
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('[ADMIN_STATS] Fallback aggregation failed:', error)
    throw error
  }
}

export const GET = withAdminAuth(async (request: NextRequest, { supabase, user }) => {
  const startTime = Date.now()
  
  try {
    console.log(`[ADMIN_STATS] Admin ${user.email} requesting comprehensive system statistics`)

    let stats: any

    try {
      // Primary method: Use optimized RPC function
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_system_stats')

      if (rpcError || !rpcData) {
        console.warn('[ADMIN_STATS] RPC function unavailable, using fallback:', rpcError?.message)
        stats = await getFallbackStats(supabase)
      } else {
        console.log('[ADMIN_STATS] Successfully retrieved stats via RPC function')
        stats = rpcData
        
        // Add performance metrics
        stats.performance = {
          ...stats.performance,
          queryExecutionTime: Date.now() - startTime,
          method: 'RPC_OPTIMIZED'
        }
      }
    } catch (rpcError) {
      console.warn('[ADMIN_STATS] RPC function failed, using fallback:', rpcError)
      stats = await getFallbackStats(supabase)
      
      // Add fallback performance metrics
      stats.performance = {
        ...stats.performance,
        queryExecutionTime: Date.now() - startTime,
        method: 'FALLBACK_AGGREGATION'
      }
    }

    // Add admin metadata
    const responseData = {
      ...stats,
      admin_metadata: {
        requested_by: user.email,
        request_timestamp: new Date().toISOString(),
        response_time: Date.now() - startTime,
        api_version: '2.0.0',
        optimization_level: 'PRODUCTION'
      }
    }

    console.log(`[ADMIN_STATS] Statistics compiled successfully in ${Date.now() - startTime}ms`)

    return NextResponse.json(responseData)

  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error('[ADMIN_STATS] Failed to retrieve system statistics:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve system statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
        execution_time: executionTime,
        fallback_attempted: true
      },
      { status: 500 }
    )
  }
})

// Disable other HTTP methods
export const POST = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to retrieve system statistics.' },
    { status: 405 }
  )
}

export const PUT = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to retrieve system statistics.' },
    { status: 405 }
  )
}

export const DELETE = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET to retrieve system statistics.' },
    { status: 405 }
  )
}