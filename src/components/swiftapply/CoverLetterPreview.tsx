'use client'

import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import Button from '@/components/ui/button'

export default function CoverLetterPreview() {
  const {
    personalInfo,
    jobTitle,
    coverLetter: { pdfPreviewUrl, isGeneratingPDF, content }
  } = useSwiftApplyStore()

  // Handle PDF download
  const handleDownload = () => {
    if (!pdfPreviewUrl) return

    // Extract info for filename
    const cleanName = (personalInfo?.fullName || 'Name').replace(/[^a-z0-9]/gi, '_')
    const cleanTitle = (jobTitle || 'Position').replace(/[^a-z0-9]/gi, '_')
    const filename = `${cleanName}_${cleanTitle}_CoverLetter.pdf`

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
          <h2 className="text-lg font-semibold text-text-primary">Cover Letter Download</h2>
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            disabled={!pdfPreviewUrl || isGeneratingPDF}
            className="text-xs px-3 py-1"
          >
            {isGeneratingPDF ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                Generating...
              </div>
            ) : (
              'Download PDF'
            )}
          </Button>
        </div>
      </div>

      {/* PDF Preview or Empty State */}
      {pdfPreviewUrl ? (
        <div className="flex-1 px-2 py-2 overflow-hidden">
          <iframe
            src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-0 rounded-lg"
            title="Cover Letter Preview"
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            {content ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Cover Letter Ready
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Your cover letter has been generated and is ready for PDF preview. Click "Confirm & Preview" in the editor to generate the PDF.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-neutral-light rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  No Cover Letter Yet
                </h3>
                <p className="text-text-secondary text-sm">
                  Generate your cover letter in the editor panel to see the PDF preview here.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}