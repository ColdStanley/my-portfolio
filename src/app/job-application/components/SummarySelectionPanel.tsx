'use client'

import { useJobAppInputStore } from '../store/useJobAppInputStore'
import { useJobAppStore } from '../store/useJobAppStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useState } from 'react'

export default function SummarySelectionPanel() {
  const { workExperience, projects, skills, education, awards } = useJobAppInputStore()
  const {
    selectedWorkIndices,
    setSelectedWorkIndices,
    selectedProjectIndices,
    setSelectedProjectIndices,
    selectedSkillIndices,
    setSelectedSkillIndices,
    selectedEducationIndices,
    setSelectedEducationIndices,
    selectedAwardIndices,
    setSelectedAwardIndices,
  } = useJobAppStore()

  const { user } = useAuthStore()

  const [uploading, setUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const toggleIndex = (index: number, selected: number[], setSelected: (v: number[]) => void) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index))
    } else {
      setSelected([...selected, index])
    }
  }

  const allEmpty =
    workExperience.length === 0 &&
    projects.length === 0 &&
    skills.length === 0 &&
    education.length === 0 &&
    awards.length === 0

  const handleConfirm = async () => {
    if (!user?.id) {
      setStatusMessage('Please log in before proceeding.')
      return
    }

    const total =
      selectedWorkIndices.length +
      selectedProjectIndices.length +
      selectedEducationIndices.length +
      selectedAwardIndices.length +
      selectedSkillIndices.length

    setStatusMessage(`✅ You selected ${total} items. Ready for matching analysis.`)
  }

  // ✅ 拆分 skills 中的每个逗号分隔项为独立技能词组
  const flattenedSkills = skills
    .flatMap((s) => s.split(','))
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <section className="space-y-10">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-800">
          Step 1: Select the content you'd like to include in your application
        </h2>
        <p className="text-sm text-gray-600">
          Then: We'll use it to tailor your resume and cover letter to match the job
        </p>
      </div>

      {allEmpty && (
        <p className="text-sm text-gray-400 italic mt-4">
          No available content yet. Please fill in your information under Experience, Projects, and Skills before selecting.
        </p>
      )}

      {workExperience.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Work Experience</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workExperience.map((item, index) => (
              <li key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition text-sm text-gray-800">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedWorkIndices.includes(index)}
                    onChange={() => toggleIndex(index, selectedWorkIndices, setSelectedWorkIndices)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.company}</div>
                    <div className="text-gray-600">{item.title}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Projects</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((item, index) => (
              <li key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition text-sm text-gray-800">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedProjectIndices.includes(index)}
                    onChange={() => toggleIndex(index, selectedProjectIndices, setSelectedProjectIndices)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-gray-600">{item.duration}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {flattenedSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Skills</h3>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {flattenedSkills.map((skill, index) => (
              <li key={index} className="border rounded-lg p-3 shadow-sm hover:shadow-md transition text-sm text-gray-800">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSkillIndices.includes(index)}
                    onChange={() => toggleIndex(index, selectedSkillIndices, setSelectedSkillIndices)}
                  />
                  <div className="flex-1 font-medium">{skill}</div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {education.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Education</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {education.map((item, index) => (
              <li key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition text-sm text-gray-800">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedEducationIndices.includes(index)}
                    onChange={() => toggleIndex(index, selectedEducationIndices, setSelectedEducationIndices)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.school}</div>
                    <div className="text-gray-600">{item.degree}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {awards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Awards and Certificates</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {awards.map((item, index) => (
              <li key={index} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition text-sm text-gray-800">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedAwardIndices.includes(index)}
                    onChange={() => toggleIndex(index, selectedAwardIndices, setSelectedAwardIndices)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-gray-600">{item.source}</div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirm Button */}
      <div className="pt-6 pb-12 space-y-2">
        <button
          onClick={handleConfirm}
          disabled={uploading}
          className={`w-48 px-4 py-2 rounded text-white text-sm transition ${
            uploading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Confirm Selection'}
        </button>

        {statusMessage && (
          <p className="text-sm text-gray-700">{statusMessage}</p>
        )}
      </div>
    </section>
  )
}
