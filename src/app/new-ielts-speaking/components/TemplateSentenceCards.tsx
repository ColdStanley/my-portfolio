'use client'

interface Props {
  text: string
}

export default function TemplateSentenceCards({ text }: Props) {
  if (!text) return null

  const sentences = text
    .split(/[。！？!\?.\n]/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="mt-10 w-full">{/* ✅ 跟 Band 卡片等宽 */}
      <h2 className="text-lg font-semibold text-purple-700 mb-3">
        🎯 Template Sentence Examples
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sentences.map((s, i) => (
          <div
            key={i}
            className="border border-purple-200 bg-purple-50 text-sm text-gray-800 rounded-xl px-4 py-3 shadow-sm leading-relaxed"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}
