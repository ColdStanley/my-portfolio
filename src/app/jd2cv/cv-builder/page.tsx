'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useCVBuilderStore } from './store/cvBuilderStore'
import CVModule from './components/CVModule'
import { 
  DndContext, 
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors 
} from '@dnd-kit/core'

export default function CVBuilder() {
  const router = useRouter()
  const { user, loading } = useCurrentUser()
  const { modules, addModule, loadFromStorage, moveModule, draggedModuleId, setDraggedModule } = useCVBuilderStore()
  
  // DnD Kit sensors with delay to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5,
      },
    })
  )

  // Auth check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/jd2cv/cv-builder')
    }
  }, [user, loading, router])

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setDraggedModule(event.active.id as string)
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    
    if (delta.x !== 0 || delta.y !== 0) {
      const module = modules.find(m => m.id === active.id)
      if (module) {
        moveModule(module.id, {
          x: Math.max(0, module.position.x + delta.x),
          y: Math.max(0, module.position.y + delta.y)
        })
      }
    }
    
    setDraggedModule(null)
  }

  const handleAddModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      title: '',
      items: [''],
      width: 50, // 50% width
      position: {
        x: window.innerWidth / 2 - (window.innerWidth * 0.5) / 2, // Center horizontally
        y: modules.length * 200 + 100 // Stack vertically with spacing
      },
      sourceType: 'manual' as const,
    }
    addModule(newModule)
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/jd2cv')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to JD2CV
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-gray-800">CV Builder</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {modules.length} module{modules.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="relative w-full h-[calc(100vh-80px)] overflow-auto"
          style={{ minHeight: '600px' }}
        >
          {/* Render Modules */}
          {modules.map((module) => (
            <CVModule 
              key={module.id}
              module={module}
            />
          ))}
        
          {/* Drag Overlay */}
          <DragOverlay>
            {draggedModuleId ? (
              <div className="opacity-80">
                <CVModule 
                  module={modules.find(m => m.id === draggedModuleId)!}
                />
              </div>
            ) : null}
          </DragOverlay>
          
          {/* Empty State */}
          {modules.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm0 6h6v2H7v-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Start Building Your CV</h3>
                <p className="text-gray-500 mb-6 max-w-sm">
                  Click the button below to add your first module and freely organize your resume content
                </p>
              </div>
            </div>
          )}
        </div>
      </DndContext>

      {/* Add Module Button */}
      <button
        onClick={handleAddModule}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center gap-2 z-20"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Module
      </button>
    </div>
  )
}