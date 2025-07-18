'use client'

import { useState, useEffect } from 'react'

interface UseOutlookAuthReturn {
  isAuthenticated: boolean
  isLoading: boolean
  authenticate: () => Promise<void>
  addToCalendar: (taskData: any) => Promise<boolean>
}

export function useOutlookAuth(): UseOutlookAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
    
    // 监听认证完成的消息
    const handleMessage = async (event: MessageEvent) => {
      console.log('Received message:', event.data, 'from:', event.origin)
      
      if (event.data.type === 'AUTH_SUCCESS') {
        console.log('Received AUTH_SUCCESS message')
        // 验证认证状态
        await checkAuthStatus()
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...')
      const response = await fetch('/api/outlook/calendar')
      const data = await response.json()
      console.log('Auth status response:', data)
      setIsAuthenticated(data.authenticated || false)
    } catch (error) {
      console.error('Failed to check auth status:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const authenticate = async () => {
    try {
      console.log('Starting authentication...')
      const response = await fetch('/api/outlook/auth')
      const data = await response.json()
      
      console.log('Auth response:', data)
      
      if (data.authUrl) {
        console.log('Opening popup with URL:', data.authUrl)
        const popup = window.open(data.authUrl, '_blank', 'width=600,height=700')
        
        if (!popup) {
          console.error('Popup blocked by browser!')
          alert('Popup blocked! Please allow popups for this site and try again.')
          return
        }
        
        console.log('Popup opened successfully')
        
        // 检查弹窗是否被关闭
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            console.log('Popup was closed')
            clearInterval(checkClosed)
          }
        }, 1000)
        
        // 认证状态会通过postMessage更新，无需轮询
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      throw error
    }
  }

  const addToCalendar = async (taskData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/outlook/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      })

      const data = await response.json()

      if (data.requireAuth) {
        setIsAuthenticated(false)
        await authenticate()
        return false
      }

      if (response.ok && data.success) {
        return true
      } else {
        throw new Error(data.error || 'Failed to add to calendar')
      }
    } catch (error) {
      console.error('Failed to add to calendar:', error)
      throw error
    }
  }

  return {
    isAuthenticated,
    isLoading,
    authenticate,
    addToCalendar
  }
}