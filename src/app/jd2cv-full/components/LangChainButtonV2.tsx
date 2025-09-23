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

const PANEL_POSITION_STORAGE_KEY = 'resumeProgressPanelPosition'
const PANEL_PIN_STORAGE_KEY = 'resumeProgressPanelPinned'
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
  const [panelPosition, setPanelPosition] = useState({ x: 24, y: 92 })
  const [isPanelPinned, setIsPanelPinned] = useState(false)
  const [isPanelMinimized, setIsPanelMinimized] = useState(false)
  const [isPanelDragging, setIsPanelDragging] = useState(false)
  const panelDragOffsetRef = useRef({ x: 0, y: 0 })
  const panelPointerIdRef = useRef<number | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const dockPointerIdRef = useRef<number | null>(null)
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    let dockPositionFound = false
    try {
      const storedPanelPosition = localStorage.getItem(PANEL_POSITION_STORAGE_KEY)
      const storedPanelPinned = localStorage.getItem(PANEL_PIN_STORAGE_KEY)
      const storedDockPosition = localStorage.getItem(DOCK_POSITION_STORAGE_KEY)

      if (storedPanelPosition) {
        const parsed = JSON.parse(storedPanelPosition)
        if (isValidPosition(parsed)) {
          setPanelPosition(clampPositionToViewport(parsed, { width: 520, height: 260 }))
        }
      }

      if (storedPanelPinned) {
        setIsPanelPinned(storedPanelPinned === 'true')
      }

      if (storedDockPosition) {
        const parsedDock = JSON.parse(storedDockPosition)
        if (isValidPosition(parsedDock)) {
          setDockPosition(clampPositionToViewport(parsedDock, { width: 260, height: 94 }))
          dockPositionFound = true
        }
      }
    } catch (storageError) {
      console.warn('Resume progress panel storage error:', storageError)
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

  useEffect(() => {
    if (!isPanelPinned) return
    if (typeof window === 'undefined') return
    localStorage.setItem(PANEL_POSITION_STORAGE_KEY, JSON.stringify(panelPosition))
  }, [panelPosition, isPanelPinned])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(PANEL_PIN_STORAGE_KEY, String(isPanelPinned))
  }, [isPanelPinned])

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
      if (isPanelMinimized) {
        setIsPanelMinimized(false)
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
  }, [tasks, currentTaskId, showPanel, isPanelMinimized])

  useEffect(() => {
    if (!isPanelDragging) return

    const handlePointerMove = (event: PointerEvent) => {
      if (panelPointerIdRef.current !== event.pointerId) return
      const targetElement = showPanel ? panelRef.current : null
      const dimensions = getElementDimensions(targetElement, { width: 520, height: 260 })
      setPanelPosition(prev => clampPositionToViewport({
        x: event.clientX - panelDragOffsetRef.current.x,
        y: event.clientY - panelDragOffsetRef.current.y
      }, dimensions))
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (panelPointerIdRef.current !== event.pointerId) return
      panelPointerIdRef.current = null
      setIsPanelDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isPanelDragging, showPanel])

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
    setIsPanelMinimized(false)
    setIsDockOpen(true)

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
      console.error('Error generating CV with AI service:', error)

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

  const handlePanelPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    panelPointerIdRef.current = event.pointerId
    panelDragOffsetRef.current = {
      x: event.clientX - panelPosition.x,
      y: event.clientY - panelPosition.y
    }
    setIsPanelDragging(true)
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

  const handlePanelMinimize = () => {
    setIsPanelMinimized(true)
    setShowPanel(false)
  }

  const togglePanelPinned = () => {
    setIsPanelPinned(prev => !prev)
  }

  const openTaskDetails = (taskId: string) => {
    const targetTask = tasks.find(task => task.id === taskId)
    if (!targetTask) return
    setCurrentTaskId(taskId)
    setStageOutputs(cloneStageState(targetTask.stageOutputs))
    setActiveStage(targetTask.activeStage)
    setIsPanelMinimized(false)
    setShowPanel(true)
    setIsDockOpen(false)
  }

  const currentTask = currentTaskId ? tasks.find(task => task.id === currentTaskId) : tasks[0]
  const runningCount = tasks.filter(task => task.status === 'running').length
  const completedCount = tasks.filter(task => task.status === 'completed').length
  const errorCount = tasks.filter(task => task.status === 'error').length
  const dockProgress = currentTask ? calculateTaskProgress(currentTask.stageOutputs) : 0
  const dockStatusLabel = currentTask ? formatTaskStatusLabel(currentTask.status) : 'Idle'
  const dockSummaryText = buildDockSummary(runningCount, completedCount, errorCount)
  return (
    <>
      <div className={`relative ${className}`.trim()}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:cursor-not-allowed border border-gray-200 hover:border-purple-300"
          title="Create a Complete Resume with AI"
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
          {tasks.length > 0 && (
            <div
              ref={dockRef}
              className="fixed z-[95]"
              style={{ top: dockPosition.y, left: dockPosition.x }}
            >
              <div className="w-[260px] rounded-3xl border border-purple-100 bg-white/95 shadow-2xl backdrop-blur p-4">
                <div
                  className={`flex items-start justify-between gap-3 select-none ${isDockDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onPointerDown={handleDockPointerDown}
                >
                  <div className="text-sm font-semibold text-purple-700 drop-shadow-sm">
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

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-purple-100">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${dockProgress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="truncate pr-2">{dockSummaryText}</span>
                  <span className="font-semibold text-purple-600">{dockStatusLabel}</span>
                </div>

                {isDockOpen && (
                  <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                    {tasks.map(task => {
                      const progress = calculateTaskProgress(task.stageOutputs)
                      const statusLabel = formatTaskStatusLabel(task.status)
                      const isActiveTask = task.id === currentTaskId
                      const statusAccent = getStatusAccentClass(task.status)
                      const cardBaseClass = isActiveTask
                        ? 'border-purple-300 bg-purple-50/70 shadow-sm'
                        : 'border-purple-100 bg-white hover:border-purple-200 hover:shadow-sm'

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
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full transition-all duration-300 ${task.status === 'error' ? 'bg-rose-400' : 'bg-purple-500'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className={`mt-2 text-[10px] font-semibold ${statusAccent}`}>{statusLabel}</div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {showPanel && (
            <div
              ref={panelRef}
              className={`fixed z-[90] w-[520px] rounded-2xl border border-purple-100 bg-white/95 shadow-2xl backdrop-blur origin-top animate-panelFadeIn transition-transform duration-500 ease-out ${isPanelDragging ? 'cursor-grabbing' : 'cursor-default'}`}
              style={{ top: panelPosition.y, left: panelPosition.x }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100/60">
                <div
                  className={`cursor-${isPanelDragging ? 'grabbing' : 'grab'} select-none`}
                  onPointerDown={handlePanelPointerDown}
                >
                  <div className="text-sm font-semibold text-purple-700">Resume Progress</div>
                  <div className="text-xs text-slate-500">Track each step as it happens</div>
                </div>
                <div className="flex items-center gap-2">
                  {isGenerating && <span className="text-xs text-purple-500 animate-softPulse">Processing…</span>}
                  <button
                    onClick={handlePanelMinimize}
                    className="h-7 w-7 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                    title="Minimize"
                  >
                    ▁
                  </button>
                  <button
                    onClick={togglePanelPinned}
                    className={`h-7 w-7 rounded-full flex items-center justify-center ${isPanelPinned ? 'text-purple-600 bg-purple-50 border border-purple-200' : 'text-slate-500 hover:bg-slate-100'}`}
                    title={isPanelPinned ? 'Unpin position' : 'Pin position'}
                  >
                    📌
                  </button>
                  <button
                    onClick={() => {
                      setShowPanel(false)
                      setIsPanelMinimized(false)
                    }}
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
                  className={`flex-1 rounded-t-lg border border-transparent px-3 py-2 text-xs font-semibold transition-all duration-300 ease-out ${isActive ? 'bg-white text-purple-700 shadow-lg border-purple-200 border-b-white' : 'text-slate-500 hover:bg-slate-50 hover:-translate-y-0.5'}`}
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

function calculateTaskProgress(stageState: Record<StageKey, StageData>) {
  if (!stageState) return 0
  let completed = 0
  let hasInProgress = false

  STAGE_ORDER.forEach(stage => {
    const status = stageState[stage]?.status
    if (status === 'completed') {
      completed += 1
    }
    if (status === 'in_progress') {
      hasInProgress = true
    }
  })

  const total = STAGE_ORDER.length || 1
  const partial = hasInProgress ? 0.4 : 0
  const rawProgress = ((completed + partial) / total) * 100
  return Math.min(100, Math.max(0, Math.round(rawProgress)))
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

function buildDockSummary(running: number, completed: number, error: number) {
  const parts: string[] = []
  if (running > 0) parts.push(`${running} running`)
  if (completed > 0) parts.push(`${completed} done`)
  if (error > 0) parts.push(`${error} error`)
  if (running === 0 && completed > 0 && error === 0) {
    return 'All tasks complete'
  }
  return parts.length > 0 ? parts.join(' • ') : 'No active tasks'
}

function getStatusAccentClass(status: TaskStatus) {
  switch (status) {
    case 'running':
      return 'text-purple-600'
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
        <div className="text-xs text-purple-600 font-medium flex items-center gap-1">
          <div className="animate-spin w-3 h-3 border border-purple-300 border-t-purple-600 rounded-full"></div>
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
            <div className="text-xs font-semibold text-purple-700">Role Type</div>
            <div>{stage.roleType}</div>
          </div>
        )}
        {stage.insights && stage.insights.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-purple-700">Classifier Insights</div>
            <ul className="list-disc pl-4 space-y-1">
              {stage.insights.map((insight, idx) => (
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
