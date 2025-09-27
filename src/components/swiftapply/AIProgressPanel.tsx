'use client'

import { useSwiftApplyStore, type AIStageKey } from '@/lib/swiftapply/store'
import { useEffect, useRef } from 'react'
import Button from '@/components/ui/button'

const STAGE_CONFIG = [
  { key: 'classifier', label: 'Analysis' },
  { key: 'experience', label: 'Generation' },
  { key: 'reviewer', label: 'Review' }
] as const

export default function AIProgressPanel() {
  const {
    ai: { activeStage, stageOutputs, isGenerating },
    resetAIState,
    setAIStage
  } = useSwiftApplyStore()

  const handleCustomizeResume = () => {
    const { personalInfo, templates, jobTitle, jobDescription, startAIGeneration } = useSwiftApplyStore.getState()

    if (!personalInfo) {
      alert('Please configure your personal information first')
      return
    }

    if (!jobTitle.trim()) {
      alert('Please enter a job title first')
      return
    }

    if (!jobDescription.trim()) {
      alert('Please enter a job description first')
      return
    }

    if (templates.length === 0) {
      alert('Please create at least one experience template')
      return
    }

    // Start AI generation
    startAIGeneration()
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-neutral-dark">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-light">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleCustomizeResume}
            variant="primary"
            size="sm"
            disabled={isGenerating}
            className="text-sm font-semibold px-2 py-1"
            title="Generate AI-powered resume"
          >
            {isGenerating ? 'Processing...' : 'Customize Resume'}
          </Button>
          {isGenerating && (
            <span className="text-xs text-primary animate-pulse">Processing…</span>
          )}
        </div>
      </div>

      {/* Stage Tabs */}
      <div className="flex gap-2 border-b border-neutral-light px-6 py-4">
        {STAGE_CONFIG.map(stage => {
          const data = stageOutputs[stage.key]
          const isActive = activeStage === stage.key

          // Status indicator classes
          let statusIndicator = ''
          if (data.status === 'in_progress') {
            statusIndicator = 'animate-pulse'
          } else if (data.status === 'completed') {
            statusIndicator = 'opacity-75'
          } else if (data.status === 'error') {
            statusIndicator = 'opacity-50'
          }

          return (
            <Button
              key={stage.key}
              onClick={() => setAIStage(stage.key)}
              variant={isActive ? "primary" : "secondary"}
              size="sm"
              className={`flex-1 text-xs ${statusIndicator}`}
            >
              {stage.label}
            </Button>
          )
        })}
      </div>

      {/* Stage Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {renderStageContent(stageOutputs[activeStage])}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-neutral-light px-6 py-4 text-xs text-text-secondary">
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
    return <div className="h-96"></div>
  }

  if (stage.status === 'error') {
    return <div className="text-error">Stage failed. Please retry.</div>
  }

  // Show streaming content for in-progress stages
  if (stage.status === 'in_progress' && stage.content) {
    return (
      <div className="space-y-2">
        <Input
          multiline
          rows={12}
          value={stage.content + (stage.status === 'in_progress' ? '▊' : '')}
          readOnly
          className="font-mono resize-none leading-relaxed"
          containerClassName="h-96"
        />
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
      <Input
        multiline
        rows={12}
        value={stage.content}
        readOnly
        className="font-mono resize-none leading-relaxed"
        containerClassName="h-96"
      />
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