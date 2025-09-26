'use client'

import { useSwiftApplyStore, type AIStageKey } from '@/lib/swiftapply/store'
import { useEffect, useRef } from 'react'

const STAGE_CONFIG = [
  { key: 'classifier', label: 'Analysis', icon: '🎯' },
  { key: 'experience', label: 'Generation', icon: '💼' },
  { key: 'reviewer', label: 'Review', icon: '🔍' }
] as const

export default function AIProgressPanel() {
  const {
    ai: { activeStage, stageOutputs, isGenerating },
    resetAIState,
    setAIStage
  } = useSwiftApplyStore()

  const handleClose = () => {
    resetAIState()
  }

  return (
    <div className="bg-white rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl h-full flex flex-col border border-neutral-dark">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <div className="text-lg font-semibold text-gray-800">AI Processing</div>
          <div className="text-xs text-gray-500">3-stage intelligent generation</div>
        </div>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <span className="text-xs text-primary animate-pulse">Processing…</span>
          )}
          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="flex gap-2 border-b border-gray-200 px-4 pt-4">
        {STAGE_CONFIG.map(stage => {
          const data = stageOutputs[stage.key]
          const isActive = activeStage === stage.key
          const statusClass = data.status === 'completed'
            ? 'bg-primary text-primary-foreground'
            : data.status === 'in_progress'
              ? 'bg-surface text-primary'
              : data.status === 'error'
                ? 'bg-red-50 text-error'
                : 'bg-neutral-light text-text-secondary'

          return (
            <button
              key={stage.key}
              onClick={() => setAIStage(stage.key)}
              className={`flex-1 rounded-t-lg px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-white text-primary shadow-md border-b-2 border-primary'
                  : 'text-text-secondary hover:bg-neutral-light'
              }`}
            >
              <div className={`mx-auto w-max rounded-full px-3 py-1 ${statusClass}`}>
                {stage.icon} {stage.label}
              </div>
            </button>
          )
        })}
      </div>

      {/* Stage Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {renderStageContent(stageOutputs[activeStage])}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 text-xs text-gray-500">
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
function renderStageContent(stage: any) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (scrollRef.current && stage.status === 'in_progress') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [stage.content, stage.status])

  if (stage.status === 'pending') {
    return <div className="text-text-secondary">Waiting for execution…</div>
  }

  if (stage.status === 'error') {
    return <div className="text-error">Stage failed. Please retry.</div>
  }

  // Show streaming content for in-progress stages
  if (stage.status === 'in_progress' && stage.content) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-primary font-medium flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-neutral-light border-t-primary rounded-full"></div>
          AI Processing...
        </div>
        <div
          ref={scrollRef}
          className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto"
        >
          <pre className="whitespace-pre-wrap text-sm text-text-primary font-mono leading-relaxed">
            {stage.content}<span className="animate-pulse text-primary">▊</span>
          </pre>
        </div>
      </div>
    )
  }

  // Show classifier insights
  if (stage.roleType || stage.insights || stage.keywords) {
    return (
      <div className="space-y-4">
        {stage.roleType && (
          <div>
            <div className="text-sm font-semibold text-primary mb-2">Role Classification</div>
            <div className="bg-surface rounded-lg p-3 text-sm text-primary">{stage.roleType}</div>
          </div>
        )}
        {stage.insights && stage.insights.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-primary mb-2">Key Insights</div>
            <ul className="bg-neutral-light rounded-lg p-3 space-y-1 text-sm">
              {stage.insights.map((insight: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {stage.keywords && stage.keywords.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-primary mb-2">Priority Keywords</div>
            <div className="bg-neutral-light rounded-lg p-3">
              <div className="flex flex-wrap gap-2">
                {stage.keywords.map((keyword: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-surface text-primary text-xs rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show content
  if (stage.content) {
    return (
      <div className="bg-neutral-light rounded-lg p-4 h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-text-primary leading-relaxed">{stage.content}</pre>
      </div>
    )
  }

  return <div className="text-text-secondary">No content available</div>
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