import React, { useState } from 'react'

export default function TodoBlock({ block }: { block: any }) {
  const text = block.to_do?.rich_text || []
  const [checked, setChecked] = useState(block.to_do?.checked)

  return (
    <div className="flex items-start space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
        className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600"
      />
      <div className={`text-sm ${checked ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
        {text.map((t: any, i: number) => (
          <span key={i}>{t.plain_text}</span>
        ))}
      </div>
    </div>
  )
}
