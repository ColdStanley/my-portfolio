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
  const [showAuthUI, setShowAuthUI] = useState(true)  // 🔧 默认显示 Auth UI
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { isLoading: workspaceLoading, actions } = useWorkspaceStore()
  const initializedRef = useRef(false)

  // Set page title
  useEffect(() => {
    document.title = "AI Card Studio | Stanley Hi"
    
    return () => {
      document.title = "Stanley's Portfolio" // Reset on unmount
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

      // 📡 监听 auth 状态变化
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return
        
        if (session?.user) {
          console.log('User authenticated:', session.user.email)
          setUser(session.user)
          actions.setUser(session.user)
          setShowAuthUI(false)
          
          // Fetch workspace for authenticated user
          if (!initializedRef.current) {
            initializedRef.current = true
            try {
              await actions.fetchAndHandleWorkspace(session.user.id)
            } catch (error) {
              console.error('Workspace fetch failed:', error)
              // Continue with default workspace
            }
          }
        } else {
          console.warn('No valid session, fallback to Auth UI')
          
          // Clear bad tokens to avoid death loop
          await clearBadTokens()
          
          setUser(null)
          actions.setUser(null)
          actions.resetWorkspace()
          setShowAuthUI(true)
        }
      })

      // 🎯 非阻塞地尝试恢复一次 session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!mounted) return
        
        if (error || !session) {
          console.warn('Session invalid on init, showing Auth UI:', error?.message)
          setShowAuthUI(true)
          actions.resetWorkspace()
        } else {
          console.log('Session restored:', session.user.email)
          setUser(session.user)
          actions.setUser(session.user)
          setShowAuthUI(false)
          
          if (!initializedRef.current) {
            initializedRef.current = true
            actions.fetchAndHandleWorkspace(session.user.id).catch(error => {
              console.error('Workspace fetch failed:', error)
            })
          }
        }
      }).catch((error) => {
        console.error('Session check failed:', error)
        if (mounted) {
          clearBadTokens()
          setShowAuthUI(true)
          actions.resetWorkspace()
        }
      })

      return subscription
    }

    const subscription = initializeAuth()

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
          {showAuthUI ? (
            <AuthUI />
          ) : (
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
          )}
        </div>
      </PageTransition>
    </>
  )
}