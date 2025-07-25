'use client'

interface SkeletonLoaderProps {
  type: 'page' | 'articleInput' | 'readingView' | 'queryCard'
}

export default function SkeletonLoader({ type }: SkeletonLoaderProps) {
  if (type === 'page') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Title skeleton */}
          <div className="h-9 bg-gradient-to-r from-purple-200 to-purple-300 rounded-lg mb-8 animate-pulse w-64"></div>
          
          {/* Main content skeleton */}
          <div className="space-y-6">
            <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'articleInput') {
    return (
      <div className="space-y-6">
        {/* Input area skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gradient-to-r from-purple-200 to-purple-300 rounded mb-4 animate-pulse w-48"></div>
          <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4 animate-pulse"></div>
          <div className="flex justify-between items-center">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-32"></div>
            <div className="h-10 bg-gradient-to-r from-purple-200 to-purple-300 rounded animate-pulse w-24"></div>
          </div>
        </div>

        {/* Previous articles skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gradient-to-r from-purple-200 to-purple-300 rounded mb-4 animate-pulse w-40"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-2 animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-8 bg-gradient-to-r from-purple-200 to-purple-300 rounded animate-pulse w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'readingView') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article content skeleton */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="h-7 bg-gradient-to-r from-purple-200 to-purple-300 rounded mb-6 animate-pulse w-2/3"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-4/6"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Query cards skeleton */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4">
              <div className="h-5 bg-gradient-to-r from-purple-200 to-purple-300 rounded mb-3 animate-pulse w-24"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-3/4"></div>
                <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'queryCard') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="flex justify-between items-start mb-3">
          <div className="h-5 bg-gradient-to-r from-purple-200 to-purple-300 rounded w-20"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/5"></div>
          <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
          <div className="h-8 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return null
}