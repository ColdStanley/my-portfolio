interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'text' | 'avatar' | 'custom'
  width?: string
  height?: string
  className?: string
  count?: number
}

export default function SkeletonLoader({ 
  type = 'text', 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  count = 1 
}: SkeletonLoaderProps) {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded"
  
  const skeletonTypes = {
    card: "bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-4",
    list: "space-y-3",
    text: `${baseClasses} ${height} ${width}`,
    avatar: "rounded-full bg-gray-300 animate-pulse",
    custom: `${baseClasses} ${className}`
  }

  if (type === 'card') {
    return (
      <div className={skeletonTypes.card}>
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-300 h-12 w-12 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-300 rounded animate-pulse w-5/6"></div>
          <div className="h-3 bg-gray-300 rounded animate-pulse w-4/6"></div>
        </div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className={skeletonTypes.list}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="rounded-full bg-gray-300 h-8 w-8 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
              <div className="h-2 bg-gray-300 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={skeletonTypes[type] || skeletonTypes.text} />
  )
}

// 预定义的页面骨架屏组件
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 pt-20 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <SkeletonLoader width="w-64" height="h-8" className="mx-auto" />
          <SkeletonLoader width="w-96" height="h-4" className="mx-auto" />
        </div>
        
        {/* Content skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonLoader key={index} type="card" />
          ))}
        </div>
      </div>
    </div>
  )
}