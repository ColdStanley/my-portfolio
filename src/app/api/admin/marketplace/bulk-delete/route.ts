import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '../../middleware'

/**
 * Admin Marketplace Bulk Delete API - RESTful Endpoint
 * 
 * Dedicated endpoint for bulk deletion of marketplace items
 * Follows RESTful conventions: DELETE method for deletion operations
 * 
 * Endpoint: DELETE /api/admin/marketplace/bulk-delete
 */

export const DELETE = withAdminAuth(async (request: NextRequest, { supabase, user }) => {
  try {
    const body = await request.json()
    const { itemIds } = body

    console.log(`[ADMIN_BULK_DELETE] Admin ${user.email} attempting bulk delete of ${itemIds?.length || 0} items`)

    // Validate input
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'itemIds array is required and must contain at least one item ID' },
        { status: 400 }
      )
    }

    // Validate item ID format (optional but recommended)
    const invalidIds = itemIds.filter(id => typeof id !== 'string' || !id.trim())
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: 'All item IDs must be non-empty strings' },
        { status: 400 }
      )
    }

    // Get items details for audit logging before deletion
    const { data: itemsToDelete } = await supabase
      .from('marketplace_items')
      .select('id, name, author_id, downloads')
      .in('id', itemIds)

    // Perform bulk deletion
    const { data: deletedItems, error: deleteError } = await supabase
      .from('marketplace_items')
      .delete()
      .in('id', itemIds)
      .select('id, name')

    if (deleteError) {
      console.error('[ADMIN_BULK_DELETE] Bulk delete failed:', deleteError)
      throw deleteError
    }

    // Log successful bulk deletion for audit
    console.log('[ADMIN_BULK_DELETE] Bulk deletion completed:', {
      requested_items: itemIds.length,
      successfully_deleted: deletedItems?.length || 0,
      deleted_by: user.email,
      deleted_at: new Date().toISOString(),
      items_details: itemsToDelete
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedItems?.length || 0} marketplace items`,
      operation: 'bulk_delete',
      results: {
        requested_count: itemIds.length,
        deleted_count: deletedItems?.length || 0,
        deleted_items: deletedItems || [],
        items_before_deletion: itemsToDelete || []
      },
      admin_action: {
        performed_by: user.email,
        performed_at: new Date().toISOString(),
        action_type: 'BULK_DELETE_MARKETPLACE_ITEMS'
      }
    })

  } catch (error) {
    console.error('[ADMIN_BULK_DELETE] Operation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to perform bulk delete operation',
        details: error instanceof Error ? error.message : 'Unknown error',
        operation: 'bulk_delete'
      },
      { status: 500 }
    )
  }
})

// Disable other HTTP methods for this endpoint
export const GET = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use DELETE for bulk delete operations.' },
    { status: 405 }
  )
}

export const POST = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use DELETE for bulk delete operations.' },
    { status: 405 }
  )
}