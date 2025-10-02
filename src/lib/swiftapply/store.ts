import { create } from 'zustand'
import { loadFromStorage, saveToStorage } from './localStorage'

export type PersonalInfo = {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string[]
  technicalSkills: string[]
  languages: string[]
  education: {
    degree: string
    institution: string
    year: string
    gpa?: string
  }[]
  certificates: string[]
  customModules: {
    id: string
    title: string
    content: string[]
  }[]
  format: 'A4' | 'Letter'
}

export type ExperienceTemplate = {
  id: string        // Use Date.now().toString()
  title: string
  targetRole: string
  content: string[]
}

// AI Generation Types
export type AIStageKey = 'classifier' | 'experience' | 'reviewer'

export interface AIStageData {
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  content?: string
  streamingContent?: string
  duration?: number | null
  tokens?: {
    prompt: number
    completion: number
    total: number
  } | null
  timestamp?: number
  // Classifier specific
  roleType?: string
  keywords?: string[]
  insights?: string[]
  // Reviewer specific
  personalInfo?: any
}

export interface AIGenerationState {
  isGenerating: boolean
  showProgressPanel: boolean
  activeStage: AIStageKey
  stageOutputs: Record<AIStageKey, AIStageData>
  generatedContent: {
    workExperience?: string
    personalInfo?: any
  } | null
  error: string | null
}

export interface CoverLetterState {
  isGenerating: boolean
  isGeneratingPDF: boolean
  content: string | null
  streamingContent: string | null
  pdfPreviewUrl: string | null
  error: string | null
}

interface SwiftApplyState {
  // Data
  personalInfo: PersonalInfo | null
  templates: ExperienceTemplate[]
  jobTitle: string
  jobDescription: string
  resumeRawText: string | null

  // UI State
  isSettingsOpen: boolean
  settingsStep: 1 | 2 | 3
  isSignUpModalOpen: boolean
  isUpgradeModalOpen: boolean
  isAIParseModeOpen: boolean

  // AI Generation State
  ai: AIGenerationState

  // Cover Letter State
  coverLetter: CoverLetterState

  // PDF Preview State
  pdfPreviewUrl: string | null

  // Actions
  setPersonalInfo: (pi: PersonalInfo) => void
  setTemplates: (t: ExperienceTemplate[]) => void
  setJobTitle: (v: string) => void
  setJobDescription: (v: string) => void
  setResumeRawText: (text: string | null) => void
  openSettings: (step?: 1 | 2 | 3) => void
  closeSettings: () => void
  openSignUpModal: () => void
  closeSignUpModal: () => void
  openUpgradeModal: () => void
  closeUpgradeModal: () => void
  openAIParseMode: () => void
  closeAIParseMode: () => void
  initializeFromStorage: () => void
  hasStoredData: () => boolean

  // Template management helpers
  addTemplate: (template: Omit<ExperienceTemplate, 'id'>) => string
  updateTemplate: (id: string, updates: Partial<ExperienceTemplate>) => void
  deleteTemplate: (id: string) => void

  // AI Generation actions
  startAIGeneration: () => void
  stopAIGeneration: () => void
  setAIStage: (stage: AIStageKey) => void
  updateAIStageData: (stage: AIStageKey, data: Partial<AIStageData>) => void
  setAIGeneratedContent: (content: any) => void
  resetAIState: () => void

  // Cover Letter actions
  startCoverLetterGeneration: () => void
  setCoverLetterContent: (content: string) => void
  setCoverLetterStreamingContent: (content: string) => void
  setCoverLetterError: (error: string | null) => void
  generateCoverLetterPDF: (content: string) => void
  setCoverLetterPdfPreviewUrl: (url: string | null) => void
  resetCoverLetterState: () => void

  // PDF Preview actions
  setPdfPreviewUrl: (url: string | null) => void
}

// Initial AI state
const getInitialAIState = (): AIGenerationState => ({
  isGenerating: false,
  showProgressPanel: false,
  activeStage: 'classifier',
  stageOutputs: {
    classifier: { status: 'pending' },
    experience: { status: 'pending' },
    reviewer: { status: 'pending' }
  },
  generatedContent: null,
  error: null
})

