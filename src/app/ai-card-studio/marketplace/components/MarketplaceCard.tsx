'use client'

import { MarketplaceListItem } from '../../types'

interface MarketplaceCardProps {
  item: MarketplaceListItem
  onPreview: () => void
}

export default function MarketplaceCard({ item, onPreview }: MarketplaceCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDownloads = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          by {item.author_name} • {formatDate(item.created_at)}
        </p>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
        {item.description}
      </p>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <span>{formatDownloads(item.downloads)} downloads</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPreview()
          }}
          className="flex-1 px-3 py-2 bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg text-sm font-medium transition-all duration-200"
        >
          Preview
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPreview()
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Import
        </button>
      </div>
    </div>
  )
}