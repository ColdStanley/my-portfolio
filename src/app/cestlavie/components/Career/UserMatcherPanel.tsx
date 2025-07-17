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

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
  title: string
}

function Modal({ isOpen, onClose, content, title }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b border-purple-200 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-purple-900">{title}</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content || 'No content available'}
          </div>
        </div>
      </div>
    </div>
  )
}


export default function UserMatcherPanel() {
  const [jdData, setJdData] = useState<JDTrackerRecord[]>([])
  const [cvData, setCvData] = useState<CVModuleRecord[]>([])
  const [jdPositionGroup, setJdPositionGroup] = useState('')
  const [jdImportance, setJdImportance] = useState('')
  const [jdUrgency, setJdUrgency] = useState('')
  const [cvPositionGroups, setCvPositionGroups] = useState<string[]>([])
  const [cvComponent, setCvComponent] = useState('')
  const [cvFirm, setCvFirm] = useState('')
  const [selectedJdCards, setSelectedJdCards] = useState<Set<string>>(new Set())
  const [selectedCvCards, setSelectedCvCards] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState<{type: string, itemId: string, content: string, title: string} | null>(null)

  const jdPositionGroups = ['', ...new Set(jdData.map(item => item.position_group).filter(Boolean))]
  const jdImportances = ['', ...new Set(jdData.map(item => item.importance).filter(Boolean))]
  const jdUrgencies = ['', ...new Set(jdData.map(item => item.urgency).filter(Boolean))]
  const availableCvPositionGroups = [...new Set(cvData.map(item => item.position_group).filter(Boolean))]
  const cvComponents = ['', ...new Set(cvData.map(item => item.cv_component).filter(Boolean))]
  const cvFirms = ['', ...new Set(cvData.map(item => item.firm).filter(Boolean))]

  useEffect(() => {
    fetchJDData()
    fetchCVData()
  }, [])

  const fetchJDData = async () => {
    try {
      const response = await fetch('/api/jd-tracker')
      if (!response.ok) {
        console.error('JD API error:', response.status, response.statusText)
        setJdData([])
        return
      }
      const result = await response.json()
      if (result.error) {
        console.error('JD API error:', result.error)
        setJdData([])
        return
      }
      setJdData(result.data || [])
    } catch (error) {
      console.error('Failed to fetch JD data:', error)
      setJdData([])
    }
  }

  const fetchCVData = async () => {
    try {
      const response = await fetch('/api/cv-module-vault')
      if (!response.ok) {
        console.error('CV API error:', response.status, response.statusText)
        setCvData([])
        return
      }
      const result = await response.json()
      if (result.error) {
        console.error('CV API error:', result.error)
        setCvData([])
        return
      }
      setCvData(result.data || [])
    } catch (error) {
      console.error('Failed to fetch CV data:', error)
      setCvData([])
    }
  }

  const handleJdModalOpen = (type: 'full' | 'responsibilities' | 'requirements', itemId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const item = jdData.find(i => i.id === itemId)
    if (!item) return
    
    const content = type === 'full' 
      ? item.jd_full_text
      : type === 'responsibilities'
      ? item.jd_responsibilities_text
      : item.jd_requirements_text
      
    const title = type === 'full'
      ? `${item.position_title} - Full Job Description`
      : type === 'responsibilities'
      ? `${item.position_title} - Responsibilities`
      : `${item.position_title} - Requirements`
      
    setModalOpen({ type, itemId, content: content || '', title })
  }

  const handleCvModalOpen = (type: 'responsibilities' | 'achievements', itemId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const item = cvData.find(i => i.id === itemId)
    if (!item) return
    
    const content = type === 'responsibilities' 
      ? item.responsibilities_text
      : item.achievements_text
      
    const title = type === 'responsibilities'
      ? `${item.firm} - Full Responsibilities`
      : `${item.firm} - Full Achievements`
      
    setModalOpen({ type, itemId, content: content || '', title })
  }

  const filteredJDData = jdData.filter(item => {
    const groupMatch = !jdPositionGroup || item.position_group === jdPositionGroup
    const importanceMatch = !jdImportance || item.importance === jdImportance
    const urgencyMatch = !jdUrgency || item.urgency === jdUrgency
    return groupMatch && importanceMatch && urgencyMatch
  })

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

  const filteredCVData = cvData.filter(item => {
    const groupMatch = cvPositionGroups.length === 0 || cvPositionGroups.includes(item.position_group)
    const componentMatch = !cvComponent || item.cv_component === cvComponent
    const firmMatch = !cvFirm || item.firm === cvFirm
    return groupMatch && componentMatch && firmMatch
  }).sort((a, b) => {
    const yearA = parseYear(a.time)
    const yearB = parseYear(b.time)
    return yearB - yearA
  })


  const toggleJdCardSelection = (id: string) => {
    const newSelection = new Set(selectedJdCards)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedJdCards(newSelection)
  }

  const toggleCvCardSelection = (id: string) => {
    const newSelection = new Set(selectedCvCards)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedCvCards(newSelection)
  }

  const handlePositionGroupToggle = (group: string) => {
    setCvPositionGroups(prev => 
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    )
  }

  const sanitizeText = (text: string) => {
    if (!text) return ''
    return text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').replace(/[\u2028\u2029]/g, ' ').trim()
  }

  const handlePreview = () => {
    try {
      const selectedJdData = jdData.filter(item => selectedJdCards.has(item.id)).map(item => ({
        id: item.id,
        position_title: sanitizeText(item.position_title || ''),
        company: sanitizeText(item.company || ''),
        fit_score: item.fit_score || 0,
        jd_responsibilities_mindmap: (item.jd_responsibilities_mindmap || []).slice(0, 2),
        jd_requirements_mindmap: (item.jd_requirements_mindmap || []).slice(0, 2)
      }))
      
      const selectedCvData = cvData.filter(item => selectedCvCards.has(item.id)).map(item => ({
        id: item.id,
        cv_component: item.cv_component || '',
        firm: sanitizeText(item.firm || ''),
        time: sanitizeText(item.time || ''),
        responsibilities_text: sanitizeText(item.responsibilities_text || ''),
        achievements_text: sanitizeText(item.achievements_text || ''),
        responsibilities_summary: sanitizeText(item.responsibilities_summary || '')
      }))
      
      const componentOrder = ['Summary', 'Education', 'Awards & Certificates', 'Work', 'Project', 'Closing Sentences']
      const sortedCvData = selectedCvData.sort((a, b) => {
        const indexA = componentOrder.indexOf(a.cv_component)
        const indexB = componentOrder.indexOf(b.cv_component)
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
      })

      const groupedCvData = {
        Summary: sortedCvData.filter(item => item.cv_component === 'Summary'),
        Education: sortedCvData.filter(item => item.cv_component === 'Education'),
        'Awards & Certificates': sortedCvData.filter(item => item.cv_component === 'Awards & Certificates'),
        Work: sortedCvData.filter(item => item.cv_component === 'Work').sort((a, b) => {
          const yearA = parseYear(a.time)
          const yearB = parseYear(b.time)
          return (isNaN(yearB) ? 0 : yearB) - (isNaN(yearA) ? 0 : yearA)
        }),
        Project: sortedCvData.filter(item => item.cv_component === 'Project').sort((a, b) => {
          const yearA = parseYear(a.time)
          const yearB = parseYear(b.time)
          return (isNaN(yearB) ? 0 : yearB) - (isNaN(yearA) ? 0 : yearA)
        }),
        'Closing Sentences': sortedCvData.filter(item => item.cv_component === 'Closing Sentences')
      }

      const previewData = { jd: selectedJdData, cv: groupedCvData }
      const jsonString = JSON.stringify(previewData)
      
      const previewId = Date.now().toString()
      localStorage.setItem(`previewData_${previewId}`, jsonString)
      
      const newWindow = window.open(`/cestlavie/preview?id=${previewId}`, '_blank')
      if (!newWindow) {
        alert('Please allow popups for this site to view the preview.')
        return
      }
      
      setTimeout(() => {
        localStorage.removeItem(`previewData_${previewId}`)
      }, 60000)
      
    } catch (error) {
      console.error('Preview error:', error)
      alert('Failed to prepare preview. Please try again.')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-purple-700'
    if (score >= 60) return 'text-purple-600'
    return 'text-purple-500'
  }

  const JDCard = ({ item }: { item: JDTrackerRecord }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-all duration-200 break-inside-avoid mb-6 inline-block w-full cursor-pointer ${
        selectedJdCards.has(item.id) ? 'border-purple-500 bg-purple-50' : 'border-purple-200 hover:border-purple-300'
      }`}
      onClick={() => toggleJdCardSelection(item.id)}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-purple-900 mb-1">
          {item.position_title || 'Untitled Position'}
        </h3>
        <p className="text-sm text-gray-600">
          {item.company || 'Unknown Company'}
        </p>
      </div>
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
        <div className="flex flex-wrap gap-1 mb-2">
          <button
            onClick={(e) => handleJdModalOpen('full', item.id, e)}
            className="px-2 py-1 text-xs rounded transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            Full JD
          </button>
          <button
            onClick={(e) => handleJdModalOpen('responsibilities', item.id, e)}
            className="px-2 py-1 text-xs rounded transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            Responsibilities
          </button>
          <button
            onClick={(e) => handleJdModalOpen('requirements', item.id, e)}
            className="px-2 py-1 text-xs rounded transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            Requirements
          </button>
        </div>
      </div>
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
  )

  const CVCard = ({ item }: { item: CVModuleRecord }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-lg transition-all duration-200 break-inside-avoid mb-6 inline-block w-full cursor-pointer ${
        selectedCvCards.has(item.id) ? 'border-purple-500 bg-purple-50' : 'border-purple-200 hover:border-purple-300'
      }`}
      onClick={() => toggleCvCardSelection(item.id)}
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
        <div className="flex gap-2 mb-3">
          <button
            onClick={(e) => handleCvModalOpen('responsibilities', item.id, e)}
            className="px-3 py-1 text-xs rounded transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            Full Responsibilities
          </button>
          <button
            onClick={(e) => handleCvModalOpen('achievements', item.id, e)}
            className="px-3 py-1 text-xs rounded transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
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
  )

  return (
    <div className="w-full py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-purple-900">User Matcher</h2>
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors shadow-sm"
          >
            Preview ({selectedJdCards.size + selectedCvCards.size} selected)
          </button>
        </div>
        <div className="flex gap-6">
          <div className="w-1/2">
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-medium text-purple-700 mb-3">Job Descriptions</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Position Group</label>
                  <select
                    value={jdPositionGroup}
                    onChange={(e) => setJdPositionGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Groups</option>
                    {jdPositionGroups.filter(g => g).map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Importance</label>
                  <select
                    value={jdImportance}
                    onChange={(e) => setJdImportance(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Levels</option>
                    {jdImportances.filter(i => i).map(importance => (
                      <option key={importance} value={importance}>{importance}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Urgency</label>
                  <select
                    value={jdUrgency}
                    onChange={(e) => setJdUrgency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Levels</option>
                    {jdUrgencies.filter(u => u).map(urgency => (
                      <option key={urgency} value={urgency}>{urgency}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="columns-1 gap-6 space-y-0">
              {filteredJDData.map((item) => (
                <JDCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div className="w-1/2">
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h2 className="text-lg font-medium text-purple-700 mb-3">CV Modules</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Position Group</label>
                  <div className="space-y-2">
                    {availableCvPositionGroups.map(group => (
                      <label key={group} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={cvPositionGroups.includes(group)}
                          onChange={() => handlePositionGroupToggle(group)}
                          className="mr-2 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{group}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CV Component</label>
                  <select
                    value={cvComponent}
                    onChange={(e) => setCvComponent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Components</option>
                    {cvComponents.filter(c => c).map(component => (
                      <option key={component} value={component}>{component}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Firm</label>
                  <select
                    value={cvFirm}
                    onChange={(e) => setCvFirm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Firms</option>
                    {cvFirms.filter(f => f).map(firm => (
                      <option key={firm} value={firm}>{firm}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="columns-1 gap-6 space-y-0">
              {filteredCVData.map((item) => (
                <CVCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
        {modalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setModalOpen(null)}
            content={modalOpen.content}
            title={modalOpen.title}
          />
        )}
      </div>
    </div>
  )
}