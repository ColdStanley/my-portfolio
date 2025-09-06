import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Admin permission middleware for God Mode developer panel
 * Provides ultimate security validation for admin-only operations
 * 
 * Security Layers:
 * 1. User authentication check
 * 2. Admin ID whitelist validation
 * 3. Master key verification
 * 4. Request logging for audit trail
 */

export interface AdminContext {
  user: any
  supabase: any
}

export async function validateAdminPermissions(request: NextRequest): Promise<{ 
  authorized: boolean, 
  context?: AdminContext, 
  error?: string 
}> {
  try {
    // Get admin configuration from environment
    const adminIds = process.env.DEVELOPER_ADMIN_IDS?.split(',').map(id => id.trim()) || []
    const masterKey = process.env.DEVELOPER_MASTER_KEY
    
    if (!masterKey || adminIds.length === 0) {
      console.error('[ADMIN_MIDDLEWARE] Missing environment configuration')
      return { authorized: false, error: 'Admin system not configured' }
    }

    // Initialize Supabase client
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Check user authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session?.user) {
      console.warn('[ADMIN_MIDDLEWARE] Unauthenticated access attempt')
      return { authorized: false, error: 'Authentication required' }
    }

    const user = session.user
    
    // Validate admin ID whitelist
    if (!adminIds.includes(user.id)) {
      console.warn(`[ADMIN_MIDDLEWARE] Unauthorized access attempt by user: ${user.id} (${user.email})`)
      return { authorized: false, error: 'Insufficient privileges' }
    }

    // Validate master key from request headers
    const providedKey = request.headers.get('x-admin-master-key')
    if (providedKey !== masterKey) {
      console.warn(`[ADMIN_MIDDLEWARE] Invalid master key provided by user: ${user.id}`)
      return { authorized: false, error: 'Invalid master key' }
    }

    // Log successful admin access for audit trail
    console.log(`[ADMIN_MIDDLEWARE] Admin access granted to: ${user.email} (${user.id}) for ${request.method} ${request.url}`)

    return { 
      authorized: true, 
      context: { user, supabase }
    }
    
  } catch (error) {
    console.error('[ADMIN_MIDDLEWARE] Validation error:', error)
    return { authorized: false, error: 'Internal validation error' }
  }
}

/**
 * Higher-order function to wrap admin API routes with permission validation
 * Usage: export const GET = withAdminAuth(async (request, context) => { ... })
 */
export function withAdminAuth(
  handler: (request: NextRequest, context: AdminContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = await validateAdminPermissions(request)
    
    if (!validation.authorized) {
      return NextResponse.json(
        { error: validation.error || 'Access denied' },
        { status: 403 }
      )
    }
    
    return handler(request, validation.context!)
  }
}

/**
 * Utility function to check if current user has admin privileges (for frontend use)
 * This should be called from client-side components
 */
export async function checkAdminStatus(userId: string): Promise<boolean> {
  const adminIds = process.env.DEVELOPER_ADMIN_IDS?.split(',').map(id => id.trim()) || []
  return adminIds.includes(userId)
}