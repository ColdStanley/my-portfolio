'use client'

import { useState, useEffect } from 'react'
import { useSwiftApplyStore, type PersonalInfo } from '@/lib/swiftapply/store'
import { getDefaultPersonalInfo } from '@/lib/swiftapply/localStorage'
import { validatePersonalInfo, parseMultilineToArray, arrayToMultiline, isValidEmail } from '@/lib/swiftapply/utils'

export default function StepPersonalInfo() {
  const { personalInfo, setPersonalInfo, openSettings } = useSwiftApplyStore()

  // Local form state
  const [formData, setFormData] = useState<PersonalInfo>(() =>
    personalInfo || getDefaultPersonalInfo()
  )
  const [errors, setErrors] = useState<string[]>([])

  // Sync with store when personalInfo changes
  useEffect(() => {
    if (personalInfo) {
      setFormData(personalInfo)
    }
  }, [personalInfo])

  // Handle field changes
  const handleChange = (field: keyof PersonalInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle array field changes (summary, skills, etc.)
  const handleArrayChange = (field: keyof PersonalInfo, value: string) => {
    const arrayValue = parseMultilineToArray(value)
    handleChange(field, arrayValue)
  }

  // Handle education changes
  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = [...formData.education]
    updated[index] = { ...updated[index], [field]: value }
    handleChange('education', updated)
  }

  const addEducation = () => {
    handleChange('education', [
      ...formData.education,
      { degree: '', institution: '', year: '', gpa: '' }
    ])
  }

  const removeEducation = (index: number) => {
    const updated = formData.education.filter((_, i) => i !== index)
    handleChange('education', updated)
  }

  // Handle custom modules
  const handleCustomModuleChange = (index: number, field: string, value: any) => {
    const updated = [...formData.customModules]
    if (field === 'content') {
      updated[index] = { ...updated[index], [field]: parseMultilineToArray(value) }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    handleChange('customModules', updated)
  }

  const addCustomModule = () => {
    handleChange('customModules', [
      ...formData.customModules,
      { id: Date.now().toString(), title: '', content: [] }
    ])
  }

  const removeCustomModule = (index: number) => {
    const updated = formData.customModules.filter((_, i) => i !== index)
    handleChange('customModules', updated)
  }

  // Validation and save
  const handleSaveAndContinue = () => {
    const validationErrors = validatePersonalInfo(formData)

    // Additional email validation
    if (formData.email && !isValidEmail(formData.email)) {
      validationErrors.push('Please enter a valid email address')
    }

    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      setPersonalInfo(formData)
      openSettings(2)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, State/Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Professional Summary
          </label>
          <p className="text-xs text-gray-500 mb-2">One point per line</p>
          <textarea
            value={arrayToMultiline(formData.summary)}
            onChange={(e) => handleArrayChange('summary', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
            placeholder="• Experienced software developer with 5+ years..."
          />
        </div>

        {/* Skills and Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technical Skills
            </label>
            <p className="text-xs text-gray-500 mb-2">One skill per line</p>
            <textarea
              value={arrayToMultiline(formData.technicalSkills)}
              onChange={(e) => handleArrayChange('technicalSkills', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
              placeholder="JavaScript&#10;React&#10;Node.js&#10;Python"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Languages
            </label>
            <p className="text-xs text-gray-500 mb-2">One language per line</p>
            <textarea
              value={arrayToMultiline(formData.languages)}
              onChange={(e) => handleArrayChange('languages', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
              placeholder="English (Native)&#10;Spanish (Fluent)"
            />
          </div>
        </div>

        {/* Education */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Education</h3>
            <button
              type="button"
              onClick={addEducation}
              className="px-3 py-1 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add Education
            </button>
          </div>

          {formData.education.map((edu, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Education {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-sm"
                    placeholder="Bachelor of Science in Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-sm"
                    placeholder="University Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-sm"
                    placeholder="2020"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    GPA (Optional)
                  </label>
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-sm"
                    placeholder="3.8"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certifications
          </label>
          <p className="text-xs text-gray-500 mb-2">One certification per line</p>
          <textarea
            value={arrayToMultiline(formData.certificates)}
            onChange={(e) => handleArrayChange('certificates', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none"
            placeholder="AWS Certified Solutions Architect&#10;Google Cloud Professional"
          />
        </div>

        {/* Custom Modules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Custom Sections</h3>
            <button
              type="button"
              onClick={addCustomModule}
              className="px-3 py-1 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add Section
            </button>
          </div>

          {formData.customModules.map((module, index) => (
            <div key={module.id} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Section {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCustomModule(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={module.title}
                    onChange={(e) => handleCustomModuleChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-sm"
                    placeholder="Projects, Publications, Awards, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Content
                  </label>
                  <p className="text-xs text-gray-500 mb-2">One item per line</p>
                  <textarea
                    value={arrayToMultiline(module.content)}
                    onChange={(e) => handleCustomModuleChange(index, 'content', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none text-sm"
                    placeholder="• Built a web application that serves 10,000+ users..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Resume Format
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="A4"
                checked={formData.format === 'A4'}
                onChange={(e) => handleChange('format', e.target.value as 'A4' | 'Letter')}
                className="mr-2 text-purple-600 focus:ring-purple-500"
              />
              A4 (210 × 297 mm)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="Letter"
                checked={formData.format === 'Letter'}
                onChange={(e) => handleChange('format', e.target.value as 'A4' | 'Letter')}
                className="mr-2 text-purple-600 focus:ring-purple-500"
              />
              Letter (8.5 × 11 in)
            </label>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
        <button
          onClick={handleSaveAndContinue}
          className="px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </div>
  )
}