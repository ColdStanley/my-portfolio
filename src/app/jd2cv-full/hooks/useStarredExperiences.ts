import { useState, useEffect } from 'react'

const STORAGE_KEY = 'starred-experiences'

interface StarredExperiences {
  [experienceId: string]: boolean
}

export function useStarredExperiences() {
  const [starredExperiences, setStarredExperiences] = useState<StarredExperiences>({})

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setStarredExperiences(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load starred experiences:', error)
    }
  }, [])

  // Save to localStorage whenever state changes
  const saveToStorage = (newStarred: StarredExperiences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStarred))
      setStarredExperiences(newStarred)
    } catch (error) {
      console.error('Failed to save starred experiences:', error)
    }
  }

  const toggleStar = (experienceId: string) => {
    const newStarred = {
      ...starredExperiences,
      [experienceId]: !starredExperiences[experienceId]
    }
    
    // Clean up false values to keep storage lean
    if (!newStarred[experienceId]) {
      delete newStarred[experienceId]
    }
    
    saveToStorage(newStarred)
  }

  const isStarred = (experienceId: string): boolean => {
    return !!starredExperiences[experienceId]
  }

  const getStarredIds = (): string[] => {
    return Object.keys(starredExperiences).filter(id => starredExperiences[id])
  }

  const getStarredCount = (): number => {
    return getStarredIds().length
  }

  return {
    toggleStar,
    isStarred,
    getStarredIds,
    getStarredCount
  }
}