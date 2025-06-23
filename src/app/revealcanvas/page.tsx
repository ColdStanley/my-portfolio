'use client'

import { useState, useEffect } from 'react'
import ImageCanvas from './components/ImageCanvas'
import { MaskData } from './page'
import CardWrapper from './components/CardWrapper'

export default function RevealCanvasPage() {
  const [imageList, setImageList] = useState<string[]>([])
  const [masks, setMasks] = useState<MaskData[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [maskSetting, setMaskSetting] = useState({
    opacity: 85,
    width: 200,
    height: 100,
    color: 'rgba(155, 89, 182, 0.3)',
  })
  const [deletableMode, setDeletableMode] = useState(false)

  // ✅ 从 localStorage 恢复遮罩
  useEffect(() => {
    const stored = localStorage.getItem('revealcanvas-masks')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setMasks(parsed)
      } catch (err) {
        console.error('Failed to parse masks from storage:', err)
      }
    }
  }, [])

  // ✅ 每次更新遮罩时保存
  useEffect(() => {
    localStorage.setItem('revealcanvas-masks', JSON.stringify(masks))
  }, [masks])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newUrls = Array.from(files).map(file => URL.createObjectURL(file))
    setImageList(prev => [...newUrls.reverse(), ...prev])
  }

  const handleAddMask = () => {
    const top = 200
    const left = 150
    const newMask: MaskData = {
      id: Date.now(),
      top,
      left,
      width: maskSetting.width,
      height: maskSetting.height,
      color: maskSetting.color,
      opacity: maskSetting.opacity,
    }
    setMasks(prev => [...prev, newMask])
    setIsAdding(true)
    setDeletableMode(false)
  }

  const handleCompleteMaskSettings = () => {
    setIsAdding(false)
    setDeletableMode(true)
  }

  const handleUpdateMask = (id: number, updates: Partial<MaskData>) => {
    setMasks(prev =>
      prev.map(mask => (mask.id === id ? { ...mask, ...updates } : mask))
    )
  }

  const handleDeleteMask = (id: number) => {
    setMasks(prev => prev.filter(mask => mask.id !== id))
  }

  return (
    <div className="relative w-full h-full bg-gray-50">
      {/* 全宽悬浮操作栏 */}
      <div className="fixed top-[65px] left-0 right-0 z-50 px-6">
        <CardWrapper>
          <div className="flex items-center justify-between">
            {/* 左侧：上传图片 */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm text-gray-600"
            />

            {/* 右侧：Opacity + 按钮 */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700">Opacity</label>
              <input
                type="number"
                value={maskSetting.opacity}
                onChange={(e) =>
                  setMaskSetting((prev) => ({
                    ...prev,
                    opacity: Math.min(100, Math.max(0, +e.target.value)),
                  }))
                }
                className="w-16 px-2 py-1 border rounded text-sm"
              />
              <button
                onClick={handleAddMask}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded shadow-md w-28"
              >
                + Mask
              </button>
              <button
                onClick={handleCompleteMaskSettings}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded shadow-md w-28"
              >
                ✔ Clear
              </button>
            </div>
          </div>
        </CardWrapper>
      </div>

      {/* 主画布区域 */}
      <div className="w-full pt-32 px-6 pb-10">
        <ImageCanvas
          imageList={imageList}
          masks={masks}
          deletableMode={deletableMode}
          onUpdateMask={handleUpdateMask}
          onDeleteMask={handleDeleteMask}
        />
      </div>
    </div>
  )
}

// 类型导出
export interface MaskData {
  id: number
  top: number
  left: number
  width: number
  height: number
  color: string
  opacity: number
}
