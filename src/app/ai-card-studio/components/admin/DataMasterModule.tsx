'use client'

import { useState, useEffect } from 'react'
import { useAdminPanel } from '../../hooks/useAdminPanel'
import { useAdminUsers, useAdminWorkspaces, useAdminMarketplace } from '../../hooks/useAdminDataLoader'

/**
 * Data Master Module - God Mode Data Control
 * 
 * Complete control over all user data, workspaces, and marketplace content
 * Provides viewing, editing, and deletion capabilities with no ownership restrictions
 */

interface User {
  id: string
  email: string
  created_at: string
  workspaces_count: number
  cards_count: number
  marketplace_items_count: number
  is_active: boolean
}

interface Workspace {
  id: string
  user_id: string
  name: string
  created_at: string
  user_info: {
    email: string
  }
  card_analysis: {
    totalCards: number
    passwordProtectedCards: number
  }
}

interface MarketplaceItem {
  id: string
  name: string
  description: string
  author_email: string
  downloads: number
  created_at: string
  content_analysis: any
}

export default function DataMasterModule() {
  const { makeAdminRequest } = useAdminPanel()
  
  // Use custom hooks for data loading
  const { data: usersData, loading: usersLoading, refresh: refreshUsers } = useAdminUsers()
  const { data: workspacesData, loading: workspacesLoading, refresh: refreshWorkspaces } = useAdminWorkspaces()
  const { data: marketplaceData, loading: marketplaceLoading, refresh: refreshMarketplace, setData: setMarketplaceData } = useAdminMarketplace()
  
  const [activeTab, setActiveTab] = useState<'users' | 'workspaces' | 'marketplace'>('users')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [viewingData, setViewingData] = useState<any>(null)
  const [selectedUserWorkspaces, setSelectedUserWorkspaces] = useState<Workspace[]>([])
  const [loadingUserWorkspaces, setLoadingUserWorkspaces] = useState(false)
  
  // Extract data from hooks
  const users = usersData?.users || []
  const workspaces = selectedUser ? selectedUserWorkspaces : (workspacesData?.workspaces || [])
  const marketplaceItems = marketplaceData?.items || []
  
  // Combined loading state
  const loading = usersLoading || workspacesLoading || marketplaceLoading || loadingUserWorkspaces

  /**
   * Load workspaces for specific user using optimized Hook pattern
   */
  const loadUserWorkspaces = async (userId: string) => {
    setLoadingUserWorkspaces(true)
    try {
      const response = await makeAdminRequest(`/api/admin/workspaces?userId=${userId}`)
      const data = await response.json()
      setSelectedUserWorkspaces(data.workspaces || [])
    } catch (error) {
      console.error('[DATA_MASTER] Failed to load user workspaces:', error)
      setSelectedUserWorkspaces([])
    } finally {
      setLoadingUserWorkspaces(false)
    }
  }

  /**
   * Delete marketplace item with admin override
   */
  const deleteMarketplaceItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this marketplace item? This action cannot be undone.')) {
      return
    }

    try {
      await makeAdminRequest(`/api/admin/marketplace/${itemId}`, {
        method: 'DELETE'
      })
      
      // Update marketplace data using Hook setter
      const updatedItems = marketplaceItems.filter(item => item.id !== itemId)
      setMarketplaceData({ items: updatedItems })
      alert('Item deleted successfully')
    } catch (error) {
      console.error('[DATA_MASTER] Failed to delete marketplace item:', error)
      alert('Failed to delete item: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  /**
   * View detailed data in modal
   */
  const viewData = (data: any, title: string) => {
    setViewingData({ data, title })
  }

  // Load user-specific workspaces when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      loadUserWorkspaces(selectedUser)
    } else {
      setSelectedUserWorkspaces([])
    }
  }, [selectedUser])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-2xl">🗄️</span>
            Data Master Control
          </h2>
          <p className="text-gray-400 mt-1">Complete access to all user data and content</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'users') refreshUsers()
            if (activeTab === 'workspaces') selectedUser ? loadUserWorkspaces(selectedUser) : refreshWorkspaces()
            if (activeTab === 'marketplace') refreshMarketplace()
          }}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'users', label: 'Users', count: users.length },
            { id: 'workspaces', label: 'Workspaces', count: workspaces.length },
            { id: 'marketplace', label: 'Marketplace', count: marketplaceItems.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="bg-gray-900/50 rounded-xl p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-400">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Loading {activeTab}...
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-white truncate">{user.email}</h3>
                      <p className="text-xs text-gray-400">ID: {user.id}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Workspaces:</span>
                      <span className="text-white">{user.workspaces_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cards:</span>
                      <span className="text-white">{user.cards_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Marketplace:</span>
                      <span className="text-white">{user.marketplace_items_count}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedUser(user.id)
                        setActiveTab('workspaces')
                      }}
                      className="flex-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 text-sm rounded border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                    >
                      View Workspaces
                    </button>
                    <button
                      onClick={() => viewData(user, `User: ${user.email}`)}
                      className="px-3 py-1.5 bg-gray-600/20 text-gray-400 text-sm rounded border border-gray-500/30 hover:bg-gray-600/30 transition-colors"
                    >
                      Raw Data
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workspaces Tab */}
        {activeTab === 'workspaces' && !loading && (
          <div className="space-y-4">
            {selectedUser && (
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-gray-400">Showing workspaces for: </span>
                <span className="text-white">{selectedUser}</span>
              </div>
            )}
            
            <div className="space-y-3">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{workspace.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Owner: {workspace.user_info.email} • Created: {new Date(workspace.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-400">
                          Cards: <span className="text-white">{workspace.card_analysis.totalCards}</span>
                        </span>
                        <span className="text-gray-400">
                          Protected: <span className="text-white">{workspace.card_analysis.passwordProtectedCards}</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => viewData(workspace, `Workspace: ${workspace.name}`)}
                      className="px-3 py-1.5 bg-gray-600/20 text-gray-400 text-sm rounded border border-gray-500/30 hover:bg-gray-600/30 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && !loading && (
          <div className="space-y-4">
            <div className="space-y-3">
              {marketplaceItems.map((item) => (
                <div key={item.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-400">
                          Author: <span className="text-white">{item.author_email}</span>
                        </span>
                        <span className="text-gray-400">
                          Downloads: <span className="text-white">{item.downloads}</span>
                        </span>
                        <span className="text-gray-400">
                          Cards: <span className="text-white">{item.content_analysis?.cardCount || 0}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => viewData(item, `Marketplace: ${item.name}`)}
                        className="px-3 py-1.5 bg-blue-600/20 text-blue-400 text-sm rounded border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => deleteMarketplaceItem(item.id)}
                        className="px-3 py-1.5 bg-red-600/20 text-red-400 text-sm rounded border border-red-500/30 hover:bg-red-600/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Raw Data Modal */}
      {viewingData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">{viewingData.title}</h3>
              <button
                onClick={() => setViewingData(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                {JSON.stringify(viewingData.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}