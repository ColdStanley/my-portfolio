'use client'

import { useEffect, useState, useRef } from 'react'

interface NotionFile {
  name: string
  url: string
  type: string
}

interface CVModuleRecord {
  id: string
  firm: string
  responsibilities_text: string
  responsibilities_summary: string
  responsibilities_mindmap: NotionFile[]
  achievements_text: string
  achievements_summary: string
  achievements_mindmap: NotionFile[]
  position_group: string
  cv_component: string
  status: string
  time: string
}

interface PopoverProps {
  isOpen: boolean
  onClose: () => void
  content: string
  title: string
  buttonRef: React.RefObject<HTMLButtonElement>
}

function Popover({ isOpen, onClose, content, title, buttonRef }: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && buttonRef.current && popoverRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()
      const scrollY = window.scrollY
      const scrollX = window.scrollX
      
      let top = buttonRect.bottom + scrollY + 8
      let left = buttonRect.left + scrollX
      
      if (left + popoverRect.width > window.innerWidth) {
        left = buttonRect.right + scrollX - popoverRect.width
      }
      if (top + popoverRect.height > window.innerHeight + scrollY) {
        top = buttonRect.top + scrollY - popoverRect.height - 8
      }
      
      setPosition({ top, left })
    }
  }, [isOpen, buttonRef])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, buttonRef])

  if (!isOpen) return null

  return (
    <div
      ref={popoverRef}
      className="fixed bg-white border border-purple-200 rounded-lg shadow-xl z-50 max-w-md w-80"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-4 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-purple-900">{title}</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-lg">×</span>
          </button>
        </div>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
          {content || 'No content available'}
        </div>
      </div>
    </div>
  )
}


