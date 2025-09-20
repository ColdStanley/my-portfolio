'use client'

import { useState, useEffect, useMemo, Dispatch, SetStateAction, useRef } from 'react'
import { createPortal } from 'react-dom'

interface JD {
  id: string
  title: string
  company: string
  full_job_description: string
  user_id?: string
}

interface LangChainButtonV2Props {
  jd: JD
  className?: string
  onPDFUploaded?: () => void
}

export default function LangChainButtonV2({ jd, className = '', onPDFUploaded }: LangChainButtonV2Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [countdown, setCountdown] = useState(180)
  const [showPanel, setShowPanel] = useState(false)
  const [activeStage, setActiveStage] = useState<StageKey>('parent')
  const [stageOutputs, setStageOutputs] = useState<Record<StageKey, StageData>>(() => createInitialStageState())
  const { completeStage, markError, updateStage } = useStageHelpers(setStageOutputs)

  const portalRef = useRef<HTMLDivElement | null>(null)
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = document.createElement('div')
    portalRef.current = el
    document.body.appendChild(el)
    setPortalReady(true)
    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current)
        portalRef.current = null
      }
    }
  }, [])

  const resetStageOutputs = () => {
    setStageOutputs(() => {
      const initial = createInitialStageState()
      initial.parent.status = 'in_progress'
      return initial
    })
  }

  const handleStreamEvent = (event: string, data: any) => {
    console.log('LangChain SSE event:', event, data)
    switch (event) {
      case 'start':
        updateStage('parent', { status: 'in_progress' })
        break
      case 'parent':
        completeStage('parent', {
          content: data.roleClassification,
          roleClassification: data.roleClassification,
          focusPoints: data.focusPoints || data.focus_points || [],
          keywords: data.keywords || [],
          keySentences: data.keySentences || data.key_sentences || [],
          tokens: data.tokens,
          duration: data.duration
        })
        setActiveStage('parent')
        break
    case 'roleExpert':
      completeStage('roleExpert', {
        content: data.workExperience,
        tokens: data.tokens,
        duration: data.duration
      })
      setActiveStage(prev => (prev === 'parent' ? 'roleExpert' : prev))
      break
    case 'nonWorkExpert':
      completeStage('nonWorkExpert', {
        json: data.personalInfo,
        tokens: data.tokens,
        duration: data.duration
      })
      setActiveStage(prev => (prev === 'roleExpert' ? 'nonWorkExpert' : prev))
      break
    case 'reviewer':
      completeStage('reviewer', {
        content: data.workExperience,
        json: data.personalInfo,
        tokens: data.tokens,
        duration: data.duration
      })
      setActiveStage('reviewer')
      break
      case 'done':
        if (data?.steps?.reviewer) {
          updateStage('reviewer', {
            status: 'completed',
            content: data.workExperience,
            json: data.personalInfo,
            tokens: data.steps.reviewer.tokens,
            duration: data.steps.reviewer.duration
          })
        }
        if (data?.steps) {
          applyStepSummaries(data.steps)
        }
        break
    case 'error':
      markError(data?.message)
      setShowPanel(true)
      break
    default:
      break
  }
}

const applyStepSummaries = (steps?: Record<StageKey, any>) => {
  if (!steps) return
  setStageOutputs(() => {
    const nextState = createInitialStageState()
    STAGE_ORDER.forEach(stageKey => {
      const step = steps[stageKey]
      if (!step) {
        nextState[stageKey] = { status: 'completed' }
        return
      }

      if (stageKey === 'parent') {
        nextState[stageKey] = {
          status: 'completed',
          content: step.roleClassification,
          roleClassification: step.roleClassification,
          focusPoints: step.focusPoints || step.focus_points || [],
          keywords: step.keywords || [],
          keySentences: step.keySentences || step.key_sentences || [],
          tokens: step.tokens,
          duration: step.duration
        }
      } else if (stageKey === 'roleExpert') {
        nextState[stageKey] = {
          status: 'completed',
          content: step.workExperience,
          tokens: step.tokens,
          duration: step.duration
        }
      } else if (stageKey === 'nonWorkExpert') {
        nextState[stageKey] = {
          status: 'completed',
          json: step.personalInfo,
          tokens: step.tokens,
          duration: step.duration
        }
      } else if (stageKey === 'reviewer') {
        nextState[stageKey] = {
          status: 'completed',
          content: step.workExperience,
          json: step.personalInfo,
          tokens: step.tokens,
          duration: step.duration
        }
      }
    })
    return nextState
  })
  setActiveStage('reviewer')
  setShowPanel(true)
}

