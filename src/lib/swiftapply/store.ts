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
  content: string[]
}

interface SwiftApplyState {
  // Data
  personalInfo: PersonalInfo | null
  templates: ExperienceTemplate[]
  jobDescription: string

  // UI State
  isSettingsOpen: boolean
  settingsStep: 1 | 2

  // Actions
  setPersonalInfo: (pi: PersonalInfo) => void
  setTemplates: (t: ExperienceTemplate[]) => void
  setJobDescription: (v: string) => void
  openSettings: (step?: 1 | 2) => void
  closeSettings: () => void
  clearAll: () => void
  initializeFromStorage: () => void

  // Template management helpers
  addTemplate: (template: Omit<ExperienceTemplate, 'id'>) => void
  updateTemplate: (id: string, updates: Partial<ExperienceTemplate>) => void
  deleteTemplate: (id: string) => void
}

export const useSwiftApplyStore = create<SwiftApplyState>((set, get) => ({
  // Initial state
  personalInfo: null,
  templates: [],
  jobDescription: '',
  isSettingsOpen: false,
  settingsStep: 1,

  // Core setters
  setPersonalInfo: (personalInfo) => {
    set({ personalInfo })
    saveToStorage('jd2cv-v2-personal-info', personalInfo)
  },

  setTemplates: (templates) => {
    set({ templates })
    saveToStorage('swiftapply-templates', templates)
  },

  setJobDescription: (jobDescription) => {
    set({ jobDescription })
    // JD is not persisted to localStorage
  },

  // UI actions
  openSettings: (step = 1) => {
    set({ isSettingsOpen: true, settingsStep: step })
  },

  closeSettings: () => {
    set({ isSettingsOpen: false })
  },

  clearAll: () => {
    set({
      personalInfo: null,
      templates: [],
      jobDescription: '',
      settingsStep: 1
    })
    localStorage.removeItem('jd2cv-v2-personal-info')
    localStorage.removeItem('swiftapply-templates')
    // Auto-open settings after clearing
    setTimeout(() => get().openSettings(1), 100)
  },

  initializeFromStorage: () => {
    const personalInfo = loadFromStorage<PersonalInfo>('jd2cv-v2-personal-info')
    const templates = loadFromStorage<ExperienceTemplate[]>('swiftapply-templates') || []

    set({
      personalInfo,
      templates
    })
  },

  // Template helpers
  addTemplate: (templateData) => {
    const newTemplate: ExperienceTemplate = {
      ...templateData,
      id: Date.now().toString()
    }
    const updatedTemplates = [...get().templates, newTemplate]
    get().setTemplates(updatedTemplates)
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
  }
}))