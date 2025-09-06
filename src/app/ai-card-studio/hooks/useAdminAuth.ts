import { useState, useEffect } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'

/**
 * Admin Authentication Hook - God Mode Access Control
 * 
 * Provides client-side admin authentication and permission checking
 * Integrates with the workspace store and environment configuration
 * 
 * Features:
 * - Real-time admin status checking
 * - Master key management
 * - Secure API request helpers
 */

interface AdminAuthState {
  isAdmin: boolean
  isChecking: boolean
  masterKey: string
  setMasterKey: (key: string) => void
  checkAdminStatus: () => Promise<boolean>
  makeAdminRequest: (url: string, options?: RequestInit) => Promise<Response>
}

export function useAdminAuth(): AdminAuthState {
  const { user } = useWorkspaceStore()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [masterKey, setMasterKey] = useState('')

  /**
   * Check if current user has admin privileges
   * This performs client-side validation against environment configuration
   */
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user?.id) {
      setIsAdmin(false)
      return false
    }

    setIsChecking(true)

    try {
      // Client-side admin check - this is a basic validation
      // Real security is enforced on the backend middleware
      const adminIds = process.env.NEXT_PUBLIC_DEVELOPER_ADMIN_IDS?.split(',').map(id => id.trim()) || []
      
      const userIsAdmin = adminIds.includes(user.id)
      setIsAdmin(userIsAdmin)
      
      console.log('[ADMIN_HOOK] Admin status check:', {
        userId: user.id,
        email: user.email,
        isAdmin: userIsAdmin,
        adminIdsConfigured: adminIds.length > 0
      })

      return userIsAdmin
    } catch (error) {
      console.error('[ADMIN_HOOK] Error checking admin status:', error)
      setIsAdmin(false)
      return false
    } finally {
      setIsChecking(false)
    }
  }

  /**
   * Make authenticated admin API requests with proper headers
   */
  const makeAdminRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    if (!isAdmin) {
      throw new Error('Admin privileges required')
    }

    if (!masterKey) {
      throw new Error('Master key required for admin operations')
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-admin-master-key': masterKey,
      ...options.headers
    }

    console.log(`[ADMIN_HOOK] Making admin request to: ${url}`)

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (response.status === 403) {
      console.error('[ADMIN_HOOK] Admin request forbidden - check master key and permissions')
      throw new Error('Admin access denied - invalid credentials')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[ADMIN_HOOK] Admin request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(errorData.error || `Request failed: ${response.status}`)
    }

    return response
  }

  // Check admin status when user changes
  useEffect(() => {
    if (user) {
      checkAdminStatus()
    } else {
      setIsAdmin(false)
    }
  }, [user?.id])

  // Load master key from localStorage if available
  useEffect(() => {
    const savedMasterKey = localStorage.getItem('admin_master_key')
    if (savedMasterKey) {
      setMasterKey(savedMasterKey)
    }
  }, [])

  // Save master key to localStorage when set
  const setMasterKeyWithStorage = (key: string) => {
    setMasterKey(key)
    if (key) {
      localStorage.setItem('admin_master_key', key)
    } else {
      localStorage.removeItem('admin_master_key')
    }
  }

  return {
    isAdmin,
    isChecking,
    masterKey,
    setMasterKey: setMasterKeyWithStorage,
    checkAdminStatus,
    makeAdminRequest
  }
}