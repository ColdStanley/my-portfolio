'use client'

import { useEffect, useRef, useState } from 'react'
import { useJobAppInputStore } from '../store/useJobAppInputStore'
import { saveInputsToSupabase } from '../utils/saveInputsToSupabase'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'sonner' // ✅ 提示库

export default function BasicProfileSection() {
  const {
    basic,
    setBasic,
    education,
    addEducation,
    updateEducation,
    removeEducation,
    awards,
    addAward,
    updateAward,
    removeAward,
  } = useJobAppInputStore()

  const { user } = useAuthStore()

  const [fadeIn, setFadeIn] = useState(false)
  const [saving, setSaving] = useState(false)
  const hasLoadedOnce = useRef(false)

  useEffect(() => {
    if (!hasLoadedOnce.current) {
      if (education.length === 0) {
        addEducation({ school: '', degree: '', major: '', duration: '', description: '' })
      }
      if (awards.length === 0) {
        addAward({ title: '', source: '', description: '' })
      }
      hasLoadedOnce.current = true
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
        ⚠️ Please log in first to fill out your profile.
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveInputsToSupabase(user.id, 'Resume: Basic Info')
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
      {/* Basic Info */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Full Name"
            value={basic.name}
            onChange={(e) => setBasic('name', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Email"
            value={basic.email}
            onChange={(e) => setBasic('email', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Phone (optional)"
            value={basic.phone}
            onChange={(e) => setBasic('phone', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Location or Work Eligibility"
            value={basic.location}
            onChange={(e) => setBasic('location', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="LinkedIn URL"
            value={basic.linkedin}
            onChange={(e) => setBasic('linkedin', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="GitHub (optional)"
            value={basic.github}
            onChange={(e) => setBasic('github', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Portfolio (optional)"
            value={basic.portfolio}
            onChange={(e) => setBasic('portfolio', e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Personal Website (optional)"
            value={basic.website}
            onChange={(e) => setBasic('website', e.target.value)}
          />
        </div>
      </section>

      {/* Education */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Education</h2>
        {education.map((edu, index) => (
          <div key={index} className="mb-6 border border-purple-200 rounded p-4 space-y-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="School"
              value={edu.school}
              onChange={(e) => updateEducation(index, { school: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                className="border rounded px-3 py-2"
                placeholder="Degree (e.g. Bachelor)"
                value={edu.degree}
                onChange={(e) => updateEducation(index, { degree: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Major / Focus"
                value={edu.major}
                onChange={(e) => updateEducation(index, { major: e.target.value })}
              />
              <input
                className="col-span-2 border rounded px-3 py-2"
                placeholder="Duration (e.g. 2018–2022)"
                value={edu.duration}
                onChange={(e) => updateEducation(index, { duration: e.target.value })}
              />
            </div>
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Key courses or description"
              value={edu.description}
              onChange={(e) => updateEducation(index, { description: e.target.value })}
            />
            <div className="flex justify-end">
              <button
                onClick={() => removeEducation(index)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete this education
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            addEducation({ school: '', degree: '', major: '', duration: '', description: '' })
          }
          className="w-48 mt-2 px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
        >
          + Add Education
        </button>
      </section>

      {/* Awards */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">🏅 Awards & Certifications</h2>
        {awards.map((award, index) => (
          <div key={index} className="mb-6 border border-purple-200 rounded p-4 space-y-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Title (e.g. National Scholarship / PMP Certificate)"
              value={award.title}
              onChange={(e) => updateAward(index, { title: e.target.value })}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Issuer / Year (e.g. 2023)"
              value={award.source}
              onChange={(e) => updateAward(index, { source: e.target.value })}
            />
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Brief description (optional)"
              value={award.description}
              onChange={(e) => updateAward(index, { description: e.target.value })}
            />
            <div className="flex justify-end">
              <button
                onClick={() => removeAward(index)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete this award
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => addAward({ title: '', source: '', description: '' })}
          className="w-48 mt-2 px-4 py-2 rounded bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
        >
          Add Award / Certificate
        </button>
      </section>

      {/* Save Button */}
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
          {saving ? 'Saving...' : '💾 Save This Section'}
        </button>
      </div>
    </div>
  )
}
