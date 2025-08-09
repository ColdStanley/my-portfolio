import { create } from 'zustand'

interface JDRecord {
  id: string
  title: string
  company: string
  full_job_description: string
  jd_key_sentences: string
  keywords_from_sentences: string
  application_stage: string
  role_group: string
  firm_type: string
  comment: string
  match_score: number
  user_id: string
  created_at: string
}

interface ExperienceRecord {
  id: string
  user_id: string
  jd_id: string | null
  company: string
  title: string
  experience: string
  keywords: string[]
  role_group: string | null
  work_or_project: string | null
  time: string | null
  comment: string | null
  created_at: string
}

interface WorkspaceState {
  // Selected data for workspace
  selectedJD: JDRecord | null
  selectedExperiences: ExperienceRecord[]
  
  // JD Analysis results
  jdKeySentences: string
  jdKeywords: string
  jdAnalysisLoading: boolean
  
  // CV Optimization results
  optimizedExperiences: {
    [experienceId: string]: {
      originalExperience: ExperienceRecord
      optimizedContent: string
      userKeywords: string[]
      isGenerating: boolean
      isGenerated: boolean
    }
  }
  
  // Actions
  setSelectedJD: (jd: JDRecord | null) => void
  setSelectedExperiences: (experiences: ExperienceRecord[]) => void
  addSelectedExperience: (experience: ExperienceRecord) => void
  removeSelectedExperience: (experienceId: string) => void
  
  // JD Analysis actions
  setJDAnalysis: (keySentences: string, keywords: string) => void
  setJDAnalysisLoading: (loading: boolean) => void
  
  // CV Optimization actions
  setOptimizedExperience: (
    experienceId: string, 
    optimizedContent: string, 
    userKeywords: string[]
  ) => void
  setExperienceGenerating: (experienceId: string, isGenerating: boolean) => void
  updateUserKeywords: (experienceId: string, keywords: string[]) => void
  
  // Reset actions
  resetWorkspace: () => void
  resetJDAnalysis: () => void
  resetOptimizedExperiences: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // Initial state
  selectedJD: null,
  selectedExperiences: [],
  jdKeySentences: '',
  jdKeywords: '',
  jdAnalysisLoading: false,
  optimizedExperiences: {},
  
  // JD/CV Selection actions
  setSelectedJD: (jd) => {
    set({ selectedJD: jd })
    // Reset JD analysis when JD changes
    if (jd === null) {
      get().resetJDAnalysis()
    }
  },
  
  setSelectedExperiences: (experiences) => {
    set({ selectedExperiences: experiences })
    // Reset optimization results when experiences change
    get().resetOptimizedExperiences()
  },
  
  addSelectedExperience: (experience) => {
    const current = get().selectedExperiences
    const exists = current.find(exp => exp.id === experience.id)
    if (!exists) {
      set({ selectedExperiences: [...current, experience] })
    }
  },
  
  removeSelectedExperience: (experienceId) => {
    const current = get().selectedExperiences
    set({ 
      selectedExperiences: current.filter(exp => exp.id !== experienceId)
    })
    
    // Remove optimization result for this experience
    const optimized = { ...get().optimizedExperiences }
    delete optimized[experienceId]
    set({ optimizedExperiences: optimized })
  },
  
  // JD Analysis actions
  setJDAnalysis: (keySentences, keywords) => {
    set({ 
      jdKeySentences: keySentences, 
      jdKeywords: keywords 
    })
  },
  
  setJDAnalysisLoading: (loading) => {
    set({ jdAnalysisLoading: loading })
  },
  
  // CV Optimization actions
  setOptimizedExperience: (experienceId, optimizedContent, userKeywords) => {
    const current = get().optimizedExperiences
    const experience = get().selectedExperiences.find(exp => exp.id === experienceId)
    
    if (experience) {
      set({
        optimizedExperiences: {
          ...current,
          [experienceId]: {
            originalExperience: experience,
            optimizedContent,
            userKeywords,
            isGenerating: false,
            isGenerated: true
          }
        }
      })
    }
  },
  
  setExperienceGenerating: (experienceId, isGenerating) => {
    const current = get().optimizedExperiences
    const experience = get().selectedExperiences.find(exp => exp.id === experienceId)
    
    if (experience) {
      set({
        optimizedExperiences: {
          ...current,
          [experienceId]: {
            ...current[experienceId],
            originalExperience: experience,
            optimizedContent: current[experienceId]?.optimizedContent || '',
            userKeywords: current[experienceId]?.userKeywords || [],
            isGenerating,
            isGenerated: current[experienceId]?.isGenerated || false
          }
        }
      })
    }
  },
  
  updateUserKeywords: (experienceId, keywords) => {
    const current = get().optimizedExperiences
    if (current[experienceId]) {
      set({
        optimizedExperiences: {
          ...current,
          [experienceId]: {
            ...current[experienceId],
            userKeywords: keywords
          }
        }
      })
    }
  },
  
  // Reset actions
  resetWorkspace: () => {
    set({
      selectedJD: null,
      selectedExperiences: [],
      jdKeySentences: '',
      jdKeywords: '',
      jdAnalysisLoading: false,
      optimizedExperiences: {}
    })
  },
  
  resetJDAnalysis: () => {
    set({
      jdKeySentences: '',
      jdKeywords: '',
      jdAnalysisLoading: false
    })
  },
  
  resetOptimizedExperiences: () => {
    set({ optimizedExperiences: {} })
  }
}))