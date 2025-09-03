'use client'

interface MarketplaceFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: 'created_at' | 'downloads' | 'name'
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: 'created_at' | 'downloads' | 'name', sortOrder: 'asc' | 'desc') => void
  loading: boolean
}

export default function MarketplaceFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  loading
}: MarketplaceFiltersProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search columns, descriptions, or tags..."
              disabled={loading}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
          
          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any, sortOrder)}
            disabled={loading}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 text-sm"
          >
            <option value="created_at">Date Created</option>
            <option value="downloads">Downloads</option>
            <option value="name">Name</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'desc' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {searchQuery ? (
              <>Showing results for "<span className="font-medium">{searchQuery}</span>"</>
            ) : (
              `Showing all columns sorted by ${sortBy === 'created_at' ? 'date created' : sortBy} (${sortOrder === 'desc' ? 'newest first' : 'oldest first'})`
            )}
          </p>
        </div>
      )}
    </div>
  )
}