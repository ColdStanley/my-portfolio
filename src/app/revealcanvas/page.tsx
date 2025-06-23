'use client'

import { useState, useEffect } from 'react'
import ImageCanvas from './components/ImageCanvas'
import { MaskData } from './page'
import MaskControlPanel from './components/MaskControlPanel'

export default function RevealCanvasPage() {
  const [imageList, setImageList] = useState<string[]>([])
  const [masks, setMasks] = useState<MaskData[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [deletableMode, setDeletableMode] = useState(false)
  const [statusText, setStatusText] = useState('请上传图片')

  const [saveProjectName, setSaveProjectName] = useState('')
  const [loadProjectName, setLoadProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [maskSetting, setMaskSetting] = useState({
    opacity: 100,
    width: 500,
    height: 300,
    color: 'rgba(155, 89, 182, 1.0)',
  })

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

  useEffect(() => {
    localStorage.setItem('revealcanvas-masks', JSON.stringify(masks))
  }, [masks])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newUrls = Array.from(files).map(file => URL.createObjectURL(file))
    setImageList(prev => [...newUrls.reverse(), ...prev])
    setStatusText('已上传图片，可添加遮罩')
  }

  const handleAddMask = () => {
    const { width, height, color, opacity } = maskSetting
    const top = window.scrollY + window.innerHeight / 2 - height / 2
    const left = window.scrollX + window.innerWidth / 2 - width / 2

    const newMask: MaskData = {
      id: Date.now(),
      top,
      left,
      width,
      height,
      color,
      opacity,
    }

    setMasks(prev => [...prev, newMask])
    setIsAdding(true)
    setDeletableMode(false)
    setStatusText('请拖动遮罩调整位置和大小')
  }

  const handleCompleteMaskSettings = () => {
    setIsAdding(false)
    setDeletableMode(true)
    setStatusText('已完成遮罩设置，可点击删除')
  }

  const handleUpdateMask = (id: number, updates: Partial<MaskData>) => {
    setMasks(prev => prev.map(mask => (mask.id === id ? { ...mask, ...updates } : mask)))
  }

  const handleDeleteMask = (id: number) => {
    setMasks(prev => prev.filter(mask => mask.id !== id))
  }

  const handleSave = async () => {
    if (!saveProjectName.trim()) {
      setStatusText('请输入项目名称')
      return
    }

    if (imageList.length === 0) {
      setStatusText('请先上传至少一张图片')
      return
    }

    setIsSaving(true)
    setStatusText('正在保存项目...')

    try {
      const base64List: string[] = await Promise.all(
        imageList.map(src =>
          fetch(src)
            .then(res => res.blob())
            .then(
              blob =>
                new Promise<string>((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onloadend = () => resolve(reader.result as string)
                  reader.onerror = reject
                  reader.readAsDataURL(blob)
                })
            )
        )
      )

      const res = await fetch('/api/revealcanvas/save-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: saveProjectName,
          images: base64List,
          masks,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatusText(`✅ 项目已保存：${saveProjectName}（ID: ${data.projectId}）`)
      } else {
        setStatusText(`❌ 保存失败：${data.error || '未知错误'}`)
        console.error(data.detail)
      }
    } catch (err) {
      console.error(err)
      setStatusText('❌ 保存失败：网络或图片处理错误')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoad = async () => {
    if (!loadProjectName.trim()) {
      setStatusText('请输入项目名称')
      return
    }

    setIsLoading(true)
    setStatusText('正在加载项目...')

    try {
      const res = await fetch(`/api/revealcanvas/load-project?projectName=${encodeURIComponent(loadProjectName.trim())}`)
      const data = await res.json()

      if (!res.ok) {
        setStatusText(`❌ 加载失败：${data.error || '未知错误'}`)
        return
      }

      const { images, masks } = data
      setImageList(images)
      setMasks(masks)
      setIsAdding(false)
      setDeletableMode(true)
      setStatusText(`✅ 加载成功：${loadProjectName}，共 ${images.length} 图 / ${masks.length} 遮罩`)
    } catch (err) {
      console.error(err)
      setStatusText('❌ 加载失败：网络或服务器错误')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <div className="flex-[0_0_80%] overflow-y-auto p-6">
        <ImageCanvas
          imageList={imageList}
          masks={masks}
          deletableMode={deletableMode}
          onUpdateMask={handleUpdateMask}
          onDeleteMask={handleDeleteMask}
        />
      </div>

      <div className="flex-[0_0_20%] h-full border-l border-gray-200 bg-white p-4 shadow-md">
        <MaskControlPanel
          maskSetting={maskSetting}
          onChangeSetting={setMaskSetting}
          onAdd={handleAddMask}
          onComplete={handleCompleteMaskSettings}
          onUpload={handleImageUpload}
          onSave={handleSave}
          onLoad={handleLoad}
          statusText={statusText}
          isAdding={isAdding}
          deletableMode={deletableMode}
          saveProjectName={saveProjectName}
          setSaveProjectName={setSaveProjectName}
          loadProjectName={loadProjectName}
          setLoadProjectName={setLoadProjectName}
          isSaving={isSaving}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export interface MaskData {
  id: number
  top: number
  left: number
  width: number
  height: number
  color: string
  opacity: number
}
