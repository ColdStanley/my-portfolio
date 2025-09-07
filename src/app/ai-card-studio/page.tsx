'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AICardStudio from './components/AICardStudio'
import AuthUI from './components/AuthUI'
import PageTransition from '@/components/PageTransition'
import { useWorkspaceStore } from './store/workspaceStore'
import type { User } from '@supabase/supabase-js'

export default function AICardStudioPage() {
  const [user, setUser] = useState<User | null>(null)
  // 🎯 默认显示AuthUI，在客户端检查后可能会隐藏
  const [showAuthUI, setShowAuthUI] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { isLoading: workspaceLoading, actions } = useWorkspaceStore()
  const initializedRef = useRef(false)
  const sessionCacheRef = useRef<{ user: User; timestamp: number } | null>(null)
  const visibilityRef = useRef(true) // Track page visibility
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Track session timeout

  // Set page title
  useEffect(() => {
    document.title = "AI Card Studio | Stanley Hi"
    
    return () => {
      document.title = "Stanley's Portfolio" // Reset on unmount
    }
  }, [])

  // 🎯 客户端初始化：检查recent session，避免SSR不匹配
  useEffect(() => {
    // 只在客户端执行，检查localStorage中的recent session标记
    const recentSession = localStorage.getItem('ai-card-studio-recent-session')
    if (recentSession) {
      const timestamp = parseInt(recentSession)
      const hourAgo = Date.now() - (60 * 60 * 1000) // 1小时
      if (timestamp > hourAgo) {
        console.log('🎯 Found valid recent session, hiding AuthUI')
        setShowAuthUI(false)
      } else {
        // 过期了，清理掉
        console.log('🎯 Recent session expired, clearing')
        localStorage.removeItem('ai-card-studio-recent-session')
      }
    }
  }, [])

  // 🎯 监听页面可见性变化，避免离开浏览器时的不必要验证
  useEffect(() => {
    const handleVisibilityChange = () => {
      visibilityRef.current = !document.hidden
      if (visibilityRef.current) {
        console.log('👀 Page became visible')
        // 页面重新可见时，检查session缓存是否仍然有效
        const cache = sessionCacheRef.current
        if (cache && Date.now() - cache.timestamp > 300000) { // 5分钟后过期
          console.log('🔄 Session cache expired, clearing...')
          sessionCacheRef.current = null
        }
        
        // 🎯 精准修复：如果有悬挂的session超时器，立即触发检查
        if (sessionTimeoutRef.current && !user) {
          console.log('🔧 Clearing hanging session timeout and retrying...')
          clearTimeout(sessionTimeoutRef.current)
          sessionTimeoutRef.current = null
          // 重新触发session检查
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              console.log('✅ Session recovered after visibility change')
              // 这里会触发onAuthStateChange，不需要手动设置状态
            }
          })
        }
      } else {
        console.log('🙈 Page became hidden')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // 🔧 双通道逻辑：Auth UI 优先，Session 异步验证
    const initializeAuth = () => {
      // Ensure client-side execution only
      if (typeof window === 'undefined') {
        return
      }

      // 🎯 检查session缓存，避免不必要的闪烁
      const checkSessionCache = () => {
        const cache = sessionCacheRef.current
        if (cache && Date.now() - cache.timestamp < 30000) { // 30秒内的缓存有效
          console.log('🎯 Using cached session for:', cache.user.email)
          setUser(cache.user)
          actions.setUser(cache.user)
          setShowAuthUI(false)
          
          if (!initializedRef.current) {
            initializedRef.current = true
            actions.fetchAndHandleWorkspace(cache.user.id).catch(error => {
              console.error('Cached workspace fetch failed:', error)
            })
          }
          return true
        }
        return false
      }

      // 如果有有效缓存，优先使用
      if (checkSessionCache()) {
        return { subscription: null, sessionTimeout: null }
      }

      // 清理坏 token 的工具函数
      const clearBadTokens = async () => {
        try {
          await supabase.auth.signOut()
          
          // Clear all possible token storage keys
          const tokensToRemove = [
            'sb-ai-card-studio-auth-token',
            'supabase.auth.token',
            'sb-' + (process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] || '') + '-auth-token'
          ]
          
          tokensToRemove.forEach(key => {
            if (key) localStorage.removeItem(key)
          })
          
          // Comprehensive cleanup
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
              localStorage.removeItem(key)
            }
          })
          
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
              sessionStorage.removeItem(key)
            }
          })
        } catch (error) {
          console.warn('Token cleanup failed:', error)
        }
      }

      // 🎯 统一 fallback 处理函数
      const handleSessionFailure = async (reason: string) => {
        if (!mounted) return
        
        console.warn(`Session failure (${reason}), falling back to Auth UI`)
        
        // 统一的 fallback 处理
        try {
          // 🎯 清理session缓存
          sessionCacheRef.current = null
          // 🎯 清理recent session标记
          localStorage.removeItem('ai-card-studio-recent-session')
          
          await clearBadTokens()
          actions.resetWorkspace()
          setUser(null)
          actions.setUser(null)
          setShowAuthUI(true)
        } catch (error) {
          console.error('Fallback cleanup failed:', error)
        }
      }

      // 📡 监听 auth 状态变化
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return
        
        console.log(`🔔 Auth state change: ${event}`, { 
          hasSession: !!session, 
          hasUser: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email 
        })
        
        if (session?.user) {
          console.log('👤 User authenticated:', session.user.email)
          console.log('🆔 User ID:', session.user.id)
          
          // 🎯 更新session缓存
          sessionCacheRef.current = {
            user: session.user,
            timestamp: Date.now()
          }
          
          // 🎯 设置recent session标记，避免刷新时闪烁
          localStorage.setItem('ai-card-studio-recent-session', Date.now().toString())
          
          setUser(session.user)
          actions.setUser(session.user)
          setShowAuthUI(false)
          
          // 🎯 确保 workspace 初始化，特别是登录事件
          if (event === 'SIGNED_IN' || !initializedRef.current) {
            console.log('🚀 Initializing workspace for user:', session.user.id)
            initializedRef.current = true
            
            // 重置 workspace loading 状态，防止卡死
            actions.resetWorkspace()
            
            try {
              await actions.fetchAndHandleWorkspace(session.user.id)
              console.log('✅ Workspace initialized successfully')
            } catch (error) {
              console.error('❌ Workspace fetch failed:', error)
              // 🔧 兜底：即使失败也要停止 loading
              actions.resetWorkspace()
            }
          } else {
            console.log('⏭️ Skipping workspace fetch (already initialized)')
          }
        } else {
          console.log('🚪 User signed out or no session')
          // 🎯 清理session缓存
          sessionCacheRef.current = null
          // 🎯 清理recent session标记
          localStorage.removeItem('ai-card-studio-recent-session')
          await handleSessionFailure('auth state change - no session')
        }
      })

      // 🎯 非阻塞 Session 恢复 + 超时保护
      const sessionTimeout = setTimeout(() => {
        sessionTimeoutRef.current = null
        handleSessionFailure('timeout')
      }, 15000) // 15秒超时保护，给session恢复更多时间
      
      // 记录超时器引用，用于页面可见性恢复
      sessionTimeoutRef.current = sessionTimeout

      // 非阻塞 getSession 调用
      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          clearTimeout(sessionTimeout)
          sessionTimeoutRef.current = null
          if (!mounted) return
          
          if (error || !session) {
            handleSessionFailure(error?.message || 'no session')
            return
          }
          
          // 成功恢复 session
          console.log('Session restored:', session.user.email)
          
          // 🎯 更新session缓存
          sessionCacheRef.current = {
            user: session.user,
            timestamp: Date.now()
          }
          
          // 🎯 设置recent session标记，避免刷新时闪烁
          localStorage.setItem('ai-card-studio-recent-session', Date.now().toString())
          
          setUser(session.user)
          actions.setUser(session.user)
          setShowAuthUI(false)
          
          if (!initializedRef.current) {
            initializedRef.current = true
            actions.fetchAndHandleWorkspace(session.user.id).catch(error => {
              console.error('Workspace fetch failed:', error)
            })
          }
        })
        .catch((error) => {
          clearTimeout(sessionTimeout)
          sessionTimeoutRef.current = null
          handleSessionFailure(`exception: ${error.message}`)
        })

      return { subscription, sessionTimeout }
    }

    const { subscription, sessionTimeout } = initializeAuth()

    return () => {
      mounted = false
      subscription?.unsubscribe()
      clearTimeout(sessionTimeout)  // 🔧 清理超时器
      initializedRef.current = false
    }
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      console.log('Signing out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error.message)
        alert('Sign out failed: ' + error.message)
      } else {
        console.log('Sign out successful')
        // 🎯 清理所有缓存和标记
        sessionCacheRef.current = null
        localStorage.removeItem('ai-card-studio-recent-session')
        
        // Reset user state immediately
        setUser(null)
        actions.setUser(null)
      }
    } catch (err) {
      console.error('Unexpected sign out error:', err)
      alert('Sign out failed')
    }
  }

  // 🔧 简化渲染逻辑 - 不再显示 Loading 骨架屏
  // 要么显示 AuthUI，要么显示 AICardStudio

  return (
    <>
      {/* Hide global navbar/footer for clean fullscreen experience */}
      <style jsx global>{`
        nav[role="banner"], 
        footer[role="contentinfo"],
        .navbar,
        .footer {
          display: none !important;
        }
      `}</style>
      
      <PageTransition>
        <div className="min-h-screen">
          {/* 🔧 Auth UI - 只在需要时显示 */}
          {showAuthUI && <AuthUI />}
          
          {/* 🔧 Main App - 始终渲染但可能隐藏，避免 hooks 顺序问题 */}
          <div className={`relative ${showAuthUI ? 'hidden' : ''}`}>
            {/* User menu - top right corner */}
            {user && (
              <div ref={userMenuRef} className="fixed top-4 right-4 z-50">
                {/* User email button */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-2 py-1 text-xs text-gray-400 hover:text-purple-500 transition-all duration-200 flex items-center gap-2"
                >
                  {user.email}
                  <svg 
                    className={`w-3 h-3 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleSignOut()
                      }}
                      className="w-full px-1.5 py-0.5 text-xs text-left text-purple-600 hover:bg-purple-50 transition-all duration-200 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
            <AICardStudio />
          </div>
        </div>
      </PageTransition>
    </>
  )
}