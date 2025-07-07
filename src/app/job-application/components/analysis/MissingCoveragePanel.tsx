'use client'

import React from 'react'

interface Props {
  unmatchedLines: string[]
}

export default function MissingCoveragePanel({ unmatchedLines }: Props) {
  return (
    <div className="space-y-4">
      {/* 模块标题：在卡片之外 */}
      <h3 className="text-xl font-semibold text-gray-800">
        Are there any parts of the job description your resume doesn’t cover?
      </h3>

      {/* 内容卡片 */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {unmatchedLines.length === 0 ? (
          <div className="text-sm text-green-700 font-medium bg-green-50 border border-green-100 px-4 py-3 rounded-lg">
            All key parts of the job description are well covered by your resume.
          </div>
        ) : (
          <div className="space-y-3 text-sm text-gray-700">
            <p className="text-gray-600">
              The following job description elements were{' '}
              <span className="text-gray-900 font-semibold">not sufficiently covered</span> by your resume:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {unmatchedLines.map((line, idx) => (
                <li key={idx} className="text-gray-800 leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
