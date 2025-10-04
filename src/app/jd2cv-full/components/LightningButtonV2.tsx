'use client'

import { useState, useEffect } from 'react'

interface JD {
  id: string
  title: string
  company: string
  full_job_description: string
}

interface LightningButtonV2Props {
  jd: JD
  className?: string
  onPDFUploaded?: () => void
  buttonText?: string
}

export default function LightningButtonV2({ jd, className = '', onPDFUploaded, buttonText = 'Lightning' }: LightningButtonV2Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [countdown, setCountdown] = useState(120)
  
  // Check if button has been clicked before
  const hasBeenClicked = localStorage.getItem(`lightning-clicked-${jd.id}`) === 'true'

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isGenerating) {
      setCountdown(120) // Reset to 120 seconds
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
    localStorage.setItem(`lightning-clicked-${jd.id}`, 'true')
    
    setIsGenerating(true)

    try {
      // Create AbortController for 180s timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 180 seconds
      
      try {
        // Call n8n webhook to get AI-generated experience
        const n8nUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5678/webhook/jd2cv-full'
          : 'https://agentworkflow.stanleyhi.com/webhook/jd2cv-full'
        
        const webhookResponse = await fetch(n8nUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: jd.title,
            full_job_description: jd.full_job_description
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId) // Clear timeout on success

        if (!webhookResponse.ok) {
          throw new Error('Failed to get AI experience from n8n workflow')
        }

        const aiExperienceRaw = await webhookResponse.text()

        // Helper function to parse AI response
        const parseAIResponse = (rawResponse: string): string => {
          if (!rawResponse) return ''
          
          // Try to parse as JSON first
          try {
            const firstParse = JSON.parse(rawResponse)
            
            // Priority check for output field
            if (firstParse.output !== undefined) {
              const outputValue = firstParse.output
              
              // If output is string, attempt second parsing
              if (typeof outputValue === 'string') {
                try {
                  const secondParse = JSON.parse(outputValue)
                  // Use strict check instead of || operator
                  return secondParse.output !== undefined ? secondParse.output : outputValue
                } catch {
                  // Second parse failed, it's normal text content
                  return outputValue
                }
              }
              
              // Output is not string, convert directly
              return String(outputValue)
            }
            
            // No output field, return string representation of parsed object
            return String(firstParse)
          } catch {
            // Not JSON, return original text
            return rawResponse
          }
        }

        const aiExperience = parseAIResponse(aiExperienceRaw)

        // Store AI experience for Cover Letter use
        localStorage.setItem(`jd2cv-v2-ai-content-${jd.id}`, aiExperience)

        // Generate and Download PDF with V2 API
        const completeResumeData = {
          personalInfo: parsedPersonalInfo,
          aiGeneratedExperience: aiExperience,
          format: parsedPersonalInfo.format || 'A4',
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
        const filename = `${parsedPersonalInfo.fullName.replace(/[^a-z0-9]/gi, '_')}_${jd.company.replace(/[^a-z0-9]/gi, '_')}_${jd.title.replace(/[^a-z0-9]/gi, '_')}_Resume.pdf`
        
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
      console.error('Error generating CV:', error)
      alert(`Failed to generate CV: ${error.message || 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`relative ${className}`.trim()}>
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-8 px-2 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        title="Generate Resume PDF V2"
      >
        {isGenerating ? `${countdown}s` : buttonText}
      </button>

    </div>
  )
}