// Initial Cover Letter state
const getInitialCoverLetterState = (): CoverLetterState => ({
  isGenerating: false,
  isGeneratingPDF: false,
  content: null,
  streamingContent: null,
  pdfPreviewUrl: null,
  error: null
})

export const useSwiftApplyStore = create<SwiftApplyState>((set, get) => ({
  // Initial state
  personalInfo: null,
  templates: [],
  jobTitle: '',
  jobDescription: '',
  resumeRawText: null,
  isSettingsOpen: false,
  settingsStep: 1,
  isSignUpModalOpen: false,
  isUpgradeModalOpen: false,
  isAIParseModeOpen: false,
  ai: getInitialAIState(),
  coverLetter: getInitialCoverLetterState(),
  pdfPreviewUrl: null,

  // Core setters
  setPersonalInfo: (personalInfo) => {
    set({ personalInfo })
    saveToStorage('swiftapply-personal-info', personalInfo)
  },

  setTemplates: (templates) => {
    set({ templates })
    saveToStorage('swiftapply-templates', templates)
  },

  setJobTitle: (jobTitle) => {
    set({ jobTitle })
    saveToStorage('swiftapply-job-title', jobTitle)
  },

  setJobDescription: (jobDescription) => {
    set({ jobDescription })
    saveToStorage('swiftapply-job-description', jobDescription)
  },

  setResumeRawText: (resumeRawText) => {
    set({ resumeRawText })
  },

  // UI actions
  openSettings: (step = 1) => {
    set({ isSettingsOpen: true, settingsStep: step })
  },

  closeSettings: () => {
    set({ isSettingsOpen: false })
  },

  openSignUpModal: () => {
    set({ isSignUpModalOpen: true })
  },

  closeSignUpModal: () => {
    set({ isSignUpModalOpen: false })
  },

  openUpgradeModal: () => {
    set({ isUpgradeModalOpen: true })
  },

  closeUpgradeModal: () => {
    set({ isUpgradeModalOpen: false })
  },

  openAIParseMode: () => {
    set({ isAIParseModeOpen: true })
  },

  closeAIParseMode: () => {
    set({ isAIParseModeOpen: false })
  },

  initializeFromStorage: () => {
    const personalInfo = loadFromStorage<PersonalInfo>('swiftapply-personal-info')
    const templates = loadFromStorage<ExperienceTemplate[]>('swiftapply-templates') || []
    const jobTitle = loadFromStorage<string>('swiftapply-job-title') || ''
    const jobDescription = loadFromStorage<string>('swiftapply-job-description') || ''

    set({
      personalInfo,
      templates,
      jobTitle,
      jobDescription
    })
  },

  hasStoredData: () => {
    const personalInfo = loadFromStorage<PersonalInfo>('swiftapply-personal-info')
    const templates = loadFromStorage<ExperienceTemplate[]>('swiftapply-templates')

    // 有任一数据存在就认为是已有数据
    return !!(personalInfo || (templates && templates.length > 0))
  },

  // Template helpers
  addTemplate: (templateData) => {
    const newId = Date.now().toString()
    const newTemplate: ExperienceTemplate = {
      ...templateData,
      id: newId
    }
    const updatedTemplates = [...get().templates, newTemplate]
    get().setTemplates(updatedTemplates)
    return newId
  },

  updateTemplate: (id, updates) => {
    const updatedTemplates = get().templates.map(template =>
      template.id === id ? { ...template, ...updates } : template
    )
    get().setTemplates(updatedTemplates)
  },

  deleteTemplate: (id) => {
    const updatedTemplates = get().templates.filter(template => template.id !== id)
    get().setTemplates(updatedTemplates)
  },

  // AI Generation actions
  startAIGeneration: async () => {
    const state = get()

    set(state => ({
      ai: {
        ...state.ai,
        isGenerating: true,
        showProgressPanel: true,
        activeStage: 'classifier',
        stageOutputs: {
          classifier: { status: 'in_progress' },
          experience: { status: 'pending' },
          reviewer: { status: 'pending' }
        },
        error: null
      }
    }))

    try {
      // Process all 3 stages sequentially
      const stages: AIStageKey[] = ['classifier', 'experience', 'reviewer']
      let stageData: Record<string, any> = {}

      for (const stage of stages) {
        // Update active stage
        set(state => ({
          ai: {
            ...state.ai,
            activeStage: stage
          }
        }))

        // Start the stage
        get().updateAIStageData(stage, {
          status: 'in_progress',
          content: '',
          tokens: null,
          duration: null,
          timestamp: Date.now()
        })

        // Call streaming endpoint
        const response = await fetch('/api/swiftapply/ai-generate/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jd: {
              title: state.jobTitle || 'Job Application',
              description: state.jobDescription
            },
            personalInfo: state.personalInfo,
            templates: state.templates,
            stage,
            stageData
          })
        })

        if (!response.ok) {
          throw new Error('Failed to process AI request')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response stream available')
        }

        let fullContent = ''
        let result: any = null

        // Read stream
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === 'content_chunk') {
                  fullContent = data.fullContent
                  get().updateAIStageData(stage, {
                    status: 'in_progress',
                    content: fullContent
                  })
                } else if (data.type === 'stage_complete') {
                  result = data.result
                  get().updateAIStageData(stage, {
                    status: 'completed',
                    content: fullContent,
                    tokens: data.tokens,
                    duration: data.duration,
                    timestamp: data.timestamp
                  })
                  break
                } else if (data.type === 'error') {
                  throw new Error(data.error)
                }
              } catch (e) {
                // Ignore JSON parse errors for malformed SSE data
              }
            }
          }
        }

        // Store stage result for next stage
        if (stage === 'classifier') {
          stageData.classifier = result
        } else if (stage === 'experience') {
          stageData.experience = result
        } else if (stage === 'reviewer') {
          // Set final generated content (result is already parsed JSON)
          get().setAIGeneratedContent({
            workExperience: result.workExperience,
            personalInfo: result.personalInfo
          })
        }

        // Small delay between stages for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
      }

    } catch (error) {
      console.error('AI Generation error:', error)
      set(state => ({
        ai: {
          ...state.ai,
          isGenerating: false,
          error: (error as Error).message
        }
      }))
    }
  },

  stopAIGeneration: () => {
    set(state => ({
      ai: {
        ...state.ai,
        isGenerating: false
      }
    }))
  },

  setAIStage: (stage) => {
    set(state => ({
      ai: {
        ...state.ai,
        activeStage: stage
      }
    }))
  },

  updateAIStageData: (stage, data) => {
    set(state => ({
      ai: {
        ...state.ai,
        stageOutputs: {
          ...state.ai.stageOutputs,
          [stage]: {
            ...state.ai.stageOutputs[stage],
            ...data
          }
        }
      }
    }))
  },

  setAIGeneratedContent: (content) => {
    set(state => ({
      ai: {
        ...state.ai,
        generatedContent: content,
        isGenerating: false,
        showProgressPanel: false
      }
    }))
  },

  resetAIState: () => {
    set(state => ({
      ai: getInitialAIState()
    }))
  },

  // Cover Letter actions
  startCoverLetterGeneration: async () => {
    const state = get()

    set(state => ({
      coverLetter: {
        ...state.coverLetter,
        isGenerating: true,
        error: null,
        streamingContent: ''
      }
    }))

    try {
      const response = await fetch('/api/swiftapply/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: state.personalInfo,
          jobTitle: state.jobTitle,
          jobDescription: state.jobDescription,
          tailoredExperience: state.ai.generatedContent?.workExperience || '',
          aiModel: 'deepseek'
        })
      })

      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`
        try {
          const errorBody = await response.json()
          if (errorBody?.error) {
            message = errorBody.error
          }
        } catch (jsonError) {
          // ignore JSON parse errors for non-JSON responses
        }

        throw new Error(message)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream available')
      }

      let buffer = ''
      let fullContent = ''
      let finalContent = ''

      const updateStreaming = (content: string) => {
        set(state => ({
          coverLetter: {
            ...state.coverLetter,
            streamingContent: content
          }
        }))
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const event of events) {
          const trimmed = event.trim()
          if (!trimmed.startsWith('data:')) continue

          const jsonString = trimmed.replace(/^data:\s*/, '')

          try {
            const data = JSON.parse(jsonString)

            if (data.type === 'content_chunk') {
              fullContent = data.fullContent || fullContent + (data.chunk || '')
              updateStreaming(fullContent)
            } else if (data.type === 'complete') {
              finalContent = (data.coverLetter || fullContent || '').trim()
            } else if (data.type === 'error') {
              throw new Error(data.error || 'Failed to generate cover letter')
            }
          } catch (parseError) {
            // ignore malformed events
          }
        }
      }

      if (buffer.trim()) {
        const trimmed = buffer.trim()
        if (trimmed.startsWith('data:')) {
          try {
            const data = JSON.parse(trimmed.replace(/^data:\s*/, ''))
            if (data.type === 'complete') {
              finalContent = (data.coverLetter || fullContent || '').trim()
            } else if (data.type === 'content_chunk') {
              fullContent = data.fullContent || fullContent + (data.chunk || '')
              updateStreaming(fullContent)
            } else if (data.type === 'error') {
              throw new Error(data.error || 'Failed to generate cover letter')
            }
          } catch (parseError) {
            // ignore leftover parse errors
          }
        }
      }

      if (!finalContent) {
        finalContent = fullContent.trim()
      }

      if (!finalContent) {
        throw new Error('Cover letter generation returned empty content')
      }

      set(state => ({
        coverLetter: {
          ...state.coverLetter,
          isGenerating: false,
          content: finalContent,
          streamingContent: null,
          error: null
        }
      }))

    } catch (error: any) {
      set(state => ({
        coverLetter: {
          ...state.coverLetter,
          isGenerating: false,
          streamingContent: null,
          error: error.message || 'Failed to generate cover letter'
        }
      }))
    }
  },

  setCoverLetterContent: (content) => {
    set(state => ({
      coverLetter: {
        ...state.coverLetter,
        content
      }
    }))
  },

  setCoverLetterStreamingContent: (content) => {
    set(state => ({
      coverLetter: {
        ...state.coverLetter,
        streamingContent: content
      }
    }))
  },

  setCoverLetterError: (error) => {
    set(state => ({
      coverLetter: {
        ...state.coverLetter,
        error
      }
    }))
  },

  generateCoverLetterPDF: async (content) => {
    const state = get()

    set(state => ({
      coverLetter: {
        ...state.coverLetter,
        isGeneratingPDF: true,
        error: null,
        pdfPreviewUrl: null
      }
    }))

    try {
      const response = await fetch('/api/swiftapply/generate-cover-letter-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverLetterContent: content,
          personalInfo: state.personalInfo,
          jobTitle: state.jobTitle,
          format: state.personalInfo?.format || 'A4'
        })
      })

      if (!response.ok) {
        let message = `HTTP error! status: ${response.status}`
        try {
          const errorBody = await response.json()
          if (errorBody?.error) {
            message = errorBody.error
          }
        } catch (jsonError) {
          // ignore JSON parse errors for binary responses
        }

        throw new Error(message)
      }

      // Get PDF preview URL from response header
      const previewUrl = response.headers.get('X-PDF-Preview-URL')

      if (previewUrl) {
        set(state => ({
          coverLetter: {
            ...state.coverLetter,
            isGeneratingPDF: false,
            pdfPreviewUrl: previewUrl,
            error: null
          }
        }))
      } else {
        // Fallback: create blob URL from response
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        set(state => ({
          coverLetter: {
            ...state.coverLetter,
            isGeneratingPDF: false,
            pdfPreviewUrl: url,
            error: null
          }
        }))
      }
    } catch (error: any) {
      set(state => ({
        coverLetter: {
          ...state.coverLetter,
          isGeneratingPDF: false,
          error: error.message || 'Failed to generate PDF'
        }
      }))
    }
  },

  setCoverLetterPdfPreviewUrl: (url) => {
    set(state => ({
      coverLetter: {
        ...state.coverLetter,
        pdfPreviewUrl: url
      }
    }))
  },

  resetCoverLetterState: () => {
    set(state => ({
      coverLetter: getInitialCoverLetterState()
    }))
  },

  // PDF Preview actions
  setPdfPreviewUrl: (url) => {
    set({ pdfPreviewUrl: url })
  }
}))
