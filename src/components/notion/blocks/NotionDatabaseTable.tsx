'use client'

import React from 'react'

interface Props {
  columns: string[]
  rows: Record<string, string>[]
}

export default function NotionDatabaseTable({ columns, rows }: Props) {
  return (
    <div className="overflow-auto my-6 border border-purple-200 rounded-xl">
      <table className="min-w-full border-collapse text-sm text-left">
        <thead className="bg-purple-100 text-purple-700">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 whitespace-nowrap font-semibold border border-purple-200">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 border border-purple-100">
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
