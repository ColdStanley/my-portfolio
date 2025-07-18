'use client'

export default function TBDPanel() {
  return (
    <div className="w-full py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">TBD</h1>
          <p className="text-sm text-gray-600 mt-1">
            Future features and explorations
          </p>
        </div>
      </div>

      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-gray-400 text-4xl font-light">🔮</div>
        <p className="text-gray-600 mt-4">TBD module coming soon...</p>
      </div>
    </div>
  )
}