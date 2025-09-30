import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Quota limits by plan
export const QUOTA_LIMITS = {
  guest: 3,
  free: 6,
  pro: null // unlimited
} as const

export type Plan = 'guest' | 'free' | 'pro'

export interface QuotaInfo {
  plan: Plan
  used: number
  limit: number | null
  remaining: number | null
}

export interface Identity {
  identity: string
  is_user: boolean
}

/**
 * Client-side: Generate or retrieve device ID from localStorage
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    throw new Error('getOrCreateDeviceId can only be called on client side')
  }

  const STORAGE_KEY = 'swiftapply-device-id'
  let deviceId = localStorage.getItem(STORAGE_KEY)

  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, deviceId)
  }

  return deviceId
}

/**
 * Server-side: Get identity from Supabase auth or device_id from request
 */
export async function getIdentity(request: Request): Promise<Identity> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Try to get user from auth header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const { data: { user } } = await supabase.auth.getUser(token)

    if (user) {
      return {
        identity: user.id,
        is_user: true
      }
    }
  }

  // Fallback to device_id from request body or query
  let deviceId: string | null = null

  if (request.method === 'POST') {
    try {
      const body = await request.json()
      deviceId = body.device_id
    } catch {
      // Body already consumed or invalid
    }
  } else if (request.method === 'GET') {
    const url = new URL(request.url)
    deviceId = url.searchParams.get('device_id')
  }

  if (!deviceId) {
    throw new Error('No user authentication or device_id provided')
  }

  return {
    identity: deviceId,
    is_user: false
  }
}

/**
 * Server-side: Check quota for given identity
 * Automatically downgrades expired pro users to free
 */
export async function checkQuota(identity: string, is_user: boolean): Promise<QuotaInfo> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let plan: Plan = 'guest'
  let limit: number | null = QUOTA_LIMITS.guest

  // Get user plan if authenticated
  if (is_user) {
    const { data: appUser } = await supabase
      .from('app_users')
      .select('plan, plan_expires_at')
      .eq('id', identity)
      .single()

    if (appUser) {
      plan = appUser.plan as Plan

      // Check if pro user is expired
      if (plan === 'pro' && appUser.plan_expires_at) {
        const expiresAt = new Date(appUser.plan_expires_at)
        if (expiresAt < new Date()) {
          // Downgrade to free
          await supabase
            .from('app_users')
            .update({ plan: 'free' })
            .eq('id', identity)

          plan = 'free'
        }
      }

      limit = QUOTA_LIMITS[plan]
    } else {
      // User exists in auth but not in app_users, treat as free
      plan = 'free'
      limit = QUOTA_LIMITS.free
    }
  }

  // Get usage for today
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const { data: usageLog } = await supabase
    .from('usage_logs')
    .select('count')
    .eq('identity', identity)
    .eq('usage_date', today)
    .single()

  const used = usageLog?.count || 0
  const remaining = limit === null ? null : Math.max(0, limit - used)

  return {
    plan,
    used,
    limit,
    remaining
  }
}

/**
 * Server-side: Consume one quota
 * Returns { success: true, remaining } or { success: false, message, user_type }
 */
export async function useQuota(
  identity: string,
  is_user: boolean
): Promise<{ success: boolean; message?: string; remaining?: number | null; user_type?: 'guest' | 'free' | 'pro' }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // First check current quota
  const quotaInfo = await checkQuota(identity, is_user)

  // Pro users have unlimited quota
  if (quotaInfo.limit === null) {
    // Still log the usage
    const today = new Date().toISOString().split('T')[0]

    await supabase
      .from('usage_logs')
      .upsert({
        identity,
        is_user,
        usage_date: today,
        count: (quotaInfo.used || 0) + 1,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'identity,usage_date'
      })

    return {
      success: true,
      remaining: null
    }
  }

  // Check if quota exceeded
  if (quotaInfo.remaining !== null && quotaInfo.remaining <= 0) {
    return {
      success: false,
      message: 'Daily limit reached. Please try again tomorrow or upgrade your account.',
      user_type: quotaInfo.plan as 'guest' | 'free' | 'pro'
    }
  }

  // Consume quota
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('usage_logs')
    .upsert({
      identity,
      is_user,
      usage_date: today,
      count: quotaInfo.used + 1,
      last_used_at: new Date().toISOString()
    }, {
      onConflict: 'identity,usage_date'
    })

  if (error) {
    return {
      success: false,
      message: 'Failed to update quota. Please try again later.'
    }
  }

  return {
    success: true,
    remaining: quotaInfo.remaining !== null ? quotaInfo.remaining - 1 : null
  }
}