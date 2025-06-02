'use client'

import React, { useEffect, useState } from 'react'

export default function ChildDatabaseBlock({ block }: { block: any }) {
  const title = block.child_database?.title || 'Untitled'
  const [columns, setColumns] = useState<string[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!block.id) return
    fetch(`/api/notion/database?id=${block.id}`)
      .then(res => res.json())
      .then(data => {
        setColumns(data.columns || [])
        setRows(data.rows || [])
      })
      .catch(() => setError('Failed to load database.'))
  }, [block.id])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="my-6 border border-purple-300 dark:border-purple-700 shadow-sm rounded-xl overflow-auto">
      <div className="text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-4 py-2 rounded-t-xl">
        📊 {title}
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="min-w-[800px] text-sm text-left border-collapse">
          <thead className="bg-purple-50 dark:bg-purple-800 text-purple-700 dark:text-purple-200">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-3 py-2 border-b border-purple-200">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                {columns.map((col, ci) => (
                  <td key={ci} className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    {row[col] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
