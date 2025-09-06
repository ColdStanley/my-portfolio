import { useAdminContext } from '../components/admin/AdminContext'

/**
 * Hook specifically for admin panel components
 * Uses the panel's authentication context instead of individual auth checks
 */
export function useAdminPanel() {
  const { isAuthenticated, masterKey } = useAdminContext()

  const makeAdminRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    if (!isAuthenticated || !masterKey) {
      throw new Error('Admin panel not authenticated')
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-admin-master-key': masterKey,
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      console.error(`[ADMIN_PANEL] Request failed: ${response.status}`)
      throw new Error(`Admin request failed: ${response.statusText}`)
    }

    return response
  }

  return {
    isAuthenticated,
    makeAdminRequest
  }
}