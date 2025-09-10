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
      {/* Backdrop - no click to close */}
      <div className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 lakers:bg-lakers-800/40" />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className={`pointer-events-auto transform animate-modal-entrance ${className}`}>
          {children}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes modal-entrance {
          0% {
            opacity: 0;
            transform: scale(0.95) translate(-2px, -4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate(0, 0);
          }
        }
        .animate-modal-entrance {
          animation: modal-entrance 300ms cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
        }
      `}</style>
    </>,
    document.body
  )
}