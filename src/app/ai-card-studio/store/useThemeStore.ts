import { create } from 'zustand'

type Theme = 'light'

interface ThemeState {
  theme: Theme
  isInitialized: boolean
  actions: {
    initializeTheme: () => void
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light', // Always light theme
  isInitialized: false,

  actions: {
    initializeTheme: () => {
      // Skip if already initialized
      if (get().isInitialized) return

      set({
        theme: 'light',
        isInitialized: true
      })
    }
  }
}))
