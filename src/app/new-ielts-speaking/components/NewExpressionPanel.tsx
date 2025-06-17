'use client'

interface ExpressionPanelProps {
  explanations: Record<string, string>
}

export default function NewExpressionPanel({ explanations }: ExpressionPanelProps) {
  const entries = Object.entries(explanations)

  if (entries.length === 0) return null

  return (
    <div className="mt-10 space-y-4">
      <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
        🧠 Expression Training
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map(([word, explanation]) => (
          <div
            key={word}
            className="bg-purple-50 border border-purple-200 rounded-xl p-4"
          >
            <p className="text-purple-800 font-medium mb-1">{word}</p>
            <p className="text-sm text-gray-700">{explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
