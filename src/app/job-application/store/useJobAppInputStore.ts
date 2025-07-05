import { create } from 'zustand'

interface BasicInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  portfolio: string
  website: string
}

interface Education {
  school: string
  degree: string
  major: string
  duration: string
  description: string
}

interface WorkItem {
  company: string
  title: string
  duration: string
  responsibilities: string
  achievements: string
}

interface ProjectItem {
  title: string
  duration: string
  description: string
}

interface AwardItem {
  title: string
  source: string
  description: string
}

interface JobAppInputState {
  basic: BasicInfo
  education: Education[]
  workExperience: WorkItem[]
  projects: ProjectItem[]
  awards: AwardItem[]
  skills: string[]

  setBasic: (key: keyof BasicInfo, value: string) => void
  setSkills: (skills: string[]) => void

  addEducation: (item: Education) => void
  updateEducation: (index: number, value: Partial<Education>) => void
  removeEducation: (index: number) => void

  addAward: (item: AwardItem) => void
  updateAward: (index: number, value: Partial<AwardItem>) => void
  removeAward: (index: number) => void

  addWork: (item: WorkItem) => void
  updateWork: (index: number, value: Partial<WorkItem>) => void
  removeWork: (index: number) => void

  addProject: (item: ProjectItem) => void
  updateProject: (index: number, value: Partial<ProjectItem>) => void
  removeProject: (index: number) => void

  setEducation: (list: Education[]) => void

  getSelectedData: (
    workIndices: number[],
    projectIndices: number[],
    skillIndices: number[],
    educationIndices: number[],
    awardIndices: number[]
  ) => {
    selectedWork: WorkItem[]
    selectedProjects: ProjectItem[]
    selectedSkills: string[]
    selectedEducation: Education[]
    selectedAwards: AwardItem[]
  }
}

export const useJobAppInputStore = create<JobAppInputState>((set) => ({
  basic: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    website: '',
  },
  education: [],
  workExperience: [],
  projects: [],
  awards: [],
  skills: [],

  setBasic: (key, value) =>
    set((state) => ({
      basic: {
        ...state.basic,
        [key]: value,
      },
    })),

  setSkills: (skills) => set({ skills }),

  // 教育经历
  addEducation: (item) =>
    set((state) => ({
      education: [...state.education, item],
    })),

  updateEducation: (index, value) =>
    set((state) => ({
      education: state.education.map((edu, i) =>
        i === index ? { ...edu, ...value } : edu
      ),
    })),

  removeEducation: (index) =>
    set((state) => ({
      education: state.education.filter((_, i) => i !== index),
    })),

  // 奖项
  addAward: (item) =>
    set((state) => ({
      awards: [...state.awards, item],
    })),

  updateAward: (index, value) =>
    set((state) => ({
      awards: state.awards.map((award, i) =>
        i === index ? { ...award, ...value } : award
      ),
    })),

  removeAward: (index) =>
    set((state) => ({
      awards: state.awards.filter((_, i) => i !== index),
    })),

  // 工作
  addWork: (item) =>
    set((state) => ({
      workExperience: [...state.workExperience, item],
    })),

  updateWork: (index, value) =>
    set((state) => ({
      workExperience: state.workExperience.map((work, i) =>
        i === index ? { ...work, ...value } : work
      ),
    })),

  removeWork: (index) =>
    set((state) => ({
      workExperience: state.workExperience.filter((_, i) => i !== index),
    })),

  // 项目
  addProject: (item) =>
    set((state) => ({
      projects: [...state.projects, item],
    })),

  updateProject: (index, value) =>
    set((state) => ({
      projects: state.projects.map((proj, i) =>
        i === index ? { ...proj, ...value } : proj
      ),
    })),

  removeProject: (index) =>
    set((state) => ({
      projects: state.projects.filter((_, i) => i !== index),
    })),

  setEducation: (list) => set({ education: list }),

  getSelectedData: (
    workIndices,
    projectIndices,
    skillIndices,
    educationIndices,
    awardIndices
  ) => {
    const state = useJobAppInputStore.getState()

    const selectedWork = workIndices
      .map((i) => state.workExperience[i])
      .filter(Boolean)

    const selectedProjects = projectIndices
      .map((i) => state.projects[i])
      .filter(Boolean)

    const selectedSkills = skillIndices
      .map((i) => state.skills[i])
      .filter(Boolean)

    const selectedEducation = educationIndices
      .map((i) => state.education[i])
      .filter(Boolean)

    const selectedAwards = awardIndices
      .map((i) => state.awards[i])
      .filter(Boolean)

    return {
      selectedWork,
      selectedProjects,
      selectedSkills,
      selectedEducation,
      selectedAwards,
    }
  },
}))

export type { JobAppInputState }
