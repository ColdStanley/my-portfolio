import { create } from 'zustand'

// 用 localStorage 持久化粘贴的 JD 内容（键名可按需调整）
const LOCAL_KEY = 'cvbuilder_jdText'

interface JdInputState {
  jdText: string
  setJdText: (text: string) => void
}

export const useJdInputStore = create<JdInputState>((set) => {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_KEY) : null

  return {
    jdText: stored || '',
    setJdText: (text: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_KEY, text)
      }
      set({ jdText: text })
    },
  }
})
