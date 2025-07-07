'use client'

import { useEffect, useRef, useState } from 'react'
import { useJobAppInputStore } from '../store/useJobAppInputStore'
import { saveInputsToSupabase } from '../utils/saveInputsToSupabase'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner'

export default function ExperienceProjectSection() {
  const {
    workExperience,
    addWork,
    removeWork,
    updateWork,
    projects,
    addProject,
    removeProject,
    updateProject,
    skills,
    addSkill,
    updateSkill,
    removeSkill,
    setSkills,
  } = useJobAppInputStore()

  const { user } = useAuthStore()

  const [fadeIn, setFadeIn] = useState(false)
  const [saving, setSaving] = useState(false)
  const hasMountedOnce = useRef(false)

  useEffect(() => {
    if (!hasMountedOnce.current) {
      if (workExperience.length === 0) {
        addWork({
          company: '',
          title: '',
          duration: '',
          responsibilities: '',
          achievements: '',
        })
      }
      if (projects.length === 0) {
        addProject({
          title: '',
          duration: '',
          description: '',
        })
      }
      if (skills.length === 0) {
        addSkill('')
      }
      hasMountedOnce.current = true
    }
  }, [])

  useEffect(() => {
    setFadeIn(false)
    const timeout = setTimeout(() => setFadeIn(true), 50)
    return () => clearTimeout(timeout)
  }, [])

  if (!user?.id) {
    return (
      <div className="text-center text-red-600 mt-20 text-lg">
        ⚠️ Please log in to enter your experience and projects.
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveInputsToSupabase(user.id, 'Resume: Experience & Projects')
      toast.success('✅ Saved successfully!')
    } catch (error) {
      console.error('❌ Failed to save:', error)
      toast.error('❌ Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'} space-y-12`}>
      {/* Work Experience */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Work Experience</h2>

        {workExperience.map((work, index) => (
          <div key={index} className="mb-6 border border-purple-200 rounded p-4 space-y-3 relative">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Company Name"
              value={work.company}
              onChange={(e) => updateWork(index, { company: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Job Title"
              value={work.title}
              onChange={(e) => updateWork(index, { title: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Duration (e.g. 2020.06 - 2022.08)"
              value={work.duration}
              onChange={(e) => updateWork(index, { duration: e.target.value })}
            />
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Responsibilities or tasks"
              value={work.responsibilities}
              onChange={(e) => updateWork(index, { responsibilities: e.target.value })}
            />
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Key achievements (optional)"
              value={work.achievements}
              onChange={(e) => updateWork(index, { achievements: e.target.value })}
            />
            <div className="flex justify-end">
              <button
                onClick={() => removeWork(index)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete this work
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            addWork({
              company: '',
              title: '',
              duration: '',
              responsibilities: '',
              achievements: '',
            })
          }
          className="w-48 mt-2 px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
        >
          + Add Work Experience
        </button>
      </section>

      {/* Project Experience */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Projects</h2>

        {projects.map((proj, index) => (
          <div key={index} className="mb-6 border border-purple-200 rounded p-4 space-y-3 relative">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Project Title"
              value={proj.title}
              onChange={(e) => updateProject(index, { title: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Duration (e.g. 2021.01 - 2021.12)"
              value={proj.duration}
              onChange={(e) => updateProject(index, { duration: e.target.value })}
            />
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Description or your responsibilities"
              value={proj.description}
              onChange={(e) => updateProject(index, { description: e.target.value })}
            />
            <div className="flex justify-end">
              <button
                onClick={() => removeProject(index)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete this project
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => addProject({ title: '', duration: '', description: '' })}
          className="w-48 mt-2 px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
        >
          + Add Project
        </button>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Skills</h2>
        <p className="text-sm text-gray-500 mb-4">
          Please use commas to separate each skill or phrase. For example: Python, SQL, machine learning
        </p>

        {skills.map((skill, index) => (
          <div key={index} className="mb-6 border border-purple-200 rounded p-4 space-y-3 relative">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Skill name (e.g. Python, Figma, Communication)"
              value={skill}
              onChange={(e) => updateSkill(index, e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={() => removeSkill(index)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete this skill
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => addSkill('')}
          className="w-48 mt-2 px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
        >
          + Add Skill
        </button>
      </section>

      {/* Save */}
      <div className="pt-4 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-48 px-4 py-2 rounded text-white text-sm transition ${
            saving
              ? 'bg-purple-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {saving ? 'Saving...' : 'Save This Section'}
        </button>
      </div>
    </div>
  )
}