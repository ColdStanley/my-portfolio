'use client'

import React from 'react'

export default function TableBlock({ block }: { block: any }) {
  const rows = block.children || []

  if (!rows.length) return null

  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse border border-gray-200 rounded-xl text-sm shadow-sm notion-table">
        <tbody>
          {rows.map((row: any) => {
            if (row.type !== 'table_row') return null

            return (
              <tr key={row.id} className="odd:bg-white even:bg-gray-50 border-t border-gray-200">
                {row.table_row.cells.map((cell: any[], i: number) => (
                  <td key={i} className="px-4 py-2 border-r border-gray-100 text-gray-800">
                    {cell.map((text: any, j: number) => (
                      <span key={j}>{text.plain_text}</span>
                    ))}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
