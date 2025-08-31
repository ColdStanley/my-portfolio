'use client'

import { useWorkspaceStore } from '../store/workspaceStore'

export default function DebugPanel() {
  const { columns, actions } = useWorkspaceStore()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  const handleManualSave = async () => {
    console.log('Manual save triggered')
    await actions.saveWorkspace()
  }
  
  return (
    <div className="fixed bottom-4 left-4 w-96 max-h-96 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-3 overflow-y-auto text-xs z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-purple-600">Debug: Store Data</h3>
        <button 
          onClick={handleManualSave}
          className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
        >
          Manual Save
        </button>
      </div>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(columns, null, 2)}
      </pre>
    </div>
  )
}