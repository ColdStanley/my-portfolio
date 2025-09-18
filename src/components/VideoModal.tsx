'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface VideoModalProps {
  url: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export default function VideoModal({ url, title, isOpen, onClose }: VideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!portalRef.current) {
      const el = document.createElement('div')
      portalRef.current = el
      document.body.appendChild(el)
    }

    return () => {
      if (portalRef.current && document.body.contains(portalRef.current)) {
        document.body.removeChild(portalRef.current)
        portalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  const renderVideoPlayer = () => {
    // YouTube video
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/')
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1]?.split('&')[0]

      if (videoId) {
        return (
          <div className="w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        )
      }
    }

    // Vimeo video
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0]
      if (videoId) {
        return (
          <div className="w-full h-full">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg"
            />
          </div>
        )
      }
    }

    // Bilibili video
    if (url.includes('bilibili.com/video/')) {
      const bvMatch = url.match(/\/video\/(BV\w+)/)
      if (bvMatch) {
        const bvid = bvMatch[1]
        return (
          <div className="w-full h-full">
            <iframe
              src={`https://player.bilibili.com/player.html?bvid=${bvid}&autoplay=1`}
              title={title}
              allowFullScreen
              className="w-full h-full rounded-lg border-0"
            />
          </div>
        )
      }
    }

    // Direct video files
    if (url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i)) {
      return (
        <video
          controls
          autoPlay
          className="w-full h-full rounded-lg"
          preload="metadata"
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )
    }

    // Fallback
    return (
      <div className="flex items-center justify-center h-full text-white">
        <p>Unsupported video format</p>
      </div>
    )
  }

  if (!isOpen || !portalRef.current) return null

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors duration-200 flex items-center justify-center"
        aria-label="Close modal"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Video container */}
      <div
        className="relative bg-black rounded-lg shadow-2xl animate-scaleIn"
        style={{
          width: 'min(90vw, 1200px)',
          height: 'min(90vh, 675px)',
          aspectRatio: '16/9'
        }}
      >
        {renderVideoPlayer()}
      </div>

      {/* Video info */}
      {title && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm max-w-[80vw] text-center">
          {title}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>,
    portalRef.current
  )
}