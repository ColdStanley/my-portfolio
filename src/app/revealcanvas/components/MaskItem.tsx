'use client'

import { useRef, useState } from 'react'
import { MaskData } from '../page'

interface Props {
  mask: MaskData
  label: string
  deletableMode: boolean
  onUpdate: (id: number, updates: Partial<MaskData>) => void
  onDelete: (id: number) => void
}

export default function MaskItem({ mask, label, deletableMode, onUpdate, onDelete }: Props) {
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

  const handleResize = (direction: string) => (e: React.MouseEvent) => {
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

      switch (direction) {
        case 'left':
          updates.left = initialLeft + dx
          updates.width = initialWidth - dx
          break
        case 'right':
          updates.width = initialWidth + dx
          break
        case 'top':
          updates.top = initialTop + dy
          updates.height = initialHeight - dy
          break
        case 'bottom':
          updates.height = initialHeight + dy
          break
        case 'top-left':
          updates.top = initialTop + dy
          updates.height = initialHeight - dy
          updates.left = initialLeft + dx
          updates.width = initialWidth - dx
          break
        case 'top-right':
          updates.top = initialTop + dy
          updates.height = initialHeight - dy
          updates.width = initialWidth + dx
          break
        case 'bottom-left':
          updates.height = initialHeight + dy
          updates.left = initialLeft + dx
          updates.width = initialWidth - dx
          break
        case 'bottom-right':
          updates.height = initialHeight + dy
          updates.width = initialWidth + dx
          break
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
        absolute rounded-xl cursor-move border border-purple-300 ring-1 ring-purple-200 
        backdrop-blur-sm shadow-lg drop-shadow-md
        transition-all duration-200 ease-out group
      `}
      style={{
        top: mask.top,
        left: mask.left,
        width: mask.width,
        height: mask.height,
        backgroundColor: 'rgba(224, 204, 250, 0.5)',
        opacity: isDisappearing ? 0 : mask.opacity / 100,
        transform: isDisappearing ? 'scale(0.9)' : 'scale(1)',
        zIndex: 50,
      }}
    >
      {/* 编号标签 */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-purple-700 font-semibold">
        {label}
      </div>

      {/* 四边 + 四角 拖拽控制区域 */}
      <div onMouseDown={handleResize('left')} className="absolute top-0 left-0 h-full w-1 cursor-ew-resize" />
      <div onMouseDown={handleResize('right')} className="absolute top-0 right-0 h-full w-1 cursor-ew-resize" />
      <div onMouseDown={handleResize('top')} className="absolute top-0 left-0 w-full h-1 cursor-ns-resize" />
      <div onMouseDown={handleResize('bottom')} className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize" />
      <div onMouseDown={handleResize('top-left')} className="absolute top-0 left-0 w-2 h-2 cursor-nwse-resize" />
      <div onMouseDown={handleResize('top-right')} className="absolute top-0 right-0 w-2 h-2 cursor-nesw-resize" />
      <div onMouseDown={handleResize('bottom-left')} className="absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize" />
      <div onMouseDown={handleResize('bottom-right')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize" />
    </div>
  )
}
