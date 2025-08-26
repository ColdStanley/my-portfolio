import { useState, useRef, useEffect } from 'react'

interface CommentInlineEditProps {
  value: string
  onSave: (value: string) => void
}

export default function CommentInlineEdit({ value, onSave }: CommentInlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value || '')
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editValue === (value || '')) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Add comment..."
          className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-0"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-500"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full h-9 px-3 text-sm rounded-lg transition-all duration-200 text-left hover:bg-gray-50 border border-transparent min-w-0"
    >
      <span className={`break-words overflow-wrap-anywhere word-break-break-word ${!value ? 'text-gray-400 italic' : 'text-gray-700'}`}>
        {!value ? 'Add comment...' : value}
      </span>
    </button>
  )
}