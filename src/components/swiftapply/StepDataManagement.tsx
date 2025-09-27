'use client'

import { useState, useRef } from 'react'
import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import Button from '@/components/ui/button'
import { saveToStorage, loadFromStorage } from '@/lib/swiftapply/localStorage'

export default function StepDataManagement() {
  const { personalInfo, templates, setPersonalInfo, setTemplates } = useSwiftApplyStore()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export data to JSON file
  const handleExport = () => {
    try {
      const exportData = {
        personalInfo,
        templates,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `swiftapply-backup-${new Date().toISOString().split('T')[0]}.json`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      setSuccess('Data exported successfully!')
      setError(null)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to export data. Please try again.')
      setSuccess(null)
    }
  }

  // Import data from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setSuccess(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)

        // Validate data structure
        if (!importData || typeof importData !== 'object') {
          throw new Error('Invalid file format')
        }

        if (!importData.personalInfo && !importData.templates) {
          throw new Error('No valid data found in file')
        }

        // Import personalInfo if exists
        if (importData.personalInfo) {
          setPersonalInfo(importData.personalInfo)
        }

        // Import templates if exists
        if (importData.templates && Array.isArray(importData.templates)) {
          setTemplates(importData.templates)
        }

        setSuccess('Data imported successfully!')
        setError(null)

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      } catch (err) {
        setError('Invalid file format or corrupted data. Please check your file.')
        setSuccess(null)
      }
    }

    reader.onerror = () => {
      setError('Failed to read file. Please try again.')
      setSuccess(null)
    }

    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Get current data summary
  const getDataSummary = () => {
    const hasPersonalInfo = !!personalInfo
    const templatesCount = templates.length

    return {
      hasPersonalInfo,
      templatesCount,
      isEmpty: !hasPersonalInfo && templatesCount === 0
    }
  }

  const summary = getDataSummary()

  return (
    <div className="p-4 sm:p-6 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Data Backup & Restore</h3>
          <p className="text-sm text-text-secondary">
            Export your personal information and templates to backup file, or import from previous backup.
          </p>
        </div>

        {/* Current Data Overview */}
        <div className="bg-surface rounded-lg p-4 border border-neutral-mid">
          <h4 className="text-sm font-semibold text-text-primary mb-3">Current Data Overview</h4>

          {summary.isEmpty ? (
            <p className="text-sm text-text-secondary">No data to export</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Personal Information:</span>
                <span className={`font-medium ${summary.hasPersonalInfo ? 'text-primary' : 'text-text-secondary'}`}>
                  {summary.hasPersonalInfo ? 'Configured' : 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Experience Templates:</span>
                <span className={`font-medium ${summary.templatesCount > 0 ? 'text-primary' : 'text-text-secondary'}`}>
                  {summary.templatesCount} template{summary.templatesCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-text-primary">Export Data</h4>
          <p className="text-xs text-text-secondary">
            Download your personal information and templates as a JSON backup file.
          </p>

          <Button
            onClick={handleExport}
            variant="secondary"
            size="sm"
            disabled={summary.isEmpty}
            className="text-xs px-3 py-1"
          >
            Export Backup File
          </Button>
        </div>

        {/* Import Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-text-primary">Import Data</h4>
          <p className="text-xs text-text-secondary">
            Restore your data from a previous backup file. This will replace your current data.
          </p>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="data-import-input"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              size="sm"
              className="text-xs px-3 py-1"
            >
              Select Backup File
            </Button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-sm text-success">
            {success}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-neutral-light/50 rounded-lg p-4 border border-neutral-light">
          <h5 className="text-xs font-semibold text-text-primary mb-2">Usage Instructions</h5>
          <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
            <li>Backup files contain only your personal information and experience templates</li>
            <li>Job titles and descriptions are not included (they change for each application)</li>
            <li>You can use backup files across different environments (localhost, production)</li>
            <li>Import will overwrite your current data - export first if you want to keep it</li>
          </ul>
        </div>
      </div>
    </div>
  )
}