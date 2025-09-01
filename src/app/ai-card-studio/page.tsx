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
  const [loading, setLoading] = useState(true)
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

    const initializeAuth = async () => {
      try {
        // Get initial session with timeout
        const { data: { session }, error } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 10000)
          )
        ]) as any
        
        if (!mounted) return
        
        if (error) {
          console.error('Auth session error:', error)
          setLoading(false)
          return
        }

        const currentUser = session?.user ?? null
        setUser(currentUser)
        actions.setUser(currentUser)
        
        if (currentUser && !initializedRef.current) {
          initializedRef.current = true
          await actions.fetchAndHandleWorkspace(currentUser.id)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Auth initialization failed:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      actions.setUser(currentUser)
      
      // Only fetch workspace on actual sign-in, not tab switching
      if (currentUser && event === 'SIGNED_IN' && !initializedRef.current) {
        initializedRef.current = true
        await actions.fetchAndHandleWorkspace(currentUser.id)
      }
      
      if (mounted) {
        setLoading(false)
      }
    })

    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
      initializedRef.current = false
    }
  }, []) // 移除actions依赖

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

  if (loading || workspaceLoading) {
    return (
      <>
        <style jsx global>{`
          nav[role="banner"], 
          footer[role="contentinfo"],
          .navbar,
          .footer {
            display: none !important;
          }
          @keyframes gradient-shift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .animate-gradient-shift {
            background-size: 400% 400%;
            animation: gradient-shift 8s ease-in-out infinite;
          }
        `}</style>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 animate-gradient-shift">
          {/* Skeleton Layout */}
          <div className="p-6 pb-0">
            <div className="max-w-full mx-auto">
              {/* Title Skeleton */}
              <div className="flex items-center justify-center mb-8">
                <div className="h-9 w-48 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-lg animate-pulse"></div>
              </div>
              
              {/* Skeleton Cards Layout */}
              <div className="relative">
                <div className="horizontal-scroll-container flex gap-3 items-start overflow-x-auto scrollbar-hide pb-0 h-[calc(100vh-125px)] px-12">
                  {/* Skeleton Columns */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 w-[480px] h-full relative">
                      <div className="h-full overflow-y-auto scrollbar-hide pr-0">
                        <div className="space-y-3 pb-0 px-2">
                          {/* Skeleton Cards */}
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm p-4 animate-pulse">
                              <div className="h-6 bg-purple-200/60 rounded mb-3"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200/60 rounded w-full"></div>
                                <div className="h-4 bg-gray-200/60 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200/60 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading Indicator Overlay */}
          <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
            <svg className="w-5 h-5 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 718-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span className="text-sm font-medium text-purple-700">Loading workspace...</span>
          </div>
        </div>
      </>
    )
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
          {user ? (
            <div className="relative">
              {/* User menu - top right corner */}
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
              <AICardStudio />
            </div>
          ) : (
            <AuthUI />
          )}
        </div>
      </PageTransition>
    </>
  )
}