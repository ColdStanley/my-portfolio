import { useState, useRef } from 'react'

interface CommentTooltipProps {
  comment: string
  maxLines?: number
  className?: string
  onEdit?: (newValue: string) => Promise<void>
  editable?: boolean
}

export default function CommentTooltip({ 
  comment, 
  maxLines = 2, 
  className = '',
  onEdit,
  editable = false
}: CommentTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(comment)
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  const handleClick = () => {
    if (editable && onEdit) {
      setIsEditing(true)
      setEditValue(comment)
    }
  }

  const handleSave = async () => {
    if (onEdit && editValue !== comment) {
      try {
        await onEdit(editValue)
        setIsEditing(false)
      } catch (error) {
        console.error('Failed to save comment:', error)
      }
    } else {
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditValue(comment)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (!comment) return null

  // Check if comment needs truncation
  const lines = comment.split('\n')
  const needsTooltip = lines.length > maxLines || comment.length > 100

  const truncatedComment = needsTooltip 
    ? lines.slice(0, maxLines).join('\n').substring(0, 100) + (comment.length > 100 ? '...' : '')
    : comment

  if (isEditing) {
    return (
      <div className="relative">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-sm border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none"
          rows={Math.max(2, editValue.split('\n').length)}
          autoFocus
        />
      </div>
    )
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={needsTooltip ? handleMouseEnter : undefined}
        onMouseLeave={needsTooltip ? handleMouseLeave : undefined}
        onClick={handleClick}
        className={`cursor-${editable ? 'pointer' : needsTooltip ? 'help' : 'default'} ${editable ? 'hover:bg-purple-50 rounded px-2 py-1 transition-colors' : ''} ${className}`}
      >
        <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
          {truncatedComment}
        </pre>
      </div>

      {/* Tooltip */}
      {showTooltip && needsTooltip && (
        <div
          className="fixed z-50 max-w-sm p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
            {comment}
          </pre>
        </div>
      )}
    </>
  )
}