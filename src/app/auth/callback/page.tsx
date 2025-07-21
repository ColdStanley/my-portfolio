'use client'

import { useEffect, useState } from 'react'

export default function AuthCallback() {
  useEffect(() => {
    let processed = false
    
    const handleAuth = () => {
      if (processed) return
      processed = true
      
      const urlParams = new URLSearchParams(window.location.search)
      const success = urlParams.get('success')
      const error = urlParams.get('error')
      const details = urlParams.get('details')
      const code = urlParams.get('code')
      
      console.log('Callback page params:', { success, error, details, hasCode: !!code })
      
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
          setTimeout(() => {
            // 重新检查URL参数，看是否已经处理完成
            const newParams = new URLSearchParams(window.location.search)
            if (newParams.get('success') || newParams.get('error')) {
              window.location.reload()
            }
          }, 2000)
        } else {
          console.log('No clear success/error status, treating as failed')
          window.opener.postMessage({ type: 'AUTH_FAILED', error: 'unknown', details: 'No clear status' }, '*')
          setTimeout(() => window.close(), 2000)
        }
      } else {
        // 如果不是弹窗，获取returnTo参数并重定向
        const urlParams = new URLSearchParams(window.location.search)
        const returnTo = urlParams.get('returnTo') || '/cestlavie'
        
        if (urlParams.get('success') === 'true') {
          // 认证成功，立即重定向
          window.location.href = returnTo
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
  }, [])

  const [urlInfo, setUrlInfo] = useState({ success: null, error: null, details: null, fullUrl: '' })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setUrlInfo({
        success: urlParams.get('success'),
        error: urlParams.get('error'),
        details: urlParams.get('details'),
        fullUrl: window.location.href
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">
          {urlInfo.success ? 'Authentication successful! Closing window...' : 'Processing authentication...'}
        </p>
        {urlInfo.error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded">
            <p className="text-red-700">Error: {urlInfo.error}</p>
            {urlInfo.details && <p className="text-red-600 text-sm mt-2">{urlInfo.details}</p>}
          </div>
        )}
        <div className="mt-4 text-xs text-gray-500">
          <p>Success: {urlInfo.success || 'null'}</p>
          <p>Error: {urlInfo.error || 'null'}</p>
          <p>URL: {urlInfo.fullUrl}</p>
        </div>
      </div>
    </div>
  )
}