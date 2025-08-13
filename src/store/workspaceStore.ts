import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { JDRecord, ExperienceRecord, JDAnalysis } from '../shared/types'

interface WorkspaceState {
  // Selected data for workspace
  selectedJD: JDRecord | null
  selectedExperiences: ExperienceRecord[]
  
  // JD Analysis results
  jdAnalysis: JDAnalysis | null
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
  setJDAnalysis: (analysis: JDAnalysis) => void
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
  
  // Data sync and validation
  validateSelectedJD: () => boolean
  validateSelectedExperiences: () => boolean
  syncJDData: (latestJD: JDRecord) => void
  syncExperienceData: (latestExperiences: ExperienceRecord[]) => void
}

// Parse time and extract end year for sorting
const getEndYear = (timeString: string | null): number => {
  if (!timeString) return 0
  // Handle "Present", "Current", etc.
  if (timeString.toLowerCase().includes('present') || 
      timeString.toLowerCase().includes('current')) {
    return 9999 // Put current positions first
  }
  // Extract year from formats like "2021 - 2023", "2021-2023", "Jan 2021 - Dec 2023"
  const yearMatch = timeString.match(/(\d{4})\s*$/) || timeString.match(/(\d{4})\s*-\s*(\d{4})/)
  if (yearMatch) {
    return parseInt(yearMatch[yearMatch.length - 1]) || 0
  }
  return 0
}

// Sort experiences by end time (most recent first)
const sortExperiences = (experiences: ExperienceRecord[]): ExperienceRecord[] => {
  return [...experiences].sort((a, b) => {
    const endYearA = getEndYear(a.time)
    const endYearB = getEndYear(b.time)
    return endYearB - endYearA // Descending order (most recent first)
  })
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
  // Initial state
  selectedJD: null,
  selectedExperiences: [],
  jdAnalysis: null,
  jdAnalysisLoading: false,
  optimizedExperiences: {},
  
  // JD/CV Selection actions
  setSelectedJD: (jd) => {
    const currentJD = get().selectedJD
    set({ selectedJD: jd })
    
    // If JD actually changed, reset related data
    if (currentJD?.id !== jd?.id) {
      get().resetJDAnalysis()
      get().resetOptimizedExperiences()
    }
    
    // Reset JD analysis when JD is cleared
    if (jd === null) {
      get().resetJDAnalysis()
    }
  },
  
  setSelectedExperiences: (experiences) => {
    set({ selectedExperiences: sortExperiences(experiences) })
    // Reset optimization results when experiences change
    get().resetOptimizedExperiences()
  },
  
  addSelectedExperience: (experience) => {
    const current = get().selectedExperiences
    const exists = current.find(exp => exp.id === experience.id)
    if (!exists) {
      const newExperiences = [...current, experience]
      set({ selectedExperiences: sortExperiences(newExperiences) })
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
  setJDAnalysis: (analysis) => {
    set({ jdAnalysis: analysis })
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
      jdAnalysis: null,
      jdAnalysisLoading: false,
      optimizedExperiences: {}
    })
  },
  
  resetJDAnalysis: () => {
    set({
      jdAnalysis: null,
      jdAnalysisLoading: false
    })
  },
  
  resetOptimizedExperiences: () => {
    set({ optimizedExperiences: {} })
  },
  
  // Data validation methods
  validateSelectedJD: () => {
    const { selectedJD } = get()
    return !!(selectedJD && selectedJD.id && selectedJD.title && selectedJD.company)
  },
  
  validateSelectedExperiences: () => {
    const { selectedExperiences } = get()
    return selectedExperiences.length > 0 && selectedExperiences.every(exp => 
      exp.id && exp.company && exp.title && exp.experience
    )
  },
  
  // Data sync methods to handle external updates
  syncJDData: (latestJD) => {
    const { selectedJD } = get()
    if (selectedJD && selectedJD.id === latestJD.id) {
      // Update selected JD with latest data
      set({ selectedJD: latestJD })
      
      // Check if JD analysis is still valid
      if (latestJD.jd_key_sentences !== selectedJD.jd_key_sentences || 
          latestJD.keywords_from_sentences !== selectedJD.keywords_from_sentences) {
        // JD analysis changed, reset optimization results
        get().resetOptimizedExperiences()
      }
    }
  },
  
  syncExperienceData: (latestExperiences) => {
    const { selectedExperiences } = get()
    let hasChanges = false
    const updatedExperiences = selectedExperiences.map(selected => {
      const latest = latestExperiences.find(exp => exp.id === selected.id)
      if (latest && JSON.stringify(latest) !== JSON.stringify(selected)) {
        hasChanges = true
        return latest
      }
      return selected
    }).filter(exp => latestExperiences.some(latest => latest.id === exp.id)) // Remove deleted experiences
    
    if (hasChanges || updatedExperiences.length !== selectedExperiences.length) {
      set({ selectedExperiences: sortExperiences(updatedExperiences) })
      
      // Reset optimization results for changed experiences
      if (hasChanges) {
        const optimized = { ...get().optimizedExperiences }
        let shouldResetOptimization = false
        
        selectedExperiences.forEach(oldExp => {
          const newExp = updatedExperiences.find(exp => exp.id === oldExp.id)
          if (newExp && newExp.experience !== oldExp.experience) {
            // Experience content changed, remove optimization
            delete optimized[oldExp.id]
            shouldResetOptimization = true
          }
        })
        
        if (shouldResetOptimization) {
          set({ optimizedExperiences: optimized })
        }
      }
    }
  }
}),
    {
      name: 'jd2cv-workspace-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist selection states, not temporary states like loading
      partialize: (state) => ({
        selectedJD: state.selectedJD,
        selectedExperiences: state.selectedExperiences,
        // Don't persist optimization results as they can become stale
        // Don't persist loading states
      }),
      // Version to handle future schema changes
      version: 1,
    }
  )
)