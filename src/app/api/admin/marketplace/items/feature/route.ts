import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '../../../middleware'

/**
 * Admin Marketplace Items Feature Management API - RESTful Feature Operations
 * 
 * Dedicated RESTful endpoint for marketplace items feature management
 * Handles bulk featuring and unfeaturing of marketplace items
 * 
 * Endpoints:
 * POST /api/admin/marketplace/items/feature - Bulk feature/unfeature marketplace items
 * 
 * Features:
 * - Bulk feature and unfeature operations
 * - Comprehensive audit logging and operation tracking
 * - Smart duplicate detection and skip logic
 * - Detailed operation statistics and reporting
 * - Production-ready error handling and validation
 */

/**
 * Validates feature operation request data
 * Ensures itemIds and featured flag are properly formatted
 */
function validateFeatureRequest(body: any): { valid: boolean; error?: string } {
  const { itemIds, featured } = body

  if (!Array.isArray(itemIds)) {
    return { valid: false, error: 'itemIds must be an array' }
  }

  if (itemIds.length === 0) {
    return { valid: false, error: 'itemIds array cannot be empty' }
  }

  if (itemIds.length > 500) {
    return { valid: false, error: 'Cannot process more than 500 items at once for feature operations' }
  }

  if (typeof featured !== 'boolean') {
    return { valid: false, error: 'featured must be a boolean value (true or false)' }
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const invalidIds = itemIds.filter(id => 
    typeof id !== 'string' || !uuidRegex.test(id)
  )

  if (invalidIds.length > 0) {
    return { 
      valid: false, 
      error: `Invalid item IDs detected: ${invalidIds.slice(0, 3).join(', ')}${invalidIds.length > 3 ? '...' : ''}` 
    }
  }

  return { valid: true }
}

/**
 * Comprehensive audit logging for feature operations
 * Tracks all feature changes with detailed metadata
 */
function logFeatureAuditTrail(
  operation: string,
  adminEmail: string,
  details: any,
  success: boolean,
  error?: any
) {
  const auditLog = {
    timestamp: new Date().toISOString(),
    operation,
    admin_user: adminEmail,
    success,
    details,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    operation_type: 'MARKETPLACE_FEATURE_MANAGEMENT',
    security_level: 'ADMIN_PRIVILEGE',
    compliance_note: 'Feature status changes logged for business analytics and audit compliance'
  }

  console.log('[FEATURE_AUDIT_LOG]', JSON.stringify(auditLog, null, 2))
  return auditLog
}

/**
 * POST Method - Bulk Feature/Unfeature Marketplace Items
 * 
 * Updates feature status for multiple marketplace items with comprehensive tracking
 * Supports both featuring and unfeaturing operations
 */
export const POST = withAdminAuth(async (request: NextRequest, { supabase, user }) => {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { itemIds, featured } = body

    const operationType = featured ? 'BULK_FEATURE' : 'BULK_UNFEATURE'
    console.log(`[ADMIN_MARKETPLACE_${operationType}] Admin ${user.email} initiating ${operationType.toLowerCase()} operation`)

    // Validate request data
    const validation = validateFeatureRequest(body)
    if (!validation.valid) {
      logFeatureAuditTrail(`${operationType}_VALIDATION_FAILED`, user.email, { itemIds, featured, error: validation.error }, false)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get current item details to determine what actually needs to be changed
    const { data: currentItems, error: fetchError } = await supabase
      .from('marketplace_items')
      .select('id, name, is_featured, downloads, author_id')
      .in('id', itemIds)

    if (fetchError) {
      logFeatureAuditTrail(`${operationType}_FETCH_FAILED`, user.email, { itemIds, featured, error: fetchError }, false, fetchError)
      throw fetchError
    }

    if (!currentItems || currentItems.length === 0) {
      const auditDetails = { 
        operation: operationType, 
        requested_items: itemIds.length, 
        found_items: 0 
      }
      logFeatureAuditTrail(`${operationType}_NO_ITEMS_FOUND`, user.email, auditDetails, false)
      
      return NextResponse.json({
        success: false,
        error: 'No items found with the provided IDs',
        operation: 'bulk_feature',
        results: {
          requested_count: itemIds.length,
          found_count: 0,
          changed_count: 0,
          skipped_count: 0
        }
      })
    }

    // Identify items that actually need to be changed (skip items already in desired state)
    const itemsToChange = currentItems.filter(item => item.is_featured !== featured)
    const itemsAlreadyInDesiredState = currentItems.filter(item => item.is_featured === featured)

    let changedItems: any[] = []
    let changeError: any = null

    if (itemsToChange.length > 0) {
      // Perform bulk feature status update
      const { data: updatedItems, error: updateError } = await supabase
        .from('marketplace_items')
        .update({ 
          is_featured: featured,
          updated_at: new Date().toISOString()
        })
        .in('id', itemsToChange.map(item => item.id))
        .select('id, name, is_featured, downloads')

      if (updateError) {
        changeError = updateError
        const auditDetails = { 
          itemIds: itemsToChange.map(item => item.id), 
          featured,
          items_to_change: itemsToChange.length,
          error: updateError
        }
        logFeatureAuditTrail(`${operationType}_OPERATION_FAILED`, user.email, auditDetails, false, updateError)
        throw updateError
      }

      changedItems = updatedItems || []
    }

    // Calculate comprehensive operation statistics
    const operationStats = {
      execution_time: Date.now() - startTime,
      requested_count: itemIds.length,
      found_count: currentItems.length,
      changed_count: changedItems.length,
      skipped_count: itemsAlreadyInDesiredState.length,
      operation_type: operationType,
      feature_status_set: featured,
      affected_authors: new Set([...itemsToChange, ...itemsAlreadyInDesiredState].map(item => item.author_id)).size,
      total_downloads_affected: [...itemsToChange, ...itemsAlreadyInDesiredState].reduce((sum, item) => sum + (item.downloads || 0), 0)
    }

    // Log successful operation
    const auditDetails = {
      operation_stats: operationStats,
      changed_items: changedItems.map(item => ({
        id: item.id,
        name: item.name,
        new_featured_status: item.is_featured,
        downloads: item.downloads
      })),
      skipped_items: itemsAlreadyInDesiredState.map(item => ({
        id: item.id,
        name: item.name,
        already_featured: item.is_featured,
        reason: 'already_in_desired_state'
      }))
    }
    
    logFeatureAuditTrail(`${operationType}_SUCCESS`, user.email, auditDetails, true)

    const actionWord = featured ? 'featured' : 'unfeatured'
    const resultMessage = operationStats.changed_count > 0 
      ? `Successfully ${actionWord} ${operationStats.changed_count} items${operationStats.skipped_count > 0 ? ` (${operationStats.skipped_count} were already ${actionWord})` : ''}`
      : `All ${operationStats.found_count} items were already ${actionWord}`

    console.log(`[ADMIN_MARKETPLACE_${operationType}] ${resultMessage} in ${operationStats.execution_time}ms`)

    return NextResponse.json({
      success: true,
      message: resultMessage,
      operation: 'bulk_feature',
      results: operationStats,
      admin_action: {
        performed_by: user.email,
        performed_at: new Date().toISOString(),
        action_type: operationType,
        security_level: 'ADMIN_PRIVILEGE'
      }
    })

  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error('[ADMIN_MARKETPLACE_FEATURE] Operation failed:', error)
    
    logFeatureAuditTrail('BULK_FEATURE_FATAL_ERROR', user.email, { execution_time: executionTime }, false, error)
    
    return NextResponse.json(
      {
        error: 'Failed to perform bulk feature operation',
        details: error instanceof Error ? error.message : 'Unknown error',
        operation: 'bulk_feature',
        execution_time: executionTime
      },
      { status: 500 }
    )
  }
})

// Disable other HTTP methods with informative responses
export const GET = async () => {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST for bulk feature operations.',
      endpoint_info: {
        purpose: 'Bulk feature/unfeature marketplace items',
        method: 'POST',
        body_format: { itemIds: ['uuid1', 'uuid2'], featured: true }
      }
    },
    { status: 405 }
  )
}

export const DELETE = async () => {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST for feature operations.',
      correct_endpoints: {
        bulk_feature: 'POST /api/admin/marketplace/items/feature',
        bulk_delete: 'DELETE /api/admin/marketplace/items'
      }
    },
    { status: 405 }
  )
}

export const PUT = async () => {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST for bulk feature operations.',
      usage_example: {
        method: 'POST',
        url: '/api/admin/marketplace/items/feature',
        body: { itemIds: ['item-uuid-1', 'item-uuid-2'], featured: true }
      }
    },
    { status: 405 }
  )
}