const generateViaRest = async ({ jd, personalInfo }: { jd: JD; personalInfo: any }) => {
  const langchainResponse = await fetch('/api/jd2cv-full/langchain-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jd: {
        title: jd.title,
        full_job_description: jd.full_job_description
      },
      personalInfo,
    })
  })

  if (!langchainResponse.ok) {
    throw new Error('Failed to get customized resume from LangChain workflow')
  }

  const result = await langchainResponse.json()
  if (!result?.success) {
    throw new Error(result?.error || 'Failed to process resume')
  }
  return result
}

const runPostGenerationSteps = async (customizedResume: any, context: { jd: JD; onPDFUploaded?: () => void }) => {
  const { jd, onPDFUploaded } = context
  const workExperience = customizedResume.workExperience

  // Store only the AI-generated work experience, preserve user's original profile
  localStorage.setItem(`jd2cv-v2-ai-content-${jd.id}`, workExperience)

  // Get original personal info from localStorage (user input should not be overwritten)
  const originalPersonalInfo = JSON.parse(localStorage.getItem('jd2cv-v2-personal-info') || '{}')

  const completeResumeData = {
    personalInfo: originalPersonalInfo,
    aiGeneratedExperience: workExperience,
    format: originalPersonalInfo.format || 'A4',
    jobTitle: jd.title
  }

  const pdfResponse = await fetch('/api/jd2cv-full/v2/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(completeResumeData)
  })

  if (!pdfResponse.ok) {
    throw new Error('Failed to generate PDF')
  }

  const blob = await pdfResponse.blob()
  const filename = `${originalPersonalInfo.fullName?.replace(/[^a-z0-9]/gi, '_') || 'Resume'}_${jd.company.replace(/[^a-z0-9]/gi, '_')}_${jd.title.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)

  try {
    const uploadBlob = new Blob([blob], { type: 'application/pdf' })
    const formData = new FormData()
    formData.append('file', uploadBlob, filename)
    formData.append('jdId', jd.id)
    formData.append('userId', jd.user_id)

    const uploadResponse = await fetch('/api/jds/upload-pdf', {
      method: 'POST',
      body: formData
    })

    if (uploadResponse.ok) {
      onPDFUploaded?.()
    } else {
      const errorText = await uploadResponse.text()
      console.warn('Auto-upload failed:', uploadResponse.status, errorText)
    }
  } catch (uploadError) {
    console.warn('Auto-upload error:', uploadError)
  }

  try {
    const experienceResponse = await fetch('/api/jd2cv-full/langchain-experience', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jd: {
          id: jd.id,
          user_id: jd.user_id,
          title: jd.title,
          company: jd.company
        },
        workExperience,
        roleClassification: customizedResume.roleClassification
      })
    })
    if (!experienceResponse.ok) {
      const errorText = await experienceResponse.text()
      console.warn('Auto-save work experience failed:', experienceResponse.status, errorText)
    }
  } catch (experienceError) {
    console.warn('Auto-save work experience error:', experienceError)
  }
}

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isGenerating) {
      setCountdown(180) // Reset to 180 seconds
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 1 // Don't go below 1
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating])

  const handleGenerate = async () => {
    // Check if personal info exists
    const personalInfo = localStorage.getItem('jd2cv-v2-personal-info')
    if (!personalInfo) {
      alert('Please configure your personal information first')
      return
    }

    const parsedPersonalInfo = JSON.parse(personalInfo)
    if (!parsedPersonalInfo.fullName || !parsedPersonalInfo.email) {
      alert('Please fill in basic personal information (Name & Email)')
      return
    }

    // Mark as clicked in localStorage
    localStorage.setItem(`langchain-clicked-${jd.id}`, 'true')

    setIsGenerating(true)

    // Reset panel state
    resetStageOutputs()
    setActiveStage('parent')
    setShowPanel(true)

    let workflowFinished = false

    try {
      const streamResult = await runWorkflowWithStream({
        jd,
        personalInfo: parsedPersonalInfo,
        requestId: `${Date.now()}`
      }, handleStreamEvent)
      workflowFinished = true
      await runPostGenerationSteps(streamResult, { jd, onPDFUploaded })

    } catch (error) {
      console.error('Error generating CV with LangChain:', error)

      if (!workflowFinished) {
        try {
          const fallbackResult = await generateViaRest({ jd, personalInfo: parsedPersonalInfo })
          applyStepSummaries(fallbackResult.steps)
          workflowFinished = true
          await runPostGenerationSteps(fallbackResult, { jd, onPDFUploaded })
        } catch (fallbackError) {
          console.error('Fallback generation error:', fallbackError)
          alert(`Failed to generate CV: ${error.message || fallbackError.message || 'Unknown error'}`)
        }
      } else {
        alert(`Post-processing failed: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const hasAnyStageOutput = useMemo(() => {
    return STAGE_CONFIG.some(stage => {
      const data = stageOutputs[stage.key]
      return Boolean(data?.content) || Boolean(data?.json)
    })
  }, [stageOutputs])

  
  return (
    <>
      <div className="relative">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:cursor-not-allowed border border-gray-200 hover:border-purple-300"
          title="Generate Complete Resume with LangChain AI"
        >
          {isGenerating ? (
            <div className="w-4 h-4 flex items-center justify-center text-xs font-mono text-purple-600">
              {countdown}
            </div>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
      {portalReady && portalRef.current && createPortal(
        <>
          {(!showPanel && (hasAnyStageOutput || isGenerating)) && (
            <button
              onClick={() => setShowPanel(true)}
              className="fixed top-[4.5rem] left-6 z-[90] rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-purple-600 shadow-lg border border-purple-100 hover:bg-purple-50"
            >
              LangChain Progress
            </button>
          )}

          {showPanel && (
            <div className="fixed top-[5.8rem] left-6 z-[90] w-[520px] rounded-2xl border border-purple-100 bg-white/95 shadow-2xl backdrop-blur origin-top animate-panelFadeIn">
              <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100/60">
                <div>
                  <div className="text-sm font-semibold text-purple-700">LangChain Progress</div>
                  <div className="text-xs text-slate-500">Monitor each agent in real time</div>
                </div>
                <div className="flex items-center gap-2">
                  {isGenerating && <span className="text-xs text-purple-500">Processing…</span>}
                  <button
                    onClick={() => setShowPanel(false)}
                    className="h-7 w-7 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>

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
                  onClick={() => setActiveStage(stage.key)}
                  className={`flex-1 rounded-t-lg border border-transparent px-3 py-2 text-xs font-semibold transition-colors ${isActive ? 'bg-white text-purple-700 shadow-sm border-purple-200 border-b-white' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <div className={`mx-auto w-max rounded-full px-3 py-1 ${statusClass}`}>
                    {stage.icon} {stage.label}
                  </div>
                </button>
                  )
                })}
              </div>

              <div className="max-h-72 overflow-y-auto px-4 py-3 text-xs text-slate-600">
                {renderStageContent(stageOutputs[activeStage])}
              </div>

              <div className="flex items-center justify-between border-t border-purple-100/60 px-4 py-2 text-[11px] text-slate-500">
                <div>
                  <span>Status: {formatStageStatus(stageOutputs[activeStage].status)}</span>
                  {stageOutputs[activeStage].duration != null && (
                    <span className="ml-2">Duration: {formatDuration(stageOutputs[activeStage].duration)}</span>
                  )}
                </div>
                <div>
                  {stageOutputs[activeStage].tokens && (
                    <span>Tokens P:{stageOutputs[activeStage].tokens?.prompt} / C:{stageOutputs[activeStage].tokens?.completion}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </>,
        portalRef.current
      )}
    </>
  )
}

const STAGE_CONFIG = [
  { key: 'parent', label: 'Role', icon: '🎯' },
  { key: 'roleExpert', label: 'Experience', icon: '💼' },
  { key: 'nonWorkExpert', label: 'Profile', icon: '👤' },
  { key: 'reviewer', label: 'Reviewer', icon: '🔍' }
] as const

const STAGE_ORDER = STAGE_CONFIG.map(stage => stage.key)

type StageKey = typeof STAGE_CONFIG[number]['key']

interface StageData {
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  content?: string
  json?: any
  tokens?: TokensUsage
  duration?: number
  roleClassification?: string
  focusPoints?: string[]
  keywords?: string[]
  keySentences?: string[]
}

interface TokensUsage {
  prompt: number
  completion: number
  total: number
}

function createInitialStageState(): Record<StageKey, StageData> {
  const state = {} as Record<StageKey, StageData>
  STAGE_CONFIG.forEach(stage => {
    state[stage.key] = {
      status: 'pending'
    }
  })
  return state
}

const formatStageStatus = (status: StageData['status']) => {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'error':
      return 'Failed'
    default:
      return ''
  }
}

function useStageHelpers(
  setStageOutputs: Dispatch<SetStateAction<Record<StageKey, StageData>>>
) {
  const updateStage = (stage: StageKey, updates: Partial<StageData>) => {
    setStageOutputs(prev => ({
      ...prev,
      [stage]: { ...prev[stage], ...updates }
    }))
  }

  const activateNextStage = (stage: StageKey) => {
    const index = STAGE_ORDER.indexOf(stage)
    if (index >= 0 && index < STAGE_ORDER.length - 1) {
      const nextStage = STAGE_ORDER[index + 1]
      setStageOutputs(prev => {
        const next = prev[nextStage]
        if (next.status === 'pending') {
          return {
            ...prev,
            [nextStage]: { ...next, status: 'in_progress' }
          }
        }
        return prev
      })
    }
  }

  const completeStage = (stage: StageKey, updates?: Partial<StageData>) => {
    updateStage(stage, { status: 'completed', ...updates })
    activateNextStage(stage)
  }

  const markError = (message?: string) => {
    setStageOutputs(prev => {
      const next = { ...prev }
      for (const key of STAGE_ORDER) {
        if (next[key].status === 'in_progress') {
          next[key] = { ...next[key], status: 'error', content: message || next[key].content }
          break
        }
      }
      return next
    })
  }

  return { updateStage, completeStage, markError }
}

function renderStageContent(stage: StageData) {
  if (stage.status === 'pending') {
    return <div className="text-slate-400">Waiting for execution…</div>
  }
  if (stage.status === 'error') {
    return <div className="text-rose-500">Step failed. Please retry.</div>
  }
  const hasParentInsights = Boolean(
    (stage.focusPoints && stage.focusPoints.length) ||
    (stage.keywords && stage.keywords.length) ||
    (stage.keySentences && stage.keySentences.length)
  )
  if (hasParentInsights) {
    return (
      <div className="space-y-3 text-[11px] text-slate-600">
        {stage.roleClassification && (
          <div>
            <div className="text-xs font-semibold text-purple-700">Role Classification</div>
            <div>{stage.roleClassification}</div>
          </div>
        )}
        {stage.focusPoints && stage.focusPoints.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-purple-700">Focus Points</div>
            <ul className="list-disc pl-4 space-y-1">
              {stage.focusPoints.map((fp, idx) => (
                <li key={idx}>{fp}</li>
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
        {stage.keySentences && stage.keySentences.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-purple-700">Key Sentences</div>
            <ul className="list-disc pl-4 space-y-1">
              {stage.keySentences.map((sentence, idx) => (
                <li key={idx}>{sentence}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
  if (stage.json) {
    return (
      <div className="space-y-3">
        <pre className="whitespace-pre-wrap text-[11px] text-slate-600">{JSON.stringify(stage.json, null, 2)}</pre>
        {stage.content && (
          <pre className="whitespace-pre-wrap text-[11px] text-slate-600">{stage.content}</pre>
        )}
      </div>
    )
  }
  if (stage.content) {
    return <pre className="whitespace-pre-wrap text-[11px] text-slate-600">{stage.content}</pre>
  }
  return <div className="text-slate-400">No content available</div>
}

function formatDuration(ms?: number) {
  if (ms == null) return ''
  const seconds = ms / 1000
  if (seconds < 1) return `${ms} ms`
  return `${seconds.toFixed(1)} s`
}

interface StreamPayload {
  jd: JD
  personalInfo: any
  requestId: string
}

async function readSseStream(response: Response, onEvent: (event: string, data: any) => void) {
  if (!response.body) {
    throw new Error('Stream not supported')
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let boundary = buffer.indexOf('\n\n')
      while (boundary !== -1) {
        const chunk = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)
        boundary = buffer.indexOf('\n\n')

        if (chunk.trim().length === 0) continue

        const lines = chunk.split('\n')
        let event: string | undefined
        let dataStr = ''
        lines.forEach(line => {
          if (line.startsWith('event: ')) {
            event = line.replace('event: ', '').trim()
          } else if (line.startsWith('data: ')) {
            dataStr += line.replace('data: ', '')
          }
        })

        if (event && dataStr) {
          try {
            const payload = JSON.parse(dataStr)
            onEvent(event, payload)
          } catch (parseError) {
            console.warn('Failed to parse SSE chunk', parseError)
          }
        }
      }
    }
    if (buffer.trim().length > 0) {
      const lines = buffer.split('\n')
      let event: string | undefined
      let dataStr = ''
      lines.forEach(line => {
        if (line.startsWith('event: ')) {
          event = line.replace('event: ', '').trim()
        } else if (line.startsWith('data: ')) {
          dataStr += line.replace('data: ', '')
        }
      })
      if (event && dataStr) {
        try {
          const payload = JSON.parse(dataStr)
          onEvent(event, payload)
        } catch (parseError) {
          console.warn('Failed to parse trailing SSE chunk', parseError)
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function runWorkflowWithStream({ jd, personalInfo, requestId }: StreamPayload, onEvent?: (event: string, data: any) => void) {
  const response = await fetch('/api/jd2cv-full/langchain-generate/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({ jd: { title: jd.title, full_job_description: jd.full_job_description }, personalInfo, requestId })
  })

  if (!response.ok) {
    throw new Error('Failed to start LangChain stream')
  }

  let finalResult: any = null
  let errorMessage: string | null = null

  await readSseStream(response, (event, data) => {
    if (event === 'error') {
      errorMessage = data?.message || 'LangChain workflow error'
    }
    if (event === 'done') {
      finalResult = data
    }
    if (onEvent) {
      onEvent(event, data)
    }
  })

  if (errorMessage) {
    throw new Error(errorMessage)
  }

  if (!finalResult) {
    throw new Error('Workflow did not return final result')
  }

  return finalResult
}
