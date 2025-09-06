import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '../middleware'

/**
 * Admin Marketplace API - God Mode Marketplace Management
 * 
 * Provides complete control over marketplace content
 * Allows viewing, editing, deleting any marketplace item regardless of ownership
 * 
 * Endpoints:
 * GET /api/admin/marketplace - Retrieve all marketplace items with admin details
 * POST /api/admin/marketplace/bulk-action - Perform bulk operations
 */

/**
 * Analyzes marketplace content structure and extracts metadata
 * Extracted for reusability and maintainability
 */
function analyzeMarketplaceContent(content: any) {
  if (!content) {
    return { error: 'No content provided' }
  }

  try {
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content

    const cards = parsedContent?.cards || []
    const columns = parsedContent?.columns || []

    // Analyze card types distribution
    const cardTypes = cards.reduce((acc: any, card: any) => {
      acc[card.type] = (acc[card.type] || 0) + 1
      return acc
    }, {})

    // Check for password protected content
    const hasPasswordProtected = cards.some((card: any) => card.passwordHash)

    // Calculate content size
    const contentSize = JSON.stringify(parsedContent).length

    return {
      cardCount: cards.length,
      columnCount: columns.length,
      hasPasswordProtected,
      contentSize,
      cardTypes,
      complexity: {
        isSimple: cards.length <= 5 && columns.length <= 3,
        isComplex: cards.length > 20 || columns.length > 10,
        hasMixedTypes: Object.keys(cardTypes).length > 2
      }
    }
  } catch (error) {
    console.warn('[MARKETPLACE_CONTENT_ANALYZER] Failed to parse content:', error)
    return { error: 'Failed to parse content', details: error }
  }
}

/**
 * Generates admin metadata for marketplace items
 * Includes content warnings, moderation flags, and feature recommendations
 */
function generateAdminMetadata(item: any, contentAnalysis: any) {
  const isLargeContent = contentAnalysis?.contentSize > 10000
  const isHighlyDownloaded = item.downloads > 50
  const isPopular = item.downloads > 100
  
  // Check for potentially sensitive content
  const description = item.description?.toLowerCase() || ''
  const potentiallySensitive = description.includes('private') ||
                              description.includes('confidential') ||
                              description.includes('secret') ||
                              description.includes('password')

  // Check if item needs review (created in last 24 hours)
  const createdAt = new Date(item.created_at)
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const needsReview = createdAt > dayAgo

  return {
    is_featured: isPopular,
    feature_recommendation: isHighlyDownloaded && !item.is_featured,
    content_warnings: {
      has_large_content: isLargeContent,
      potentially_sensitive: potentiallySensitive,
      high_download_count: isHighlyDownloaded,
      complex_structure: contentAnalysis?.complexity?.isComplex || false
    },
    moderation_flags: {
      needs_review: needsReview,
      reported_count: 0, // Placeholder for future reporting system
      auto_approved: !potentiallySensitive && !needsReview,
      risk_level: potentiallySensitive ? 'HIGH' : isLargeContent ? 'MEDIUM' : 'LOW'
    },
    quality_indicators: {
      has_description: Boolean(item.description?.trim()),
      has_tags: Array.isArray(item.tags) && item.tags.length > 0,
      is_complete: contentAnalysis && contentAnalysis.cardCount > 0,
      engagement_score: Math.min(100, Math.floor((item.downloads / 10) + (item.tags?.length || 0) * 5))
    }
  }
}

/**
 * Enriches a marketplace item with comprehensive analysis and metadata
 * Main processing function extracted for clarity and reusability
 */
function analyzeMarketplaceItem(item: any) {
  const contentAnalysis = analyzeMarketplaceContent(item.content)
  const adminMetadata = generateAdminMetadata(item, contentAnalysis)

  return {
    ...item,
    author_email: item.author?.email || 'Unknown',
    content_analysis: contentAnalysis,
    admin_metadata: adminMetadata,
    raw_item_data: item // Full raw data for deep inspection
  }
}

