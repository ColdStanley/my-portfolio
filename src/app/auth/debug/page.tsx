'use client'

import { useEffect, useState } from 'react'

export default function AuthDebug() {
  const [params, setParams] = useState<Record<string, string>>({})
  const [fullUrl, setFullUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const paramObj: Record<string, string> = {}
      
      urlParams.forEach((value, key) => {
        paramObj[key] = value
      })
      
      setParams(paramObj)
      setFullUrl(window.location.href)
      
      console.log('Debug page - Full URL:', window.location.href)
      console.log('Debug page - All params:', paramObj)
    }
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OAuth Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Complete URL</h2>
          <p className="text-sm bg-gray-100 p-3 rounded break-all">{fullUrl}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">URL Parameters</h2>
          {Object.keys(params).length === 0 ? (
            <p className="text-gray-500">No parameters found</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(params).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium w-32">{key}:</span>
                  <span className="text-gray-700 break-all">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close Window
            </button>
            <button
              onClick={() => window.location.href = '/cestlavie'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to CestLaVie
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}