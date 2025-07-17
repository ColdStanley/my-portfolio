'use client'

import { useEffect, useState, useRef } from 'react'

interface NotionFile {
  name: string
  url: string
  type: string
}

interface JDTrackerRecord {
  id: string
  position_title: string
  company: string
  position_group: string
  jd_full_text: string
  jd_responsibilities_text: string
  jd_responsibilities_mindmap: NotionFile[]
  jd_requirements_text: string
  jd_requirements_mindmap: NotionFile[]
  fit_score: number
  interest_score: number
  importance: string
  urgency: string
  comment: string[]
  status: string
  final_tailored_cv: NotionFile[]
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

export default function JDTrackerPanel() {
  const [data, setData] = useState<JDTrackerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedImportance, setSelectedImportance] = useState<string>('all')
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all')
  const [minFitScore, setMinFitScore] = useState<number>(0)
  const [minInterestScore, setMinInterestScore] = useState<number>(0)

  const [popoverOpen, setPopoverOpen] = useState<{type: 'full' | 'responsibilities' | 'requirements', itemId: string} | null>(null)
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())


  useEffect(() => {
    fetchNotionData()
  }, [])

  const fetchNotionData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 使用 JD Tracker 专用的 API 端点
      const response = await fetch('/api/jd-tracker')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setData(result.data || [])
    } catch (err) {
      console.error('Failed to fetch JD Tracker data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Filter options
  const groups = ['all', ...new Set(data.map(item => item.position_group).filter(group => group && group.trim()))]
  const statuses = ['all', ...new Set(data.map(item => item.status).filter(Boolean))]
  const importanceOptions = ['all', ...new Set(data.map(item => item.importance).filter(Boolean))]
  const urgencyOptions = ['all', ...new Set(data.map(item => item.urgency).filter(Boolean))]
  
  // Filtered data
  const filteredData = data.filter(item => {
    const groupMatch = selectedGroup === 'all' || item.position_group === selectedGroup
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus
    const importanceMatch = selectedImportance === 'all' || item.importance === selectedImportance
    const urgencyMatch = selectedUrgency === 'all' || item.urgency === selectedUrgency
    const fitScoreMatch = item.fit_score >= minFitScore
    const interestScoreMatch = item.interest_score >= minInterestScore
    
    return groupMatch && statusMatch && importanceMatch && urgencyMatch && fitScoreMatch && interestScoreMatch
  })

  const handlePopoverOpen = (type: 'full' | 'responsibilities' | 'requirements', itemId: string) => {
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
    fetchNotionData()
  }

  // Helper functions for rendering with purple theme
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-purple-700'
    if (score >= 60) return 'text-purple-600'
    return 'text-purple-500'
  }


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading JD Tracker database...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-xl">!</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed to load JD Tracker database</h3>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">JD Tracker Database</h1>
          <p className="text-sm text-gray-600 mt-1">
            {data.length} job descriptions loaded from Notion
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors shadow-sm"
        >
          Refresh
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-purple-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Filters</h3>
        
        {/* Row 1: Filters Grid */}
        <div className="space-y-4">
          {/* Position Group (Primary) */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
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

            {/* Importance */}
            {importanceOptions.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Importance</label>
                <select
                  value={selectedImportance}
                  onChange={(e) => setSelectedImportance(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                >
                  <option value="all">All Levels</option>
                  {importanceOptions.filter(i => i !== 'all').map(importance => (
                    <option key={importance} value={importance}>{importance}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Urgency */}
            {urgencyOptions.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">Urgency</label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                >
                  <option value="all">All Levels</option>
                  {urgencyOptions.filter(u => u !== 'all').map(urgency => (
                    <option key={urgency} value={urgency}>{urgency}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Score Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Fit Score ≥ {minFitScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minFitScore}
              onChange={(e) => setMinFitScore(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${minFitScore}%, #E5E7EB ${minFitScore}%, #E5E7EB 100%)`
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="min-w-[200px] flex-1">
            <label className="block text-sm font-medium text-purple-700 mb-2">
              Interest Score ≥ {minInterestScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minInterestScore}
              onChange={(e) => setMinInterestScore(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${minInterestScore}%, #E5E7EB ${minInterestScore}%, #E5E7EB 100%)`
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Active Filter Summary */}
        {(selectedGroup !== 'all' || selectedStatus !== 'all' || selectedImportance !== 'all' || 
          selectedUrgency !== 'all' || minFitScore > 0 || minInterestScore > 0) && (
          <div className="pt-2 border-t border-purple-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-purple-700">Active filters:</span>
              {selectedGroup !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Group: {selectedGroup}
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Status: {selectedStatus}
                </span>
              )}
              {selectedImportance !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Importance: {selectedImportance}
                </span>
              )}
              {selectedUrgency !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Urgency: {selectedUrgency}
                </span>
              )}
              {minFitScore > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Fit ≥ {minFitScore}%
                </span>
              )}
              {minInterestScore > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  Interest ≥ {minInterestScore}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Data Grid */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 text-4xl font-light">JD</div>
          <p className="text-gray-600 mt-4">No job descriptions found with current filters</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-6 space-y-0">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-purple-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-200 break-inside-avoid mb-6 inline-block w-full"
            >
              {/* Header with Title and Company */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-purple-900 mb-1">
                  {item.position_title || 'Untitled Position'}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.company || 'Unknown Company'}
                </p>
              </div>

              {/* Info Grid */}
              <div className="space-y-1 mb-4 text-xs">
                <div>
                  <span className="text-gray-600">Position Group: </span>
                  <span className="font-bold">{item.position_group || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status: </span>
                  <span className="font-bold">{item.status || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Importance: </span>
                  <span className="font-bold">{item.importance || 'Medium'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Urgency: </span>
                  <span className="font-bold">{item.urgency || 'Medium'}</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  <button
                    ref={(ref) => setButtonRef(`full-${item.id}`, ref)}
                    onClick={() => handlePopoverOpen('full', item.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      popoverOpen?.type === 'full' && popoverOpen?.itemId === item.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Full JD
                  </button>
                  <button
                    ref={(ref) => setButtonRef(`responsibilities-${item.id}`, ref)}
                    onClick={() => handlePopoverOpen('responsibilities', item.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      popoverOpen?.type === 'responsibilities' && popoverOpen?.itemId === item.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Responsibilities
                  </button>
                  <button
                    ref={(ref) => setButtonRef(`requirements-${item.id}`, ref)}
                    onClick={() => handlePopoverOpen('requirements', item.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      popoverOpen?.type === 'requirements' && popoverOpen?.itemId === item.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Requirements
                  </button>
                </div>
              </div>

              {/* Scores */}
              <div className="flex gap-3 mb-3">
                <div className="bg-purple-50 rounded-lg p-2 flex-1">
                  <div className="text-xs font-medium text-purple-700 mb-1">Fit Score</div>
                  <div className={`text-sm font-bold ${getScoreColor(item.fit_score)}`}>
                    {item.fit_score}%
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 flex-1">
                  <div className="text-xs font-medium text-purple-700 mb-1">Interest Score</div>
                  <div className={`text-sm font-bold ${getScoreColor(item.interest_score)}`}>
                    {item.interest_score}%
                  </div>
                </div>
              </div>

              {/* Comments */}
              {item.comment && item.comment.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-purple-700 mb-1 block">Comments:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.comment.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              <div className="space-y-2">
                {item.jd_responsibilities_mindmap && item.jd_responsibilities_mindmap.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-purple-700 mb-1 block">Responsibilities MindMap</span>
                    <div className="space-y-2">
                      {item.jd_responsibilities_mindmap.map((file, index) => (
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

                {item.jd_requirements_mindmap && item.jd_requirements_mindmap.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-purple-700 mb-1 block">Requirements MindMap</span>
                    <div className="space-y-2">
                      {item.jd_requirements_mindmap.map((file, index) => (
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

                {item.final_tailored_cv && item.final_tailored_cv.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-purple-700 mb-1 block">Final Tailored CV</span>
                    <div className="flex flex-wrap gap-2">
                      {item.final_tailored_cv.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
                        >
                          {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Footer Stats */}
      <div className="text-center text-sm text-purple-600 pt-8 border-t border-purple-200">
        Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> job descriptions
      </div>

      {/* Popover */}
      {popoverOpen && (() => {
        const item = filteredData.find(i => i.id === popoverOpen.itemId)
        if (!item) return null
        
        const content = popoverOpen.type === 'full' 
          ? item.jd_full_text
          : popoverOpen.type === 'responsibilities'
          ? item.jd_responsibilities_text
          : item.jd_requirements_text
          
        const title = popoverOpen.type === 'full'
          ? 'Full Job Description'
          : popoverOpen.type === 'responsibilities'
          ? 'Responsibilities'
          : 'Requirements'
          
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