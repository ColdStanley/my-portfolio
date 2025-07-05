import { useJobAppInputStore } from '../store/useJobAppInputStore'

export function buildInputsJSON() {
  const {
    basic,
    education,
    workExperience,
    projects,
    awards,
    skills,
  } = useJobAppInputStore.getState()

  return {
    basic,
    education,
    workExperience, // ✅ 保持一致
    projects,
    awards,
    skills,
  }
}
