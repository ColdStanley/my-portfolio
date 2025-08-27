import { useState, useRef, useEffect } from 'react'

interface InlineEditFieldProps {
  value: string | number
  field: string
  type: 'text' | 'select' | 'number'
  onSave: (field: string, value: string | number) => Promise<void>
  placeholder?: string
  options?: readonly string[]
  className?: string
}

export default function InlineEditField({
  value,
  field,
  type,
  onSave,
  placeholder = '',
  options = [],  // Now required to be passed in
  className = ''
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value || ''))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flashSuccess, setFlashSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editValue === String(value || '')) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const finalValue = type === 'number' ? Number(editValue) : editValue
      await onSave(field, finalValue)
      setIsEditing(false)
      
      // Flash success for Stage field
      if (field === 'application_stage' && finalValue) {
        setFlashSuccess(true)
        setTimeout(() => setFlashSuccess(false), 800)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditValue(String(value || ''))
    setIsEditing(false)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'select') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const displayValue = value || placeholder
  const baseFieldClasses = "h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white transition-all duration-200"
  const focusClasses = "focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
  const displayClasses = "h-9 px-3 text-sm rounded-lg transition-all duration-200 text-left w-full"
  
  if (type === 'select') {
    if (isEditing) {
      return (
        <div className="relative">
          <div className="relative">
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value)
                // Auto-save on select change
                const finalValue = e.target.value
                setIsLoading(true)
                onSave(field, finalValue).then(() => {
                  setIsEditing(false)
                  
                  // Flash success for Stage field
                  if (field === 'application_stage' && finalValue) {
                    setFlashSuccess(true)
                    setTimeout(() => setFlashSuccess(false), 800)
                  }
                }).catch((err) => {
                  setError(err instanceof Error ? err.message : 'Update failed')
                  setIsLoading(false)
                })
              }}
              onBlur={handleCancel}
              disabled={isLoading}
              className={`${baseFieldClasses} ${focusClasses} appearance-none pr-8 cursor-pointer`}
            >
              <option value="" className="text-gray-400">{placeholder}</option>
              {options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {error && (
            <div className="absolute top-full left-0 text-xs text-red-500 mt-1">
              {error}
            </div>
          )}
        </div>
      )
    }

    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`${displayClasses} hover:bg-purple-50 border border-transparent ${className} ${
          !value ? 'text-gray-400 italic' : 'text-gray-700 font-medium'
        } ${flashSuccess ? 'bg-green-50 border-green-300' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span>{!value ? placeholder : displayValue}</span>
          <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
    )
  }

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={placeholder}
          className={`${baseFieldClasses} ${focusClasses} ${type === 'number' ? 'font-bold text-purple-600' : ''}`}
          min={type === 'number' ? "1" : undefined}
          max={type === 'number' ? "5" : undefined}
          step={type === 'number' ? "0.5" : undefined}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-500"></div>
          </div>
        )}
        {error && (
          <div className="absolute top-full left-0 text-xs text-red-500 mt-1">
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`${displayClasses} hover:bg-purple-50 border border-transparent ${className} ${
        !value ? 'text-gray-400 italic' : (type === 'number' ? 'text-purple-600 font-bold' : 'text-gray-700 font-medium')
      } ${flashSuccess ? 'bg-green-50 border-green-300' : ''}`}
    >
      {!value ? placeholder : displayValue}
    </button>
  )
}