'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface JD {
  id: string
  title: string
  company: string
  full_job_description: string
}

interface CoverLetterButtonV2Props {
  jd: JD
  className?: string
}

export default function CoverLetterButtonV2({ jd, className = '' }: CoverLetterButtonV2Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Check if button has been clicked before
  const hasBeenClicked = localStorage.getItem(`coverletter-clicked-${jd.id}`) === 'true'

  // Cover Letter states - exactly same as JD2CV 2.0
  const [coverLetterState, setCoverLetterState] = useState({
    available: false,
    generating: false,
    generated: false,
    content: null as string | null,
    error: null as string | null,
    userPrompt: `### Requirements
1. Structure the cover letter in **3–4 short paragraphs**:
   - **Opening**: Express interest in the position and introduce yourself.
   - **Body (1–2 paragraphs)**: Match applicant's skills and experiences with the job's key requirements. Use measurable achievements where possible.
   - **Closing**: Reaffirm enthusiasm, mention availability for interview, polite sign-off.
2. Keep tone **professional, confident, and concise** (approx. 250–350 words).
3. Do **not** repeat the resume word-for-word; instead, highlight the most relevant skills/achievements.
4. Directly address the company (use the company name).
5. Output only the **main body content** - do not include salutation (Dear...) or closing signature (Sincerely...).

### Output Format
Main body paragraphs only (no "Dear..." salutation, no "Sincerely..." closing).

### Job Information
{jd_info}

### Personal Information
{personal_info}

### Tailored Experience (Resume Content)
{tailored_experience}

Based on the above information, generate a professional cover letter for this position.`,
    aiModel: 'deepseek' as 'openai' | 'deepseek'
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if AI content and personal info exist
  const hasAIContent = () => {
    const aiContent = localStorage.getItem(`jd2cv-v2-ai-content-${jd.id}`)
    return !!aiContent
  }

  const hasPersonalInfo = () => {
    const personalInfo = localStorage.getItem('jd2cv-v2-personal-info')
    if (!personalInfo) return false
    
    try {
      const parsed = JSON.parse(personalInfo)
      return !!(parsed.fullName && parsed.email)
    } catch {
      return false
    }
  }

  const canGenerate = hasAIContent() && hasPersonalInfo()

  // Handle Cover Letter generation - exactly same logic as JD2CV 2.0
  const handleGenerateCoverLetter = async () => {
    const personalInfo = JSON.parse(localStorage.getItem('jd2cv-v2-personal-info')!)
    const aiContent = localStorage.getItem(`jd2cv-v2-ai-content-${jd.id}`)!

    setCoverLetterState(prev => ({ 
      ...prev, 
      generating: true, 
      error: null,
      generated: false 
    }))

    try {
      // Step 1: Generate Cover Letter content
      const coverLetterResponse = await fetch('/api/ai-agent-gala/jd2cv2/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: personalInfo,
          jdInfo: {
            title: jd.title,
            company: jd.company,
            description: jd.full_job_description
          },
          tailoredExperience: aiContent,
          userPrompt: coverLetterState.userPrompt,
          aiModel: coverLetterState.aiModel
        })
      })

      if (!coverLetterResponse.ok) {
        throw new Error(`HTTP error! status: ${coverLetterResponse.status}`)
      }
      
      const result = await coverLetterResponse.json()
      
      if (result.success && result.coverLetter) {
        setCoverLetterState(prev => ({
          ...prev,
          generating: false,
          generated: true,
          content: result.coverLetter
        }))

        // Step 2: Generate PDF directly
        const pdfResponse = await fetch('/api/ai-agent-gala/jd2cv2/generate-cover-letter-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coverLetterContent: result.coverLetter,
            personalInfo: personalInfo,
            jdInfo: {
              title: jd.title,
              company: jd.company,
              description: jd.full_job_description
            },
            format: personalInfo.format || 'A4'
          })
        })

        if (pdfResponse.ok) {
          // Download the PDF
          const blob = await pdfResponse.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          const cleanName = personalInfo.fullName.replace(/[^a-z0-9]/gi, '_')
          const cleanCompany = jd.company.replace(/[^a-z0-9]/gi, '_')
          const cleanPosition = jd.title.replace(/[^a-z0-9]/gi, '_')
          a.download = `${cleanName}_${cleanCompany}_${cleanPosition}_CoverLetter.pdf`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      } else {
        throw new Error(result.error || 'Failed to generate cover letter')
      }

    } catch (error) {
      console.error('Cover Letter generation error:', error)
      setCoverLetterState(prev => ({
        ...prev,
        generating: false,
        error: error.message || 'Unknown error occurred'
      }))
    }
  }

  // Handle tooltip open
  const handleClick = () => {
    if (!canGenerate) return
    
    // Mark as clicked in localStorage
    localStorage.setItem(`coverletter-clicked-${jd.id}`, 'true')
    
    setShowTooltip(true)
    // Smooth entrance animation
    setTimeout(() => setIsVisible(true), 10)
  }

  // Handle tooltip close
  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => setShowTooltip(false), 200)
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!canGenerate || isGenerating}
        className="w-full h-10 px-3 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        title={canGenerate ? "Generate Cover Letter PDF V2" : "Generate Resume first to unlock Cover Letter"}
      >
        {isGenerating ? 'Loading...' : 'Cover'}
      </button>

      {/* Tooltip Portal - Cover Letter Generator */}
      {mounted && showTooltip && createPortal(
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          <div className={`
            relative bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto transition-all duration-200 ease-out
            ${isVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-2'
            }
          `}>
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-150 hover:scale-110 hover:shadow-md z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Cover Letter Generator Content - Exactly same as JD2CV 2.0 */}
            <div className="p-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent mb-4">
                📝 Cover Letter Generator
              </h2>
              
              <div className="text-sm text-gray-600 mb-4 bg-gray-50/50 rounded-lg p-3">
                ✨ Your resume has been generated! Now create a professional cover letter using the same information.
              </div>

              <div className="space-y-4">
                {/* Prompt Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter Prompt (Customize if needed)
                  </label>
                  <textarea
                    value={coverLetterState.userPrompt}
                    onChange={(e) => setCoverLetterState(prev => ({ ...prev, userPrompt: e.target.value }))}
                    rows={12}
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-gray-500 focus:outline-none transition-colors"
                    placeholder="Modify the prompt or use the default template..."
                  />
                </div>

                {/* AI Model Selection */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">AI Model:</label>
                  <select 
                    value={coverLetterState.aiModel}
                    onChange={(e) => setCoverLetterState(prev => ({ ...prev, aiModel: e.target.value as 'openai' | 'deepseek' }))}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gray-500 focus:outline-none"
                  >
                    <option value="deepseek">DeepSeek (Recommended)</option>
                    <option value="openai">OpenAI GPT-4</option>
                  </select>
                </div>
                
                {/* Generate Button */}
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={coverLetterState.generating}
                  className="w-full px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {coverLetterState.generating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating Cover Letter + PDF...
                    </div>
                  ) : (
                    'Generate Cover Letter + PDF'
                  )}
                </button>
                
                {/* Error Display */}
                {coverLetterState.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{coverLetterState.error}</p>
                    <button 
                      onClick={handleGenerateCoverLetter}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Retry
                    </button>
                  </div>
                )}
                
                {/* Generated Content Display */}
                {coverLetterState.generated && coverLetterState.content && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Generated Cover Letter</h4>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(coverLetterState.content || '')
                          alert('Cover letter copied to clipboard!')
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto">
                      {coverLetterState.content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}