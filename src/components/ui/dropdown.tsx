'use client'

import { ReactNode, useRef, useEffect } from 'react'

interface DropdownProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  align?: 'left' | 'right'
}

export function Dropdown({ children, isOpen, onClose, align = 'right' }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full mt-2 bg-white rounded-lg shadow-lg border border-neutral-dark py-2 min-w-[200px] z-50 ${
        align === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      {children}
    </div>
  )
}

interface DropdownItemProps {
  children: ReactNode
  onClick: () => void
  icon?: ReactNode
}

export function DropdownItem({ children, onClick, icon }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-surface transition-colors duration-200 flex items-center gap-2"
    >
      {icon && <span className="text-text-secondary">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
