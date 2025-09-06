import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '../../../middleware'

/**
 * Admin Marketplace Downloads Update API - RESTful Endpoint
 * 
 * Dedicated endpoint for updating individual item download counts
 * Follows RESTful conventions: PUT method for update operations
 * 
 * Endpoint: PUT /api/admin/marketplace/{id}/downloads
 */

export const PUT = withAdminAuth(async (request: NextRequest, { supabase, user }, { params }: { params: { id: string } }) => {
  try {
    const itemId = params.id
    const body = await request.json()
    const { downloads } = body

    console.log(`[ADMIN_DOWNLOADS_UPDATE] Admin ${user.email} updating downloads for item: ${itemId}`)

    // Validate input
    if (downloads === undefined || downloads === null) {
      return NextResponse.json(
        { error: 'downloads field is required' },
        { status: 400 }
      )
    }

    // Validate downloads is a non-negative integer
    if (!Number.isInteger(downloads) || downloads < 0) {
      return NextResponse.json(
        { error: 'downloads must be a non-negative integer' },
        { status: 400 }
      )
    }

    // Get current item details for audit logging
    const { data: itemBefore, error: fetchError } = await supabase
      .from('marketplace_items')
      .select('id, name, downloads, author_id')
      .eq('id', itemId)
      .single()

    if (fetchError || !itemBefore) {
      console.error('[ADMIN_DOWNLOADS_UPDATE] Item not found:', itemId)
      return NextResponse.json(
        { error: `Marketplace item not found: ${itemId}` },
        { status: 404 }
      )
    }

    // Check if update is actually needed
    if (itemBefore.downloads === downloads) {
      return NextResponse.json({
        success: true,
        message: 'No update needed - download count is already at the requested value',
        operation: 'downloads_update_skipped',
        results: {
          item_id: itemId,
          item_name: itemBefore.name,
          current_downloads: itemBefore.downloads,
          requested_downloads: downloads,
          change_needed: false
        }
      })
    }

    // Perform download count update
    const { data: updatedItem, error: updateError } = await supabase
      .from('marketplace_items')
      .update({ 
        downloads: downloads,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select('id, name, downloads, updated_at')
      .single()

    if (updateError) {
      console.error('[ADMIN_DOWNLOADS_UPDATE] Update failed:', updateError)
      throw updateError
    }

    // Log successful download count update
    console.log('[ADMIN_DOWNLOADS_UPDATE] Download count updated:', {
      item_id: itemId,
      item_name: updatedItem.name,
      downloads_before: itemBefore.downloads,
      downloads_after: downloads,
      change_amount: downloads - itemBefore.downloads,
      updated_by: user.email,
      updated_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: `Successfully updated download count for "${updatedItem.name}"`,
      operation: 'downloads_update',
      results: {
        item_id: itemId,
        item_name: updatedItem.name,
        downloads_before: itemBefore.downloads,
        downloads_after: downloads,
        change_amount: downloads - itemBefore.downloads,
        change_type: downloads > itemBefore.downloads ? 'INCREASE' : 'DECREASE',
        updated_item: updatedItem
      },
      admin_action: {
        performed_by: user.email,
        performed_at: new Date().toISOString(),
        action_type: 'UPDATE_MARKETPLACE_DOWNLOADS'
      }
    })

  } catch (error) {
    console.error('[ADMIN_DOWNLOADS_UPDATE] Operation failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to update download count',
        details: error instanceof Error ? error.message : 'Unknown error',
        operation: 'downloads_update'
      },
      { status: 500 }
    )
  }
})

// Disable other HTTP methods for this endpoint
export const GET = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use PUT to update download counts.' },
    { status: 405 }
  )
}

export const POST = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use PUT to update download counts.' },
    { status: 405 }
  )
}

export const DELETE = async () => {
  return NextResponse.json(
    { error: 'Method not allowed. Use PUT to update download counts.' },
    { status: 405 }
  )
}