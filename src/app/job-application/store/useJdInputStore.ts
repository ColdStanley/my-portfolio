import { create } from 'zustand'

const LOCAL_KEY = 'cvbuilder_jdText'

interface JDSentenceEmbedding {
  sentence: string
  embedding: number[]
}

interface JdInputState {
  jdText: string
  setJdText: (text: string) => void

  jdEmbedding: number[] | null
  setJdEmbedding: (embedding: number[] | null) => void

  jdSentenceEmbeddings: JDSentenceEmbedding[]
  setJdSentenceEmbeddings: (items: JDSentenceEmbedding[]) => void
}

export const useJdInputStore = create<JdInputState>((set) => {
  const stored =
    typeof window !== 'undefined' ? localStorage.getItem(LOCAL_KEY) : null

  let parsed: any = {}
  if (stored) {
    try {
      parsed = JSON.parse(stored)
    } catch (e) {
      console.warn('⚠️ Failed to parse local JD cache', e)
    }
  }

  return {
    jdText: parsed.jdText || '',
    setJdText: (text: string) => {
      const existing = localStorage.getItem(LOCAL_KEY)
      let parsed: any = {}
      try {
        parsed = existing ? JSON.parse(existing) : {}
      } catch (e) {
        console.warn('⚠️ Failed to parse JD cache in setJdText', e)
      }
      parsed.jdText = text
      localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed))
      set({ jdText: text })
    },

    jdEmbedding: parsed.embedding || null,
    setJdEmbedding: (embedding) => {
      const existing = localStorage.getItem(LOCAL_KEY)
      let parsed: any = {}
      try {
        parsed = existing ? JSON.parse(existing) : {}
      } catch (e) {
        console.warn('⚠️ Failed to parse JD cache in setJdEmbedding', e)
      }
      parsed.embedding = embedding
      localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed))
      set({ jdEmbedding: embedding })
    },

    jdSentenceEmbeddings: parsed.sentenceEmbeddings || [],
    setJdSentenceEmbeddings: (items) => {
      const existing = localStorage.getItem(LOCAL_KEY)
      let parsed: any = {}
      try {
        parsed = existing ? JSON.parse(existing) : {}
      } catch (e) {
        console.warn('⚠️ Failed to parse JD cache in setJdSentenceEmbeddings', e)
      }
      parsed.sentenceEmbeddings = items
      localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed))
      set({ jdSentenceEmbeddings: items })
    },
  }
}
)
