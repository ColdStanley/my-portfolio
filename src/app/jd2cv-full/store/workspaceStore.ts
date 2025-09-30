import { create } from 'zustand'

interface JDRecord {
  id: string
  title: string
  company: string
  full_job_description: string
  jd_key_sentences: string
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
  // Selected data
  selectedJD: JDRecord | null
  selectedExperiences: ExperienceRecord[]

  // Actions
  setSelectedJD: (jd: JDRecord | null) => void
  setSelectedExperiences: (experiences: ExperienceRecord[]) => void
  addSelectedExperience: (experience: ExperienceRecord) => void
  removeSelectedExperience: (experienceId: string) => void

  // Reset actions
  resetWorkspace: () => void
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

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  // Initial state
  selectedJD: null,
  selectedExperiences: [],

  // Selection actions
  setSelectedJD: (jd) => {
    set({ selectedJD: jd })
  },

  setSelectedExperiences: (experiences) => {
    set({ selectedExperiences: sortExperiences(experiences) })
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
  },

  // Reset actions
  resetWorkspace: () => {
    set({
      selectedJD: null,
      selectedExperiences: []
    })
  }
}))