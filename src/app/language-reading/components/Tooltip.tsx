'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface TooltipProps {
  content: string
  children: React.ReactNode
  className?: string
  position?: 'top' | 'left' | 'right'
}

export default function Tooltip({ content, children, className = '', position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsVisible(false)
    }, 300) // 300ms延迟，给用户时间移动鼠标到tooltip上
    setTimeoutId(id)
  }

  const handleTooltipMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }

  const handleTooltipMouseLeave = () => {
    setIsVisible(false)
  }

  // 清理函数，防止内存泄漏
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  // 根据位置设置tooltip和箭头的CSS类
  const getTooltipPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 mr-2 z-50'
      case 'right':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 ml-2 z-50'
      case 'top':
      default:
        return 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50'
    }
  }

  const getArrowClasses = () => {
    switch (position) {
      case 'left':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-purple-200'
      case 'right':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-purple-200'
      case 'top':
      default:
        return 'absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-purple-200'
    }
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={getTooltipPositionClasses()}>
          <div 
            className="bg-white border border-purple-200 rounded-lg shadow-xl p-6 w-96 max-w-[90vw]"
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            {/* Arrow */}
            <div className={getArrowClasses()}></div>
            
            {/* Content */}
            <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
              <div className="font-medium text-purple-800 mb-3 text-sm">AI Notes</div>
              <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-sm font-bold mt-3 mb-2 text-purple-800">{children}</h1>,
                    h2: ({children}) => <h2 className="text-sm font-bold mt-3 mb-2 text-purple-700">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-bold mt-2 mb-1 text-purple-600">{children}</h3>,
                    strong: ({children}) => <strong className="font-semibold text-purple-800">{children}</strong>,
                    ul: ({children}) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-gray-700 text-sm">{children}</li>,
                    p: ({children}) => <p className="mb-2 last:mb-0 text-sm">{children}</p>,
                    code: ({children}) => <code className="bg-purple-50 text-purple-800 px-2 py-1 rounded text-sm">{children}</code>,
                    blockquote: ({children}) => <blockquote className="border-l-3 border-purple-300 pl-3 italic text-gray-600 text-sm">{children}</blockquote>
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}