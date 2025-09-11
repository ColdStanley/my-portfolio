import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'lakers' | 'anno'

interface ThemeState {
  theme: Theme
  isInitialized: boolean
  actions: {
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
    initializeTheme: () => void
  }
}

// Helper function to detect system preference
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Helper function to apply theme to document
const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  // Clear all theme classes
  root.classList.remove('dark', 'lakers', 'anno')
  
  // Apply selected theme class
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'lakers') {
    root.classList.add('lakers')
  } else if (theme === 'anno') {
    root.classList.add('anno')
  }
  // light theme doesn't need a class
}

// Helper function to save theme to localStorage
const saveTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('ai-card-studio-theme', theme)
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error)
  }
}

// Helper function to load theme from localStorage
const loadTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const saved = localStorage.getItem('ai-card-studio-theme') as Theme | null
    return saved && ['light', 'dark', 'lakers', 'anno'].includes(saved) ? saved : null
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error)
    return null
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light', // Default theme
  isInitialized: false,

  actions: {
    setTheme: (theme: Theme) => {
      applyTheme(theme)
      saveTheme(theme)
      set({ theme })
    },

    toggleTheme: () => {
      const currentTheme = get().theme
      const newTheme = currentTheme === 'light' ? 'dark' : 'light'
      get().actions.setTheme(newTheme)
    },

    initializeTheme: () => {
      // Skip if already initialized
      if (get().isInitialized) return

      // Try to load from localStorage first
      const savedTheme = loadTheme()
      const finalTheme = savedTheme || getSystemTheme()
      
      applyTheme(finalTheme)
      set({ 
        theme: finalTheme, 
        isInitialized: true 
      })
      
      // Save to localStorage if it wasn't there before
      if (!savedTheme) {
        saveTheme(finalTheme)
      }
    }
  }
}))