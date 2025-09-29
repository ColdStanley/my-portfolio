'use client'

import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import { Card } from '@/components/ui/card'
import Button from '@/components/ui/button'

export default function ResumePreview() {
  const { personalInfo, templates, pdfPreviewUrl } = useSwiftApplyStore()

  // Handle PDF download
  const handleDownload = () => {
    if (!pdfPreviewUrl) return

    // Extract job title from work experience for filename
    const jobTitle = 'Resume' // You can enhance this logic
    const cleanName = (personalInfo?.fullName || 'Name').replace(/[^a-z0-9]/gi, '_')
    const cleanTitle = jobTitle.replace(/[^a-z0-9]/gi, '_')
    const filename = `${cleanName}_${cleanTitle}_Resume.pdf`

    // Download the PDF
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = pdfPreviewUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col border border-neutral-dark">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-light h-12 flex items-center">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold text-text-primary">Final PDF Preview</h2>
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            disabled={!pdfPreviewUrl}
            className="text-xs px-3 py-1"
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* PDF Preview or Empty State */}
      {pdfPreviewUrl ? (
        <div className="flex-1 px-2 py-2 overflow-hidden">
          <iframe
            src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-0 rounded-lg"
            title="PDF Preview"
          />
        </div>
      ) : (
        <div className="flex-1 px-6 py-4">
          <div className="h-full bg-neutral-light/30 rounded-lg border border-neutral-light">
          </div>
        </div>
      )}
    </div>
  )
}