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
      <div className="px-6 py-4 border-b border-neutral-light">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Final PDF Preview</h2>
          {pdfPreviewUrl && (
            <Button
              onClick={handleDownload}
              variant="primary"
              size="sm"
              className="text-xs px-3 py-1"
            >
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* PDF Preview or Empty State */}
      {pdfPreviewUrl ? (
        <div className="flex-1 px-2 py-2 overflow-hidden">
          <iframe
            src={`${pdfPreviewUrl}#navpanes=0`}
            className="w-full h-full border border-neutral-light rounded-lg"
            title="PDF Preview"
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-neutral-light rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm0 6h6v2H7v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No PDF Preview
            </h3>
            <p className="text-text-secondary text-sm">
              Click "Confirm & Preview" to generate the final PDF preview
            </p>
          </div>
        </div>
      )}
    </div>
  )
}