export default function CVModuleVaultPanel() {
  const [data, setData] = useState<CVModuleRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [selectedComponent, setSelectedComponent] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedFirm, setSelectedFirm] = useState<string>('all')

  const [popoverOpen, setPopoverOpen] = useState<{type: 'responsibilities' | 'achievements', itemId: string} | null>(null)
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    fetchCVModuleData()
  }, [])

  const fetchCVModuleData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/cv-module-vault')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setData(result.data || [])
    } catch (err) {
      console.error('Failed to fetch CV Module Vault data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const groups = ['all', ...new Set(data.map(item => item.position_group).filter(group => group && group.trim()))]
  const components = ['all', ...new Set(data.map(item => item.cv_component).filter(Boolean))]
  const statuses = ['all', ...new Set(data.map(item => item.status).filter(Boolean))]
  const firms = ['all', ...new Set(data.map(item => item.firm).filter(firm => firm && firm.trim()))]
  
  const parseYear = (dateStr: string) => {
    if (!dateStr) return 0
    const parts = dateStr.split(' - ')
    if (parts.length === 2) {
      const endDate = parts[1].trim()
      return new Date(endDate).getFullYear() || 0
    }
    return new Date(dateStr).getFullYear() || 0
  }

  const formatDisplayTime = (dateStr: string) => {
    if (!dateStr) return ''
    const parts = dateStr.split(' - ')
    if (parts.length === 2) {
      const startYear = new Date(parts[0].trim()).getFullYear()
      const endYear = new Date(parts[1].trim()).getFullYear()
      return `${startYear} - ${endYear}`
    }
    const year = new Date(dateStr).getFullYear()
    return year.toString() || dateStr
  }

  const filteredData = data
    .filter(item => {
      const groupMatch = selectedGroup === 'all' || item.position_group === selectedGroup
      const componentMatch = selectedComponent === 'all' || item.cv_component === selectedComponent
      const statusMatch = selectedStatus === 'all' || item.status === selectedStatus
      const firmMatch = selectedFirm === 'all' || item.firm === selectedFirm
      
      return groupMatch && componentMatch && statusMatch && firmMatch
    })
    .sort((a, b) => {
      const yearA = parseYear(a.time)
      const yearB = parseYear(b.time)
      return yearB - yearA
    })


  const handlePopoverOpen = (type: 'responsibilities' | 'achievements', itemId: string) => {
    if (popoverOpen?.type === type && popoverOpen?.itemId === itemId) {
      setPopoverOpen(null)
    } else {
      setPopoverOpen({ type, itemId })
    }
  }

  const getButtonRef = (key: string) => {
    if (!buttonRefs.current.has(key)) {
      buttonRefs.current.set(key, null as any)
    }
    return { current: buttonRefs.current.get(key) || null }
  }

  const setButtonRef = (key: string, ref: HTMLButtonElement | null) => {
    if (ref) {
      buttonRefs.current.set(key, ref)
    }
  }

  const handleRefresh = () => {
    fetchCVModuleData()
  }

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading CV Module Vault...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-xl">!</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed to load CV Module Vault</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">CV Module Vault</h1>
          <p className="text-sm text-gray-600 mt-1">
            {data.length} CV modules loaded from Notion
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors shadow-sm"
        >
          Refresh
        </button>
      </div>

      <div className="bg-purple-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Position Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
            >
              <option value="all">All Groups</option>
              {groups.filter(g => g !== 'all').map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">Firm</label>
            <select
              value={selectedFirm}
              onChange={(e) => setSelectedFirm(e.target.value)}
              className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
            >
              <option value="all">All Firms</option>
              {firms.filter(f => f !== 'all').map(firm => (
                <option key={firm} value={firm}>{firm}</option>
              ))}
            </select>
          </div>

          {components.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">CV Component</label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
              >
                <option value="all">All Components</option>
                {components.filter(c => c !== 'all').map(component => (
                  <option key={component} value={component}>{component}</option>
                ))}
              </select>
            </div>
          )}

          {statuses.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
              >
                <option value="all">All Statuses</option>
                {statuses.filter(s => s !== 'all').map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {(selectedGroup !== 'all' || selectedComponent !== 'all' || selectedStatus !== 'all' || selectedFirm !== 'all') && (
          <div className="pt-2 border-t border-purple-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-purple-700">Active filters:</span>
              {selectedGroup !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Group: {selectedGroup}
                </span>
              )}
              {selectedComponent !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Component: {selectedComponent}
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Status: {selectedStatus}
                </span>
              )}
              {selectedFirm !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Firm: {selectedFirm}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 text-4xl font-light">🧩</div>
          <p className="text-gray-600 mt-4">No CV modules found with current filters</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-6 space-y-0">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-200 break-inside-avoid mb-6 inline-block w-full"
            >
              <div className="mb-4 flex justify-between items-start">
                <h3 className="text-lg font-semibold text-purple-900 mb-1 flex-1">
                  {item.firm || 'Untitled Firm'}
                </h3>
                {item.time && (
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatDisplayTime(item.time)}
                  </span>
                )}
              </div>

              <div className="space-y-1 mb-4 text-xs">
                <div>
                  <span className="text-gray-600">Position Group: </span>
                  <span className="font-medium">{item.position_group || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">CV Component: </span>
                  <span className="font-medium">{item.cv_component || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status: </span>
                  <span className="font-medium">{item.status || 'Unknown'}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <button
                    ref={(ref) => setButtonRef(`responsibilities-${item.id}`, ref)}
                    onClick={() => handlePopoverOpen('responsibilities', item.id)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      popoverOpen?.type === 'responsibilities' && popoverOpen?.itemId === item.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Full Responsibilities
                  </button>
                  <button
                    ref={(ref) => setButtonRef(`achievements-${item.id}`, ref)}
                    onClick={() => handlePopoverOpen('achievements', item.id)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      popoverOpen?.type === 'achievements' && popoverOpen?.itemId === item.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Full Achievements
                  </button>
                </div>
              </div>

              {item.responsibilities_summary && (
                <div className="mb-4">
                  <span className="text-xs font-medium text-purple-700 mb-2 block">Responsibilities Summary</span>
                  <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.responsibilities_summary}</div>
                </div>
              )}

              {item.achievements_summary && (
                <div className="mb-4">
                  <span className="text-xs font-medium text-purple-700 mb-2 block">Achievements Summary</span>
                  <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{item.achievements_summary}</div>
                </div>
              )}

              <div className="space-y-3">
                {item.responsibilities_mindmap && item.responsibilities_mindmap.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-purple-700 mb-2 block">Responsibilities MindMap</span>
                    <div className="space-y-2">
                      {item.responsibilities_mindmap.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={file.url} 
                            alt={file.name}
                            className="w-full rounded-lg border border-purple-200 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => window.open(file.url, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.achievements_mindmap && item.achievements_mindmap.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-purple-700 mb-2 block">Achievements MindMap</span>
                    <div className="space-y-2">
                      {item.achievements_mindmap.map((file, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={file.url} 
                            alt={file.name}
                            className="w-full rounded-lg border border-purple-200 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => window.open(file.url, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      <div className="text-center text-sm text-purple-600 pt-8 border-t border-purple-200">
        Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> CV modules
      </div>

      {popoverOpen && (() => {
        const item = filteredData.find(i => i.id === popoverOpen.itemId)
        if (!item) return null
        
        const content = popoverOpen.type === 'responsibilities' 
          ? item.responsibilities_text
          : item.achievements_text
          
        const title = popoverOpen.type === 'responsibilities'
          ? 'Full Responsibilities'
          : 'Full Achievements'
          
        return (
          <Popover
            isOpen={true}
            onClose={() => setPopoverOpen(null)}
            content={content || `No ${popoverOpen.type} content available`}
            title={title}
            buttonRef={getButtonRef(`${popoverOpen.type}-${popoverOpen.itemId}`)}
          />
        )
      })()}

    </div>
  )
}