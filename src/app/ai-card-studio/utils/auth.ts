import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export interface AuthenticatedUser {
  id: string
  email: string
  user_metadata?: {
    name?: string
  }
}

// AI Card Studio 专用Cookie名称
const AI_CARD_STUDIO_TOKEN = 'ai_card_studio_access_token'

// 从Cookie中验证用户身份
export async function verifyAuth(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = request.cookies.get(AI_CARD_STUDIO_TOKEN)?.value
    console.log('🔐 AI Card Studio auth verification - token present:', !!token)
    console.log('🍪 AI Card Studio cookies:', Object.fromEntries(
      request.cookies.getAll()
        .filter(c => c.name.includes('ai_card_studio'))
        .map(c => [c.name, c.value])
    ))
    
    if (!token) {
      console.log('❌ No auth token found')
      return null
    }

    const supabase = getSupabaseAdmin()
    
    // 使用token验证用户
    const { data: { user }, error } = await supabase.auth.getUser(token)
    console.log('🔐 Supabase auth result:', { user: user?.email, error: error?.message })
    
    if (error || !user) {
      console.log('❌ Auth validation failed:', error?.message)
      return null
    }

    console.log('✅ User authenticated:', user.email)
    return {
      id: user.id,
      email: user.email!,
      user_metadata: user.user_metadata
    }
  } catch (error) {
    console.error('❌ Auth verification error:', error)
    return null
  }
}