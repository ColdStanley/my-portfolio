'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import DataMasterModule from './admin/DataMasterModule'
import DebugMonitorModule from './admin/DebugMonitorModule'
import QuickActionsModule from './admin/QuickActionsModule'
import SystemStatsModule from './admin/SystemStatsModule'
import { AdminProvider } from './admin/AdminContext'

/**
 * Developer Panel - God Mode Control Center
 * 
 * The ultimate admin interface providing complete control over the AI Card Studio
 * Accessible only to authorized developers with master key authentication
 * 
 * Features:
 * - Complete user and workspace management
 * - Marketplace content control
 * - System monitoring and debugging
 * - Bulk operations and quick actions
 * - Real-time statistics and analytics
 */

interface DeveloperPanelProps {
  isVisible: boolean
  onClose: () => void
}

export default function DeveloperPanel({ isVisible, onClose }: DeveloperPanelProps) {
  const { isAdmin, masterKey, setMasterKey, makeAdminRequest } = useAdminAuth()
  const [activeModule, setActiveModule] = useState<string>('data')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string>('')
  const [systemHealth, setSystemHealth] = useState<any>(null)

  /**
   * Authenticate admin access with master key
   */
  const authenticateAdmin = async () => {
    if (!masterKey.trim()) {
      setAuthError('Master key is required')
      return
    }

    try {
      setAuthError('')
      // Test admin access with a simple API call
      const response = await makeAdminRequest('/api/admin/users')
      const data = await response.json()
      
      setIsAuthenticated(true)
      console.log('[DEV_PANEL] Admin authentication successful')
      
      // Load initial system health data
      loadSystemHealth()
    } catch (error) {
      console.error('[DEV_PANEL] Admin authentication failed:', error)
      setAuthError(error instanceof Error ? error.message : 'Authentication failed')
      setIsAuthenticated(false)
    }
  }

  /**
   * Load system health and statistics
   */
  const loadSystemHealth = async () => {
    try {
      const [usersRes, workspacesRes, marketplaceRes] = await Promise.all([
        makeAdminRequest('/api/admin/users'),
        makeAdminRequest('/api/admin/workspaces'),
        makeAdminRequest('/api/admin/marketplace')
      ])

      const [users, workspaces, marketplace] = await Promise.all([
        usersRes.json(),
        workspacesRes.json(),
        marketplaceRes.json()
      ])

      setSystemHealth({
        users: users.totalCount || 0,
        workspaces: workspaces.systemStats?.totalWorkspaces || 0,
        cards: workspaces.systemStats?.totalCards || 0,
        marketplaceItems: marketplace.statistics?.totalItems || 0,
        totalDownloads: marketplace.statistics?.totalDownloads || 0,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('[DEV_PANEL] Failed to load system health:', error)
    }
  }

  // Reset authentication when panel is closed
  useEffect(() => {
    if (!isVisible) {
      setIsAuthenticated(false)
      setAuthError('')
    }
  }, [isVisible])

  if (!isVisible) return null

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
        <div className="bg-red-900/90 backdrop-blur-md rounded-xl p-8 border border-red-500 max-w-md mx-4">
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-300 mb-2">Access Denied</h2>
            <p className="text-red-400 mb-4">You do not have developer privileges.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999]">
      <div className="h-full flex">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-gray-900/95 backdrop-blur-md border-r border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-red-400">GOD MODE</h1>
                  <p className="text-xs text-gray-400">Developer Panel</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Authentication */}
            {!isAuthenticated ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Master Key</label>
                  <input
                    type="password"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    placeholder="Enter master key..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    onKeyPress={(e) => e.key === 'Enter' && authenticateAdmin()}
                  />
                </div>
                {authError && (
                  <p className="text-red-400 text-sm">{authError}</p>
                )}
                <button
                  onClick={authenticateAdmin}
                  disabled={!masterKey.trim()}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Authenticate
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-400 font-medium">Authenticated</p>
                <p className="text-gray-400 text-sm">Full system access granted</p>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          {isAuthenticated && (
            <nav className="p-4">
              <div className="space-y-2">
                {[
                  { id: 'data', name: 'Data Master', icon: '🗄️', desc: 'Users & Workspaces' },
                  { id: 'debug', name: 'Debug Monitor', icon: '🐛', desc: 'Logs & Performance' },
                  { id: 'actions', name: 'Quick Actions', icon: '🎮', desc: 'Bulk Operations' },
                  { id: 'stats', name: 'System Stats', icon: '📊', desc: 'Analytics Dashboard' }
                ].map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeModule === module.id
                        ? 'bg-red-600/20 border border-red-500/30 text-red-300'
                        : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{module.icon}</span>
                      <div>
                        <div className="font-medium">{module.name}</div>
                        <div className="text-xs opacity-75">{module.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </nav>
          )}

          {/* System Health */}
          {isAuthenticated && systemHealth && (
            <div className="p-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3">System Health</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Users:</span>
                  <span className="text-white">{systemHealth.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cards:</span>
                  <span className="text-white">{systemHealth.cards}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Downloads:</span>
                  <span className="text-white">{systemHealth.totalDownloads}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-950/95 backdrop-blur-md overflow-y-auto">
          {isAuthenticated ? (
            <AdminProvider isAuthenticated={isAuthenticated} masterKey={masterKey}>
              <div className="p-8">
                {activeModule === 'data' && <DataMasterModule />}
                {activeModule === 'debug' && <DebugMonitorModule />}
                {activeModule === 'actions' && <QuickActionsModule />}
                {activeModule === 'stats' && <SystemStatsModule />}
              </div>
            </AdminProvider>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-lg">Authentication Required</p>
                <p className="text-sm mt-1">Enter your master key to access the developer panel</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}