export const GET = withAdminAuth(async (request: NextRequest, { supabase }) => {
  try {
    console.log('[ADMIN_MARKETPLACE_API] Fetching all marketplace data')

    // Get all marketplace items with comprehensive details
    const { data: marketplaceItems, error: itemsError } = await supabase
      .from('marketplace_items')
      .select(`
        *,
        author:author_id (
          id,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (itemsError) {
      console.error('[ADMIN_MARKETPLACE_API] Error fetching marketplace items:', itemsError)
      throw itemsError
    }

    // Process and enrich marketplace items with comprehensive analysis
    const enrichedItems = marketplaceItems?.map(analyzeMarketplaceItem)

    // Generate comprehensive statistics
    const marketplaceStats = {
      totalItems: enrichedItems?.length || 0,
      totalDownloads: enrichedItems?.reduce((sum, item) => sum + (item.downloads || 0), 0) || 0,
      authorCount: new Set(enrichedItems?.map(item => item.author_id)).size || 0,
      averageDownloads: enrichedItems?.length ? 
        (enrichedItems.reduce((sum, item) => sum + (item.downloads || 0), 0) / enrichedItems.length).toFixed(2) : 0,
      topAuthors: Object.entries(
        enrichedItems?.reduce((acc: any, item) => {
          const authorEmail = item.author_email
          if (!acc[authorEmail]) {
            acc[authorEmail] = { email: authorEmail, items: 0, totalDownloads: 0 }
          }
          acc[authorEmail].items += 1
          acc[authorEmail].totalDownloads += item.downloads || 0
          return acc
        }, {}) || {}
      ).sort((a: any, b: any) => b[1].totalDownloads - a[1].totalDownloads).slice(0, 10),
      contentDistribution: {
        withPasswords: enrichedItems?.filter(item => item.content_analysis?.hasPasswordProtected).length || 0,
        largeContent: enrichedItems?.filter(item => item.admin_metadata?.content_warnings?.has_large_content).length || 0,
        recentItems: enrichedItems?.filter(item => item.admin_metadata?.moderation_flags?.needs_review).length || 0
      }
    }

    console.log(`[ADMIN_MARKETPLACE_API] Successfully retrieved ${enrichedItems?.length || 0} marketplace items`)

    return NextResponse.json({
      items: enrichedItems,
      statistics: marketplaceStats,
      timestamp: new Date().toISOString(),
      admin_notes: {
        last_updated: new Date().toISOString(),
        data_source: 'marketplace_items table',
        security_level: 'ADMIN_FULL_ACCESS'
      }
    })

  } catch (error) {
    console.error('[ADMIN_MARKETPLACE_API] Fatal error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve marketplace data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})

/**
 * POST method disabled - operations moved to dedicated RESTful endpoints
 * 
 * This endpoint now strictly follows RESTful conventions
 * All bulk operations have been migrated to semantic HTTP methods
 * 
 * New RESTful endpoints:
 * - DELETE /api/admin/marketplace/items - Bulk delete marketplace items
 * - POST /api/admin/marketplace/items/feature - Bulk feature/unfeature items  
 * - PUT /api/admin/marketplace/{id}/downloads - Update individual item download counts
 */
export const POST = async () => {
  return NextResponse.json(
    {
      error: 'Method not allowed - POST operations moved to dedicated RESTful endpoints',
      restful_migration: {
        bulk_delete: {
          old: 'POST /api/admin/marketplace (with action: bulk-delete)',
          new: 'DELETE /api/admin/marketplace/items',
          body: { itemIds: ['uuid1', 'uuid2'] }
        },
        bulk_feature: {
          old: 'POST /api/admin/marketplace (with action: bulk-feature)',
          new: 'POST /api/admin/marketplace/items/feature',
          body: { itemIds: ['uuid1', 'uuid2'], featured: true }
        },
        update_downloads: {
          old: 'POST /api/admin/marketplace (with action: update-downloads)',
          new: 'PUT /api/admin/marketplace/{id}/downloads',
          body: { downloads: 100 }
        }
      },
      compliance_improvements: {
        http_semantics: 'Proper HTTP method usage (DELETE for deletions, PUT for updates)',
        endpoint_clarity: 'Clear resource-based URL structure',
        audit_logging: 'Enhanced operation tracking and security logging',
        error_handling: 'Production-ready error responses and validation'
      },
      migration_date: '2025-09-05',
      status: 'PRODUCTION_READY'
    },
    { 
      status: 405,
      headers: {
        'Allow': 'GET',
        'X-API-Migration': 'RESTful-2025-09-05'
      }
    }
  )
}