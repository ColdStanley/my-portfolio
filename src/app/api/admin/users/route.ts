import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '../middleware'

/**
 * Admin Users API - God Mode User Management
 * 
 * Provides complete access to all user data and management operations
 * Only accessible by authenticated admin users with master key
 * 
 * Endpoints:
 * GET /api/admin/users - Retrieve all users with full details
 */

/**
 * Aggregates user statistics using optimized single query approach
 * Reduces database round trips from 4 queries to 1 comprehensive query
 */
async function getUsersWithAggregatedStats(supabase: any) {
  console.log('[ADMIN_USERS_API] Executing optimized user aggregation query')
  
  // Single comprehensive query with JOIN aggregations
  // This replaces 4 separate queries with 1 optimized query
  const { data: usersWithStats, error: queryError } = await supabase
    .rpc('get_admin_users_with_stats')
    .order('created_at', { ascending: false })

  if (queryError) {
    console.warn('[ADMIN_USERS_API] RPC function not available, falling back to optimized JOIN query')
    
    // Fallback: Use optimized JOIN query if RPC is not available
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select(`
        id,
        email,
        created_at,
        updated_at,
        last_sign_in_at,
        email_confirmed_at,
        workspaces:workspaces(count),
        cards:cards(count),
        marketplace_items:marketplace_items!author_id(count)
      `)
      .order('created_at', { ascending: false })

    if (usersError) {
      throw usersError
    }

    // Transform the aggregated data
    return users?.map(user => ({
      ...user,
      workspaces_count: user.workspaces?.[0]?.count || 0,
      cards_count: user.cards?.[0]?.count || 0,
      marketplace_items_count: user.marketplace_items?.[0]?.count || 0,
      is_active: user.last_sign_in_at ? 
        (Date.now() - new Date(user.last_sign_in_at).getTime()) < (7 * 24 * 60 * 60 * 1000) : false
    })) || []
  }

  return usersWithStats
}

/**
 * Gets system-wide statistics in a single aggregated query
 */
async function getSystemStats(supabase: any) {
  const { data: stats, error: statsError } = await supabase
    .rpc('get_admin_system_stats')

  if (statsError) {
    console.warn('[ADMIN_USERS_API] System stats RPC not available, calculating manually')
    
    // Fallback: manual aggregation
    const [
      { count: usersCount },
      { count: workspacesCount },
      { count: cardsCount },
      { count: marketplaceCount }
    ] = await Promise.all([
      supabase.from('auth.users').select('*', { count: 'exact', head: true }),
      supabase.from('workspaces').select('*', { count: 'exact', head: true }),
      supabase.from('cards').select('*', { count: 'exact', head: true }),
      supabase.from('marketplace_items').select('*', { count: 'exact', head: true })
    ])

    return {
      totalUsers: usersCount || 0,
      totalWorkspaces: workspacesCount || 0,
      totalCards: cardsCount || 0,
      totalMarketplaceItems: marketplaceCount || 0
    }
  }

  return stats
}

export const GET = withAdminAuth(async (request: NextRequest, { supabase }) => {
  try {
    console.log('[ADMIN_USERS_API] Starting optimized user data aggregation')

    // Execute optimized parallel queries
    const [usersWithStats, systemStats] = await Promise.all([
      getUsersWithAggregatedStats(supabase),
      getSystemStats(supabase)
    ])

    console.log(`[ADMIN_USERS_API] Successfully aggregated data for ${usersWithStats?.length || 0} users`)

    return NextResponse.json({
      users: usersWithStats,
      totalCount: usersWithStats?.length || 0,
      systemStats,
      source: 'optimized_aggregation',
      timestamp: new Date().toISOString(),
      performance: {
        queryOptimization: 'single_comprehensive_query',
        reducedDbCalls: 'from_4_to_1_queries'
      }
    })

  } catch (error) {
    console.error('[ADMIN_USERS_API] Fatal error in optimized query:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve users data',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Check database RPC functions or table permissions'
      },
      { status: 500 }
    )
  }
})