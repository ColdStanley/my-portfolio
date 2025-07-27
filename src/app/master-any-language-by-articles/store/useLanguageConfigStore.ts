import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LanguageConfig, DEFAULT_LANGUAGE_CONFIG } from '../config/languageConfig'

interface LanguageConfigState {
  config: LanguageConfig
  setConfig: (config: LanguageConfig) => void
  setNativeLanguage: (native: LanguageConfig['native']) => void
  setTargetLanguage: (target: LanguageConfig['target']) => void
}

export const useLanguageConfigStore = create<LanguageConfigState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_LANGUAGE_CONFIG,
      
      setConfig: (config) => set({ config }),
      
      setNativeLanguage: (native) => set((state) => ({
        config: { ...state.config, native }
      })),
      
      setTargetLanguage: (target) => set((state) => ({
        config: { ...state.config, target }
      }))
    }),
    {
      name: 'language-config-storage',
      version: 1
    }
  )
)