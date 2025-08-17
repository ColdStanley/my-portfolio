'use client'

import { useState } from 'react'
import AIResponseFloatingPanel from './AIResponseFloatingPanel'
import { useReadLinguaStore } from '../store/useReadLinguaStore'

export default function MultipleAITooltips() {
  const { aiTooltips, removeAITooltip, updateAITooltip, selectedArticle } = useReadLinguaStore()
  const [isPlaying, setIsPlaying] = useState(false)

  // Don't render anything if no tooltips
  if (aiTooltips.length === 0) return null

  const handlePlayPronunciation = async (text: string) => {
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
  }

  return (
    <>
      {aiTooltips.map((tooltip) => (
        <AIResponseFloatingPanel
          key={tooltip.id}
          isVisible={true}
          selectedText={tooltip.selectedText}
          queryType={tooltip.queryType}
          aiResponse={tooltip.aiResponse}
          isLoading={tooltip.isLoading}
          hasError={tooltip.hasError}
          onClose={() => removeAITooltip(tooltip.id)}
          userQuestion={tooltip.userQuestion}
          // Position props for multi-tooltip
          initialPosition={tooltip.position}
          tooltipId={tooltip.id}
          onPositionChange={(position) => updateAITooltip(tooltip.id, { position })}
          // Pronunciation props
          onPlayPronunciation={handlePlayPronunciation}
          isPlaying={isPlaying}
        />
      ))}
    </>
  )
}