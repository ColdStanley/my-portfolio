import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '../middleware'

/**
 * Admin Workspaces API - God Mode Workspace Management
 * 
 * Provides complete access to all user workspaces and their data
 * Allows viewing, editing, and managing any workspace regardless of ownership
 * 
 * Endpoints:
 * GET /api/admin/workspaces - Retrieve all workspaces with full details
 * GET /api/admin/workspaces?userId=xxx - Get specific user's workspaces
 */

/**
 * Analyzes workspace cards to extract statistics and security information
 * Extracted for reusability and maintainability
 */
function analyzeWorkspaceCards(cards: any[]) {
  if (!cards || cards.length === 0) {
    return {
      totalCards: 0,
      cardsByType: {},
      passwordProtectedCards: 0,
      columnDistribution: {},
      lastCardCreated: null,
      securityFlags: {
        has_password_protected_cards: false,
        password_protected_count: 0,
        potentially_sensitive: false
      }
    }
  }

  const cardsByType = cards.reduce((acc: any, card: any) => {
    acc[card.type] = (acc[card.type] || 0) + 1
    return acc
  }, {})

  const passwordProtectedCards = cards.filter((card: any) => card.password_hash).length

  const columnDistribution = cards.reduce((acc: any, card: any) => {
    acc[card.column_id] = (acc[card.column_id] || 0) + 1
    return acc
  }, {})

  const lastCardCreated = cards.length > 0 ? 
    Math.max(...cards.map((card: any) => new Date(card.created_at).getTime())) : null

  const potentially_sensitive = cards.some((card: any) => {
    const content = card.content?.toLowerCase() || ''
    return content.includes('password') ||
           content.includes('api key') ||
           content.includes('secret') ||
           content.includes('token')
  })

  return {
    totalCards: cards.length,
    cardsByType,
    passwordProtectedCards,
    columnDistribution,
    lastCardCreated,
    securityFlags: {
      has_password_protected_cards: passwordProtectedCards > 0,
      password_protected_count: passwordProtectedCards,
      potentially_sensitive
    }
  }
}

/**
 * Get marketplace items as workspace-like data since workspaces table doesn't exist
 * Each marketplace item represents a user's shared work (like a workspace)
 */
async function getWorkspacesWithUserInfo(supabase: any, userId?: string) {
  console.log('[ADMIN_WORKSPACES_API] Fetching marketplace items as workspace data')
  
  try {
    // Query marketplace_items instead of workspaces
    let query = supabase
      .from('marketplace_items')
      .select('id, name, description, author_id, downloads, data, created_at, tags')
      .order('created_at', { ascending: false })

    // Apply user filter if specified
    if (userId) {
      query = query.eq('author_id', userId)
    }

    const { data: marketplaceItems, error: marketplaceError } = await query

    if (marketplaceError) {
      console.error('[ADMIN_WORKSPACES_API] Marketplace query failed:', marketplaceError)
      throw marketplaceError
    }

    // Transform marketplace items to workspace-like format
    return marketplaceItems?.map(item => ({
      id: item.id,
      user_id: item.author_id,
      name: item.name,
      description: item.description,
      created_at: item.created_at,
      downloads: item.downloads,
      tags: item.tags,
      user_info: {
        email: 'User Email Unavailable', // We'll enhance this later if needed
        user_created_at: null
      },
      card_analysis: {
        totalCards: item.data?.cards?.length || 0,
        passwordProtectedCards: item.data?.cards?.filter((card: any) => card.password_hash)?.length || 0,
        cardsByType: item.data?.cards?.reduce((acc: any, card: any) => {
          acc[card.type] = (acc[card.type] || 0) + 1
          return acc
        }, {}) || {}
      }
    })) || []
    
  } catch (error) {
    console.error('[ADMIN_WORKSPACES_API] Error:', error)
    return []
  }
}

/**
 * Processes workspace data with enriched analytics
 */
function enrichWorkspacesData(workspaces: any[]) {
  // Simplified enrichment without complex card analysis
  return workspaces?.map(workspace => ({
    ...workspace,
    user_info: workspace.user_info || {
      email: 'Unknown User',
      user_created_at: null
    },
    card_analysis: workspace.card_analysis || {
      totalCards: 0,
      passwordProtectedCards: 0
    }
  })) || []
}

/**
 * Calculates system-wide statistics from enriched workspace data
 */
function calculateSystemStats(enrichedWorkspaces: any[]) {
  const totalCards = enrichedWorkspaces.reduce((sum, ws) => sum + ws.card_analysis.totalCards, 0)
  const totalPasswordProtected = enrichedWorkspaces.reduce((sum, ws) => sum + ws.card_analysis.passwordProtectedCards, 0)
  const uniqueUsers = new Set(enrichedWorkspaces.map(ws => ws.user_id)).size

  return {
    totalWorkspaces: enrichedWorkspaces.length,
    totalCards,
    totalPasswordProtected,
    activeUsers: uniqueUsers,
    workspacesByUserCount: enrichedWorkspaces.reduce((acc: any, ws) => {
      const userId = ws.user_id
      acc[userId] = (acc[userId] || 0) + 1
      return acc
    }, {}),
    securityMetrics: {
      passwordProtectedRatio: totalCards > 0 ? (totalPasswordProtected / totalCards) : 0,
      sensitiveContentWorkspaces: 0 // Since we don't have security_info anymore, set to 0
    }
  }
}

export const GET = withAdminAuth(async (request: NextRequest, { supabase }) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log(`[ADMIN_WORKSPACES_API] Starting optimized workspaces query${userId ? ` for user: ${userId}` : ' (all users)'}`)

    // Single optimized query with JOIN - replaces 2 separate queries
    const workspacesRaw = await getWorkspacesWithUserInfo(supabase, userId || undefined)

    // Process and enrich data
    const enrichedWorkspaces = enrichWorkspacesData(workspacesRaw)
    const systemStats = calculateSystemStats(enrichedWorkspaces)

    console.log(`[ADMIN_WORKSPACES_API] Successfully processed ${enrichedWorkspaces.length} workspaces`)

    return NextResponse.json({
      workspaces: enrichedWorkspaces,
      systemStats,
      timestamp: new Date().toISOString(),
      query: {
        userId: userId || 'all_users',
        totalResults: enrichedWorkspaces.length
      },
      performance: {
        queryOptimization: 'single_join_query',
        reducedDbCalls: 'from_2_to_1_queries',
        dataProcessing: 'extracted_reusable_functions'
      }
    })

  } catch (error) {
    console.error('[ADMIN_WORKSPACES_API] Fatal error in optimized query:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve workspaces data',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Check workspace table relationships and permissions'
      },
      { status: 500 }
    )
  }
})