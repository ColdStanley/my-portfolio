'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MarketplaceListItem, MarketplacePagination } from '../types'
import MarketplaceGrid from './components/MarketplaceGrid'
import MarketplaceFilters from './components/MarketplaceFilters'
import PreviewModal from './components/PreviewModal'
import { useWorkspaceStore } from '../store/workspaceStore'
import { supabase } from '../../../lib/supabaseClient'
import PageTransition from '@/components/PageTransition'

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceListItem[]>([])
  const [pagination, setPagination] = useState<MarketplacePagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'downloads' | 'name'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Preview modal state
  const [previewItem, setPreviewItem] = useState<string | null>(null)

  // Initialize workspace store for importing functionality
  const { actions } = useWorkspaceStore()

  // Initialize workspace on component mount - cache-first strategy
  useEffect(() => {
    const initWorkspace = async () => {
      try {
        console.log('Initializing workspace for marketplace')
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        
        if (!authError && session?.user) {
          console.log('User authenticated, loading workspace for:', session.user.id)
          actions.setUser(session.user)
          
          // 🔧 使用智能加载逻辑
          console.log('Loading workspace intelligently for marketplace')
          await actions.loadWorkspace(session.user.id)
        } else {
          console.log('No authenticated user or auth error:', authError)
        }
      } catch (error) {
        console.error('Failed to initialize workspace:', error)
      }
    }

    initWorkspace()
  }, [])

  // Fetch marketplace items with search support
  const fetchItems = async (page: number = 1, search: string = '') => {
    try {
      console.log('Fetching marketplace items, page:', page, 'search:', search)
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sort: sortBy,
        order: sortOrder
      })

      // Add search query if provided
      if (search.trim()) {
        params.set('search', search.trim())
      }

      const url = `/api/marketplace?${params}`
      console.log('Fetching from URL:', url)
      
      const response = await fetch(url)
      console.log('Response status:', response.status, 'ok:', response.ok)
      
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace items')
      }

      const data = await response.json()
      console.log('Received data:', data)
      console.log('Items count:', data.items?.length)
      
      setItems(data.items)
      setPagination(data.pagination)
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and when sorting changes
  useEffect(() => {
    fetchItems(1, searchQuery)
  }, [sortBy, sortOrder])

  // Handle search changes with API call
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchItems(1, searchQuery)
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchItems(page, searchQuery)
  }

  // Handle sort change
  const handleSortChange = (newSortBy: typeof sortBy, newSortOrder: typeof sortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 pt-16 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  href="/ai-card-studio"
                  className="text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Studio
                </Link>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI Card Studio Marketplace
              </h1>
              <p className="text-gray-600 mt-2">
                Discover and share powerful workflow columns created by the community
              </p>
            </div>
            
            {/* Stats */}
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{pagination.total}</div>
                <div className="text-sm text-gray-500">Shared Columns</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <MarketplaceFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            loading={loading}
          />

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-purple-600">
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span className="font-medium">Loading marketplace...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Items Grid */}
              <MarketplaceGrid
                items={items}
                onPreview={setPreviewItem}
              />

              {/* Empty State */}
              {!loading && items.length === 0 && (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-500 mb-2">
                    {searchQuery ? 'No items found' : 'No items in marketplace yet'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {searchQuery
                      ? 'Try adjusting your search terms or filters'
                      : 'Be the first to share a column with the community!'
                    }
                  </p>
                  {!searchQuery && (
                    <Link
                      href="/ai-card-studio"
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Go to Studio
                    </Link>
                  )}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm rounded-lg transition-all duration-150 ${
                        page === pagination.page
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Preview Modal */}
        <PreviewModal
          itemId={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      </div>
    </PageTransition>
  )
}