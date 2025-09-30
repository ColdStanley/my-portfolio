import { NextRequest, NextResponse } from 'next/server'
import { checkQuota, getOrCreateDeviceId } from '@/lib/swiftapply-quota'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * GET /api/quota/check
 *
 * Query params:
 *   - device_id (optional): For guest users
 *
 * Headers:
 *   - Authorization: Bearer <token> (optional): For authenticated users
 *
 * Returns: { plan, used, limit, remaining }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let identity: string
    let is_user = false

    // Try to get authenticated user
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user } } = await supabase.auth.getUser(token)

      if (user) {
        identity = user.id
        is_user = true
      }
    }

    // Fallback to device_id from query params
    if (!is_user) {
      const { searchParams } = new URL(request.url)
      const deviceId = searchParams.get('device_id')

      if (!deviceId) {
        return NextResponse.json(
          { error: 'No authentication or device_id provided' },
          { status: 401 }
        )
      }

      identity = deviceId
    }

    // Check quota
    const quotaInfo = await checkQuota(identity!, is_user)

    return NextResponse.json(quotaInfo)
  } catch (error: any) {
    console.error('Quota check error:', error)
    return NextResponse.json(
      { error: 'Failed to check quota', details: error.message },
      { status: 500 }
    )
  }
}