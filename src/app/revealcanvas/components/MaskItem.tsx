'use client'

import { useRef, useState } from 'react'
import { MaskData } from '../page'

interface Props {
  mask: MaskData
  deletableMode: boolean
  onUpdate: (id: number, updates: Partial<MaskData>) => void
  onDelete: (id: number) => void
}

export default function MaskItem({ mask, deletableMode, onUpdate, onDelete }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDisappearing, setIsDisappearing] = useState(false)

  const handleDrag = (e: React.MouseEvent) => {
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const initialLeft = mask.left
    const initialTop = mask.top

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      onUpdate(mask.id, {
        left: initialLeft + dx,
        top: initialTop + dy,
      })
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleResize = (direction: 'left' | 'right' | 'top' | 'bottom') => (e: React.MouseEvent) => {
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const initialLeft = mask.left
    const initialTop = mask.top
    const initialWidth = mask.width
    const initialHeight = mask.height

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      const updates: Partial<MaskData> = {}

      if (direction === 'left') {
        updates.left = initialLeft + dx
        updates.width = initialWidth - dx
      } else if (direction === 'right') {
        updates.width = initialWidth + dx
      } else if (direction === 'top') {
        updates.top = initialTop + dy
        updates.height = initialHeight - dy
      } else if (direction === 'bottom') {
        updates.height = initialHeight + dy
      }

      onUpdate(mask.id, updates)
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleDelete = () => {
    if (!deletableMode) return
    setIsDisappearing(true)
    setTimeout(() => onDelete(mask.id), 200)
  }

  return (
    <div
      ref={ref}
      onMouseDown={handleDrag}
      onClick={handleDelete}
      className={`
        absolute rounded-xl cursor-move 
        border border-purple-300 ring-1 ring-purple-200 
        backdrop-blur-sm shadow-lg drop-shadow-md
        transition-all duration-200 ease-out
      `}
      style={{
        top: mask.top,
        left: mask.left,
        width: mask.width,
        height: mask.height,
        backgroundColor: 'rgba(224, 204, 250, 0.5)', // 淡紫色遮罩
        opacity: isDisappearing ? 0 : mask.opacity / 100,
        transform: isDisappearing ? 'scale(0.9)' : 'scale(1)',
        zIndex: 50,
      }}
    >
      {/* 四边拖拽控制 */}
      <div
        onMouseDown={handleResize('left')}
        className="absolute top-0 left-0 h-full w-1 cursor-ew-resize"
      />
      <div
        onMouseDown={handleResize('right')}
        className="absolute top-0 right-0 h-full w-1 cursor-ew-resize"
      />
      <div
        onMouseDown={handleResize('top')}
        className="absolute top-0 left-0 w-full h-1 cursor-ns-resize"
      />
      <div
        onMouseDown={handleResize('bottom')}
        className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize"
      />
    </div>
  )
}
