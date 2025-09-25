'use client'

import { useState } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'

export default function AIReviewModal() {
  const {
    ai: { generatedContent },
    resetAIState
  } = useSwiftApplyStore()

  const [editedWorkExperience, setEditedWorkExperience] = useState(
    generatedContent?.workExperience || ''
  )
  const [editedPersonalInfoText, setEditedPersonalInfoText] = useState(
    JSON.stringify(generatedContent?.personalInfo || {}, null, 2)
  )
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleConfirm = async () => {
    setError(null)

    // Validate personal info JSON
    let parsedPersonalInfo: any
    try {
      parsedPersonalInfo = JSON.parse(editedPersonalInfoText)
      if (!parsedPersonalInfo || typeof parsedPersonalInfo !== 'object' || Array.isArray(parsedPersonalInfo)) {
        throw new Error('Personal info must be a JSON object')
      }
    } catch (error) {
      setError('Personal info must be valid JSON. Please correct and try again.')
      return
    }

    // Validate work experience
    const trimmedWorkExperience = editedWorkExperience.trim()
    if (!trimmedWorkExperience) {
      setError('Work experience cannot be empty.')
      return
    }

    setIsGeneratingPDF(true)

    try {
      // Call PDF generation API
      const response = await fetch('/api/swiftapply/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: parsedPersonalInfo,
          workExperience: trimmedWorkExperience,
          format: parsedPersonalInfo.format || 'A4'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url

      // Extract job title from work experience
      let jobTitle = 'Resume'
      if (trimmedWorkExperience) {
        const firstLine = trimmedWorkExperience.split('\n')[0]?.trim() || ''
        if (firstLine.includes('|')) {
          // Pattern: Company | Role | Time
          const parts = firstLine.split('|').map(p => p.trim())
          jobTitle = parts[1] || 'Resume'
        } else if (firstLine.includes('–') || firstLine.includes('-')) {
          // Pattern: Company – Role or Role – Company
          const parts = firstLine.split(/[–-]/).map(p => p.trim())
          jobTitle = parts[1] || parts[0] || 'Resume'
        } else {
          // Use first meaningful word/phrase
          const words = firstLine.split(' ').filter(w => w.length > 2)
          jobTitle = words.slice(0, 2).join('_') || 'Resume'
        }
      }

      // Generate filename: name_title_resume.pdf
      const cleanName = (parsedPersonalInfo.fullName || 'Name').replace(/[^a-z0-9]/gi, '_')
      const cleanTitle = jobTitle.replace(/[^a-z0-9]/gi, '_')
      a.download = `${cleanName}_${cleanTitle}_Resume.pdf`

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Keep panels visible after PDF download
      // Do not reset AI state - user wants panels to persist

    } catch (error) {
      console.error('PDF generation error:', error)
      setError((error as Error)?.message || 'Failed to generate PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleCancel = () => {
    // Keep panels visible - only close if user explicitly wants to clear everything
    // resetAIState()
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <div className="text-lg font-semibold text-gray-800">Review & Download</div>
          <div className="text-xs text-gray-500">Edit the content below before downloading your PDF</div>
        </div>
        <button
          onClick={handleCancel}
          className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 flex items-center justify-center"
          aria-label="Close review dialog"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Work Experience */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700" htmlFor="work-experience">
            AI-Generated Work Experience
          </label>
          <textarea
            id="work-experience"
            className="h-48 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
            value={editedWorkExperience}
            onChange={event => setEditedWorkExperience(event.target.value)}
            spellCheck={false}
            placeholder="AI-generated work experience will appear here..."
          />
          <p className="text-xs text-gray-400">
            Review and edit the AI-generated experience content
          </p>
        </div>

        {/* Personal Info */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700" htmlFor="personal-info">
            Personal Information (JSON)
          </label>
          <textarea
            id="personal-info"
            className="h-48 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
            value={editedPersonalInfoText}
            onChange={event => setEditedPersonalInfoText(event.target.value)}
            spellCheck={false}
            placeholder="Personal information JSON..."
          />
          <p className="text-xs text-gray-400">
            Must be valid JSON format. Do not rename fields.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
        <span className="text-sm text-gray-500">Review your AI-generated resume content before downloading</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            disabled={isGeneratingPDF}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isGeneratingPDF}
            className="px-6 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg shadow hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isGeneratingPDF ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Generating PDF...
              </div>
            ) : (
              'Confirm & Download PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}