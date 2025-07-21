'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const [processing, setProcessing] = useState(true)
  const [urlInfo, setUrlInfo] = useState({ 
    success: null as string | null, 
    error: null as string | null, 
    details: null as string | null, 
    fullUrl: '' 
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    let processed = false
    
    const handleAuth = async () => {
      if (processed) return
      processed = true
      
      const urlParams = new URLSearchParams(window.location.search)
      const success = urlParams.get('success')
      const error = urlParams.get('error')
      const details = urlParams.get('details')
      const code = urlParams.get('code')
      const returnTo = urlParams.get('returnTo') || '/cestlavie'
      
      // 更新URL信息显示
      setUrlInfo({
        success,
        error,
        details,
        fullUrl: window.location.href
      })
      
      console.log('Callback page params:', { success, error, details, hasCode: !!code, returnTo })
      
      // 如果有认证代码，处理代码交换
      if (code && !success && !error) {
        try {
          console.log('Processing auth code...')
          const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (authError) {
            console.error('Auth exchange error:', authError)
            window.location.href = `/auth/callback?error=${encodeURIComponent(authError.message)}&details=${encodeURIComponent('Code exchange failed')}&returnTo=${encodeURIComponent(returnTo)}`
            return
          }

          if (data.user) {
            console.log('User authenticated successfully:', data.user.id)
            
            // 确保用户在user_product_membership表中存在
            try {
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
            } catch (membershipErr) {
              console.error('Membership upsert error:', membershipErr)
            }

            // 标记成功并重定向
            window.location.href = `/auth/callback?success=true&returnTo=${encodeURIComponent(returnTo)}`
            return
          }
        } catch (error) {
          console.error('Auth callback error:', error)
          window.location.href = `/auth/callback?error=${encodeURIComponent('Authentication failed')}&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}&returnTo=${encodeURIComponent(returnTo)}`
          return
        }
      }
      
      setProcessing(false)
      
      if (window.opener) {
        if (success === 'true') {
          console.log('Auth success! Sending message to parent window...')
          // 等待一下确保cookies设置完成
          setTimeout(() => {
            try {
              console.log('Sending AUTH_SUCCESS message')
              window.opener.postMessage({ type: 'AUTH_SUCCESS' }, '*')
              console.log('Message sent, closing window in 3 seconds...')
              setTimeout(() => {
                console.log('Closing window now')
                window.close()
              }, 3000)
            } catch (err) {
              console.error('Failed to send success message:', err)
              window.close()
            }
          }, 1000)
        } else if (error) {
          // 认证失败，发送错误信息
          console.error('Auth failed with error:', error, details)
          window.opener.postMessage({ type: 'AUTH_FAILED', error, details }, '*')
          setTimeout(() => window.close(), 2000)
        } else if (code) {
          // 有授权码但还在处理中
          console.log('Processing authorization code...')
        } else {
          console.log('No clear success/error status, treating as failed')
          window.opener.postMessage({ type: 'AUTH_FAILED', error: 'unknown', details: 'No clear status' }, '*')
          setTimeout(() => window.close(), 2000)
        }
      } else {
        // 如果不是弹窗，获取returnTo参数并重定向
        if (success === 'true') {
          // 认证成功，立即重定向
          window.location.href = returnTo
        } else if (error) {
          // 有错误，延迟后重定向到登录页
          setTimeout(() => {
            window.location.href = `/auth/login?returnTo=${encodeURIComponent(returnTo)}&error=${encodeURIComponent(error)}`
          }, 3000)
        } else if (processing) {
          // 仍在处理中，等待
          return
        } else {
          // 等待处理完成后重定向
          setTimeout(() => {
            window.location.href = returnTo
          }, 3000)
        }
      }
    }
    
    // 延迟执行，确保页面完全加载
    setTimeout(handleAuth, 500)
  }, [supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {processing 
            ? 'Processing authentication...' 
            : urlInfo.success 
              ? 'Authentication successful! Redirecting...' 
              : urlInfo.error 
                ? 'Authentication failed. Redirecting...'
                : 'Processing...'
          }
        </p>
        {urlInfo.error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded max-w-md mx-auto">
            <p className="text-red-700">Error: {urlInfo.error}</p>
            {urlInfo.details && <p className="text-red-600 text-sm mt-2">{urlInfo.details}</p>}
          </div>
        )}
        <div className="mt-4 text-xs text-gray-500">
          <p>Success: {urlInfo.success || 'null'}</p>
          <p>Error: {urlInfo.error || 'null'}</p>
          <p className="break-all">URL: {urlInfo.fullUrl}</p>
        </div>
      </div>
    </div>
  )
}