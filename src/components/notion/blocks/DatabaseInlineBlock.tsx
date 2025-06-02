'use client'

import React, { useEffect, useState } from 'react'

export default function DatabaseInlineBlock({ block }: { block: any }) {
  // ✅ 现在可以使用 block
  console.log('🟣 <DatabaseInlineBlock /> mounted:', block)

  const [rows, setRows] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/notion/database?id=${block.id}`)
      .then((res) => res.json())
      .then((data) => {
        setColumns(data.columns || [])
        setRows(data.rows || [])
      })
      .catch(() => setError('Failed to load database.'))
  }, [block.id])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="overflow-x-auto my-6 border border-purple-200 rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="bg-purple-100 text-purple-700">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-2 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((col, ci) => (
                <td key={ci} className="px-4 py-2">
                  {row[col] || ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
