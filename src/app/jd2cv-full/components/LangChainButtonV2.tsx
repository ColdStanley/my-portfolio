'use client'

import { useState, useEffect } from 'react'

interface JD {
  id: string
  title: string
  company: string
  full_job_description: string
}

interface LangChainButtonV2Props {
  jd: JD
  className?: string
  onPDFUploaded?: () => void
}

export default function LangChainButtonV2({ jd, className = '', onPDFUploaded }: LangChainButtonV2Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [countdown, setCountdown] = useState(180)

  // Check if button has been clicked before
  const hasBeenClicked = localStorage.getItem(`langchain-clicked-${jd.id}`) === 'true'

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isGenerating) {
      setCountdown(180) // Reset to 180 seconds
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 1 // Don't go below 1
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating])

  const handleGenerate = async () => {
    // Check if personal info exists
    const personalInfo = localStorage.getItem('jd2cv-v2-personal-info')
    if (!personalInfo) {
      alert('Please configure your personal information first')
      return
    }

    const parsedPersonalInfo = JSON.parse(personalInfo)
    if (!parsedPersonalInfo.fullName || !parsedPersonalInfo.email) {
      alert('Please fill in basic personal information (Name & Email)')
      return
    }

    // Mark as clicked in localStorage
    localStorage.setItem(`langchain-clicked-${jd.id}`, 'true')

    setIsGenerating(true)

    try {
      // Create AbortController for 300s timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 300 seconds

      try {
        // Call LangChain API for full resume customization
        const langchainResponse = await fetch('/api/jd2cv-full/langchain-generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jd: {
              title: jd.title,
              full_job_description: jd.full_job_description
            },
            personalInfo: parsedPersonalInfo
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId) // Clear timeout on success

        if (!langchainResponse.ok) {
          throw new Error('Failed to get customized resume from LangChain workflow')
        }

        const customizedResume = await langchainResponse.json()

        // Update localStorage with customized personal info
        localStorage.setItem('jd2cv-v2-personal-info', JSON.stringify(customizedResume.personalInfo))

        // Store customized work experience for PDF generation
        localStorage.setItem(`jd2cv-v2-ai-content-${jd.id}`, customizedResume.workExperience)

        // Generate and Download PDF with V2 API
        const completeResumeData = {
          personalInfo: customizedResume.personalInfo,
          aiGeneratedExperience: customizedResume.workExperience,
          format: customizedResume.personalInfo.format || 'A4',
          jobTitle: jd.title
        }

        const pdfResponse = await fetch('/api/jd2cv-full/v2/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeResumeData)
        })

        if (!pdfResponse.ok) {
          throw new Error('Failed to generate PDF')
        }

        const blob = await pdfResponse.blob()
        const filename = `${customizedResume.personalInfo.fullName.replace(/[^a-z0-9]/gi, '_')}_${jd.company.replace(/[^a-z0-9]/gi, '_')}_${jd.title.replace(/[^a-z0-9]/gi, '_')}_Resume_LangChain.pdf`

        // User download (existing functionality)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Auto-upload to database (using fresh blob)
        try {
          console.log('Starting auto-upload to database...')
          console.log('JD Info:', { id: jd.id, user_id: jd.user_id, filename })

          const uploadBlob = new Blob([blob], { type: 'application/pdf' }) // Ensure PDF MIME type
          const formData = new FormData()
          formData.append('file', uploadBlob, filename)
          formData.append('jdId', jd.id)
          formData.append('userId', jd.user_id)

          const uploadResponse = await fetch('/api/jds/upload-pdf', {
            method: 'POST',
            body: formData
          })

          if (uploadResponse.ok) {
            const result = await uploadResponse.json()
            console.log('Auto-upload to database successful:', result)
            // Trigger refresh of JD data to show the uploaded PDF
            onPDFUploaded?.()
          } else {
            const errorText = await uploadResponse.text()
            console.warn('Auto-upload failed:', uploadResponse.status, errorText)
          }
        } catch (uploadError) {
          console.warn('Auto-upload error:', uploadError)
        }

      } catch (timeoutError) {
        clearTimeout(timeoutId)
        throw timeoutError // Re-throw to outer catch
      }

    } catch (error) {
      console.error('Error generating CV with LangChain:', error)
      alert(`Failed to generate CV: ${error.message || 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:cursor-not-allowed border border-gray-200 hover:border-purple-300 ${
          hasBeenClicked ? 'ring-2 ring-purple-300/30 ring-inset' : ''
        }`}
        title="Generate Complete Resume with LangChain AI"
      >
        {isGenerating ? (
          <div className="w-4 h-4 flex items-center justify-center text-xs font-mono text-purple-600">
            {countdown}
          </div>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  )
}