'use client'

import { useState } from 'react'
import { useSwiftApplyStore, type ExperienceTemplate } from '@/lib/swiftapply/store'
import { parseMultilineToArray, arrayToMultiline } from '@/lib/swiftapply/utils'
import ConfirmDialog from './ConfirmDialog'

export default function StepTemplates() {
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    openSettings,
    closeSettings
  } = useSwiftApplyStore()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<{
    title: string
    targetRole: string
    content: string
  }>({ title: '', targetRole: '', content: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean
    templateId: string
    templateTitle: string
  }>({ show: false, templateId: '', templateTitle: '' })

  // Toggle template expansion
  const toggleExpanded = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      const template = templates.find(t => t.id === id)
      if (template) {
        setEditingTemplate({
          title: template.title,
          targetRole: template.targetRole,
          content: arrayToMultiline(template.content)
        })
      }
    }
  }

  // Save expanded template
  const saveTemplate = (id: string) => {
    if (!editingTemplate.title.trim() || !editingTemplate.targetRole.trim()) return

    updateTemplate(id, {
      title: editingTemplate.title.trim(),
      targetRole: editingTemplate.targetRole.trim(),
      content: parseMultilineToArray(editingTemplate.content)
    })
    setExpandedId(null)
  }

  // Cancel editing
  const cancelEdit = () => {
    setExpandedId(null)
    setEditingTemplate({ title: '', targetRole: '', content: '' })
  }

  // Add new template
  const handleAddTemplate = () => {
    const templateData = {
      title: 'New Experience Template',
      targetRole: 'Software Engineer',
      content: ['• Add your experience bullet points here...']
    }
    const newId = addTemplate(templateData)
    setExpandedId(newId)
    setEditingTemplate({
      title: templateData.title,
      targetRole: templateData.targetRole,
      content: '• Add your experience bullet points here...'
    })
  }

  // Delete template with confirmation
  const handleDeleteTemplate = (id: string, title: string) => {
    setDeleteConfirm({
      show: true,
      templateId: id,
      templateTitle: title
    })
  }

  const confirmDeleteTemplate = () => {
    deleteTemplate(deleteConfirm.templateId)
    if (expandedId === deleteConfirm.templateId) {
      setExpandedId(null)
    }
    setDeleteConfirm({ show: false, templateId: '', templateTitle: '' })
  }

  return (
    <div className="p-4 sm:p-6 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Experience Templates
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Create reusable experience templates that you can tailor for different job applications.
        </p>

        {/* Templates List */}
        <div className="space-y-4">
          {templates.map((template) => {
            const isExpanded = expandedId === template.id

            return (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Template Header */}
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {template.title || 'Untitled Template'}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {template.content.length} bullet point{template.content.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpanded(template.id)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    >
                      {isExpanded ? 'Collapse' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id, template.title)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Expanded Edit Form */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="space-y-4">
                      {/* Title Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Template Title
                        </label>
                        <input
                          type="text"
                          value={editingTemplate.title}
                          onChange={(e) => setEditingTemplate(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                          placeholder="e.g., Software Engineer at TechCorp"
                        />
                      </div>

                      {/* Target Role Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Role
                        </label>
                        <input
                          type="text"
                          value={editingTemplate.targetRole}
                          onChange={(e) => setEditingTemplate(prev => ({ ...prev, targetRole: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                          placeholder="e.g., Software Engineer"
                        />
                      </div>

                      {/* Content Textarea */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Experience Bullets
                        </label>
                        <p className="text-xs text-gray-500 mb-2">One bullet point per line</p>
                        <textarea
                          value={editingTemplate.content}
                          onChange={(e) => setEditingTemplate(prev => ({ ...prev, content: e.target.value }))}
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors resize-none font-mono text-sm"
                          placeholder="• Developed and maintained web applications using React and Node.js&#10;• Led a team of 3 developers in implementing new features&#10;• Improved application performance by 40% through code optimization"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveTemplate(template.id)}
                          disabled={!editingTemplate.title.trim() || !editingTemplate.targetRole.trim()}
                          className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
                        >
                          Save Template
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preview (when collapsed) */}
                {!isExpanded && template.content.length > 0 && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="text-sm text-gray-600 space-y-1">
                      {template.content.slice(0, 3).map((bullet, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1 text-xs">•</span>
                          <span className="line-clamp-1">{bullet}</span>
                        </div>
                      ))}
                      {template.content.length > 3 && (
                        <div className="text-xs text-gray-400 italic">
                          +{template.content.length - 3} more bullets...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Empty State */}
          {templates.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No templates yet
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Create your first experience template to get started
              </p>
            </div>
          )}

          {/* Add Template Button */}
          <button
            onClick={handleAddTemplate}
            className="w-full p-4 border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-lg text-gray-600 hover:text-purple-600 transition-colors group"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Template
            </div>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
        <button
          onClick={() => openSettings(1)}
          className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-sm sm:text-base transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={closeSettings}
          className="px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm sm:text-base font-medium transition-colors"
        >
          Save & Close
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, templateId: '', templateTitle: '' })}
        onConfirm={confirmDeleteTemplate}
        title="Delete Template"
        message={`Are you sure you want to delete "${deleteConfirm.templateTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}