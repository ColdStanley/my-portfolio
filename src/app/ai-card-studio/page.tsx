'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import AICardStudio from './components/AICardStudio'
import AuthUI from './components/AuthUI'
import PageTransition from '@/components/PageTransition'
import { useWorkspaceStore } from './store/workspaceStore'
import { useThemeStore } from './store/useThemeStore'
import type { User } from '@supabase/supabase-js'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export default function AICardStudioPage() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [userMenuVisible, setUserMenuVisible] = useState(false)
  const [showPdfTemplateMenu, setShowPdfTemplateMenu] = useState(false)
  const [pdfTemplateMenuVisible, setPdfTemplateMenuVisible] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const [themeMenuVisible, setThemeMenuVisible] = useState(false)
  const [pdfTemplate, setPdfTemplate] = useState<'default' | 'resume'>('default')
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { isLoading: workspaceLoading, canvases, saveError, actions } = useWorkspaceStore()
  const { theme, actions: themeActions } = useThemeStore()
  const initializedRef = useRef(false)
  const visibilityRef = useRef(true) // Track page visibility


  // Set page title and initialize PDF template from localStorage
  useEffect(() => {
    document.title = "AI Card Studio | Stanley Hi"
    
    // Initialize theme
    themeActions.initializeTheme()
    
    // Initialize PDF template from localStorage
    if (typeof window !== 'undefined') {
      const savedTemplate = localStorage.getItem('pdfTemplate') as 'default' | 'resume'
      if (savedTemplate) {
        setPdfTemplate(savedTemplate)
      }
    }
    
    return () => {
      document.title = "Stanley's Portfolio" // Reset on unmount
    }
  }, [])


  // 🎯 监听页面可见性变化，避免离开浏览器时的不必要验证
  useEffect(() => {
    const handleVisibilityChange = () => {
      visibilityRef.current = !document.hidden
      if (visibilityRef.current) {
        // 🔧 页面可见时恢复 - 轻量检查更新
        if (user) {
          actions.checkForUpdates(user.id).catch(error => {
            console.warn('Update check failed:', error)
          })
        }
      } else {
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
        
        
        if (session?.user) {
          
          // 🎯 设置recent session标记，避免刷新时闪烁
          localStorage.setItem('ai-card-studio-recent-session', Date.now().toString())
          
          // 🎯 统一状态更新 - 同时设置用户和认证状态
          setUser(session.user)
          actions.setUser(session.user)
          
          // 🎯 首次初始化或真正的登录事件处理
          if (!initializedRef.current) {
            initializedRef.current = true
            
            // 🔧 使用新的智能加载逻辑
            actions.loadWorkspace(session.user.id)
              .then(() => {
                setAuthState('authenticated')
              })
              .catch(error => {
                console.error('Smart workspace load failed:', error)
                // 即使失败也设置为已认证，显示默认内容
                setAuthState('authenticated')
              })
          } else {
            // 已初始化的情况，直接设置为已认证
            setAuthState('authenticated')
          }
        } else {
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
            setAuthState('unauthenticated')
            return
          }
          
          // 成功恢复session
          localStorage.setItem('ai-card-studio-recent-session', Date.now().toString())
          
          setUser(session.user)
          actions.setUser(session.user)
          
          // 首次初始化：使用智能加载逻辑
          if (!initializedRef.current) {
            initializedRef.current = true
            actions.loadWorkspace(session.user.id)
              .then(() => {
                setAuthState('authenticated')
              })
              .catch(() => {
                setAuthState('authenticated')
              })
          } else {
            // 已初始化，直接设置认证状态
            setAuthState('authenticated')
          }
        })
        .catch((error) => {
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
        handleCloseUserMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error.message)
        alert('Sign out failed: ' + error.message)
      } else {
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

  const handleUserMenuToggle = () => {
    if (showUserMenu) {
      handleCloseUserMenu()
    } else {
      setShowUserMenu(true)
      setTimeout(() => setUserMenuVisible(true), 10)
    }
  }

  const handleCloseUserMenu = () => {
    setUserMenuVisible(false)
    setPdfTemplateMenuVisible(false)
    setTimeout(() => {
      setShowUserMenu(false)
      setShowPdfTemplateMenu(false)
    }, 200)
  }

  const handlePdfTemplateToggle = () => {
    if (showPdfTemplateMenu) {
      setPdfTemplateMenuVisible(false)
      setTimeout(() => setShowPdfTemplateMenu(false), 200)
    } else {
      setShowPdfTemplateMenu(true)
      setTimeout(() => setPdfTemplateMenuVisible(true), 10)
    }
  }

  const handlePdfTemplateSelect = (template: 'default' | 'resume') => {
    setPdfTemplate(template)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pdfTemplate', template)
    }
    setPdfTemplateMenuVisible(false)
    setTimeout(() => setShowPdfTemplateMenu(false), 200)
  }

  const handleThemeMenuToggle = () => {
    if (showThemeMenu) {
      setThemeMenuVisible(false)
      setTimeout(() => setShowThemeMenu(false), 200)
    } else {
      setShowThemeMenu(true)
      setTimeout(() => setThemeMenuVisible(true), 10)
    }
  }

  const handleThemeSelect = (selectedTheme: 'light' | 'dark' | 'lakers' | 'anno' | 'cyberpunk') => {
    themeActions.setTheme(selectedTheme)
    setThemeMenuVisible(false)
    setTimeout(() => setShowThemeMenu(false), 200)
  }

  // 🎯 统一渲染逻辑 - 基于单一authState状态
  const renderContent = () => {
    switch (authState) {
      case 'loading':
        return (
          <div className="min-h-screen bg-white dark:bg-neutral-900 lakers:bg-gradient-to-br lakers:from-lakers-800 lakers:to-lakers-700 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-purple-600 lakers:border-lakers-300 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-neutral-400 lakers:text-lakers-300">Loading AI Card Studio...</p>
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
                  onClick={handleUserMenuToggle}
                  className="px-3 py-2 text-xs text-gray-400 hover:text-purple-600 lakers:text-lakers-300 lakers:hover:text-lakers-400 anno:text-anno-300 anno:hover:text-anno-400 cyberpunk:text-cyberpunk-300 cyberpunk:hover:text-cyberpunk-400 hover:bg-purple-50/50 lakers:hover:bg-lakers-300/20 anno:hover:bg-anno-300/20 cyberpunk:hover:bg-cyberpunk-300/20 dark:text-neutral-500 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105 active:scale-95"
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
                  <div className={`absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-700 p-2 transform transition-all duration-200 ease-out ${
                    userMenuVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2'
                  }`}>
                    {/* PDF Template Selection */}
                    <div 
                      className="relative"
                      onMouseEnter={() => {
                        setShowPdfTemplateMenu(true)
                        setTimeout(() => setPdfTemplateMenuVisible(true), 10)
                      }}
                      onMouseLeave={() => {
                        setPdfTemplateMenuVisible(false)
                        setTimeout(() => setShowPdfTemplateMenu(false), 200)
                      }}
                    >
                      <button
                        className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 rounded-md transition-all duration-150 text-left flex items-center"
                      >
                        <span>PDF Template</span>
                      </button>
                      
                      {/* PDF Template Submenu */}
                      {showPdfTemplateMenu && (
                        <div className={`absolute top-0 right-full mr-2 z-50 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-neutral-700/50 p-3 transform transition-all duration-300 ease-out ${
                          pdfTemplateMenuVisible ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-2'
                        }`}>
                          {/* Arrow pointing to button */}
                          <div className="absolute top-4 -right-1 w-2 h-2 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md border-r border-b border-white/20 dark:border-neutral-700/50 transform rotate-45"></div>
                          
                          <div className="flex flex-col gap-2 min-w-28">
                            <button
                              onClick={() => handlePdfTemplateSelect('default')}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 text-left transform hover:scale-[1.02] hover:shadow-md active:scale-95 ${
                                pdfTemplate === 'default' 
                                  ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20 shadow-sm' 
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
                              }`}
                            >
                              Default
                            </button>
                            <button
                              onClick={() => handlePdfTemplateSelect('resume')}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 text-left transform hover:scale-[1.02] hover:shadow-md active:scale-95 ${
                                pdfTemplate === 'resume' 
                                  ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20 shadow-sm' 
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
                              }`}
                            >
                              Resume
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Separator */}
                    <hr className="my-2 border-gray-200 dark:border-neutral-700" />
                    
                    {/* Theme Selection */}
                    <div 
                      className="relative"
                      onMouseEnter={() => {
                        setShowThemeMenu(true)
                        setTimeout(() => setThemeMenuVisible(true), 10)
                      }}
                      onMouseLeave={() => {
                        setThemeMenuVisible(false)
                        setTimeout(() => setShowThemeMenu(false), 200)
                      }}
                    >
                      <button
                        className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20 rounded-md transition-all duration-150 text-left flex items-center"
                      >
                        <span>Theme</span>
                      </button>
                      
                      {/* Theme Submenu */}
                      {showThemeMenu && (
                        <div className={`absolute top-0 right-full mr-2 z-50 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-neutral-700/50 p-3 transform transition-all duration-300 ease-out ${
                          themeMenuVisible ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-2'
                        }`}>
                          {/* Arrow pointing to button */}
                          <div className="absolute top-4 -right-1 w-2 h-2 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md border-r border-b border-white/20 dark:border-neutral-700/50 transform rotate-45"></div>
                          
                          <div className="flex flex-col gap-2 min-w-28">
                            <button
                              onClick={() => handleThemeSelect('light')}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 text-left transform hover:scale-[1.02] hover:shadow-md active:scale-95 ${
                                theme === 'light' 
                                  ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20 shadow-sm' 
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
                              }`}
                            >
                              Light
                            </button>
                            <button
                              onClick={() => handleThemeSelect('dark')}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 text-left transform hover:scale-[1.02] hover:shadow-md active:scale-95 ${
                                theme === 'dark' 
                                  ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20 shadow-sm' 
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
                              }`}
                            >
                              Dark
                            </button>
                            <button
                              onClick={() => handleThemeSelect('lakers')}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 text-left transform hover:scale-[1.02] hover:shadow-md active:scale-95 ${
                                theme === 'lakers' 
                                  ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20 shadow-sm' 
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
                              }`}
                            >
                              Lakers
                            </button>
                            <button
                              onClick={() => handleThemeSelect('anno')}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 text-left transform hover:scale-[1.02] hover:shadow-md active:scale-95 ${
                                theme === 'anno' 
                                  ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20 shadow-sm' 
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
                              }`}
                            >
                              Anno
                            </button>
                            <button
                              onClick={() => handleThemeSelect('cyberpunk')}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 text-left transform hover:scale-[1.02] hover:shadow-md active:scale-95 ${
                                theme === 'cyberpunk' 
                                  ? 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20 shadow-sm' 
                                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-purple-900/20'
                              }`}
                            >
                              Cyberpunk
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        handleCloseUserMenu()
                        handleSignOut()
                      }}
                      className="w-full px-3 py-1.5 text-sm text-left text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 rounded-md transition-all duration-150 flex items-center gap-2"
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