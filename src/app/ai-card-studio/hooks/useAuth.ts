import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  user_metadata?: {
    name?: string
  }
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  // 检查认证状态
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/ai-card-studio/api/auth/me', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const { user } = await response.json()
        setAuthState({ user, loading: false, error: null })
      } else {
        // 认证失败，清除状态
        setAuthState({ user: null, loading: false, error: null })
      }
    } catch (error) {
      console.error('❌ Auth status check error:', error)
      setAuthState({ user: null, loading: false, error: null })
    }
  }, [])

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // 统一错误处理
  const handleApiError = (error: any, defaultMessage: string) => {
    console.error('❌ API Error:', error)
    let errorMessage = defaultMessage
    
    // 处理HTML响应错误
    if (error.message?.includes('Unexpected token')) {
      errorMessage = 'Authentication failed, please sign in again'
      setAuthState({ user: null, loading: false, error: errorMessage })
    } else {
      errorMessage = error instanceof Error ? error.message : defaultMessage
    }
    
    return errorMessage
  }

  // 登录
  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/ai-card-studio/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const user = data.user ?? data.session?.user
        
        if (user) {
          console.log('🔄 useAuth: Login successful, updating state:', {
            userEmail: user.email,
            userId: user.id
          })
          
          // 立即更新UI状态 (用户体验优先)
          const newState = { user, loading: false, error: null }
          setAuthState(newState)
          
          console.log('🔄 useAuth: State updated, isAuthenticated should now be true')
          console.log('🔄 useAuth: New state object:', newState)
          
          // 强制触发组件重新渲染
          setTimeout(() => {
            console.log('🔄 useAuth: Force triggering state update')
            setAuthState(prevState => ({ ...prevState }))
          }, 50)
          
          // 后台验证Cookie (数据一致性保障)
          setTimeout(() => {
            checkAuthStatus().catch(error => {
              console.warn('🔄 Background auth verification failed:', error)
              // 如果验证失败，清除状态
              setAuthState({ user: null, loading: false, error: 'Authentication expired' })
            })
          }, 100)
          
          return { success: true, data }
        } else {
          setAuthState(prev => ({ ...prev, loading: false, error: 'No user returned' }))
          return { success: false, error: 'No user returned' }
        }
      } else {
        const data = await response.json()
        const errorMessage = data.error || 'Login failed'
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Login failed')
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  // 注册
  const register = async (email: string, password: string, name?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/ai-card-studio/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setAuthState({ user: data.user, loading: false, error: null })
          return { success: true, data }
        }
      }
      
      const data = await response.json()
      const errorMessage = data.error || 'Registration failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Registration failed')
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  // 登出
  const logout = async () => {
    try {
      await fetch('/ai-card-studio/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('❌ Logout error:', error)
    } finally {
      // 无论API调用成功与否，都清除前端状态
      setAuthState({ user: null, loading: false, error: null })
    }
  }

  const isAuthenticated = !!authState.user

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus
  }
}