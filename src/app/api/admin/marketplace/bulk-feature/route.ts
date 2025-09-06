import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '../../middleware'

/**
 * Admin Marketplace Bulk Feature API - RESTful Endpoint
 * 
 * Dedicated endpoint for bulk featuring/promoting marketplace items
 * Follows RESTful conventions: POST method for update operations
 * 
 * Endpoint: POST /api/admin/marketplace/bulk-feature
 */

export const POST = withAdminAuth(async (request: NextRequest, { supabase, user }) => {
  try {
    const body = await request.json()
    const { itemIds, featured = true } = body

    console.log(`[ADMIN_BULK_FEATURE] Admin ${user.email} attempting to ${featured ? 'feature' : 'unfeature'} ${itemIds?.length || 0} items`)

    // Validate input
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'itemIds array is required and must contain at least one item ID' },
        { status: 400 }
      )
    }

    // Validate featured flag
    if (typeof featured !== 'boolean') {
      return NextResponse.json(
        { error: 'featured field must be a boolean value' },
        { status: 400 }
      )
    }

    // Get current item details for audit logging
    const { data: itemsBeforeUpdate } = await supabase
      .from('marketplace_items')
      .select('id, name, is_featured, downloads, author_id')
      .in('id', itemIds)

    if (!itemsBeforeUpdate || itemsBeforeUpdate.length === 0) {
      return NextResponse.json(
        { error: 'No marketplace items found with the provided IDs' },
        { status: 404 }
      )
    }

    // Perform bulk feature update
    const { data: updatedItems, error: updateError } = await supabase
      .from('marketplace_items')
      .update({ 
        is_featured: featured,
        updated_at: new Date().toISOString()
      })
      .in('id', itemIds)
      .select('id, name, is_featured, downloads')

    if (updateError) {
      console.error('[ADMIN_BULK_FEATURE] Bulk feature update failed:', updateError)
      throw updateError
    }

    // Calculate actual changes made
    const actualChanges = itemsBeforeUpdate.filter(item => 
      item.is_featured !== featured
    ).length

    // Log successful bulk feature operation
    console.log('[ADMIN_BULK_FEATURE] Bulk feature operation completed:', {
      requested_items: itemIds.length,
      items_found: itemsBeforeUpdate.length,
      items_changed: actualChanges,
      featured_status: featured,
      updated_by: user.email,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: `Successfully ${featured ? 'featured' : 'unfeatured'} ${actualChanges} marketplace items`,
      operation: featured ? 'bulk_feature' : 'bulk_unfeature',
      results: {
        requested_count: itemIds.length,
        found_count: itemsBeforeUpdate.length,
        changed_count: actualChanges,
        unchanged_count: itemsBeforeUpdate.length - actualChanges,
        updated_items: updatedItems || [],
        items_before_update: itemsBeforeUpdate
      },
      feature_status: {
        is_featured: featured,
        operation_type: featured ? 'PROMOTE_TO_FEATURED' : 'REMOVE_FROM_FEATURED'
      },
      admin_action: {
        performed_by: user.email,
        performed_at: new Date().toISOString(),
        action_type: 'BULK_FEATURE_MARKETPLACE_ITEMS'
      }
    })

  } catch (error) {
    console.error('[ADMIN_BULK_FEATURE] Operation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to perform bulk feature operation',
        details: error instanceof Error ? error.message : 'Unknown error',
        operation: 'bulk_feature'
      },
      { status: 500 }
    )
  }
})

// Disable other HTTP methods for this endpoint
export const GET = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for bulk feature operations.' },
    { status: 405 }
  )
}

export const DELETE = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for bulk feature operations.' },
    { status: 405 }
  )
}