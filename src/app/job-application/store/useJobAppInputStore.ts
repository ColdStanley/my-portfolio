import { create } from 'zustand'

const LOCAL_KEY = 'cvbuilder_resume_data'

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
  addSkill: (newSkill: string) => void
  updateSkill: (index: number, value: string) => void
  removeSkill: (index: number) => void

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

export const useJobAppInputStore = create<JobAppInputState>((set, get) => {
  const persist = () => {
    const state = get()
    const dataToStore = {
      basic: state.basic,
      education: state.education,
      workExperience: state.workExperience,
      projects: state.projects,
      awards: state.awards,
      skills: state.skills,
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(dataToStore))
  }

  return {
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
      set((state) => {
        const updated = {
          basic: {
            ...state.basic,
            [key]: value,
          },
        }
        persist()
        return updated
      }),

    setSkills: (skills) =>
  set(() => {
    const updated = { skills }
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({
        ...get(),
        skills, 
      })
    )
    return updated
  }),


    addSkill: (newSkill) =>
      set((state) => {
        const updated = { skills: [...state.skills, newSkill] }
        persist()
        return updated
      }),

    updateSkill: (index, value) =>
      set((state) => {
        const updated = [...state.skills]
        updated[index] = value
        persist()
        return { skills: updated }
      }),

    removeSkill: (index) =>
      set((state) => {
        const updated = state.skills.filter((_, i) => i !== index)
        persist()
        return { skills: updated }
      }),

    addEducation: (item) =>
      set((state) => {
        const updated = { education: [...state.education, item] }
        persist()
        return updated
      }),

    updateEducation: (index, value) =>
      set((state) => {
        const updated = {
          education: state.education.map((edu, i) =>
            i === index ? { ...edu, ...value } : edu
          ),
        }
        persist()
        return updated
      }),

    removeEducation: (index) =>
      set((state) => {
        const updated = { education: state.education.filter((_, i) => i !== index) }
        persist()
        return updated
      }),

    addAward: (item) =>
      set((state) => {
        const updated = { awards: [...state.awards, item] }
        persist()
        return updated
      }),

    updateAward: (index, value) =>
      set((state) => {
        const updated = {
          awards: state.awards.map((award, i) =>
            i === index ? { ...award, ...value } : award
          ),
        }
        persist()
        return updated
      }),

    removeAward: (index) =>
      set((state) => {
        const updated = { awards: state.awards.filter((_, i) => i !== index) }
        persist()
        return updated
      }),

    addWork: (item) =>
      set((state) => {
        const updated = { workExperience: [...state.workExperience, item] }
        persist()
        return updated
      }),

    updateWork: (index, value) =>
      set((state) => {
        const updated = {
          workExperience: state.workExperience.map((work, i) =>
            i === index ? { ...work, ...value } : work
          ),
        }
        persist()
        return updated
      }),

    removeWork: (index) =>
      set((state) => {
        const updated = {
          workExperience: state.workExperience.filter((_, i) => i !== index),
        }
        persist()
        return updated
      }),

    addProject: (item) =>
      set((state) => {
        const updated = { projects: [...state.projects, item] }
        persist()
        return updated
      }),

    updateProject: (index, value) =>
      set((state) => {
        const updated = {
          projects: state.projects.map((proj, i) =>
            i === index ? { ...proj, ...value } : proj
          ),
        }
        persist()
        return updated
      }),

    removeProject: (index) =>
      set((state) => {
        const updated = { projects: state.projects.filter((_, i) => i !== index) }
        persist()
        return updated
      }),

    setEducation: (list) =>
      set(() => {
        const updated = { education: list }
        persist()
        return updated
      }),

    getSelectedData: (
      workIndices,
      projectIndices,
      skillIndices,
      educationIndices,
      awardIndices
    ) => {
      const state = useJobAppInputStore.getState()

      const selectedWork = workIndices.map((i) => state.workExperience[i]).filter(Boolean)
      const selectedProjects = projectIndices.map((i) => state.projects[i]).filter(Boolean)
      const selectedSkills = skillIndices.map((i) => state.skills[i]).filter(Boolean)
      const selectedEducation = educationIndices.map((i) => state.education[i]).filter(Boolean)
      const selectedAwards = awardIndices.map((i) => state.awards[i]).filter(Boolean)

      return {
        selectedWork,
        selectedProjects,
        selectedSkills,
        selectedEducation,
        selectedAwards,
      }
    },
  }
})

export type { JobAppInputState }
