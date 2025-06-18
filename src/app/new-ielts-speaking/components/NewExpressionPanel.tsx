'use client'

interface Props {
  explanations: Record<string, string>
}

export default function NewExpressionPanel({ explanations }: Props) {
  const entries = Object.entries(explanations || {})

  if (entries.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-lg font-semibold text-purple-700 mb-3">🧠 Expression Training</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {entries.map(([key, val], index) => (
          <div
            key={index}
            className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition"
          >
            <div className="text-[15px] font-semibold text-purple-800 leading-tight">{key}</div>
            <div className="text-[13px] text-gray-600 mt-1">{val}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
