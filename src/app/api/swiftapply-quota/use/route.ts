import { NextRequest, NextResponse } from 'next/server'
import { useQuota } from '@/lib/swiftapply-quota'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/quota/use
 *
 * Body:
 *   - device_id (optional): For guest users
 *
 * Headers:
 *   - Authorization: Bearer <token> (optional): For authenticated users
 *
 * Returns:
 *   - { success: true, remaining: number | null }
 *   - { success: false, message: string }
 */
export async function POST(request: NextRequest) {
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

    // Fallback to device_id from request body
    if (!is_user) {
      const body = await request.json()
      const deviceId = body.device_id

      if (!deviceId) {
        return NextResponse.json(
          { success: false, message: 'No authentication or device_id provided' },
          { status: 401 }
        )
      }

      identity = deviceId
    }

    // Consume quota
    const result = await useQuota(identity!, is_user)

    if (!result.success) {
      return NextResponse.json(result, { status: 429 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Quota use error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process quota', details: error.message },
      { status: 500 }
    )
  }
}