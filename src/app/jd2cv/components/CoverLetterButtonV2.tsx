'use client'

import { useState } from 'react'

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

  const handleGenerate = async () => {
    if (!canGenerate || isGenerating) return

    const personalInfo = JSON.parse(localStorage.getItem('jd2cv-v2-personal-info')!)
    const aiContent = localStorage.getItem(`jd2cv-v2-ai-content-${jd.id}`)!

    setIsGenerating(true)

    try {
      // Step 1: Generate cover letter text
      const coverLetterResponse = await fetch('/api/jd2cv/v2/generate-cover-letter', {
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
          aiModel: 'deepseek'
        })
      })

      if (!coverLetterResponse.ok) {
        throw new Error('Failed to generate cover letter')
      }

      const coverLetterResult = await coverLetterResponse.json()
      
      if (!coverLetterResult.success || !coverLetterResult.coverLetter) {
        throw new Error(coverLetterResult.error || 'Failed to generate cover letter')
      }

      // Step 2: Generate PDF directly
      const pdfResponse = await fetch('/api/jd2cv/v2/generate-cover-letter-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverLetterContent: coverLetterResult.coverLetter,
          personalInfo: personalInfo,
          jdInfo: {
            title: jd.title,
            company: jd.company,
            description: jd.full_job_description
          },
          format: personalInfo.format || 'A4'
        })
      })

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate cover letter PDF')
      }

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

    } catch (error) {
      console.error('Cover Letter generation error:', error)
      alert(`Failed to generate cover letter: ${error.message || 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className={`
        p-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl
        ${canGenerate 
          ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white cursor-pointer' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
        }
        ${isGenerating ? 'animate-pulse' : ''}
        ${className}
      `}
      title={canGenerate ? "Generate Cover Letter PDF V2" : "Generate Resume first to unlock Cover Letter"}
    >
      {isGenerating ? (
        <div className="animate-spin w-4 h-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
    </button>
  )
}