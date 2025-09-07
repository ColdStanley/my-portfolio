'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AICardStudio from './components/AICardStudio'
import AuthUI from './components/AuthUI'
import PageTransition from '@/components/PageTransition'
import { useWorkspaceStore } from './store/workspaceStore'
import type { User } from '@supabase/supabase-js'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export default function AICardStudioPage() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { isLoading: workspaceLoading, canvases, saveError, actions } = useWorkspaceStore()
  const initializedRef = useRef(false)
  const visibilityRef = useRef(true) // Track page visibility

  // Set page title
  useEffect(() => {
    document.title = "AI Card Studio | Stanley Hi"
    
    return () => {
      document.title = "Stanley's Portfolio" // Reset on unmount
    }
  }, [])


  // 🎯 监听页面可见性变化，避免离开浏览器时的不必要验证
  useEffect(() => {
    const handleVisibilityChange = () => {
      visibilityRef.current = !document.hidden
      if (visibilityRef.current) {
        console.log('👀 Page became visible')
        
        // 🔧 页面可见时恢复 - 极简缓存加载
        if (user) {
          console.log('👀 Page became visible, loading from cache...')
          actions.loadFromCache()
        }
      } else {
        console.log('🙈 Page became hidden, canceling requests...')
        // 🚫 页面隐藏时取消当前请求
        actions.cancelCurrentRequest()
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

      // 🎯 简化：让Supabase SDK处理session持久化，移除复杂缓存逻辑


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
          
          // 🎯 设置recent session标记，避免刷新时闪烁
          localStorage.setItem('ai-card-studio-recent-session', Date.now().toString())
          
          // 🎯 统一状态更新 - 同时设置用户和认证状态
          setUser(session.user)
          actions.setUser(session.user)
          
          // 🎯 首次初始化或登录事件处理
          if (event === 'SIGNED_IN' || !initializedRef.current) {
            console.log('🚀 Initializing workspace for user:', session.user.id)
            initializedRef.current = true
            
            // 优先加载缓存，无缓存时从数据库加载
            const hasCache = actions.loadFromCache()
            if (hasCache) {
              console.log('💾 Cache loaded, setting authenticated state')
              setAuthState('authenticated')
            } else {
              console.log('🔄 No cache, fetching from database')
              actions.fetchAndHandleWorkspace(session.user.id)
                .then(() => {
                  console.log('✅ Database loaded, setting authenticated state')
                  setAuthState('authenticated')
                })
                .catch(error => {
                  if (error.message?.includes('AbortError')) {
                    console.log('🚫 Initial fetch cancelled')
                  } else {
                    console.error('Initial workspace fetch failed:', error)
                    // 即使失败也设置为已认证，显示默认内容
                    setAuthState('authenticated')
                  }
                })
            }
          } else {
            // 已初始化的情况，直接设置为已认证
            setAuthState('authenticated')
          }
        } else {
          console.log('🚪 User signed out or no session')
          localStorage.removeItem('ai-card-studio-recent-session')
          setUser(null)
          actions.setUser(null)
          setAuthState('unauthenticated')
        }
      })

      // 🎯 简化Session恢复 - 信任Supabase标准机制
      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          if (!mounted) return
          
          if (error || !session) {
            console.log('No session found, setting unauthenticated')
            setAuthState('unauthenticated')
            return
          }
          
          // 成功恢复session
          console.log('✅ Session restored:', session.user.email)
          localStorage.setItem('ai-card-studio-recent-session', Date.now().toString())
          
          setUser(session.user)
          actions.setUser(session.user)
          
          // 首次初始化：优先缓存，统一状态更新
          if (!initializedRef.current) {
            initializedRef.current = true
            const hasCache = actions.loadFromCache()
            if (hasCache) {
              console.log('💾 Session restored with cache, setting authenticated')
              setAuthState('authenticated')
            } else {
              console.log('🔄 Session restored, no cache, fetching from database')
              actions.fetchAndHandleWorkspace(session.user.id)
                .then(() => {
                  console.log('✅ Database loaded after session restore')
                  setAuthState('authenticated')
                })
                .catch(() => {
                  console.log('❌ Database failed, but setting authenticated anyway')
                  setAuthState('authenticated')
                })
            }
          } else {
            // 已初始化，直接设置认证状态
            console.log('💾 Session restored, already initialized')
            setAuthState('authenticated')
          }
        })
        .catch((error) => {
          console.log('Session check failed:', error.message)
          setAuthState('unauthenticated')
        })

      return { subscription }
    }

    const { subscription } = initializeAuth()

    return () => {
      mounted = false
      subscription?.unsubscribe()
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
        // 🎯 清理recent session标记
        localStorage.removeItem('ai-card-studio-recent-session')
        
        // Reset user state immediately
        setUser(null)
        actions.setUser(null)
        setAuthState('unauthenticated')
      }
    } catch (err) {
      console.error('Unexpected sign out error:', err)
      alert('Sign out failed')
    }
  }

  // 🎯 统一渲染逻辑 - 基于单一authState状态
  const renderContent = () => {
    switch (authState) {
      case 'loading':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading AI Card Studio...</p>
            </div>
          </div>
        )
      case 'unauthenticated':
        return <AuthUI />
      case 'authenticated':
        return (
          <div className="relative">
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
        )
      default:
        return null
    }
  }

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
          {renderContent()}
        </div>
      </PageTransition>
    </>
  )
}