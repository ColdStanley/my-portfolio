import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '../../middleware'

/**
 * Admin Individual Marketplace Item API - God Mode Item Management
 * 
 * Provides complete control over individual marketplace items
 * Allows deletion and editing regardless of ownership
 * 
 * Endpoints:
 * DELETE /api/admin/marketplace/{id} - Force delete any marketplace item
 * POST /api/admin/marketplace/{id}/edit - Edit any marketplace item metadata
 * GET /api/admin/marketplace/{id} - Get detailed item information
 */

export const DELETE = withAdminAuth(async (request: NextRequest, { supabase, user }, { params }: { params: { id: string } }) => {
  try {
    const itemId = params.id
    console.log(`[ADMIN_MARKETPLACE_ITEM_API] Admin ${user.email} attempting to delete item: ${itemId}`)

    // First, get item details for logging
    const { data: itemDetails } = await supabase
      .from('marketplace_items')
      .select('name, author_id, downloads')
      .eq('id', itemId)
      .single()

    // Force delete the item (no ownership checks)
    const { error: deleteError } = await supabase
      .from('marketplace_items')
      .delete()
      .eq('id', itemId)

    if (deleteError) {
      console.error(`[ADMIN_MARKETPLACE_ITEM_API] Failed to delete item ${itemId}:`, deleteError)
      throw deleteError
    }

    console.log(`[ADMIN_MARKETPLACE_ITEM_API] Successfully deleted item: ${itemId}`, {
      item_name: itemDetails?.name || 'Unknown',
      author_id: itemDetails?.author_id || 'Unknown',
      downloads: itemDetails?.downloads || 0,
      deleted_by: user.email,
      deleted_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted marketplace item: ${itemDetails?.name || itemId}`,
      deleted_item: {
        id: itemId,
        name: itemDetails?.name,
        author_id: itemDetails?.author_id,
        downloads: itemDetails?.downloads
      },
      admin_action: {
        performed_by: user.email,
        performed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[ADMIN_MARKETPLACE_ITEM_API] Delete operation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete marketplace item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})

export const POST = withAdminAuth(async (request: NextRequest, { supabase, user }, { params }: { params: { id: string } }) => {
  try {
    const itemId = params.id
    const body = await request.json()
    
    console.log(`[ADMIN_MARKETPLACE_ITEM_API] Admin ${user.email} editing item: ${itemId}`, body)

    // Validate and sanitize input data
    const allowedFields = ['name', 'description', 'tags', 'downloads', 'is_featured']
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 })
    }

    // Get current item details
    const { data: currentItem, error: fetchError } = await supabase
      .from('marketplace_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (fetchError) {
      throw new Error(`Item not found: ${itemId}`)
    }

    // Update the item with admin override (no ownership checks)
    const { data: updatedItem, error: updateError } = await supabase
      .from('marketplace_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single()

    if (updateError) {
      console.error(`[ADMIN_MARKETPLACE_ITEM_API] Failed to update item ${itemId}:`, updateError)
      throw updateError
    }

    console.log(`[ADMIN_MARKETPLACE_ITEM_API] Successfully updated item: ${itemId}`, {
      updated_fields: Object.keys(updateData),
      updated_by: user.email,
      updated_at: new Date().toISOString(),
      before: currentItem,
      after: updatedItem
    })

    return NextResponse.json({
      success: true,
      message: `Successfully updated marketplace item: ${updatedItem.name}`,
      updated_item: updatedItem,
      changes: {
        fields_updated: Object.keys(updateData),
        before: currentItem,
        after: updatedItem
      },
      admin_action: {
        performed_by: user.email,
        performed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[ADMIN_MARKETPLACE_ITEM_API] Edit operation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to edit marketplace item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})

export const GET = withAdminAuth(async (request: NextRequest, { supabase }, { params }: { params: { id: string } }) => {
  try {
    const itemId = params.id
    console.log(`[ADMIN_MARKETPLACE_ITEM_API] Fetching detailed data for item: ${itemId}`)

    // Get comprehensive item details
    const { data: item, error: itemError } = await supabase
      .from('marketplace_items')
      .select(`
        *,
        author:author_id (
          id,
          email,
          created_at
        )
      `)
      .eq('id', itemId)
      .single()

    if (itemError) {
      throw itemError
    }

    // Parse and analyze content
    let contentAnalysis = null
    let parsedContent = null
    try {
      parsedContent = typeof item.content === 'string' ? JSON.parse(item.content) : item.content
      
      contentAnalysis = {
        total_size: JSON.stringify(parsedContent).length,
        card_count: parsedContent?.cards?.length || 0,
        column_count: parsedContent?.columns?.length || 0,
        has_passwords: parsedContent?.cards?.some((card: any) => card.passwordHash) || false,
        card_types: parsedContent?.cards?.reduce((acc: any, card: any) => {
          acc[card.type] = (acc[card.type] || 0) + 1
          return acc
        }, {}) || {},
        column_names: parsedContent?.columns?.map((col: any) => col.title) || [],
        creation_metadata: {
          total_cards: parsedContent?.cards?.length || 0,
          encrypted_cards: parsedContent?.cards?.filter((card: any) => card.passwordHash).length || 0,
          card_positions: parsedContent?.cards?.map((card: any) => ({
            id: card.id,
            column: card.columnId,
            position: card.position
          })) || []
        }
      }
    } catch (error) {
      console.warn(`[ADMIN_MARKETPLACE_ITEM_API] Failed to parse content for item ${itemId}:`, error)
      contentAnalysis = { error: 'Failed to parse content', raw_error: error }
    }

    // Get usage statistics (if available)
    // Note: This could be extended to include download history, user feedback, etc.
    const enrichedItem = {
      ...item,
      author_details: {
        email: item.author?.email || 'Unknown',
        author_since: item.author?.created_at || null,
        total_contributions: null // Could be calculated
      },
      content_analysis: contentAnalysis,
      parsed_content: parsedContent,
      admin_metadata: {
        item_age_days: Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        download_rate: item.downloads / Math.max(1, Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24))),
        is_popular: item.downloads > 50,
        size_category: contentAnalysis?.total_size > 5000 ? 'large' : contentAnalysis?.total_size > 1000 ? 'medium' : 'small',
        security_flags: {
          has_encrypted_content: contentAnalysis?.has_passwords || false,
          potentially_sensitive: item.description?.toLowerCase().includes('private') || item.description?.toLowerCase().includes('password'),
          needs_review: false // Placeholder for manual flagging
        }
      },
      raw_item_data: item
    }

    console.log(`[ADMIN_MARKETPLACE_ITEM_API] Successfully retrieved detailed data for item: ${itemId}`)

    return NextResponse.json({
      item: enrichedItem,
      timestamp: new Date().toISOString(),
      admin_access_level: 'FULL_DETAILS'
    })

  } catch (error) {
    console.error('[ADMIN_MARKETPLACE_ITEM_API] Get operation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve marketplace item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
})