'use client'

import { useEffect, useState } from 'react'

const MAX_TRIAL = 3
const STORAGE_KEY = 'ielts_speaking_trial_count'

export function useTrialLimit() {
  const [canUse, setCanUse] = useState(true)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const current = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
      setCount(current)
      setCanUse(current < MAX_TRIAL)
    }
  }, [])

  const increaseCount = () => {
    if (typeof window === 'undefined') return
    const current = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
    const next = current + 1
    localStorage.setItem(STORAGE_KEY, next.toString())
    setCount(next)
    setCanUse(next < MAX_TRIAL)
  }

  return { canUse, count, increaseCount }
}
