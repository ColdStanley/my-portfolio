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
 * Optimized single query to get workspaces with user information
 * Replaces separate user lookup with JOIN operation
 */
async function getWorkspacesWithUserInfo(supabase: any, userId?: string) {
  console.log('[ADMIN_WORKSPACES_API] Executing optimized workspace query with JOIN')
  
  // Single optimized query with JOIN to get user info
  let query = supabase
    .from('workspaces')
    .select(`
      *,
      user_info:user_id!inner(
        id,
        email,
        created_at
      ),
      cards (
        id,
        title,
        content,
        type,
        position,
        password_hash,
        created_at,
        updated_at,
        column_id
      )
    `)
    .order('created_at', { ascending: false })

  // Apply user filter if specified
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data: workspaces, error: workspacesError } = await query

  if (workspacesError) {
    console.error('[ADMIN_WORKSPACES_API] Optimized query failed:', workspacesError)
    throw workspacesError
  }

  return workspaces
}

/**
 * Processes workspace data with enriched analytics
 */
function enrichWorkspacesData(workspaces: any[]) {
  return workspaces?.map(workspace => {
    const cardAnalysis = analyzeWorkspaceCards(workspace.cards)
    
    return {
      ...workspace,
      user_info: {
        email: workspace.user_info?.email || 'Unknown',
        user_created_at: workspace.user_info?.created_at || null
      },
      card_analysis: cardAnalysis,
      security_info: cardAnalysis.securityFlags,
      raw_workspace_data: workspace
    }
  }) || []
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
      sensitiveContentWorkspaces: enrichedWorkspaces.filter(ws => 
        ws.security_info.potentially_sensitive).length
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