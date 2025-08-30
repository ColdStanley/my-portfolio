import { createPortal } from 'react-dom'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export default function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className={`pointer-events-auto ${className}`}>
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}