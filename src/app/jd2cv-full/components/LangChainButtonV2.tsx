'use client'

import { useState, useEffect, Dispatch, SetStateAction, useRef, type PointerEvent as ReactPointerEvent } from 'react'
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

const DOCK_POSITION_STORAGE_KEY = 'resumeProgressDockPosition'

type TaskStatus = 'pending' | 'running' | 'completed' | 'error'

interface TaskEntry {
  id: string
  label: string
  status: TaskStatus
  startedAt: number
  updatedAt: number
  stageOutputs: Record<StageKey, StageData>
  activeStage: StageKey
}

export default function LangChainButtonV2({ jd, className = '', onPDFUploaded }: LangChainButtonV2Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [countdown, setCountdown] = useState(180)
  const [showPanel, setShowPanel] = useState(false)
  const [activeStage, setActiveStage] = useState<StageKey>('classifier')
  const [stageOutputs, setStageOutputs] = useState<Record<StageKey, StageData>>(() => createInitialStageState())
  const [tasks, setTasks] = useState<TaskEntry[]>([])
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [isDockOpen, setIsDockOpen] = useState(false)
  const [dockPosition, setDockPosition] = useState({ x: 0, y: 0 })
  const [dockInitialized, setDockInitialized] = useState(false)
  const [isDockDragging, setIsDockDragging] = useState(false)
  const dockDragOffsetRef = useRef({ x: 0, y: 0 })
  const dockRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const dockPointerIdRef = useRef<number | null>(null)
  const { completeStage, markError, updateStage } = useStageHelpers(setStageOutputs)

  const [pendingReview, setPendingReview] = useState<{ resume: any; personalInfo: any } | null>(null)
  const [manualReviewOpen, setManualReviewOpen] = useState(false)
  const [manualWorkExperience, setManualWorkExperience] = useState('')
  const [manualPersonalInfoText, setManualPersonalInfoText] = useState('')
  const [manualReviewError, setManualReviewError] = useState<string | null>(null)
  const [isFinalizingPdf, setIsFinalizingPdf] = useState(false)

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    let dockPositionFound = false
    try {
      const storedDockPosition = localStorage.getItem(DOCK_POSITION_STORAGE_KEY)

      if (storedDockPosition) {
        const parsedDock = JSON.parse(storedDockPosition)
        if (isValidPosition(parsedDock)) {
          setDockPosition(clampPositionToViewport(parsedDock, { width: 260, height: 94 }))
          dockPositionFound = true
        }
      }
    } catch (storageError) {
      console.warn('Resume progress dock storage error:', storageError)
    }

    if (!dockPositionFound) {
      const fallbackDock = {
        x: 24,
        y: 88
      }
      setDockPosition(clampPositionToViewport(fallbackDock, { width: 260, height: 94 }))
    }
    setDockInitialized(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!dockInitialized) return
    localStorage.setItem(DOCK_POSITION_STORAGE_KEY, JSON.stringify(dockPosition))
  }, [dockInitialized, dockPosition])

  const resetStageOutputs = () => {
    const initial = createInitialStageState()
    initial.classifier.status = 'in_progress'
    setStageOutputs(initial)
    return initial
  }

  const handleStreamEvent = (event: string, data: any) => {
    // Handle streaming content updates
    if (data.streamingContent && !data.isComplete) {
      const stage = data.stage as StageKey
      let shouldActivateStage = false

      setStageOutputs(prev => {
        const prevStage = prev[stage] || { status: 'pending' as const }
        if (!prevStage.streamingContent) {
          shouldActivateStage = true
        }
        const streamingContent = (prevStage.streamingContent || '') + data.streamingContent

        return {
          ...prev,
          [stage]: {
            ...prevStage,
            status: 'in_progress',
            streamingContent
          }
        }
      })

      if (shouldActivateStage) {
        setActiveStage(stage)
      }
      return
    }

    switch (event) {
      case 'start':
        updateStage('classifier', { status: 'in_progress' })
        break
      case 'classifier':
        completeStage('classifier', {
          content: data.roleType,
          roleType: data.roleType,
          keywords: data.keywords || [],
          insights: data.insights || [],
          tokens: data.tokens,
          duration: data.duration
        })
        setActiveStage('classifier')
        break
      case 'experience':
        completeStage('experience', {
          content: data.workExperience,
          tokens: data.tokens,
          duration: data.duration
        })
        setActiveStage(prev => (prev === 'classifier' ? 'experience' : prev))
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

      if (stageKey === 'classifier') {
        nextState[stageKey] = {
          status: 'completed',
          content: step.roleType,
          roleType: step.roleType,
          keywords: step.keywords || [],
          insights: step.insights || [],
          tokens: step.tokens,
          duration: step.duration
        }
      } else if (stageKey === 'experience') {
        nextState[stageKey] = {
          status: 'completed',
          content: step.workExperience,
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
    throw new Error('Failed to get customized resume from the AI workflow')
  }

  const result = await langchainResponse.json()
  if (!result?.success) {
    throw new Error(result?.error || 'Failed to process resume')
  }
  return result
}

const runPostGenerationSteps = async (
  customizedResume: any,
  context: { jd: JD; onPDFUploaded?: () => void; personalInfoOverride?: any; workExperienceOverride?: string }
) => {
  const { jd, onPDFUploaded, personalInfoOverride, workExperienceOverride } = context
  const workExperience = workExperienceOverride ?? customizedResume.workExperience

  // Store only the AI-generated work experience, preserve user's original profile
  localStorage.setItem(`jd2cv-v2-ai-content-${jd.id}`, workExperience)

  // Get original personal info from localStorage (user input should not be overwritten)
  const storedPersonalInfo = JSON.parse(localStorage.getItem('jd2cv-v2-personal-info') || '{}')
  const finalPersonalInfo = personalInfoOverride ?? storedPersonalInfo

  if (!finalPersonalInfo || typeof finalPersonalInfo !== 'object' || Array.isArray(finalPersonalInfo)) {
    throw new Error('Personal information must be a JSON object.')
  }

  const completeResumeData = {
    personalInfo: finalPersonalInfo,
    aiGeneratedExperience: workExperience,
    format: finalPersonalInfo.format || 'A4',
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
  const filename = `${finalPersonalInfo.fullName?.replace(/[^a-z0-9]/gi, '_') || 'Resume'}_${jd.company.replace(/[^a-z0-9]/gi, '_')}_${jd.title.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`

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

  useEffect(() => {
    if (!currentTaskId) return
    setTasks(prev => prev.map(task => {
      if (task.id !== currentTaskId) {
        return task
      }

      const snapshot = cloneStageState(stageOutputs)
      return {
        ...task,
        stageOutputs: snapshot,
        activeStage,
        status: deriveTaskStatus(snapshot),
        updatedAt: Date.now()
      }
    }))
  }, [stageOutputs, activeStage, currentTaskId])

  useEffect(() => {
    if (tasks.length === 0) {
      if (currentTaskId) {
        setCurrentTaskId(null)
      }
      if (showPanel) {
        setShowPanel(false)
      }
      return
    }

    if (currentTaskId && tasks.some(task => task.id === currentTaskId)) {
      return
    }

    const fallbackTask = tasks[0]
    setCurrentTaskId(fallbackTask.id)
    setStageOutputs(cloneStageState(fallbackTask.stageOutputs))
    setActiveStage(fallbackTask.activeStage)
  }, [tasks, currentTaskId, showPanel])

  useEffect(() => {
    if (!isDockDragging) return

    const handlePointerMove = (event: PointerEvent) => {
      if (dockPointerIdRef.current !== event.pointerId) return
      const dimensions = getElementDimensions(dockRef.current, { width: 256, height: 80 })
      setDockPosition(prev => clampPositionToViewport({
        x: event.clientX - dockDragOffsetRef.current.x,
        y: event.clientY - dockDragOffsetRef.current.y
      }, dimensions))
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (dockPointerIdRef.current !== event.pointerId) return
      dockPointerIdRef.current = null
      setIsDockDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isDockDragging])

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

    setPendingReview(null)
    setManualReviewOpen(false)
    setManualWorkExperience('')
    setManualPersonalInfoText('')
    setManualReviewError(null)

    // Mark as clicked in localStorage
    localStorage.setItem(`langchain-clicked-${jd.id}`, 'true')

    setIsGenerating(true)

    // Reset panel state
    const initialStages = resetStageOutputs()
    const taskId = `${Date.now()}`
    const newTask: TaskEntry = {
      id: taskId,
      label: buildTaskLabel(jd),
      status: 'running',
      startedAt: Date.now(),
      updatedAt: Date.now(),
      stageOutputs: cloneStageState(initialStages),
      activeStage: 'classifier'
    }

    setCurrentTaskId(taskId)
    setTasks(prev => {
      const filtered = prev.filter(task => task.id !== taskId)
      const nextTasks = [newTask, ...filtered]
      return nextTasks.slice(0, 5)
    })
    setActiveStage('classifier')
    setShowPanel(true)
    setIsDockOpen(true)

    let workflowFinished = false

    try {
      const streamResult = await runWorkflowWithStream({
        jd,
        personalInfo: parsedPersonalInfo,
        requestId: `${Date.now()}`
      }, handleStreamEvent)
      workflowFinished = true
      openManualReview(streamResult, parsedPersonalInfo)
      return
    } catch (error) {
      console.error('Error generating CV with AI service:', error)

      if (!workflowFinished) {
        try {
          const fallbackResult = await generateViaRest({ jd, personalInfo: parsedPersonalInfo })
          applyStepSummaries(fallbackResult.steps)
          workflowFinished = true
          openManualReview(fallbackResult, parsedPersonalInfo)
          return
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

  const handleDockPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    dockPointerIdRef.current = event.pointerId
    dockDragOffsetRef.current = {
      x: event.clientX - dockPosition.x,
      y: event.clientY - dockPosition.y
    }
    setIsDockDragging(true)
  }

  const openTaskDetails = (taskId: string) => {
    const targetTask = tasks.find(task => task.id === taskId)
    if (!targetTask) return

    // Toggle: if clicking the same task, close the panel; otherwise switch to new task
    if (currentTaskId === taskId && showPanel) {
      setShowPanel(false)
      return
    }

    setCurrentTaskId(taskId)
    setStageOutputs(cloneStageState(targetTask.stageOutputs))
    setActiveStage(targetTask.activeStage)
    setShowPanel(true)
  }

  const openManualReview = (resumeResult: any, basePersonalInfo: any) => {
    const personalInfoPayload = resumeResult?.personalInfo && Object.keys(resumeResult.personalInfo).length
      ? resumeResult.personalInfo
      : basePersonalInfo

    setPendingReview({ resume: resumeResult, personalInfo: personalInfoPayload })
    setManualWorkExperience(resumeResult?.workExperience || '')
    setManualPersonalInfoText(JSON.stringify(personalInfoPayload || {}, null, 2))
    setManualReviewError(null)
    setIsFinalizingPdf(false)
    setManualReviewOpen(true)
  }

  const openExistingManualReview = () => {
    if (!pendingReview) return
    setManualReviewError(null)
    setIsFinalizingPdf(false)
    setManualReviewOpen(true)
  }

  const handleManualReviewConfirm = async () => {
    if (!pendingReview) return

    let parsedPersonalInfo: any
    try {
      parsedPersonalInfo = JSON.parse(manualPersonalInfoText)
      if (!parsedPersonalInfo || typeof parsedPersonalInfo !== 'object' || Array.isArray(parsedPersonalInfo)) {
        throw new Error('Personal info must be a JSON object')
      }
    } catch (error) {
      setManualReviewError('Personal info must be valid JSON. Please correct and try again.')
      return
    }

    const trimmedWorkExperience = manualWorkExperience.trim()
    if (!trimmedWorkExperience) {
      setManualReviewError('Work experience cannot be empty.')
      return
    }

    setManualReviewError(null)
    setIsFinalizingPdf(true)

    try {
      await runPostGenerationSteps(
        { ...pendingReview.resume, workExperience: trimmedWorkExperience },
        { jd, onPDFUploaded, personalInfoOverride: parsedPersonalInfo, workExperienceOverride: trimmedWorkExperience }
      )
      setPendingReview(null)
      setManualReviewOpen(false)
    } catch (error) {
      console.error('Manual review finalization failed:', error)
      setManualReviewError((error as Error)?.message || 'Failed to generate PDF with the provided content.')
    } finally {
      setIsFinalizingPdf(false)
    }
  }

  return (
    <>
      <div className={`relative ${className}`.trim()}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-10 px-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          title="Create a Complete Resume with AI"
        >
          {isGenerating ? `${countdown}s` : 'LangChain'}
        </button>
      </div>
      {portalReady && portalRef.current && createPortal(
        <>
          {tasks.length > 0 && (
            <div
              ref={dockRef}
              className="fixed z-[95]"
              style={{ top: dockPosition.y, left: dockPosition.x }}
            >
              <div className="w-[320px] rounded-3xl border border-gray-100 bg-white/95 shadow-2xl backdrop-blur p-4">
                <div
                  className={`flex items-start justify-between gap-3 select-none ${isDockDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onPointerDown={handleDockPointerDown}
                >
                  <div className="text-sm font-semibold text-gray-700 drop-shadow-sm">
                    Resume Tasks ({tasks.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDockOpen(prev => !prev)}
                    onPointerDown={event => event.stopPropagation()}
                    className="h-7 w-7 rounded-full text-slate-400 transition hover:bg-slate-100 flex items-center justify-center"
                    aria-label={isDockOpen ? 'Collapse task list' : 'Expand task list'}
                  >
                    <span className={`transition-transform transform ${isDockOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                </div>
                {isDockOpen && (
                  <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                    {tasks.map(task => {
                      const statusLabel = formatTaskStatusLabel(task.status)
                      const isActiveTask = task.id === currentTaskId
                      const statusAccent = getStatusAccentClass(task.status)
                      const stageKey = getTaskStage(task.stageOutputs)
                      const stageLabel = getStageLabel(stageKey)
                      const cardBaseClass = isActiveTask
                        ? 'border-gray-300 bg-gray-50/70 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'

                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => openTaskDetails(task.id)}
                          className={`w-full rounded-2xl border px-3 py-3 text-left transition ${cardBaseClass}`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-700">
                            <span className="truncate" title={task.label}>{task.label}</span>
                            <span className="text-[10px] text-slate-400">{formatRelativeTime(task.updatedAt)}</span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                            <span className="truncate">Stage: {stageLabel}</span>
                            <span className={`font-semibold ${statusAccent}`}>{statusLabel}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {showPanel && currentTaskId && (
            <div
              ref={panelRef}
              className="fixed z-[96] w-[520px] rounded-2xl border border-gray-100 bg-white/95 shadow-2xl backdrop-blur origin-top-left animate-panelFadeIn transition-all duration-300 ease-out"
              style={{
                top: dockPosition.y,
                left: dockPosition.x + 340
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/60">
                <div>
                  <div className="text-sm font-semibold text-gray-700">Resume Progress</div>
                  <div className="text-xs text-slate-500">Track each step as it happens</div>
                </div>
                <div className="flex items-center gap-2">
                  {isGenerating && <span className="text-xs text-gray-500 animate-softPulse">Processing…</span>}
                  {!isGenerating && pendingReview && !manualReviewOpen && (
                    <button
                      onClick={openExistingManualReview}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Review & Download
                    </button>
                  )}
                </div>
              </div>

          <div className="flex gap-2 border-b border-gray-100/60 px-2 pt-2">
            {STAGE_CONFIG.map(stage => {
              const data = stageOutputs[stage.key]
              const isActive = activeStage === stage.key
              const statusClass = data.status === 'completed'
                ? 'bg-gray-600 text-white'
                : data.status === 'in_progress'
                  ? 'bg-gray-100 text-gray-700'
                  : data.status === 'error'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-slate-50 text-slate-500'

              return (
                <button
                  key={stage.key}
                  onClick={() => setActiveStage(stage.key)}
                  className={`flex-1 rounded-t-lg border border-transparent px-3 py-2 text-xs font-semibold transition-all duration-300 ease-out ${isActive ? 'bg-white text-gray-700 shadow-lg border-gray-200 border-b-white' : 'text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5'}`}
                >
                  <div className={`mx-auto w-max rounded-full px-3 py-1 transition-transform duration-300 ${isActive ? 'scale-105' : 'scale-100'} ${statusClass}`}>
                    {stage.icon} {stage.label}
                  </div>
                </button>
                  )
                })}
              </div>

              <div className="max-h-72 overflow-y-auto px-4 py-3 text-xs text-slate-600">
                {renderStageContent(stageOutputs[activeStage])}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100/60 px-4 py-2 text-[11px] text-slate-500">
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

      {manualReviewOpen && pendingReview && portalReady && portalRef.current && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <div className="text-lg font-semibold text-slate-800">Review & Edit Before Download</div>
                <div className="text-xs text-slate-500">Update any content below. Formatting is preserved automatically.</div>
              </div>
              <button
                onClick={() => setManualReviewOpen(false)}
                className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 flex items-center justify-center"
                aria-label="Close review dialog"
              >
                ×
              </button>
            </div>
            <div className="grid gap-4 overflow-y-auto px-6 py-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-600" htmlFor="manual-work-experience">Work Experience</label>
                <textarea
                  id="manual-work-experience"
                  className="h-64 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  value={manualWorkExperience}
                  onChange={event => setManualWorkExperience(event.target.value)}
                  spellCheck={false}
                />
                <p className="text-[11px] text-slate-400">Keep bullet points separated by new lines.</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-600" htmlFor="manual-personal-info">Personal Info (JSON)</label>
                <textarea
                  id="manual-personal-info"
                  className="h-64 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-mono text-slate-700 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  value={manualPersonalInfoText}
                  onChange={event => setManualPersonalInfoText(event.target.value)}
                  spellCheck={false}
                />
                <p className="text-[11px] text-slate-400">Must remain valid JSON. Do not rename fields.</p>
              </div>
            </div>
            {manualReviewError && (
              <div className="px-6">
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-600">
                  {manualReviewError}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
              <span>Ready to download? Confirm to generate the PDF with your changes.</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setManualReviewOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  disabled={isFinalizingPdf}
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualReviewConfirm}
                  className="rounded-full bg-gray-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-gray-700 disabled:opacity-60"
                  disabled={isFinalizingPdf}
                >
                  {isFinalizingPdf ? 'Generating…' : 'Confirm & Download PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        portalRef.current
      )}
    </>
  )
}

const STAGE_CONFIG = [
  { key: 'classifier', label: 'Insights', icon: '🎯' },
  { key: 'experience', label: 'Experience', icon: '💼' },
  { key: 'reviewer', label: 'Review', icon: '🔍' }
] as const

const STAGE_ORDER = STAGE_CONFIG.map(stage => stage.key)

type StageKey = typeof STAGE_CONFIG[number]['key']

interface StageData {
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  content?: string
  json?: any
  tokens?: TokensUsage
  duration?: number
  roleType?: string
  keywords?: string[]
  insights?: string[]
  streamingContent?: string // For real-time streaming content
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

function isValidPosition(value: any): value is { x: number; y: number } {
  return Boolean(value) && typeof value.x === 'number' && typeof value.y === 'number'
}

function getElementDimensions(element: HTMLElement | null, fallback: { width: number; height: number }) {
  if (!element) {
    return fallback
  }
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width || fallback.width,
    height: rect.height || fallback.height
  }
}

function clampPositionToViewport(
  position: { x: number; y: number },
  size: { width: number; height: number }
) {
  if (typeof window === 'undefined') {
    return position
  }
  const padding = 12
  const maxX = Math.max(padding, window.innerWidth - size.width - padding)
  const maxY = Math.max(padding, window.innerHeight - size.height - padding)
  return {
    x: Math.min(Math.max(padding, position.x), maxX),
    y: Math.min(Math.max(padding, position.y), maxY)
  }
}

function cloneStageState(state: Record<StageKey, StageData>): Record<StageKey, StageData> {
  const structuredCloneFn = (globalThis as { structuredClone?: <T>(value: T) => T }).structuredClone
  if (typeof structuredCloneFn === 'function') {
    try {
      return structuredCloneFn(state) as Record<StageKey, StageData>
    } catch (error) {
      console.warn('structuredClone failed, falling back to JSON clone', error)
    }
  }
  return JSON.parse(JSON.stringify(state)) as Record<StageKey, StageData>
}

function deriveTaskStatus(stageState: Record<StageKey, StageData>): TaskStatus {
  const statuses = STAGE_ORDER.map(stage => stageState[stage]?.status || 'pending')
  if (statuses.includes('error')) return 'error'
  if (statuses.every(status => status === 'completed')) return 'completed'
  if (statuses.includes('in_progress')) return 'running'
  if (statuses.includes('completed')) return 'running'
  return 'pending'
}

function formatTaskStatusLabel(status: TaskStatus) {
  switch (status) {
    case 'running':
      return 'Running'
    case 'completed':
      return 'Completed'
    case 'error':
      return 'Error'
    default:
      return 'Pending'
  }
}

function getStatusAccentClass(status: TaskStatus) {
  switch (status) {
    case 'running':
      return 'text-gray-600'
    case 'completed':
      return 'text-emerald-600'
    case 'error':
      return 'text-rose-500'
    default:
      return 'text-slate-400'
  }
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp
  if (Number.isNaN(diff) || diff < 0) return 'just now'
  if (diff < 10_000) return 'just now'
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function buildTaskLabel(jd: JD) {
  const title = jd.title?.trim() || 'Resume'
  const company = jd.company?.trim()
  return company ? `${title} · ${company}` : title
}

function getTaskStage(stageOutputs: Record<StageKey, StageData>): StageKey {
  for (const key of STAGE_ORDER) {
    const status = stageOutputs[key]?.status
    if (status === 'in_progress' || status === 'pending') {
      return key
    }
  }
  for (let i = STAGE_ORDER.length - 1; i >= 0; i--) {
    const key = STAGE_ORDER[i]
    if (stageOutputs[key]?.status === 'completed') {
      return key
    }
  }
  return STAGE_ORDER[0]
}

function getStageLabel(stageKey: StageKey) {
  const stage = STAGE_CONFIG.find(item => item.key === stageKey)
  return stage ? stage.label : stageKey
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

    // Clear streaming content after a brief delay to allow final content to render
    setTimeout(() => {
      updateStage(stage, { streamingContent: undefined })
    }, 100)
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

  // Show streaming content only if stage is in progress, has streaming content, and no final content yet
  if (stage.status === 'in_progress' && stage.streamingContent && !stage.content && !stage.json && !stage.roleType) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
          <div className="animate-spin w-3 h-3 border border-gray-300 border-t-purple-600 rounded-full"></div>
          AI Generating...
        </div>
        <pre className="whitespace-pre-wrap text-[11px] text-slate-600 bg-slate-50 p-2 rounded max-h-48 overflow-y-auto">
          {stage.streamingContent}<span className="animate-pulse">▊</span>
        </pre>
      </div>
    )
  }
  const hasClassifierInsights = Boolean(
    stage.roleType ||
    (stage.insights && stage.insights.length) ||
    (stage.keywords && stage.keywords.length)
  )
  if (hasClassifierInsights) {
    return (
      <div className="space-y-3 text-[11px] text-slate-600">
        {stage.roleType && (
          <div>
            <div className="text-xs font-semibold text-gray-700">Role Type</div>
            <div>{stage.roleType}</div>
          </div>
        )}
        {stage.insights && stage.insights.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-700">Classifier Insights</div>
            <ul className="list-disc pl-4 space-y-1">
              {stage.insights.map((insight, idx) => (
                <li key={idx}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
        {stage.keywords && stage.keywords.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-700">Priority Keywords</div>
            <div>{stage.keywords.join(', ')}</div>
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
    throw new Error('Failed to start resume stream')
  }

  let finalResult: any = null
  let errorMessage: string | null = null

  await readSseStream(response, (event, data) => {
    if (event === 'error') {
      errorMessage = data?.message || 'AI workflow error'
    }
    if (event === 'done') {
      finalResult = data
    }
    if (onEvent) {
      onEvent(event, data)
    }
  })

  if (!finalResult) {
    throw new Error(errorMessage || 'Workflow did not return final result')
  }

  if (errorMessage) {
    console.warn('Resume workflow warning:', errorMessage)
  }

  return finalResult
}
