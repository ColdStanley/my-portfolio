'use client'

import { useSwiftApplyStore } from '@/lib/swiftapply/store'

export default function ResumePreview() {
  const { personalInfo, templates } = useSwiftApplyStore()

  if (!personalInfo) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Resume Preview</h2>
        </div>

        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm0 6h6v2H7v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Configure Your Information
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Set up your personal information and experience templates to see the resume preview
            </p>
            <button
              onClick={() => useSwiftApplyStore.getState().openSettings(1)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Open Settings
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Resume Preview</h2>
          <div className="text-sm text-gray-500">
            {personalInfo.format} Format
          </div>
        </div>
      </div>

      {/* PDF-style Preview */}
      <div className="flex-1 p-4 overflow-auto">
        <div
          className="mx-auto bg-white shadow-lg max-w-full"
          style={{
            width: '100%',
            maxWidth: personalInfo.format === 'A4' ? '595px' : '612px',
            minHeight: personalInfo.format === 'A4' ? '842px' : '792px' // A4: 842px, Letter: 792px
          }}
        >
          <div className="p-8 text-sm">
            {/* Header */}
            <div className="text-center border-b-2 border-purple-600 pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {personalInfo.fullName}
              </h1>

              {/* Contact Info */}
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-600">
                {personalInfo.email && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    {personalInfo.email}
                  </span>
                )}
                {personalInfo.phone && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    {personalInfo.phone}
                  </span>
                )}
                {personalInfo.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    {personalInfo.location}
                  </span>
                )}
              </div>

              {/* Links */}
              {(personalInfo.linkedin || personalInfo.website) && (
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-gray-600 mt-1">
                  {personalInfo.linkedin && (
                    <span>{personalInfo.linkedin}</span>
                  )}
                  {personalInfo.website && (
                    <span>{personalInfo.website}</span>
                  )}
                </div>
              )}
            </div>

            {/* Professional Summary */}
            {personalInfo.summary.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-purple-700 border-b border-gray-200 pb-1 mb-3 uppercase tracking-wide">
                  Professional Summary
                </h2>
                <ul className="list-none space-y-1">
                  {personalInfo.summary.map((item, index) => (
                    <li key={index} className="text-xs leading-relaxed pl-3 relative">
                      <span className="absolute left-0 top-1 text-purple-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Experience Templates - Preview Only */}
            {templates.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-purple-700 border-b border-gray-200 pb-1 mb-3 uppercase tracking-wide">
                  Professional Experience
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <div key={template.id} className="bg-white rounded p-2 border border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-900">
                          {template.title}
                        </h3>
                        <div className="text-xs text-gray-500 mt-1">
                          Template available for AI customization
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-medium text-purple-600">AI Smart Selection:</span> AI will automatically analyze the job description and select the most suitable template for customization, enabling you to apply for multiple roles with intelligently tailored content.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Two Column Layout for remaining sections */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Technical Skills */}
                {personalInfo.technicalSkills.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-purple-700 border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide">
                      Technical Skills
                    </h2>
                    <div className="flex flex-wrap gap-1">
                      {personalInfo.technicalSkills.map((skill, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Education */}
                {personalInfo.education.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-purple-700 border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {personalInfo.education.map((edu, index) => (
                        <div key={index} className="text-xs">
                          <div className="font-semibold text-gray-900">{edu.degree}</div>
                          <div className="text-gray-600">
                            {edu.institution} • {edu.year}
                            {edu.gpa && ` • GPA: ${edu.gpa}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {personalInfo.certificates.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-purple-700 border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide">
                      Certifications
                    </h2>
                    <ul className="list-none space-y-1">
                      {personalInfo.certificates.map((cert, index) => (
                        <li key={index} className="text-xs pl-3 relative">
                          <span className="absolute left-0 top-1 text-purple-600">•</span>
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Languages */}
                {personalInfo.languages.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-purple-700 border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide">
                      Languages
                    </h2>
                    <div className="flex flex-wrap gap-1">
                      {personalInfo.languages.map((language, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Modules */}
            {personalInfo.customModules.map((module) => (
              <div key={module.id} className="mt-6">
                <h2 className="text-sm font-bold text-purple-700 border-b border-gray-200 pb-1 mb-3 uppercase tracking-wide">
                  {module.title}
                </h2>
                <ul className="list-none space-y-1">
                  {module.content.map((item, index) => (
                    <li key={index} className="text-xs leading-relaxed pl-3 relative">
                      <span className="absolute left-0 top-1 text-purple-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}