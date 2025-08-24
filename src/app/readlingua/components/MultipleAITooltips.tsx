'use client'

import React, { useState, memo, useCallback } from 'react'
import AIResponseFloatingPanel from './AIResponseFloatingPanel'
import { useReadLinguaStore } from '../store/useReadLinguaStore'
import type { AITooltip } from '../store/useReadLinguaStore'

// 优化：单个Tooltip的memo版本 - 只在自己的props变化时重渲染
interface OptimizedTooltipProps {
  tooltip: AITooltip
  selectedLanguage: string
  isPlaying: boolean
  onRemove: (id: string) => void
  onUpdatePosition: (id: string, position: { x: number, y: number }) => void
  onPlayPronunciation: (text: string) => Promise<void>
}

const OptimizedTooltip = memo<OptimizedTooltipProps>(({ 
  tooltip, 
  selectedLanguage, 
  isPlaying, 
  onRemove, 
  onUpdatePosition, 
  onPlayPronunciation 
}) => {
  const handleClose = useCallback(() => {
    onRemove(tooltip.id)
  }, [onRemove, tooltip.id])

  const handlePositionChange = useCallback((position: { x: number, y: number }) => {
    onUpdatePosition(tooltip.id, position)
  }, [onUpdatePosition, tooltip.id])

  return (
    <AIResponseFloatingPanel
      key={tooltip.id}
      isVisible={true}
      selectedText={tooltip.selectedText}
      queryType={tooltip.queryType}
      aiResponse={tooltip.aiResponse}
      isLoading={tooltip.isLoading}
      hasError={tooltip.hasError}
      onClose={handleClose}
      userQuestion={tooltip.userQuestion}
      // Position props for multi-tooltip
      initialPosition={tooltip.position}
      tooltipId={tooltip.id}
      onPositionChange={handlePositionChange}
      // Pronunciation props
      onPlayPronunciation={onPlayPronunciation}
      isPlaying={isPlaying}
    />
  )
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 只在相关props真正改变时重渲染
  const prev = prevProps.tooltip
  const next = nextProps.tooltip
  
  return (
    prev.id === next.id &&
    prev.selectedText === next.selectedText &&
    prev.queryType === next.queryType &&
    prev.aiResponse === next.aiResponse &&
    prev.isLoading === next.isLoading &&
    prev.hasError === next.hasError &&
    prev.position.x === next.position.x &&
    prev.position.y === next.position.y &&
    prev.userQuestion === next.userQuestion &&
    prevProps.selectedLanguage === nextProps.selectedLanguage &&
    prevProps.isPlaying === nextProps.isPlaying
  )
})

OptimizedTooltip.displayName = 'OptimizedTooltip'

export default function MultipleAITooltips() {
  const { aiTooltips, removeAITooltip, updateAITooltip, selectedArticle } = useReadLinguaStore()
  const [isPlaying, setIsPlaying] = useState(false)

  // 使用浅比较选择器，避免不必要的重渲染
  const selectedLanguage = selectedArticle?.source_language || 'english'

  // Don't render anything if no tooltips
  if (aiTooltips.length === 0) return null

  // 优化：稳定的回调函数，避免子组件重渲染
  const handleRemove = useCallback((id: string) => {
    removeAITooltip(id)
  }, [removeAITooltip])

  const handleUpdatePosition = useCallback((id: string, position: { x: number, y: number }) => {
    updateAITooltip(id, { position })
  }, [updateAITooltip])

  const handlePlayPronunciation = useCallback(async (text: string) => {
    if (isPlaying || !selectedArticle) return
    
    setIsPlaying(true)
    try {
      const response = await fetch('/api/readlingua/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          language: selectedArticle.source_language
        })
      })
      
      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        audio.onerror = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
      } else {
        const errorData = await response.json()
        console.error('Failed to get audio:', errorData.error)
        alert(errorData.error || 'Failed to generate pronunciation')
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Error playing pronunciation:', error)
      setIsPlaying(false)
    }
  }, [isPlaying, selectedArticle])

  return (
    <>
      {aiTooltips.map((tooltip) => (
        <OptimizedTooltip
          key={tooltip.id}
          tooltip={tooltip}
          selectedLanguage={selectedLanguage}
          isPlaying={isPlaying}
          onRemove={handleRemove}
          onUpdatePosition={handleUpdatePosition}
          onPlayPronunciation={handlePlayPronunciation}
        />
      ))}
    </>
  )
}