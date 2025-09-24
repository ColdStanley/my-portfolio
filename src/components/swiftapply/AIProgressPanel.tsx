'use client'

import { useState, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { useSwiftApplyStore, type AIStageKey } from '@/lib/swiftapply/store'

const STAGE_CONFIG = [
  { key: 'classifier', label: 'Analysis', icon: '🎯' },
  { key: 'experience', label: 'Generation', icon: '💼' },
  { key: 'reviewer', label: 'Review', icon: '🔍' }
] as const

const PANEL_POSITION_STORAGE_KEY = 'swiftapply-ai-panel-position'

export default function AIProgressPanel() {
  const {
    ai: { showProgressPanel, activeStage, stageOutputs, isGenerating },
    resetAIState,
    setAIStage
  } = useSwiftApplyStore()

  const [position, setPosition] = useState({ x: 24, y: 92 })
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const pointerIdRef = useRef<number | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Load position from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const storedPosition = localStorage.getItem(PANEL_POSITION_STORAGE_KEY)
      if (storedPosition) {
        const parsed = JSON.parse(storedPosition)
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(clampPositionToViewport(parsed, { width: 520, height: 300 }))
        }
      }
    } catch (error) {
      console.warn('AI Progress Panel storage error:', error)
    }
  }, [])

  // Save position to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(PANEL_POSITION_STORAGE_KEY, JSON.stringify(position))
  }, [position])

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return
      const dimensions = { width: 520, height: 300 }
      setPosition(prev => clampPositionToViewport({
        x: event.clientX - dragOffsetRef.current.x,
        y: event.clientY - dragOffsetRef.current.y
      }, dimensions))
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return
      pointerIdRef.current = null
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isDragging])

  const handlePanelPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    pointerIdRef.current = event.pointerId
    dragOffsetRef.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y
    }
    setIsDragging(true)
  }

  const handleClose = () => {
    resetAIState()
  }

  if (!showProgressPanel) return null

  return (
    <div
      ref={panelRef}
      className={`fixed z-[90] w-[520px] rounded-2xl border border-purple-100 bg-white/95 shadow-2xl backdrop-blur origin-top animate-panelFadeIn transition-transform duration-500 ease-out ${
        isDragging ? 'cursor-grabbing' : 'cursor-default'
      }`}
      style={{ top: position.y, left: position.x }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100/60">
        <div
          className={`cursor-${isDragging ? 'grabbing' : 'grab'} select-none`}
          onPointerDown={handlePanelPointerDown}
        >
          <div className="text-sm font-semibold text-purple-700">AI Resume Generation</div>
          <div className="text-xs text-slate-500">3-stage intelligent processing</div>
        </div>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <span className="text-xs text-purple-500 animate-softPulse">Processing…</span>
          )}
          <button
            onClick={handleClose}
            className="h-7 w-7 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="flex gap-2 border-b border-purple-100/60 px-2 pt-2">
        {STAGE_CONFIG.map(stage => {
          const data = stageOutputs[stage.key]
          const isActive = activeStage === stage.key
          const statusClass = data.status === 'completed'
            ? 'bg-purple-600 text-white'
            : data.status === 'in_progress'
              ? 'bg-purple-100 text-purple-700'
              : data.status === 'error'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-slate-50 text-slate-500'

          return (
            <button
              key={stage.key}
              onClick={() => setAIStage(stage.key)}
              className={`flex-1 rounded-t-lg border border-transparent px-3 py-2 text-xs font-semibold transition-all duration-300 ease-out ${
                isActive
                  ? 'bg-white text-purple-700 shadow-lg border-purple-200 border-b-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5'
              }`}
            >
              <div className={`mx-auto w-max rounded-full px-3 py-1 transition-transform duration-300 ${
                isActive ? 'scale-105' : 'scale-100'
              } ${statusClass}`}>
                {stage.icon} {stage.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Stage Content */}
      <div className="max-h-72 overflow-y-auto px-4 py-3 text-xs text-slate-600">
        {renderStageContent(stageOutputs[activeStage])}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-purple-100/60 px-4 py-2 text-[11px] text-slate-500">
        <div>
          <span>Status: {formatStageStatus(stageOutputs[activeStage].status)}</span>
          {stageOutputs[activeStage].duration != null && (
            <span className="ml-2">Duration: {formatDuration(stageOutputs[activeStage].duration)}</span>
          )}
        </div>
        <div>
          {stageOutputs[activeStage].tokens && (
            <span>
              Tokens P:{stageOutputs[activeStage].tokens?.prompt} / C:{stageOutputs[activeStage].tokens?.completion}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper functions
function clampPositionToViewport(
  position: { x: number; y: number },
  size: { width: number; height: number }
) {
  if (typeof window === 'undefined') return position

  const padding = 12
  const maxX = Math.max(padding, window.innerWidth - size.width - padding)
  const maxY = Math.max(padding, window.innerHeight - size.height - padding)

  return {
    x: Math.min(Math.max(padding, position.x), maxX),
    y: Math.min(Math.max(padding, position.y), maxY)
  }
}

function renderStageContent(stage: any) {
  if (stage.status === 'pending') {
    return <div className="text-slate-400">Waiting for execution…</div>
  }

  if (stage.status === 'error') {
    return <div className="text-rose-500">Stage failed. Please retry.</div>
  }

  // Show streaming content for in-progress stages
  if (stage.status === 'in_progress' && stage.streamingContent && !stage.content) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-purple-600 font-medium flex items-center gap-1">
          <div className="animate-spin w-3 h-3 border border-purple-300 border-t-purple-600 rounded-full"></div>
          AI Processing...
        </div>
        <pre className="whitespace-pre-wrap text-[11px] text-slate-600 bg-slate-50 p-2 rounded max-h-48 overflow-y-auto">
          {stage.streamingContent}<span className="animate-pulse">▊</span>
        </pre>
      </div>
    )
  }

  // Show classifier insights
  if (stage.roleType || stage.insights || stage.keywords) {
    return (
      <div className="space-y-3 text-[11px] text-slate-600">
        {stage.roleType && (
          <div>
            <div className="text-xs font-semibold text-purple-700">Role Classification</div>
            <div>{stage.roleType}</div>
          </div>
        )}
        {stage.insights && stage.insights.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-purple-700">Key Insights</div>
            <ul className="list-disc pl-4 space-y-1">
              {stage.insights.map((insight: string, idx: number) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
        {stage.keywords && stage.keywords.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-purple-700">Priority Keywords</div>
            <div>{stage.keywords.join(', ')}</div>
          </div>
        )}
      </div>
    )
  }

  // Show content
  if (stage.content) {
    return <pre className="whitespace-pre-wrap text-[11px] text-slate-600">{stage.content}</pre>
  }

  return <div className="text-slate-400">No content available</div>
}

function formatStageStatus(status: string) {
  switch (status) {
    case 'pending': return 'Pending'
    case 'in_progress': return 'Processing'
    case 'completed': return 'Completed'
    case 'error': return 'Failed'
    default: return ''
  }
}

function formatDuration(ms?: number) {
  if (ms == null) return ''
  const seconds = ms / 1000
  if (seconds < 1) return `${ms}ms`
  return `${seconds.toFixed(1)}s`
}