'use client'

import { useState } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'

export default function AIReviewModal() {
  const {
    ai: { generatedContent, showProgressPanel },
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

  // Show modal only if we have generated content and panel is not showing
  if (!generatedContent || showProgressPanel) return null

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

      // Generate filename
      const cleanName = (parsedPersonalInfo.fullName || 'Resume').replace(/[^a-z0-9]/gi, '_')
      const timestamp = new Date().toISOString().slice(0, 10)
      a.download = `${cleanName}_AI_Resume_${timestamp}.pdf`

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Close modal and reset state
      resetAIState()

    } catch (error) {
      console.error('PDF generation error:', error)
      setError((error as Error)?.message || 'Failed to generate PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleCancel = () => {
    resetAIState()
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <div className="text-lg font-semibold text-gray-800">Review AI-Generated Resume</div>
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
        <div className="grid gap-4 overflow-y-auto px-6 py-4 md:grid-cols-2 max-h-[60vh]">
          {/* Work Experience */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="work-experience">
              AI-Generated Work Experience
            </label>
            <textarea
              id="work-experience"
              className="h-64 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="personal-info">
              Personal Information (JSON)
            </label>
            <textarea
              id="personal-info"
              className="h-64 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
              value={editedPersonalInfoText}
              onChange={event => setEditedPersonalInfoText(event.target.value)}
              spellCheck={false}
              placeholder="Personal information JSON..."
            />
            <p className="text-xs text-gray-400">
              Must be valid JSON format. Do not rename fields.
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6">
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 text-xs text-gray-500">
          <span>Review your AI-generated resume content before downloading</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={isGeneratingPDF}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isGeneratingPDF}
              className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-purple-700 disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                  Generating PDF...
                </div>
              ) : (
                'Confirm & Download PDF'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}