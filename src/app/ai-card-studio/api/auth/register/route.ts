import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    console.log('🔧 Backend registration request:', { email, name })

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    console.log('🔗 Using Supabase admin client for registration')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0] // 默认用邮箱前缀作为名字
        }
      }
    })

    console.log('📊 Supabase registration response:', { data: !!data, error: error?.message })

    if (error) {
      console.error('❌ Supabase registration error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('✅ Registration successful, setting response and cookie')
    
    // 设置Cookie用于持久化session
    const response = NextResponse.json({
      user: data.user,
      session: data.session,
      message: 'Registration successful'
    })

    if (data.session) {
      console.log('🍪 Setting AI Card Studio auth cookie')
      response.cookies.set('ai_card_studio_access_token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.session.expires_in
      })
    } else {
      console.log('⚠️ No session in response data')
    }

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}