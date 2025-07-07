'use client'

import { useEffect, useRef, useState } from 'react'
import { loadInputsFromSupabase } from '../utils/loadInputsFromSupabase'
import { useJobAppInputStore } from '../store/useJobAppInputStore'
import { useAuthStore } from '@/store/useAuthStore'
import SummarySelectionPanel from './SummarySelectionPanel'

export default function SummaryAndFilterPanel() {
  const {
    basic,
    education,
    workExperience,
    projects,
    awards,
    skills,
  } = useJobAppInputStore()

  const { user, authLoaded } = useAuthStore()

  const [fadeIn, setFadeIn] = useState(false)
  const hasLoadedOnce = useRef(false)

  useEffect(() => {
    if (authLoaded && user?.id && !hasLoadedOnce.current) {
      loadInputsFromSupabase(user.id)
      hasLoadedOnce.current = true
    }
  }, [authLoaded, user])

  useEffect(() => {
    setFadeIn(false)
    const timeout = setTimeout(() => setFadeIn(true), 50)
    return () => clearTimeout(timeout)
  }, [])

  if (!authLoaded) {
    return (
      <div className="text-center text-gray-500 mt-20 text-sm">
        Loading user information...
      </div>
    )
  }

  if (!user?.id) {
    return (
      <div className="text-center text-red-600 mt-20 text-lg">
        ⚠️ Please log in to view or edit your resume.
      </div>
    )
  }

  return (
    <div
      className={`transition-opacity duration-500 ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      } space-y-12 max-w-5xl mx-auto px-4 py-10`}
    >
      {/* Resume Display */}
      <section className="space-y-10">
        {/* Basic Info */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">🧾 Basic Info</h2>
          <div className="text-gray-800 space-y-1">
            <div><strong>Name: </strong>{basic.name}</div>
            <div><strong>Email: </strong>{basic.email}</div>
            <div><strong>Location: </strong>{basic.location}</div>
            <div><strong>LinkedIn: </strong>{basic.linkedin}</div>
            <div><strong>Portfolio: </strong>{basic.portfolio}</div>
          </div>
        </div>

        {/* Education */}
        {education.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">🎓 Education</h2>
            {education.map((edu, index) => (
              <div key={index} className="border-l-4 border-purple-300 pl-4 mb-4">
                <div><strong>School: </strong>{edu.school}</div>
                <div><strong>Degree: </strong>{edu.degree}</div>
                <div><strong>Major: </strong>{edu.major}</div>
                <div><strong>Duration: </strong>{edu.duration}</div>
                <div><strong>Description: </strong>{edu.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">💼 Work Experience</h2>
            {workExperience.map((job, index) => (
              <div key={index} className="border-l-4 border-purple-300 pl-4 mb-4">
                <div><strong>Company: </strong>{job.company}</div>
                <div><strong>Title: </strong>{job.title}</div>
                <div><strong>Duration: </strong>{job.duration}</div>
                <div><strong>Responsibilities: </strong>{job.responsibilities}</div>
                <div><strong>Achievements: </strong>{job.achievements}</div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">📁 Projects</h2>
            {projects.map((proj, index) => (
              <div key={index} className="border-l-4 border-purple-300 pl-4 mb-4">
                <div><strong>Title: </strong>{proj.title}</div>
                <div><strong>Duration: </strong>{proj.duration}</div>
                <div><strong>Description: </strong>{proj.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">🎖 Awards / Certificates</h2>
            {awards.map((award, index) => (
              <div key={index} className="border-l-4 border-purple-300 pl-4 mb-4">
                <div><strong>Title: </strong>{award.title}</div>
                <div><strong>Issuer: </strong>{award.source}</div>
                <div><strong>Description: </strong>{award.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">🛠 Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.flatMap((skill) =>
                skill
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              ).map((cleanedSkill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                >
                  {cleanedSkill}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Selection Section */}
      <SummarySelectionPanel />
    </div>
  )
}
