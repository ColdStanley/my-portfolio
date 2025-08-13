import { useState, useEffect } from 'react'
import { JDRecord } from '@/shared/types'

interface JDTargets {
  dailyNewJD: number
  dailyApplications: number
  weeklyApplications: number
  monthlyApplications: number
}

interface JDStats {
  todayNewJD: number
  todayApplications: number
  weeklyApplications: number
  monthlyApplications: number
}

const DEFAULT_TARGETS: JDTargets = {
  dailyNewJD: 5,
  dailyApplications: 2,
  weeklyApplications: 10,
  monthlyApplications: 30
}

export function useJDStats(jds: JDRecord[]) {
  const [targets, setTargets] = useState<JDTargets>(DEFAULT_TARGETS)

  // Load targets from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('jd2cv-targets')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setTargets({ ...DEFAULT_TARGETS, ...parsed })
      } catch (error) {
        console.error('Failed to parse stored targets:', error)
      }
    }
  }, [])

  // Save targets to localStorage
  const updateTargets = (newTargets: Partial<JDTargets>) => {
    const updated = { ...targets, ...newTargets }
    setTargets(updated)
    localStorage.setItem('jd2cv-targets', JSON.stringify(updated))
  }

  // Calculate stats based on current JDs
  const getStats = (): JDStats => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Start of week (Monday)
    const startOfWeek = new Date(today)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    // Start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Count new JDs created today
    const todayNewJD = jds.filter(jd => {
      const createdDate = new Date(jd.created_at)
      return createdDate >= today
    }).length

    // Count applications (Stage = "Applied") for different periods
    const appliedJDs = jds.filter(jd => jd.application_stage === 'Applied')

    const todayApplications = appliedJDs.filter(jd => {
      const updatedDate = new Date(jd.updated_at)
      return updatedDate >= today
    }).length

    const weeklyApplications = appliedJDs.filter(jd => {
      const updatedDate = new Date(jd.updated_at)
      return updatedDate >= startOfWeek
    }).length

    const monthlyApplications = appliedJDs.filter(jd => {
      const updatedDate = new Date(jd.updated_at)
      return updatedDate >= startOfMonth
    }).length

    return {
      todayNewJD,
      todayApplications,
      weeklyApplications,
      monthlyApplications
    }
  }

  return {
    targets,
    updateTargets,
    stats: getStats()
  }
}