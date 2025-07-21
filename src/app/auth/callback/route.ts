import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const returnTo = requestUrl.searchParams.get('returnTo') || '/cestlavie'

  console.log('Auth callback received:', { code: !!code, returnTo })

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', error)
        return NextResponse.redirect(
          new URL(`/auth/callback?error=${encodeURIComponent(error.message)}&details=${encodeURIComponent('Code exchange failed')}`, requestUrl.origin)
        )
      }

      if (data.user) {
        console.log('User authenticated successfully:', data.user.id)
        
        // 确保用户在user_product_membership表中存在
        const { error: membershipError } = await supabase
          .from('user_product_membership')
          .upsert({
            user_id: data.user.id,
            membership_level: 'registered'
          }, {
            onConflict: 'user_id'
          })

        if (membershipError) {
          console.error('Failed to create membership record:', membershipError)
        } else {
          console.log('Membership record created/updated for user:', data.user.id)
        }

        // 重定向到目标页面，标记成功
        return NextResponse.redirect(
          new URL(`/auth/callback?success=true&returnTo=${encodeURIComponent(returnTo)}`, requestUrl.origin)
        )
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL(`/auth/callback?error=${encodeURIComponent('Authentication failed')}&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, requestUrl.origin)
      )
    }
  }

  // 如果没有code或者处理失败，重定向到错误页面
  return NextResponse.redirect(
    new URL(`/auth/callback?error=${encodeURIComponent('No authorization code')}&details=${encodeURIComponent('Missing code parameter')}`, requestUrl.origin)
  )
}