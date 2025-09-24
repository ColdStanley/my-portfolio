/**
 * LocalStorage utilities for SwiftApply
 * Handles safe reading/writing of data to localStorage
 */

export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error)
    return null
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error)
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error)
  }
}

/**
 * Get default PersonalInfo structure
 */
export function getDefaultPersonalInfo() {
  return {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: [],
    technicalSkills: [],
    languages: [],
    education: [],
    certificates: [],
    customModules: [],
    format: 'A4' as const
  }
}